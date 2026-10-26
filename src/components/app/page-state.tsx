"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_SKELETON_ROWS = 3;

export function PageEmpty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section
      data-slot="page-empty"
      className="rounded-lg border border-border bg-muted/40 px-6 py-10 text-center"
    >
      <h2 className="font-heading font-semibold text-base text-foreground">
        {title}
      </h2>
      <p className="mx-auto mt-1.5 max-w-md text-muted-foreground text-sm">
        {description}
      </p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </section>
  );
}

export function PageError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      data-slot="page-error"
      className="flex flex-col gap-3 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-destructive text-sm">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}

export function PageSkeleton({
  rows = DEFAULT_SKELETON_ROWS,
}: {
  rows?: number;
}) {
  const count = rows > 0 ? Math.floor(rows) : DEFAULT_SKELETON_ROWS;

  return (
    <div
      aria-hidden="true"
      data-slot="page-skeleton"
      className="space-y-3 rounded-lg border border-border bg-card p-4"
    >
      {Array.from({ length: count }, (_, index) => (
        <Skeleton
          key={`page-skeleton-row-${index + 1}`}
          className={
            index === count - 1 && count > 1 ? "h-4 w-2/3" : "h-4 w-full"
          }
        />
      ))}
    </div>
  );
}
