"use client";

import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-6 py-6">
      {/* Header Skeleton */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-64 md:w-96" />
          <Skeleton className="h-6 w-48 md:w-80" />
        </div>
        <Skeleton className="h-12 w-48 rounded-xl" />
      </div>

      {/* Metrics Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 space-y-4 rounded-2xl border border-border/50 p-6"
          >
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="mt-4 h-2 w-full" />
          </div>
        ))}
      </div>

      {/* Jobs Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="space-y-4">
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
    </div>
  );
}

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
