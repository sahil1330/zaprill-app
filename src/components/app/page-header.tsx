import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** One primary call to action. */
  action?: ReactNode;
  /** Existing pages pass `actions`. Prefer `action` for new screens. */
  actions?: ReactNode;
  eyebrow?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  actions,
  eyebrow,
  className,
}: PageHeaderProps) {
  const slot = action ?? actions;

  return (
    <header
      data-slot="page-header"
      className={cn(
        "mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow ? (
          <p className="font-medium text-muted-foreground text-xs">{eyebrow}</p>
        ) : null}
        <h1 className="font-heading font-semibold text-3xl text-foreground tracking-tight md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-muted-foreground text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {slot ? (
        <div
          data-slot="page-header-action"
          className="flex shrink-0 items-center gap-2"
        >
          {slot}
        </div>
      ) : null}
    </header>
  );
}
