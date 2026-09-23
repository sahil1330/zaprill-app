import type React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end",
        className,
      )}
    >
      <div className="space-y-2">
        {eyebrow && (
          <p className="font-bold text-primary text-xs uppercase tracking-[0.2em]">
            {eyebrow}
          </p>
        )}
        <h1 className="font-black font-heading text-3xl tracking-tight md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl font-medium text-base text-muted-foreground md:text-lg">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
