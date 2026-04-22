/**
 * Cashfree Payment Gateway SDK wrapper.
 * Uses cashfree-pg v5.1.x — instance-based API.
 * API version 2025-01-01 is set automatically by the SDK constructor.
 *
 * Server-side only. Never import on the client.
 */
import { Cashfree, CFEnvironment } from "cashfree-pg";
import crypto from "crypto";

// Lazy singleton instance
let _client: InstanceType<typeof Cashfree> | null = null;

function getCashfreeClient(): InstanceType<typeof Cashfree> {
  if (_client) return _client;

  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  const environment = process.env.CASHFREE_ENVIRONMENT ?? "SANDBOX";

  if (!clientId || !clientSecret) {
    throw new Error(
      "CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET must be set in environment variables.",
    );
  }

  _client = new Cashfree(
    environment === "PRODUCTION"
      ? CFEnvironment.PRODUCTION
      : CFEnvironment.SANDBOX,
    clientId,
    clientSecret,
  );

  return _client;
}

// ─────────────────────────────────────────────────
// Order Management
// ─────────────────────────────────────────────────

export interface CreateOrderParams {
  orderId: string;
  amount: number;
  currency?: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  returnUrl: string;
  notifyUrl?: string;
  orderTags?: Record<string, string>;
}

export interface CashfreeOrder {
  orderId: string;
  paymentSessionId: string;
  orderStatus: string;
}

export async function createCashfreeOrder(
  params: CreateOrderParams,
): Promise<CashfreeOrder> {
  const cf = getCashfreeClient();

  // Method signature: PGCreateOrder(CreateOrderRequest, x_request_id?, x_idempotency_key?, options?)
  const response = await cf.PGCreateOrder({
    order_id: params.orderId,
    order_amount: params.amount,
    order_currency: params.currency ?? "INR",
    customer_details: {
      customer_id: params.customerId,
      customer_email: params.customerEmail,
      customer_phone: params.customerPhone,
      customer_name: params.customerName,
    },
    order_meta: {
      return_url: params.returnUrl,
      notify_url: params.notifyUrl,
    },
    order_tags: params.orderTags,
  });

  const data = response.data as Record<string, unknown>;
  if (!data?.payment_session_id) {
    throw new Error(`Cashfree order creation failed: ${JSON.stringify(data)}`);
  }

  return {
    orderId: (data.order_id as string) ?? params.orderId,
    paymentSessionId: data.payment_session_id as string,
    orderStatus: (data.order_status as string) ?? "ACTIVE",
  };
}

// ─────────────────────────────────────────────────
// Order Status (reconciliation fallback)
// ─────────────────────────────────────────────────

export interface CashfreePaymentDetail {
  cfPaymentId: string;
  paymentStatus: string;
  paymentAmount: number;
  paymentMethod: string;
  bankReference: string;
  paymentTime: string;
}

export async function fetchOrderPayments(
  orderId: string,
): Promise<CashfreePaymentDetail[]> {
  const cf = getCashfreeClient();
  // Method signature: PGOrderFetchPayments(order_id, x_request_id?, x_idempotency_key?, options?)
  const response = await cf.PGOrderFetchPayments(orderId);
  const payments = response.data as unknown[];

  if (!Array.isArray(payments)) return [];

  return payments.map((p) => {
    const pay = p as Record<string, unknown>;
    return {
      cfPaymentId: String(pay.cf_payment_id ?? ""),
      paymentStatus: String(pay.payment_status ?? ""),
      paymentAmount: Number(pay.payment_amount ?? 0),
      paymentMethod: String(pay.payment_group ?? ""),
      bankReference: String(pay.bank_reference ?? ""),
      paymentTime: String(pay.payment_time ?? ""),
    };
  });
}

// ─────────────────────────────────────────────────
// Webhook Signature Verification
// ─────────────────────────────────────────────────

/**
 * Verify a Cashfree webhook payload using HMAC-SHA256.
 * Cashfree sends: x-webhook-timestamp + x-webhook-signature headers.
 * Verification: HMAC-SHA256(timestamp + rawBody, clientSecret) → Base64
 *
 * @param signature   Value of x-webhook-signature header
 * @param rawBody     Raw request body string (NOT JSON.parsed)
 * @param timestamp   Value of x-webhook-timestamp header
 */
export function verifyWebhookSignature(
  signature: string,
  rawBody: string,
  timestamp: string,
): boolean {
  const secret = process.env.CASHFREE_CLIENT_SECRET;
  if (!secret) throw new Error("CASHFREE_CLIENT_SECRET is not set");

  const data = timestamp + rawBody;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64");

  try {
    // Timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expected, "base64"),
      Buffer.from(signature, "base64"),
    );
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────
// Refunds
// ─────────────────────────────────────────────────

export interface CashfreeRefundResult {
  refundId: string;
  refundStatus: string;
  refundAmount: number;
}

export async function createCashfreeRefund(
  orderId: string,
  refundId: string,
  amount: number,
  note?: string,
): Promise<CashfreeRefundResult> {
  const cf = getCashfreeClient();

  // Method signature: PGOrderCreateRefund(order_id, OrderCreateRefundRequest, ...)
  const response = await cf.PGOrderCreateRefund(orderId, {
    refund_amount: amount,
    refund_id: refundId,
    refund_note: note ?? "Customer refund",
  });

  const data = response.data as Record<string, unknown>;
  return {
    refundId: String(data?.refund_id ?? refundId),
    refundStatus: String(data?.refund_status ?? ""),
    refundAmount: Number(data?.refund_amount ?? amount),
  };
}
