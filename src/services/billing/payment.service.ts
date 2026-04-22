/**
 * PaymentService — Payment attempt lifecycle with idempotency.
 */

import { and, desc, eq } from "drizzle-orm";
import db from "@/db";
import { payment } from "@/db/schema";
import { generateId, generateIdempotencyKey } from "@/lib/billing-utils";
import type { Payment, PaymentStatus } from "@/types/billing";

export async function createPayment(
  invoiceId: string,
  userId: string,
  amount: number,
  currency = "INR",
): Promise<Payment> {
  const id = generateId("pay");
  const idempotencyKey = generateIdempotencyKey();
  const [created] = await db
    .insert(payment)
    .values({
      id,
      invoiceId,
      userId,
      amount: amount.toFixed(2),
      currency,
      status: "initiated",
      idempotencyKey,
    })
    .returning();
  return created as Payment;
}

/** Mark payment success. Only transitions from 'initiated'. Returns false if already processed (idempotent). */
export async function markPaymentSuccess(
  paymentId: string,
  opts: {
    cashfreePaymentId: string;
    paymentMethod?: string;
    transactionId?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<boolean> {
  const result = await db
    .update(payment)
    .set({
      status: "success",
      cashfreePaymentId: opts.cashfreePaymentId,
      paymentMethod: opts.paymentMethod,
      transactionId: opts.transactionId,
      paidAt: new Date(),
      metadata: opts.metadata ?? {},
    })
    .where(and(eq(payment.id, paymentId), eq(payment.status, "initiated")))
    .returning({ id: payment.id });
  return result.length > 0;
}

/** Mark payment failed. Only transitions from 'initiated'. */
export async function markPaymentFailed(paymentId: string): Promise<boolean> {
  const result = await db
    .update(payment)
    .set({ status: "failed" })
    .where(and(eq(payment.id, paymentId), eq(payment.status, "initiated")))
    .returning({ id: payment.id });
  return result.length > 0;
}

/** Mark payment refunded. Only transitions from 'success'. */
export async function markPaymentRefunded(paymentId: string): Promise<boolean> {
  const result = await db
    .update(payment)
    .set({ status: "refunded" })
    .where(and(eq(payment.id, paymentId), eq(payment.status, "success")))
    .returning({ id: payment.id });
  return result.length > 0;
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  const [row] = await db
    .select()
    .from(payment)
    .where(eq(payment.id, id))
    .limit(1);
  return (row as Payment) ?? null;
}

export async function getPaymentByCashfreeId(
  cfPaymentId: string,
): Promise<Payment | null> {
  const [row] = await db
    .select()
    .from(payment)
    .where(eq(payment.cashfreePaymentId, cfPaymentId))
    .limit(1);
  return (row as Payment) ?? null;
}

export async function getPaymentsByInvoice(
  invoiceId: string,
): Promise<Payment[]> {
  const rows = await db
    .select()
    .from(payment)
    .where(eq(payment.invoiceId, invoiceId))
    .orderBy(desc(payment.createdAt));
  return rows as Payment[];
}

export async function getInitiatedPaymentForInvoice(
  invoiceId: string,
): Promise<Payment | null> {
  const [row] = await db
    .select()
    .from(payment)
    .where(
      and(eq(payment.invoiceId, invoiceId), eq(payment.status, "initiated")),
    )
    .orderBy(desc(payment.createdAt))
    .limit(1);
  return (row as Payment) ?? null;
}

export async function getInvoicePaymentStatus(invoiceId: string): Promise<{
  hasSuccess: boolean;
  hasPending: boolean;
  latestStatus: PaymentStatus | null;
}> {
  const payments = await getPaymentsByInvoice(invoiceId);
  return {
    hasSuccess: payments.some((p) => p.status === "success"),
    hasPending: payments.some((p) => p.status === "initiated"),
    latestStatus: payments.length > 0 ? payments[0].status : null,
  };
}
