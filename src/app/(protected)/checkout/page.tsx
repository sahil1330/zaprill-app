import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import db from "@/db";
import * as schema from "@/db/schema";
import { plan } from "@/db/schema";
import CheckoutForm from "./checkout-form";

interface CheckoutPageProps {
  searchParams: Promise<{ planId?: string }>;
}

export const metadata = {
  title: "Checkout | Zaprill",
};

export default async function CheckoutPage(props: CheckoutPageProps) {
  const searchParams = await props.searchParams;
  const { planId } = searchParams;

  if (!planId) {
    redirect("/billing");
  }

  const [selectedPlan] = await db
    .select()
    .from(plan)
    .where(eq(plan.id, planId))
    .limit(1);

  if (!selectedPlan || !selectedPlan.isActive) {
    redirect("/billing");
  }

  // Fetch all active plans in the same category (to allow switching billing cycles)
  const availablePlans = await db
    .select()
    .from(plan)
    .where(eq(plan.category, selectedPlan.category))
    .orderBy(plan.amount);

  // Fetch available coupons
  const allCoupons = await db
    .select()
    .from(schema.coupons)
    .where(eq(schema.coupons.status, "active"));

  const now = new Date();
  const availableCoupons = allCoupons.filter((c) => {
    // 1. Check if the coupon has expired based on date
    if (c.endTime && now > new Date(c.endTime)) {
      return false;
    }

    // 2. Check if the plan amount meets the minimum order value requirement
    if (c.minOrderValue) {
      if (parseFloat(c.minOrderValue) > parseFloat(selectedPlan.amount))
        return false;
    }

    // 3. Visibility check
    return c.isPublic;
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-8 text-center font-bold text-3xl">
        Complete your purchase
      </h1>
      <CheckoutForm
        plan={selectedPlan as any}
        availablePlans={availablePlans as any}
        availableCoupons={availableCoupons}
      />
    </div>
  );
}
