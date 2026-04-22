/**
 * WebhookService — Orchestrates all Cashfree webhook events.
 *
 * Design principles:
 * 1. Fully idempotent — safe to process the same event multiple times
 * 2. Never trust client-side confirmation — only webhook updates subscription
 * 3. Every step is a conditional update (only acts if state is expected)
 * 4. Returns 200 even on internal errors (log + prevent Cashfree retries)
 */

import type { CashfreeWebhookEvent } from "@/types/billing";
import { getCouponUsageByInvoice, redeemCoupon } from "./coupon.service";
import {
  getInvoiceByCashfreeOrderId,
  markInvoiceFailed,
  markInvoicePaid,
} from "./invoice.service";
import {
  getPaymentByCashfreeId,
  markPaymentFailed,
  markPaymentSuccess,
} from "./payment.service";
import {
  createSubscription,
  getActiveSubscription,
  getSubscriptionById,
  markSubscriptionPastDue,
  renewSubscription,
} from "./subscription.service";

export type WebhookResult =
  | { handled: true; action: string }
  | { handled: false; reason: string };

export async function handleWebhookEvent(
  event: CashfreeWebhookEvent,
): Promise<WebhookResult> {
  const { type, data } = event;
  const cashfreeOrderId = data.order.order_id;
  const cfPaymentData = data.payment;

  // ── Step 1: Find our invoice by Cashfree order ID ──────────────────
  const inv = await getInvoiceByCashfreeOrderId(cashfreeOrderId);
  if (!inv) {
    // Unknown order — could be from a different integration. Log and ack.
    console.warn(`[webhook] Unknown cashfree_order_id: ${cashfreeOrderId}`);
    return { handled: false, reason: "invoice_not_found" };
  }

  const cfPaymentId = String(cfPaymentData.cf_payment_id);

  // ── Step 2: Find or derive our payment record ──────────────────────
  // First try to find by cf_payment_id (idempotency check)
  const existingPayment = await getPaymentByCashfreeId(cfPaymentId);

  // ── PAYMENT_SUCCESS ────────────────────────────────────────────────
  if (type === "PAYMENT_SUCCESS_WEBHOOK") {
    // Determine which payment record to update
    let paymentId: string;

    if (existingPayment) {
      // Already have a record linked to this cf_payment_id
      if (existingPayment.status === "success") {
        // Duplicate webhook — already processed. Ack silently.
        return { handled: true, action: "duplicate_success_ack" };
      }
      paymentId = existingPayment.id;
    } else {
      // Payment record not yet linked to cf_payment_id
      // Find the most recent initiated payment for this invoice
      const { getInitiatedPaymentForInvoice } = await import(
        "./payment.service"
      );
      const pendingPay = await getInitiatedPaymentForInvoice(inv.id);
      if (!pendingPay) {
        console.error(`[webhook] No initiated payment for invoice ${inv.id}`);
        return { handled: false, reason: "no_initiated_payment" };
      }
      paymentId = pendingPay.id;
    }

    // Determine payment method string
    const method = cfPaymentData.payment_method
      ? Object.keys(cfPaymentData.payment_method)[0]
      : "unknown";

    // a) Mark payment success (idempotent)
    await markPaymentSuccess(paymentId, {
      cashfreePaymentId: cfPaymentId,
      paymentMethod: method,
      transactionId: cfPaymentData.bank_reference,
      metadata: { cashfree_event: data },
    });

    // b) Mark invoice paid (idempotent)
    const invoiceUpdated = await markInvoicePaid(
      inv.id,
      cfPaymentData.payment_amount,
      new Date(cfPaymentData.payment_completion_time),
    );

    if (!invoiceUpdated) {
      // Invoice already paid — duplicate webhook
      return { handled: true, action: "invoice_already_paid" };
    }

    // c) Subscription lifecycle
    if (inv.billingReason === "subscription_create") {
      // Check if subscription already exists (idempotent guard)
      const existing = await getActiveSubscription(inv.userId);
      if (!existing) {
        // Extract plan from invoice metadata or subscription_id
        // subscription_id may be null at this point (created after payment)
        // We need planId from invoice metadata
        const meta = inv.metadata as Record<string, string>;
        const planId = meta.planId;
        const billingCycle = (meta.billingCycle ?? "monthly") as
          | "monthly"
          | "yearly";

        if (planId) {
          await createSubscription({
            userId: inv.userId,
            planId,
            billingCycle,
            priceAtPurchase: parseFloat(inv.amountDue),
            couponId: inv.couponId ?? undefined,
            discountAmount: parseFloat(inv.discountAmount),
          });
        }
      }
    } else if (inv.billingReason === "renewal" && inv.subscriptionId) {
      await renewSubscription(inv.subscriptionId);
    }

    // d) Redeem coupon (if any)
    const couponUsageRow = await getCouponUsageByInvoice(inv.id);
    if (couponUsageRow) {
      await redeemCoupon(couponUsageRow.id);
    }

    console.log(`[webhook] SUCCESS handled for invoice ${inv.id}`);
    return { handled: true, action: "payment_success" };
  }

  // ── PAYMENT_FAILED / USER_DROPPED ──────────────────────────────────
  if (
    type === "PAYMENT_FAILED_WEBHOOK" ||
    type === "PAYMENT_USER_DROPPED_WEBHOOK"
  ) {
    const paymentRecord = existingPayment;

    if (paymentRecord) {
      if (paymentRecord.status === "failed") {
        return { handled: true, action: "duplicate_failure_ack" };
      }
      await markPaymentFailed(paymentRecord.id);
    }

    // For renewal failures, mark subscription past_due
    if (inv.billingReason === "renewal" && inv.subscriptionId) {
      await markSubscriptionPastDue(inv.subscriptionId);
    }

    // Keep invoice as pending — allows user to retry payment
    // Only mark failed if it's a hard failure (not user_dropped)
    if (type === "PAYMENT_FAILED_WEBHOOK") {
      await markInvoiceFailed(inv.id);
    }

    console.log(`[webhook] FAILED/DROPPED handled for invoice ${inv.id}`);
    return { handled: true, action: "payment_failed" };
  }

  // Unknown event type — ack to prevent retries
  console.warn(`[webhook] Unhandled event type: ${type}`);
  return { handled: false, reason: `unhandled_event_type:${type}` };
}
