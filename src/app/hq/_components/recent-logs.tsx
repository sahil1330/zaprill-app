"use client";

import { format } from "date-fns";
import { ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type LogEntry = {
  id: string;
  action: string;
  createdAt: string;
  adminName: string | null;
};

export function RecentLogs() {
  const [logs, setLogs] = useState<LogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/audit?limit=5")
      .then((r) => r.json())
      .then((json) => setLogs(json.logs ?? []))
      .catch(() => setError("Failed to load recent activity"));
  }, []);

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Admin Actions</CardTitle>
        <CardDescription>Latest logs from the audit system.</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-destructive text-center py-10">{error}</p>
        ) : !logs ? (
          <div className="space-y-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <Skeleton className="h-3.5 w-[200px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-4">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium leading-none">
                    {log.adminName || "System"} performed {log.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(log.createdAt), "MMM dd, HH:mm")}
                  </p>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-10">
                No recent activity logged.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
