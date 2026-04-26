"use client";

import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UsersTable } from "./_components/users-table";

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage your platform users, roles, and permissions.
          </p>
        </div>
      </div>

      <Card className="p-6">
        <Suspense
          fallback={<Skeleton className="h-[500px] w-full rounded-lg" />}
        >
          <UsersTable />
        </Suspense>
      </Card>
    </div>
  );
}
