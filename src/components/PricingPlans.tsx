"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/billing-utils";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  amount: string;
  originalAmount: string | null;
  billingCycle: string;
  category: string;
  sortOrder: number;
  features: unknown;
}

export default function PricingPlans({ plans }: { plans: Plan[] }) {
  // Extract unique categories (excluding 'free')
  const categories = useMemo(() => {
    const cats = Array.from(new Set(plans.map((p) => p.category))).filter(
      (c) => c !== "free",
    );
    return cats.length > 0 ? cats : ["pro"];
  }, [plans]);

  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  // Group plans by category
  const plansByCategory = useMemo(() => {
    const grouped: Record<string, Plan[]> = {};
    for (const p of plans) {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push(p);
    }
    return grouped;
  }, [plans]);

  // The plans to show always (e.g. Free) + the plans for the selected category
  const activePlans = useMemo(() => {
    const freePlans = plansByCategory["free"] || [];
    const tierPlans = plansByCategory[selectedCategory] || [];
    return [...freePlans, ...tierPlans].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
  }, [plansByCategory, selectedCategory]);

  return (
    <div className="w-full max-w-7xl mx-auto py-12 flex flex-col items-center gap-10">
      {/* Category Tabs Switcher (only if more than 1 premium category) */}
      {categories.length > 1 && (
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="w-auto"
        >
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="capitalize font-bold"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full pt-6">
        {activePlans.map((p) => {
          const isYearly = p.billingCycle === "yearly";
          const isQuarterly = p.billingCycle === "quarterly";

          const amount = parseFloat(p.amount);
          const originalAmount = p.originalAmount
            ? parseFloat(p.originalAmount)
            : amount;
          const savings = originalAmount - amount;

          let pricePerMonth = amount;
          if (isQuarterly) pricePerMonth = amount / 3;
          if (isYearly) pricePerMonth = amount / 12;

          let features: string[] = [];
          try {
            features =
              (typeof p.features === "string"
                ? JSON.parse(p.features)
                : p.features) || [];
          } catch {
            // fallback
          }

          return (
            <Card
              key={p.id}
              className={`relative flex flex-col overflow-visible transition-all duration-300 ${
                isYearly
                  ? "border-primary shadow-lg scale-105 z-10 ring-2 ring-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {isYearly && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1">
                    Best Value
                  </Badge>
                </div>
              )}
              {isQuarterly && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Badge
                    variant="secondary"
                    className="font-semibold px-3 py-1"
                  >
                    Save More
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl capitalize">{p.name}</CardTitle>
                <CardDescription className="pt-2 h-12">
                  {p.description}
                </CardDescription>

                <div className="mt-4 flex flex-col items-center">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      {formatCurrency(pricePerMonth.toString())}
                    </span>
                    <span className="text-muted-foreground ml-1">/mo</span>
                  </div>
                  {(isQuarterly || isYearly) && (
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                      (billed {p.billingCycle})
                    </span>
                  )}

                  <div className="mt-3 flex items-center gap-2 min-h-[28px]">
                    {originalAmount > amount && (
                      <span className="text-muted-foreground line-through text-sm font-medium">
                        {formatCurrency(originalAmount.toString())}
                      </span>
                    )}
                    {savings > 0 && (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30 font-bold"
                      >
                        Save {formatCurrency(savings.toString())}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 mt-6">
                <ul className="space-y-3">
                  {features.map((feature: any, i: number) => (
                    <li key={i} className="flex items-start text-left">
                      <Check className="h-5 w-5 text-primary shrink-0 mr-3" />
                      <span className="text-muted-foreground text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pb-8">
                <Link
                  href={
                    parseFloat(p.amount) === 0
                      ? "/"
                      : `/checkout?planId=${p.id}`
                  }
                  className="w-full"
                >
                  <Button
                    className="w-full"
                    variant={isYearly ? "default" : "outline"}
                  >
                    {parseFloat(p.amount) === 0
                      ? "Get Started"
                      : "Subscribe Now"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
