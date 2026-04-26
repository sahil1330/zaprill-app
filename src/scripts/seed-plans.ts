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
    originalAmount: "0.00",
    currency: "INR",
    billingCycle: "monthly" as const,
    category: "free",
    features: JSON.stringify([
      "1 resume analysis per month",
      "Basic job matching",
      "Skill gap overview",
    ]),
    isActive: true,
    sortOrder: 0,
  },
  {
    id: "plan_pro_monthly",
    name: "Monthly",
    slug: "pro-monthly",
    description: "Flexible monthly plan",
    amount: "49.00",
    originalAmount: "99.00",
    currency: "INR",
    billingCycle: "monthly" as const,
    category: "pro",
    features: JSON.stringify([
      "Ads-free experience",
      "100% job match visibility",
      "AI-powered resume rewrite",
      "Search up to 7 job titles",
      "1 skill test per week",
      "Priority support",
    ]),
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "plan_pro_quarterly",
    name: "Quarterly",
    slug: "pro-quarterly",
    description: "Save more with quarterly billing",
    amount: "129.00",
    originalAmount: "299.00",
    currency: "INR",
    billingCycle: "quarterly" as const,
    category: "pro",
    features: JSON.stringify([
      "Ads-free experience",
      "100% job match visibility",
      "AI-powered resume rewrite",
      "Search up to 7 job titles",
      "1 skill test per week",
      "Priority support",
    ]),
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "plan_pro_yearly",
    name: "Yearly",
    slug: "pro-yearly",
    description: "Best value — for serious career growth",
    amount: "399.00",
    originalAmount: "699.00",
    currency: "INR",
    billingCycle: "yearly" as const,
    category: "pro",
    features: JSON.stringify([
      "Ads-free experience",
      "100% job match visibility",
      "AI-powered resume rewrite",
      "Search up to 7 job titles",
      "1 skill test per week",
      "Priority support",
    ]),
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "plan_max_monthly",
    name: "Max Monthly",
    slug: "max-monthly",
    description: "Ultimate power for career seekers",
    amount: "199.00",
    originalAmount: "399.00",
    currency: "INR",
    billingCycle: "monthly" as const,
    category: "max",
    features: JSON.stringify([
      "Everything in Pro",
      "Unlimited resume analyses",
      "One-on-one AI coaching",
      "Priority matching for top jobs",
      "Weekly career roadmap",
      "Expert human review (1/mo)",
    ]),
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "plan_max_quarterly",
    name: "Max Quarterly",
    slug: "max-quarterly",
    description: "The ultimate quarterly value",
    amount: "499.00",
    originalAmount: "999.00",
    currency: "INR",
    billingCycle: "quarterly" as const,
    category: "max",
    features: JSON.stringify([
      "Everything in Pro",
      "Unlimited resume analyses",
      "One-on-one AI coaching",
      "Priority matching for top jobs",
      "Weekly career roadmap",
      "Expert human review (1/mo)",
    ]),
    isActive: true,
    sortOrder: 5,
  },
  {
    id: "plan_max_yearly",
    name: "Max Yearly",
    slug: "max-yearly",
    description: "Best for long-term career dominance",
    amount: "1499.00",
    originalAmount: "2999.00",
    currency: "INR",
    billingCycle: "yearly" as const,
    category: "max",
    features: JSON.stringify([
      "Everything in Pro",
      "Unlimited resume analyses",
      "One-on-one AI coaching",
      "Priority matching for top jobs",
      "Weekly career roadmap",
      "Expert human review (1/mo)",
    ]),
    isActive: true,
    sortOrder: 6,
  },
];

const coupons: any[] = [];

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
          originalAmount: p.originalAmount,
          billingCycle: p.billingCycle,
          category: p.category,
          description: p.description,
          features: p.features,
          isActive: p.isActive,
          sortOrder: p.sortOrder,
          updatedAt: new Date(),
        },
      });
    console.log(`  ✓ ${p.name} (${p.id})`);
  }
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
