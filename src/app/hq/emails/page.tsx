"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmailsContent } from "./_components/emails-content";

export default function EmailsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Hub</h1>
        <p className="text-muted-foreground">
          Manage all outgoing and incoming communications.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-[400px] rounded-lg" />
            <Skeleton className="h-[500px] w-full rounded-xl" />
          </div>
        }
      >
        <EmailsContent />
      </Suspense>
    </div>
  );
}
