/**
 * GET /api/billing/payment-status?orderId=inv_xxx
 *
 * Called by the frontend after user returns from Cashfree checkout.
 * Checks DB first (webhook may have already updated), then polls
 * Cashfree API directly as a fallback (handles delayed webhooks).
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchOrderPayments } from "@/lib/cashfree";
import {
  getCouponUsageByInvoice,
  redeemCoupon,
} from "@/services/billing/coupon.service";
import {
  getInvoiceById,
  markInvoicePaid,
  setInvoiceCashfreeOrderId,
} from "@/services/billing/invoice.service";
import {
  getPaymentsByInvoice,
  markPaymentSuccess,
} from "@/services/billing/payment.service";
import {
  createSubscription,
  getActiveSubscription,
} from "@/services/billing/subscription.service";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const orderId = url.searchParams.get("orderId"); // this is our invoice ID
    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 },
      );
    }

    // ── 1. Check DB state first ─────────────────────────────────────────
    const inv = await getInvoiceById(orderId);
    if (!inv) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Security: ensure invoice belongs to this user
    if (inv.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (inv.status === "paid") {
      return NextResponse.json({ status: "paid", invoice: inv });
    }

    if (inv.status === "void" || inv.status === "failed") {
      return NextResponse.json({ status: inv.status, invoice: inv });
    }

    // ── 2. Webhook hasn't arrived yet — poll Cashfree directly ──────────
    if (!inv.cashfreeOrderId) {
      return NextResponse.json({ status: "pending", invoice: inv });
    }

    let cfPayments: Awaited<ReturnType<typeof fetchOrderPayments>> = [];
    try {
      cfPayments = await fetchOrderPayments(inv.cashfreeOrderId);
    } catch (err) {
      console.warn("[payment-status] Cashfree fetch failed:", err);
      return NextResponse.json({ status: "pending", invoice: inv });
    }

    // Find a successful payment from Cashfree
    const successfulPayment = cfPayments.find(
      (p) => p.paymentStatus === "SUCCESS",
    );
    if (successfulPayment) {
      // Webhook is delayed — reconcile now
      const payments = await getPaymentsByInvoice(inv.id);
      const initiatedPay = payments.find((p) => p.status === "initiated");

      if (initiatedPay) {
        await markPaymentSuccess(initiatedPay.id, {
          cashfreePaymentId: successfulPayment.cfPaymentId,
          paymentMethod: successfulPayment.paymentMethod,
          transactionId: successfulPayment.bankReference,
        });
      }

      const updated = await markInvoicePaid(
        inv.id,
        successfulPayment.paymentAmount,
      );

      if (updated) {
        // Create subscription if not exists
        const existingSub = await getActiveSubscription(inv.userId);
        if (!existingSub && inv.billingReason === "subscription_create") {
          const meta = inv.metadata as Record<string, string>;
          if (meta.planId) {
            await createSubscription({
              userId: inv.userId,
              planId: meta.planId,
              billingCycle:
                (meta.billingCycle as "monthly" | "yearly") ?? "monthly",
              priceAtPurchase: parseFloat(inv.amountDue),
              couponId: inv.couponId ?? undefined,
              discountAmount: parseFloat(inv.discountAmount),
            });
          }
        }

        const couponUsageRow = await getCouponUsageByInvoice(inv.id);
        if (couponUsageRow) await redeemCoupon(couponUsageRow.id);
      }

      return NextResponse.json({
        status: "paid",
        invoice: { ...inv, status: "paid" },
      });
    }

    return NextResponse.json({ status: "pending", invoice: inv });
  } catch (err) {
    console.error("[payment-status]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
