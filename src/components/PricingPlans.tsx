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
  isGstEnabled: boolean;
  gstPercentage: string | null;
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
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-10 py-12">
      {/* Category Tabs Switcher (only if more than 1 premium category) */}
      <div className={`grid grid-cols-1 ${gridCols} w-full gap-8 pt-6`}>
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
                  ? "z-10 scale-105 border-primary shadow-lg ring-2 ring-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {isYearly && (
                <div className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-1/2">
                  <Badge className="bg-primary px-3 py-1 font-semibold text-primary-foreground">
                    Best Value
                  </Badge>
                </div>
              )}
              {isQuarterly && (
                <div className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-1/2">
                  <Badge
                    variant="secondary"
                    className="px-3 py-1 font-semibold"
                  >
                    Save More
                  </Badge>
                </div>
              )}

              <CardHeader className="space-y-4 pt-8 text-center">
                <CardTitle className="text-2xl capitalize">{p.name}</CardTitle>
                <CardDescription className="h-12">
                  {p.description}
                </CardDescription>

                <div className="flex flex-col items-center pt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-black text-4xl tracking-tight">
                      {formatCurrency(pricePerMonth.toFixed(2))}
                    </span>
                    <span className="font-bold text-muted-foreground text-sm">
                      /mo
                    </span>
                  </div>
                  {isYearly && (
                    <div className="mt-1 flex flex-col items-center">
                      <span className="font-black text-[10px] text-primary uppercase tracking-widest">
                        Billed Yearly
                      </span>
                      <span className="font-medium text-muted-foreground text-xs">
                        {formatCurrency(p.amount)} / year
                      </span>
                    </div>
                  )}
                  {isQuarterly && (
                    <div className="mt-1 flex flex-col items-center">
                      <span className="font-black text-[10px] text-primary uppercase tracking-widest">
                        Billed Quarterly
                      </span>
                      <span className="font-medium text-muted-foreground text-xs">
                        {formatCurrency(p.amount)} / quarter
                      </span>
                    </div>
                  )}
                  {p.isGstEnabled && (
                    <span className="mt-1.5 font-bold text-[10px] text-emerald-500 uppercase tracking-wider">
                      + {p.gstPercentage}% GST
                    </span>
                  )}
                </div>

                <div className="mt-3 flex min-h-[28px] items-center justify-center gap-2">
                  {originalAmount > amount && (
                    <span className="font-medium text-muted-foreground text-sm line-through">
                      {formatCurrency(originalAmount.toString())}
                    </span>
                  )}
                  {savings > 0 && (
                    <Badge
                      variant="outline"
                      className="border-green-200 bg-green-50 font-bold text-green-600 dark:bg-green-950/30"
                    >
                      Save {formatCurrency(savings.toString())}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="mt-6 flex-1">
                <TooltipProvider>
                  <ul className="space-y-3">
                    {features.map((feature: any, i: number) => {
                      const text =
                        typeof feature === "string" ? feature : feature.text;
                      const info =
                        typeof feature === "string" ? null : feature.info;
                      const reactKey = `${text}-${i}`;

                      return (
                        <li
                          key={reactKey}
                          className="flex items-start text-left"
                        >
                          <Check className="mr-3 h-5 w-5 shrink-0 text-primary" />
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span className="text-muted-foreground text-sm">
                              {text}
                            </span>
                            {info && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <button
                                    type="button"
                                    className="text-muted-foreground/50 outline-none transition-colors hover:text-primary"
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
