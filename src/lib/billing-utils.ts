import { customAlphabet } from "nanoid";
import type { BillingCycle } from "@/types/billing";

// ─────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────

/** GST rate for India (18%). Adjust per your jurisdiction. */
export const TAX_RATE = 0.18;

// ─────────────────────────────────────────────────
// ID Generation
// ─────────────────────────────────────────────────

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 16);

export function generateId(prefix: string): string {
  return `${prefix}_${nanoid()}`;
}

export function generateIdempotencyKey(): string {
  return `idem_${Date.now()}_${nanoid()}`;
}

// ─────────────────────────────────────────────────
// Date / Period Math
// ─────────────────────────────────────────────────

export function calculatePeriodEnd(start: Date, cycle: BillingCycle): Date {
  const end = new Date(start);
  if (cycle === "monthly") {
    end.setMonth(end.getMonth() + 1);
  } else {
    end.setFullYear(end.getFullYear() + 1);
  }
  return end;
}

/** True if the date is in the future */
export function isActive(date: Date): boolean {
  return date.getTime() > Date.now();
}

// ─────────────────────────────────────────────────
// Amount Calculations
// ─────────────────────────────────────────────────

/**
 * Calculate discount based on coupon type.
 * Returns the discount amount in INR (as a number, 2 decimal places).
 */
export function calculateDiscount(
  couponType: "percentage" | "flat",
  couponValue: string,
  orderAmount: number,
  maxDiscount?: string | null,
): number {
  const value = parseFloat(couponValue);
  let discount = 0;

  if (couponType === "percentage") {
    discount = (orderAmount * value) / 100;
    if (maxDiscount) {
      discount = Math.min(discount, parseFloat(maxDiscount));
    }
  } else {
    discount = value;
  }

  // Discount cannot exceed order amount
  discount = Math.min(discount, orderAmount);
  return Math.round(discount * 100) / 100; // round to 2dp
}

/**
 * Calculate invoice amounts.
 * Returns all amounts in INR as numbers (2dp).
 */
export function calculateInvoiceAmounts(
  planAmount: number,
  discountAmount: number,
): { amountDue: number; taxAmount: number; totalAmount: number } {
  const amountDue = planAmount;
  const taxableAmount = planAmount - discountAmount;
  const taxAmount = Math.round(taxableAmount * TAX_RATE * 100) / 100;
  const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;
  return { amountDue, taxAmount, totalAmount };
}

// ─────────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────────

export function formatCurrency(
  amount: number | string,
  currency = "INR",
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

// ─────────────────────────────────────────────────
// Error Helpers
// ─────────────────────────────────────────────────

export class BillingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode = 400,
  ) {
    super(message);
    this.name = "BillingError";
  }
}
