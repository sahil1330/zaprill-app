"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditList } from "./_components/audit-list";

export default function AuditLogPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground">
          Track all administrative actions and security events.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-xl" />}>
        <AuditList />
      </Suspense>
    </div>
  );
}
