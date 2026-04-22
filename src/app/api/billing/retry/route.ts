/**
 * POST /api/billing/retry
 * Retry payment for a pending/failed invoice.
 * Creates a new payment record + new Cashfree order.
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { BillingError, generateId } from "@/lib/billing-utils";
import { createCashfreeOrder } from "@/lib/cashfree";
import {
  getInvoiceById,
  setInvoiceCashfreeOrderId,
} from "@/services/billing/invoice.service";
import { createPayment } from "@/services/billing/payment.service";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user;

    const { invoiceId } = await request.json();
    if (!invoiceId) {
      return NextResponse.json(
        { error: "invoiceId is required" },
        { status: 400 },
      );
    }

    const inv = await getInvoiceById(invoiceId);
    if (!inv) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (inv.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (inv.status === "paid") {
      return NextResponse.json(
        { error: "Invoice is already paid", code: "ALREADY_PAID" },
        { status: 409 },
      );
    }

    if (inv.status === "void") {
      return NextResponse.json(
        {
          error: "Invoice is void and cannot be retried",
          code: "INVOICE_VOID",
        },
        { status: 400 },
      );
    }

    // Create a new payment attempt
    const totalAmount = parseFloat(inv.totalAmount);
    const pay = await createPayment(inv.id, user.id, totalAmount);

    // Create new Cashfree order
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    let cashfreeOrder: Awaited<ReturnType<typeof createCashfreeOrder>>;
    try {
      cashfreeOrder = await createCashfreeOrder({
        orderId: generateId("cf"),
        amount: totalAmount,
        customerId: user.id,
        customerEmail: user.email ?? "",
        customerPhone:
          (user as unknown as Record<string, string>).phoneNumber ??
          "9999999999",
        customerName: user.name ?? "User",
        returnUrl: `${appUrl}/payment/status?orderId=${inv.id}`,
        notifyUrl: `${appUrl}/api/billing/webhook`,
        orderTags: { invoice_id: inv.id, payment_id: pay.id },
      });
    } catch (err) {
      console.error("[retry] Cashfree order creation failed:", err);
      return NextResponse.json(
        { error: "Payment gateway error. Please try again." },
        { status: 502 },
      );
    }

    await setInvoiceCashfreeOrderId(inv.id, cashfreeOrder.orderId);

    return NextResponse.json({
      paymentSessionId: cashfreeOrder.paymentSessionId,
      cashfreeOrderId: cashfreeOrder.orderId,
      invoiceId: inv.id,
      totalAmount,
    });
  } catch (err) {
    if (err instanceof BillingError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.statusCode },
      );
    }
    console.error("[retry]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
