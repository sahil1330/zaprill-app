import { eq } from "drizzle-orm";
import { Check } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import db from "@/db";
import { plan } from "@/db/schema";
import { formatCurrency } from "@/lib/billing-utils";

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
    <div className="container max-w-6xl py-16 mx-auto px-4 md:px-6">
      <div className="text-center space-y-4 mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock the full power of AI to analyze your resume and get a
          personalized career roadmap.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((p) => {
          const isPro = p.slug.includes("pro");
          const isYearly = p.billingCycle === "yearly";
          let features: string[] = [];
          try {
            features = JSON.parse(p.features as string) || [];
          } catch {
            // fallback
          }

          return (
            <Card
              key={p.id}
              className={`relative flex flex-col ${
                isPro && !isYearly
                  ? "border-primary shadow-lg scale-105 z-10"
                  : "border-border"
              }`}
            >
              {isPro && !isYearly && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              {isYearly && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Badge
                    variant="secondary"
                    className="font-semibold px-3 py-1"
                  >
                    Best Value
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl">{p.name}</CardTitle>
                <CardDescription className="pt-2 h-12">
                  {p.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {formatCurrency(p.amount)}
                  </span>
                  {parseFloat(p.amount) > 0 && (
                    <span className="text-muted-foreground">
                      /
                      {p.billingCycle === "monthly"
                        ? "mo"
                        : p.billingCycle === "quarterly"
                          ? "qtr"
                          : "yr"}
                    </span>
                  )}
                </div>
                {p.billingCycle === "quarterly" && (
                  <div className="mt-3 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-md border border-green-200 dark:border-green-900 inline-block">
                    Use code{" "}
                    <span className="font-bold border-b border-dashed border-green-600 dark:border-green-400">
                      NEW49
                    </span>{" "}
                    to get it for ₹49
                  </div>
                )}
                {p.billingCycle === "yearly" && (
                  <div className="mt-3 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-md border border-green-200 dark:border-green-900 inline-block">
                    Use code{" "}
                    <span className="font-bold border-b border-dashed border-green-600 dark:border-green-400">
                      YEAR149
                    </span>{" "}
                    to get it for ₹149
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-1 mt-6">
                <ul className="space-y-3">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-primary shrink-0 mr-3" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pb-8">
                <Button
                  render={<Link href={`/checkout?planId=${p.id}`} />}
                  className="w-full"
                  variant={isPro && !isYearly ? "default" : "outline"}
                >
                  {parseFloat(p.amount) === 0 ? "Get Started" : "Subscribe Now"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
