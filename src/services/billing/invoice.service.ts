/**
 * InvoiceService — Invoice creation and lifecycle management.
 * Invoice is the single source of truth for what was billed.
 */

import { and, desc, eq } from "drizzle-orm";
import db from "@/db";
import { invoice } from "@/db/schema";
import {
  BillingError,
  calculateInvoiceAmounts,
  generateId,
} from "@/lib/billing-utils";
import type { BillingReason, Invoice } from "@/types/billing";
import { getCouponUsageByInvoice, releaseCoupon } from "./coupon.service";

// ─────────────────────────────────────────────────
// Creation
// ─────────────────────────────────────────────────

export interface CreateInvoiceParams {
  subscriptionId?: string;
  userId: string;
  planAmount: number;
  discountAmount: number;
  currency?: string;
  billingReason: BillingReason;
  couponId?: string;
  gstPercentage?: number;
}

export async function createInvoice(
  params: CreateInvoiceParams,
): Promise<Invoice> {
  const taxRate = params.gstPercentage ? params.gstPercentage / 100 : 0;
  const { amountDue, taxAmount, totalAmount } = calculateInvoiceAmounts(
    params.planAmount,
    params.discountAmount,
    taxRate,
  );

  const id = generateId("inv");
  const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h to pay

  const [created] = await db
    .insert(invoice)
    .values({
      id,
      subscriptionId: params.subscriptionId,
      userId: params.userId,
      amountDue: amountDue.toFixed(2),
      amountPaid: "0.00",
      currency: params.currency ?? "INR",
      status: "pending",
      billingReason: params.billingReason,
      dueDate,
      couponId: params.couponId,
      discountAmount: params.discountAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      gstPercentage: params.gstPercentage?.toString(),
      totalAmount: totalAmount.toFixed(2),
    })
    .returning();

  return created as Invoice;
}

// ─────────────────────────────────────────────────
// Status Transitions (idempotent by design)
// ─────────────────────────────────────────────────

/** Mark invoice paid. Only transitions from 'pending'. */
export async function markInvoicePaid(
  invoiceId: string,
  amountPaid: number,
  paidAt?: Date,
): Promise<boolean> {
  const result = await db
    .update(invoice)
    .set({
      status: "paid",
      amountPaid: amountPaid.toFixed(2),
      paidAt: paidAt ?? new Date(),
    })
    .where(and(eq(invoice.id, invoiceId), eq(invoice.status, "pending")))
    .returning({ id: invoice.id });

  return result.length > 0;
}

/** Mark invoice failed. */
export async function markInvoiceFailed(invoiceId: string): Promise<void> {
  const result = await db
    .update(invoice)
    .set({ status: "failed" })
    .where(and(eq(invoice.id, invoiceId), eq(invoice.status, "pending")))
    .returning({ id: invoice.id });

  if (result.length > 0) {
    const couponUsage = await getCouponUsageByInvoice(invoiceId);
    if (couponUsage) {
      await releaseCoupon(couponUsage.id);
    }
  }
}

/** Void an invoice (e.g., on subscription cancel before payment). */
export async function voidInvoice(invoiceId: string): Promise<void> {
  const result = await db
    .update(invoice)
    .set({ status: "void" })
    .where(and(eq(invoice.id, invoiceId), eq(invoice.status, "pending")))
    .returning({ id: invoice.id });

  if (result.length > 0) {
    const couponUsage = await getCouponUsageByInvoice(invoiceId);
    if (couponUsage) {
      await releaseCoupon(couponUsage.id);
    }
  }
}

/** Attach the Cashfree order ID to an invoice after order creation. */
export async function setInvoiceCashfreeOrderId(
  invoiceId: string,
  cashfreeOrderId: string,
): Promise<void> {
  await db
    .update(invoice)
    .set({ cashfreeOrderId })
    .where(eq(invoice.id, invoiceId));
}

// ─────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────

export async function getInvoiceById(
  invoiceId: string,
): Promise<Invoice | null> {
  const [row] = await db
    .select()
    .from(invoice)
    .where(eq(invoice.id, invoiceId))
    .limit(1);
  return (row as Invoice) ?? null;
}

/** Primary lookup for webhook processing. */
export async function getInvoiceByCashfreeOrderId(
  cashfreeOrderId: string,
): Promise<Invoice | null> {
  const [row] = await db
    .select()
    .from(invoice)
    .where(eq(invoice.cashfreeOrderId, cashfreeOrderId))
    .limit(1);
  return (row as Invoice) ?? null;
}

/** Paginated invoice history for a user. */
export async function getInvoicesByUser(
  userId: string,
  limit = 20,
  offset = 0,
): Promise<Invoice[]> {
  const rows = await db
    .select()
    .from(invoice)
    .where(eq(invoice.userId, userId))
    .orderBy(desc(invoice.createdAt))
    .limit(limit)
    .offset(offset);
  return rows as Invoice[];
}

/** Check if an invoice is stale (>24h old and still pending). */
export async function expireStaleInvoices(): Promise<number> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const result = await db
    .update(invoice)
    .set({ status: "void" })
    .where(and(eq(invoice.status, "pending")))
    .returning({ id: invoice.id });
  if (result.length > 0) {
    for (const inv of result) {
      const usage = await getCouponUsageByInvoice(inv.id);
      if (usage) await releaseCoupon(usage.id);
    }
  }
  return result.length;
}
