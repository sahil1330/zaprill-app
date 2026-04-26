"use client";

import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GrowthChart } from "./_components/growth-chart";
import { RecentLogs } from "./_components/recent-logs";
import { StatsCards } from "./_components/stats-cards";

function StatsSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[110px] w-full rounded-xl" />
      ))}
    </>
  );
}

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">
            Welcome to the Zaprill management headquarters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="px-2 py-1 border-emerald-500/50 text-emerald-500"
          >
            <span className="mr-1.5 flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            System Healthy
          </Badge>
          <Badge variant="secondary" className="px-2 py-1">
            v1.0.0-stable
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<StatsSkeleton />}>
          <StatsCards />
        </Suspense>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Suspense
          fallback={
            <div className="col-span-4">
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
          }
        >
          <GrowthChart />
        </Suspense>

        <Suspense
          fallback={
            <div className="col-span-3">
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
          }
        >
          <RecentLogs />
        </Suspense>
      </div>
    </div>
  );
}
