"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function AnalyzeSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-5">
      {/* Header */}
      <div className="flex flex-col items-start gap-8 border-border border-b pb-10 md:flex-row">
        <Skeleton className="h-32 w-32 shrink-0 rounded-3xl" />
        <div className="w-full flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Skeleton className="h-12 w-full rounded-full" />

      {/* Content */}
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex h-[140px] items-center gap-6 rounded-2xl border border-border/50 p-6"
          >
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
            <Skeleton className="h-12 w-32 shrink-0 rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
