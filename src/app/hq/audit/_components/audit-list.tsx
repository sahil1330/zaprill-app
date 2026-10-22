"use client";

import { format } from "date-fns";
import { Globe, Monitor, ShieldAlert, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  adminName: string | null;
  adminEmail: string | null;
};

function AuditSkeleton() {
  return (
    <div className="space-y-8">
      {["s1", "s2", "s3", "s4", "s5", "s6"].map((slot) => (
        <div
          key={slot}
          className="flex items-start gap-4 border-b pb-8 last:border-0 last:pb-0"
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <Skeleton className="h-3 w-[160px]" />
              <Skeleton className="h-3 w-[120px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AuditList() {
  const [logs, setLogs] = useState<AuditLog[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/audit?limit=100")
      .then((r) => r.json())
      .then((json) => setLogs(json.logs ?? []))
      .catch(() => setError("Failed to load audit logs"));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Showing the last 100 administrative actions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="py-12 text-center text-destructive text-sm">{error}</p>
        ) : !logs ? (
          <AuditSkeleton />
        ) : (
          <div className="space-y-8">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 border-b pb-8 last:border-0 last:pb-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {log.action}
                      </span>
                      <Badge variant="outline" className="py-0 text-[10px]">
                        {log.entityType}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {format(new Date(log.createdAt), "MMM dd, HH:mm:ss")}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <User className="h-3 w-3" />
                        <span>
                          Admin: {log.adminName || "System"} ({log.adminEmail})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Globe className="h-3 w-3" />
                        <span>IP: {log.ipAddress}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Monitor className="h-3 w-3" />
                        <span
                          className="max-w-[200px] truncate"
                          title={log.userAgent || ""}
                        >
                          {log.userAgent}
                        </span>
                      </div>
                    </div>
                  </div>

                  {log.details && (
                    <div className="mt-3 rounded-md bg-muted p-3">
                      <pre className="whitespace-pre-wrap font-mono text-[10px] text-muted-foreground">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {logs.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                No audit logs found.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
