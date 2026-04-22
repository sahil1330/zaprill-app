/**
 * Seed script: populate initial subscription plans.
 * Run with: pnpm tsx src/scripts/seed-plans.ts
 *
 * Plans: Free (₹0), Pro Monthly (₹499), Pro Yearly (₹4,999)
 */
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const plans = [
  {
    id: "plan_free",
    name: "Free",
    slug: "free",
    description: "Get started with basic resume analysis",
    amount: "0.00",
    currency: "INR",
    billingCycle: "monthly" as const,
    features: JSON.stringify([
      "1 resume analysis per month",
      "Basic job matching",
      "Skill gap overview",
    ]),
    isActive: true,
    sortOrder: 0,
  },
  {
    id: "plan_pro_quarterly",
    name: "Pro Quarterly",
    slug: "pro-quarterly",
    description: "Unlimited analysis & full career roadmap",
    amount: "499.00",
    currency: "INR",
    billingCycle: "quarterly" as const,
    features: JSON.stringify([
      "Unlimited resume analyses",
      "Advanced job matching (300+ jobs)",
      "Detailed skill gap analysis",
      "AI career roadmap",
      "Save & track jobs",
      "Priority support",
    ]),
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "plan_pro_yearly",
    name: "Pro Yearly",
    slug: "pro-yearly",
    description: "Best value — save on yearly plan",
    amount: "999.00",
    currency: "INR",
    billingCycle: "yearly" as const,
    features: JSON.stringify([
      "Everything in Pro Quarterly",
      "Early access to new features",
      "Dedicated support",
    ]),
    isActive: true,
    sortOrder: 2,
  },
];

const coupons = [
  {
    id: "coup_new49",
    code: "NEW49",
    type: "flat" as const,
    value: "450.00", // 499 - 450 = 49
    maxDiscount: null,
    minOrderValue: "499.00",
    status: "active" as const,
    usageLimitGlobal: null,
    usageLimitPerUser: 1,
    newUserOnly: false,
  },
  {
    id: "coup_year149",
    code: "YEAR149",
    type: "flat" as const,
    value: "850.00", // 999 - 850 = 149
    maxDiscount: null,
    minOrderValue: "999.00",
    status: "active" as const,
    usageLimitGlobal: null,
    usageLimitPerUser: 1,
    newUserOnly: false,
  },
];

async function seedPlans() {
  console.log("🌱 Seeding plans...");
  for (const p of plans) {
    await db
      .insert(schema.plan)
      .values(p)
      .onConflictDoUpdate({
        target: schema.plan.id,
        set: {
          name: p.name,
          amount: p.amount,
          billingCycle: p.billingCycle,
          description: p.description,
          features: p.features,
          isActive: p.isActive,
          updatedAt: new Date(),
        },
      });
    console.log(`  ✓ ${p.name} (${p.id})`);
  }
  // Disable the old monthly plan to hide it from pricing
  await db
    .update(schema.plan)
    .set({ isActive: false })
    .where(eq(schema.plan.id, "plan_pro_monthly"));

  console.log("🎟️ Seeding coupons...");
  for (const c of coupons) {
    await db
      .insert(schema.coupons)
      .values(c)
      .onConflictDoUpdate({
        target: schema.coupons.code,
        set: {
          value: c.value,
          minOrderValue: c.minOrderValue,
          status: c.status,
          updatedAt: new Date(),
        },
      });
    console.log(`  ✓ Coupon: ${c.code}`);
  }

  console.log("✅ Plans & Coupons seeded!");
  process.exit(0);
}

seedPlans().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
