/**
 * POST /api/billing/coupons/validate
 * Preview coupon discount without reserving it.
 */

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { plan } from "@/db/schema";
import { auth } from "@/lib/auth";
import { validateCoupon } from "@/services/billing/coupon.service";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, planId } = await request.json();
    if (!code || !planId) {
      return NextResponse.json(
        { error: "code and planId are required" },
        { status: 400 },
      );
    }

    const [selectedPlan] = await db
      .select()
      .from(plan)
      .where(eq(plan.id, planId))
      .limit(1);
    if (!selectedPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const planAmount = parseFloat(selectedPlan.amount);
    const result = await validateCoupon(code, session.user.id, planAmount);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[coupon/validate]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
