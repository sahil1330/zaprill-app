/**
 * GET  /api/billing/subscription  — Fetch current user's subscription
 * DELETE /api/billing/subscription — Cancel current subscription
 */

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { plan } from "@/db/schema";
import { auth } from "@/lib/auth";
import { BillingError } from "@/lib/billing-utils";
import {
  cancelSubscription,
  getActiveSubscription,
} from "@/services/billing/subscription.service";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sub = await getActiveSubscription(session.user.id);
    if (!sub) {
      return NextResponse.json({ subscription: null });
    }

    // Enrich with plan details
    const [planRow] = await db
      .select()
      .from(plan)
      .where(eq(plan.id, sub.planId))
      .limit(1);

    return NextResponse.json({ subscription: sub, plan: planRow ?? null });
  } catch (err) {
    console.error("[subscription GET]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscriptionId } = await request.json();
    if (!subscriptionId) {
      return NextResponse.json(
        { error: "subscriptionId is required" },
        { status: 400 },
      );
    }

    await cancelSubscription(subscriptionId, session.user.id);
    return NextResponse.json({
      success: true,
      message: "Subscription canceled. Access continues until period end.",
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
