"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BillingContent } from "./_components/billing-content";

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">
          Billing &amp; AI Usage
        </h1>
        <p className="text-muted-foreground">
          Monitor revenue, token consumption, and infrastructure costs.
        </p>
      </div>

      <Suspense
        fallback={
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {["s1", "s2", "s3"].map((slot) => (
                <Skeleton key={slot} className="h-[110px] rounded-xl" />
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-[360px] rounded-xl" />
              <Skeleton className="h-[360px] rounded-xl" />
            </div>
            <Skeleton className="h-[260px] rounded-xl" />
          </>
        }
      >
        <BillingContent />
      </Suspense>
    </div>
  );
}
