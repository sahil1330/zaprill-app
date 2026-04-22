/**
 * POST /api/billing/webhook
 * Receives and verifies Cashfree payment webhook events.
 *
 * CRITICAL: Must read raw body before JSON parsing (signature uses raw bytes).
 * Returns 200 always — Cashfree retries on non-200.
 */
import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/cashfree";
import { handleWebhookEvent } from "@/services/billing/webhook.service";
import type { CashfreeWebhookEvent } from "@/types/billing";

// Disable body parsing — we need raw bytes for signature verification
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // ── Read raw body ───────────────────────────────────────────────────
  const rawBody = await request.text();

  // ── Extract Cashfree signature headers ─────────────────────────────
  const signature = request.headers.get("x-webhook-signature");
  const timestamp = request.headers.get("x-webhook-timestamp");

  if (!signature || !timestamp) {
    console.warn("[webhook] Missing signature headers");
    // Return 200 to prevent retries on invalid requests
    return NextResponse.json({ error: "Missing headers" }, { status: 200 });
  }

  // ── Verify signature ────────────────────────────────────────────────
  const isValid = verifyWebhookSignature(signature, rawBody, timestamp);
  if (!isValid) {
    console.error("[webhook] Invalid signature — possible spoofed request");
    return NextResponse.json({ error: "Invalid signature" }, { status: 200 });
  }

  // ── Parse event ─────────────────────────────────────────────────────
  let event: CashfreeWebhookEvent;
  try {
    event = JSON.parse(rawBody) as CashfreeWebhookEvent;
  } catch {
    console.error("[webhook] Failed to parse body");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 200 });
  }

  console.log(`[webhook] Received event: ${event.type} at ${event.event_time}`);

  // ── Handle event (never throw — always 200) ─────────────────────────
  try {
    const result = await handleWebhookEvent(event);
    console.log(`[webhook] Result:`, result);
  } catch (err) {
    // Log but still return 200 — prevents Cashfree retry storm
    console.error("[webhook] Handler error:", err);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
