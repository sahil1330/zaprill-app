"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsContent } from "./_components/analytics-content";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Website performance and user behavior tracking via GA4.
        </p>
      </div>

      <Suspense
        fallback={
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[110px] w-full rounded-xl" />
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
              <Skeleton className="col-span-4 h-[380px] rounded-xl" />
              <Skeleton className="col-span-3 h-[380px] rounded-xl" />
            </div>
          </>
        }
      >
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}
