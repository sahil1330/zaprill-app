import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { coupons, plan } from "@/db/schema";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") return null;
  return session;
}

// ─── Plans ───────────────────────────────────────────────────────────────────

export async function GET() {
  if (!(await requireAdmin())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const [plans, couponsData] = await Promise.all([
    db.select().from(plan).orderBy(plan.sortOrder),
    db.select().from(coupons).orderBy(coupons.createdAt),
  ]);

  return NextResponse.json({ plans, coupons: couponsData });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { _action, ...data } = body;

  try {
    if (_action === "create_plan") {
      const newPlan = await db
        .insert(plan)
        .values({
          id: `plan_${nanoid(10)}`,
          name: data.name,
          slug: data.slug,
          description: data.description ?? null,
          amount: data.amount,
          originalAmount: data.originalAmount || null,
          currency: data.currency ?? "INR",
          billingCycle: data.billingCycle,
          category: data.category || "pro",
          features: data.features ?? [],
          isActive: data.isActive ?? true,
          sortOrder: data.sortOrder ?? 0,
        })
        .returning();
      return NextResponse.json({ plan: newPlan[0] });
    }

    if (_action === "update_plan") {
      const updated = await db
        .update(plan)
        .set({
          name: data.name,
          slug: data.slug,
          description: data.description,
          amount: data.amount,
          originalAmount: data.originalAmount || null,
          billingCycle: data.billingCycle,
          category: data.category,
          features: data.features,
          isActive: data.isActive,
          sortOrder: data.sortOrder,
          updatedAt: new Date(),
        })
        .where(eq(plan.id, data.id))
        .returning();
      return NextResponse.json({ plan: updated[0] });
    }

    if (_action === "delete_plan") {
      await db.delete(plan).where(eq(plan.id, data.id));
      return NextResponse.json({ success: true });
    }

    if (_action === "create_coupon") {
      const newCoupon = await db
        .insert(coupons)
        .values({
          id: `coup_${nanoid(10)}`,
          code: data.code.toUpperCase(),
          type: data.type,
          value: data.value,
          maxDiscount: data.maxDiscount ?? null,
          minOrderValue: data.minOrderValue ?? "0",
          startTime: data.startTime ? new Date(data.startTime) : null,
          endTime: data.endTime ? new Date(data.endTime) : null,
          usageLimitGlobal: data.usageLimitGlobal ?? null,
          usageLimitPerUser: data.usageLimitPerUser ?? 1,
          newUserOnly: data.newUserOnly ?? false,
          status: data.status ?? "active",
        })
        .returning();
      return NextResponse.json({ coupon: newCoupon[0] });
    }

    if (_action === "update_coupon") {
      const updated = await db
        .update(coupons)
        .set({
          status: data.status,
          usageLimitGlobal: data.usageLimitGlobal,
          endTime: data.endTime ? new Date(data.endTime) : null,
          updatedAt: new Date(),
        })
        .where(eq(coupons.id, data.id))
        .returning();
      return NextResponse.json({ coupon: updated[0] });
    }

    if (_action === "delete_coupon") {
      await db
        .update(coupons)
        .set({ status: "disabled", updatedAt: new Date() })
        .where(eq(coupons.id, data.id));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
