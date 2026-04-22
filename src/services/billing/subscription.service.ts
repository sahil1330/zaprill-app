/**
 * SubscriptionService — Subscription lifecycle management.
 */

import { and, eq, inArray } from "drizzle-orm";
import db from "@/db";
import { subscription } from "@/db/schema";
import {
  BillingError,
  calculatePeriodEnd,
  generateId,
} from "@/lib/billing-utils";
import type {
  BillingCycle,
  Subscription,
  SubscriptionStatus,
} from "@/types/billing";

export async function createSubscription(opts: {
  userId: string;
  planId: string;
  billingCycle: BillingCycle;
  priceAtPurchase: number;
  couponId?: string;
  discountAmount?: number;
}): Promise<Subscription> {
  const now = new Date();
  const periodEnd = calculatePeriodEnd(now, opts.billingCycle);
  const id = generateId("sub");

  const [created] = await db
    .insert(subscription)
    .values({
      id,
      userId: opts.userId,
      planId: opts.planId,
      status: "active",
      startDate: now,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      billingCycle: opts.billingCycle,
      priceAtPurchase: opts.priceAtPurchase.toFixed(2),
      couponId: opts.couponId,
      discountAmount: (opts.discountAmount ?? 0).toFixed(2),
    })
    .returning();

  return created as Subscription;
}

/** Get a user's active or trialing subscription. */
export async function getActiveSubscription(
  userId: string,
): Promise<Subscription | null> {
  const [row] = await db
    .select()
    .from(subscription)
    .where(
      and(
        eq(subscription.userId, userId),
        inArray(subscription.status, ["active", "trialing"]),
      ),
    )
    .limit(1);
  return (row as Subscription) ?? null;
}

export async function getSubscriptionById(
  id: string,
): Promise<Subscription | null> {
  const [row] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.id, id))
    .limit(1);
  return (row as Subscription) ?? null;
}

/** Renew subscription period after successful renewal payment. */
export async function renewSubscription(
  subscriptionId: string,
): Promise<Subscription> {
  const sub = await getSubscriptionById(subscriptionId);
  if (!sub)
    throw new BillingError("Subscription not found", "SUB_NOT_FOUND", 404);

  const newStart = sub.currentPeriodEnd;
  const newEnd = calculatePeriodEnd(newStart, sub.billingCycle);

  const [updated] = await db
    .update(subscription)
    .set({
      status: "active",
      currentPeriodStart: newStart,
      currentPeriodEnd: newEnd,
      updatedAt: new Date(),
    })
    .where(eq(subscription.id, subscriptionId))
    .returning();

  return updated as Subscription;
}

/** Cancel subscription — keeps access until period end. */
export async function cancelSubscription(
  subscriptionId: string,
  userId: string,
): Promise<void> {
  const sub = await getSubscriptionById(subscriptionId);
  if (!sub)
    throw new BillingError("Subscription not found", "SUB_NOT_FOUND", 404);
  if (sub.userId !== userId)
    throw new BillingError("Forbidden", "FORBIDDEN", 403);
  if (sub.status === "canceled") return; // already canceled — idempotent

  await db
    .update(subscription)
    .set({
      status: "canceled",
      endDate: sub.currentPeriodEnd, // access until end of paid period
      updatedAt: new Date(),
    })
    .where(eq(subscription.id, subscriptionId));
}

/** Mark subscription past_due on renewal payment failure. */
export async function markSubscriptionPastDue(
  subscriptionId: string,
): Promise<void> {
  await db
    .update(subscription)
    .set({ status: "past_due", updatedAt: new Date() })
    .where(
      and(
        eq(subscription.id, subscriptionId),
        inArray(subscription.status, ["active", "trialing"]),
      ),
    );
}

/** Update status generically (used by admin / system). */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: SubscriptionStatus,
): Promise<void> {
  await db
    .update(subscription)
    .set({ status, updatedAt: new Date() })
    .where(eq(subscription.id, subscriptionId));
}
