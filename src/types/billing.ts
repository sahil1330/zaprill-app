// ─────────────────────────────────────────────────
// Billing Type Definitions
// Derived from the DB schema — single source of truth.
// ─────────────────────────────────────────────────

export type BillingCycle = "monthly" | "quarterly" | "yearly";
export type CouponType = "percentage" | "flat";
export type CouponStatus = "active" | "expired" | "disabled";
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled";
export type InvoiceStatus = "pending" | "paid" | "failed" | "void";
export type BillingReason =
  | "subscription_create"
  | "renewal"
  | "upgrade"
  | "downgrade";
export type PaymentStatus = "initiated" | "success" | "failed" | "refunded";
export type CouponUsageStatus = "reserved" | "redeemed" | "released";

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  amount: string; // numeric as string for precision
  currency: string;
  billingCycle: BillingCycle;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: string;
  maxDiscount: string | null;
  minOrderValue: string;
  startTime: Date | null;
  endTime: Date | null;
  usageLimitGlobal: number | null;
  usageLimitPerUser: number;
  newUserOnly: boolean;
  status: CouponStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  userId: string;
  orderId: string | null;
  status: CouponUsageStatus;
  reservedAt: Date;
  redeemedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date | null;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  billingCycle: BillingCycle;
  priceAtPurchase: string;
  couponId: string | null;
  discountAmount: string;
  cashfreeSubscriptionId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  subscriptionId: string | null;
  userId: string;
  amountDue: string;
  amountPaid: string;
  currency: string;
  status: InvoiceStatus;
  billingReason: BillingReason;
  dueDate: Date | null;
  paidAt: Date | null;
  couponId: string | null;
  discountAmount: string;
  taxAmount: string;
  totalAmount: string;
  cashfreeOrderId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface Payment {
  id: string;
  invoiceId: string;
  userId: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string | null;
  transactionId: string | null;
  cashfreePaymentId: string | null;
  idempotencyKey: string;
  paidAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

// ─────────────────────────────────────────────────
// API Request / Response shapes
// ─────────────────────────────────────────────────

export interface CheckoutRequest {
  planId: string;
  couponCode?: string;
}

export interface CheckoutResponse {
  paymentSessionId: string;
  cashfreeOrderId: string;
  invoiceId: string;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  finalAmount?: number;
  error?: string;
}

// ─────────────────────────────────────────────────
// Cashfree Webhook Payload (2025-01-01 API)
// ─────────────────────────────────────────────────

export interface CashfreeWebhookEvent {
  type: string; // "PAYMENT_SUCCESS_WEBHOOK" | "PAYMENT_FAILED_WEBHOOK" | "PAYMENT_USER_DROPPED_WEBHOOK"
  version: string;
  event_time: string;
  data: {
    order: {
      order_id: string;
      order_amount: number;
      order_currency: string;
      order_tags?: Record<string, string>;
    };
    payment: {
      cf_payment_id: number;
      payment_amount: number;
      payment_currency: string;
      payment_message: string;
      payment_status: string; // "SUCCESS" | "FAILED" | "USER_DROPPED" | "PENDING"
      payment_time: string;
      payment_completion_time: string;
      payment_method?: {
        upi?: { upi_id: string; channel: string };
        card?: { card_number: string; card_network: string; card_type: string };
        netbanking?: {
          netbanking_bank_code: string;
          netbanking_bank_name: string;
        };
      };
      bank_reference: string; // transaction_id equivalent
    };
    customer_details: {
      customer_id: string;
      customer_name: string;
      customer_email: string;
      customer_phone: string;
    };
    error_details?: {
      error_code: string;
      error_description: string;
      error_reason: string;
      error_source: string;
      error_code_raw: string;
    };
  };
}
