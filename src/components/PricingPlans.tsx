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
import { formatCurrency } from "@/lib/billing-utils";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  amount: string;
  billingCycle: string;
  features: unknown;
}

export default function PricingPlans({ plans }: { plans: Plan[] }) {
  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {plans.map((p) => {
        const isPro = p.slug.includes("pro");
        const isYearly = p.billingCycle === "yearly";
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
                <Badge variant="secondary" className="font-semibold px-3 py-1">
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
                  <span className="text-muted-foreground ml-1">
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
                {features.map((feature: any, i: number) => (
                  <li key={i} className="flex items-start text-left">
                    <Check className="h-5 w-5 text-primary shrink-0 mr-3" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pb-8">
              <Link
                href={
                  parseFloat(p.amount) === 0 ? "/" : `/checkout?planId=${p.id}`
                }
                className="w-full"
              >
                <Button
                  className="w-full"
                  variant={isPro && !isYearly ? "default" : "outline"}
                >
                  {parseFloat(p.amount) === 0 ? "Get Started" : "Subscribe Now"}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
