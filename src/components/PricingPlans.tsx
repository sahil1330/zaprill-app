"use client";

import { Check, Info } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  // Filter plans to show exactly one per category: free, pro, max
  const activePlans = useMemo(() => {
    const categoriesToShow = ["free", "pro", "max"];
    const displayPlans: Plan[] = [];

    // Group plans by category for easy lookup
    const plansByCategory: Record<string, Plan[]> = {};
    for (const p of plans) {
      if (!plansByCategory[p.category]) plansByCategory[p.category] = [];
      plansByCategory[p.category].push(p);
    }

    for (const cat of categoriesToShow) {
      const catPlans = plansByCategory[cat] || [];
      if (catPlans.length === 0) continue;

      // For premium plans, prefer yearly for initial display
      if (cat !== "free") {
        const yearlyPlan =
          catPlans.find((p) => p.billingCycle === "yearly") || catPlans[0];
        displayPlans.push(yearlyPlan);
      } else {
        displayPlans.push(catPlans[0]);
      }
    }

    return displayPlans.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [plans]);

  // Dynamic grid columns based on number of plans
  const gridCols =
    activePlans.length === 1
      ? "md:grid-cols-1 max-w-md"
      : activePlans.length === 2
        ? "md:grid-cols-2 max-w-4xl"
        : activePlans.length === 3
          ? "md:grid-cols-3 max-w-6xl"
          : "md:grid-cols-4 max-w-7xl";

  return (
    <div className="w-full max-w-7xl mx-auto py-12 flex flex-col items-center gap-10">
      {/* Category Tabs Switcher (only if more than 1 premium category) */}
      <div className={`grid grid-cols-1 ${gridCols} gap-8 w-full pt-6`}>
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

              <CardHeader className="text-center pt-8 space-y-4">
                <CardTitle className="text-2xl capitalize">{p.name}</CardTitle>
                <CardDescription className="h-12">
                  {p.description}
                </CardDescription>

                <div className="flex flex-col items-center pt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tight">
                      {formatCurrency(pricePerMonth.toFixed(2))}
                    </span>
                    <span className="text-muted-foreground font-bold text-sm">
                      /mo
                    </span>
                  </div>
                  {isYearly && (
                    <div className="flex flex-col items-center mt-1">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                        Billed Yearly
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {formatCurrency(p.amount)} / year
                      </span>
                    </div>
                  )}
                  {isQuarterly && (
                    <div className="flex flex-col items-center mt-1">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                        Billed Quarterly
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {formatCurrency(p.amount)} / quarter
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-center gap-2 min-h-[28px]">
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
              </CardHeader>

              <CardContent className="flex-1 mt-6">
                <TooltipProvider>
                  <ul className="space-y-3">
                    {features.map((feature: any, i: number) => {
                      const text =
                        typeof feature === "string" ? feature : feature.text;
                      const info =
                        typeof feature === "string" ? null : feature.info;

                      return (
                        <li key={i} className="flex items-start text-left">
                          <Check className="h-5 w-5 text-primary shrink-0 mr-3" />
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-muted-foreground text-sm">
                              {text}
                            </span>
                            {info && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <button
                                    type="button"
                                    className="text-muted-foreground/50 hover:text-primary transition-colors outline-none"
                                  >
                                    <Info className="h-3.5 w-3.5" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="right"
                                  className="max-w-[200px] text-xs"
                                >
                                  {info}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </TooltipProvider>
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
