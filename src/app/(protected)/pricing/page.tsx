import { eq } from "drizzle-orm";
import PricingPlans from "@/components/PricingPlans";
import db from "@/db";
import { plan } from "@/db/schema";

export const metadata = {
  title: "Pricing | Zaprill",
  description: "Choose the perfect plan for your career growth.",
};

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const plans = await db
    .select()
    .from(plan)
    .where(eq(plan.isActive, true))
    .orderBy(plan.sortOrder);

  return (
    <div className="container max-w-6xl py-16 mx-auto px-4 md:px-6 text-center">
      <div className="space-y-4 mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock the full power of AI to analyze your resume and get a
          personalized career roadmap.
        </p>
      </div>
      <PricingPlans plans={plans} />
    </div>
  );
}
