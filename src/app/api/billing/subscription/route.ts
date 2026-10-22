/**
 * GET /api/billing/subscription — Fetch current user's subscription (with access)
 */

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { plan } from "@/db/schema";
import { BillingError } from "@/lib/billing-utils";
import { auth } from "@/lib/auth";
import {
  cancelSubscription,
  getSubscriptionById,
  getSubscriptionWithAccess,
} from "@/services/billing/subscription.service";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sub = await getSubscriptionWithAccess(session.user.id);
    if (!sub) {
      return NextResponse.json({ subscription: null, isPro: false });
    }

    const [planRow] = await db
      .select()
      .from(plan)
      .where(eq(plan.id, sub.planId))
      .limit(1);

    return NextResponse.json({
      subscription: sub,
      plan: planRow ?? null,
      isPro: true,
    });
  } catch (err) {
    console.error("[subscription GET]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/billing/subscription — Cancel the current subscription.
 * Access continues until the paid period ends.
 */
export async function DELETE() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sub = await getSubscriptionWithAccess(session.user.id);
    if (!sub) {
      return NextResponse.json(
        { error: "No subscription to cancel" },
        { status: 404 },
      );
    }

    if (sub.status !== "canceled") {
      await cancelSubscription(sub.id, session.user.id);
    }

    const updated = await getSubscriptionById(sub.id);
    return NextResponse.json({
      subscription: updated,
      alreadyCanceled: sub.status === "canceled",
    });
  } catch (err) {
    if (err instanceof BillingError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.statusCode },
      );
    }
    console.error("[subscription DELETE]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
