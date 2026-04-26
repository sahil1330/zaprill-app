"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsContent } from "./_components/settings-content";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage plans, coupons, and platform configuration.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-10 w-[360px] rounded-lg" />
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[180px] rounded-xl" />
              ))}
            </div>
          </div>
        }
      >
        <SettingsContent />
      </Suspense>
    </div>
  );
}
