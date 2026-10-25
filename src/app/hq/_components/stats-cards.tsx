"use client";

import { Activity, Brain, DollarSign, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type OverviewStats = {
  userCount: number;
  activeSubs: number;
  totalRevenue: number;
  totalTokens: number;
};

function StatSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-2 h-8 w-[80px]" />
        <Skeleton className="h-3 w-[100px]" />
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats/overview")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setError("Failed to load stats"));
  }, []);

  if (error) {
    return <div className="col-span-4 text-destructive text-sm">{error}</div>;
  }

  if (!stats) {
    return (
      <>
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </>
    );
  }

  const items = [
    {
      title: "Total Users",
      value: stats.userCount.toLocaleString(),
      description: "Lifetime registrations",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Active Subscriptions",
      value: stats.activeSubs.toLocaleString(),
      description: "Paying customers",
      icon: Activity,
      color: "text-emerald-500",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      description: "Net collected revenue",
      icon: DollarSign,
      color: "text-amber-500",
    },
    {
      title: "AI Consumption",
      value: `${(stats.totalTokens / 1000).toFixed(1)}k`,
      description: "Total tokens used",
      icon: Brain,
      color: "text-primary",
    },
  ];

  return (
    <>
      {items.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">{stat.title}</CardTitle>
            <stat.icon className={cn("h-4 w-4", stat.color)} />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stat.value}</div>
            <p className="pt-1 text-muted-foreground text-xs">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
