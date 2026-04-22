/**
 * POST /api/billing/checkout
 * Initiates the full checkout flow:
 * validate coupon → create invoice → create payment → create Cashfree order
 */

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { plan } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  BillingError,
  calculateDiscount,
  generateId,
} from "@/lib/billing-utils";
import { createCashfreeOrder } from "@/lib/cashfree";
import {
  reserveCoupon,
  validateCoupon,
} from "@/services/billing/coupon.service";
import {
  createInvoice,
  setInvoiceCashfreeOrderId,
  voidInvoice,
} from "@/services/billing/invoice.service";
import { createPayment } from "@/services/billing/payment.service";
import { getActiveSubscription } from "@/services/billing/subscription.service";
import type { CheckoutRequest } from "@/types/billing";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user;

    // ── Parse body ──────────────────────────────────────────────────────
    const body = (await request.json()) as CheckoutRequest;
    const { planId, couponCode } = body;

    if (!planId) {
      return NextResponse.json(
        { error: "planId is required" },
        { status: 400 },
      );
    }

    // ── Guard: already subscribed? ──────────────────────────────────────
    const existingSub = await getActiveSubscription(user.id);
    if (existingSub) {
      return NextResponse.json(
        {
          error: "You already have an active subscription",
          code: "ALREADY_SUBSCRIBED",
        },
        { status: 409 },
      );
    }

    // ── Fetch plan ──────────────────────────────────────────────────────
    const [selectedPlan] = await db
      .select()
      .from(plan)
      .where(eq(plan.id, planId))
      .limit(1);
    if (!selectedPlan || !selectedPlan.isActive) {
      return NextResponse.json(
        { error: "Plan not found or inactive" },
        { status: 404 },
      );
    }

    const planAmount = parseFloat(selectedPlan.amount);

    // ── Validate coupon (preview only, no reservation yet) ──────────────
    let discountAmount = 0;
    let couponId: string | undefined;

    if (couponCode) {
      const validation = await validateCoupon(couponCode, user.id, planAmount);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error, code: "COUPON_INVALID" },
          { status: 400 },
        );
      }
      discountAmount = validation.discountAmount ?? 0;
      couponId = validation.coupon?.id;
    }

    // ── Create invoice ──────────────────────────────────────────────────
    const inv = await createInvoice({
      userId: user.id,
      planAmount,
      discountAmount,
      billingReason: "subscription_create",
      couponId,
      // Store planId + billingCycle in metadata for webhook handler
    });

    // Update invoice metadata with plan info for webhook
    await db
      .update((await import("@/db/schema")).invoice)
      .set({ metadata: { planId, billingCycle: selectedPlan.billingCycle } })
      .where(eq((await import("@/db/schema")).invoice.id, inv.id));

    // ── Reserve coupon (now that invoice exists) ────────────────────────
    let couponUsageId: string | undefined;
    if (couponCode && couponId) {
      try {
        const reservation = await reserveCoupon(couponCode, user.id, inv.id);
        couponUsageId = reservation.couponUsageId;
      } catch (err) {
        // Coupon reservation failed — void invoice and abort
        await voidInvoice(inv.id);
        if (err instanceof BillingError) {
          return NextResponse.json(
            { error: err.message, code: err.code },
            { status: 400 },
          );
        }
        throw err;
      }
    }

    // ── Create payment record ───────────────────────────────────────────
    const totalAmount = parseFloat(inv.totalAmount);
    const pay = await createPayment(inv.id, user.id, totalAmount);

    // ── Create Cashfree order ───────────────────────────────────────────
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const webhookUrl = `${appUrl}/api/billing/webhook`;
    const returnUrl = `${appUrl}/payment/status?orderId=${inv.id}`;

    let cashfreeOrder: Awaited<ReturnType<typeof createCashfreeOrder>>;
    try {
      cashfreeOrder = await createCashfreeOrder({
        orderId: generateId("cf"), // unique Cashfree order ID
        amount: totalAmount,
        customerId: user.id,
        customerEmail: user.email ?? "",
        customerPhone:
          (user as unknown as Record<string, string>).phoneNumber ??
          "9999999999",
        customerName: user.name ?? "User",
        returnUrl,
        notifyUrl: webhookUrl,
        orderTags: { invoice_id: inv.id, payment_id: pay.id },
      });
    } catch (err) {
      // Cashfree order creation failed — clean up
      await voidInvoice(inv.id);
      console.error("[checkout] Cashfree order creation failed:", err);
      return NextResponse.json(
        {
          error: "Payment gateway error. Please try again.",
          code: "GATEWAY_ERROR",
        },
        { status: 502 },
      );
    }

    // ── Store Cashfree order ID on invoice ──────────────────────────────
    await setInvoiceCashfreeOrderId(inv.id, cashfreeOrder.orderId);

    return NextResponse.json({
      paymentSessionId: cashfreeOrder.paymentSessionId,
      cashfreeOrderId: cashfreeOrder.orderId,
      invoiceId: inv.id,
      totalAmount,
      discountAmount,
      taxAmount: parseFloat(inv.taxAmount),
    });
  } catch (err) {
    console.error("[checkout] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
