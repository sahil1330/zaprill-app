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
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-4 pb-8 border-b last:border-0 last:pb-0"
        >
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
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
          <p className="text-sm text-destructive text-center py-12">{error}</p>
        ) : !logs ? (
          <AuditSkeleton />
        ) : (
          <div className="space-y-8">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 pb-8 border-b last:border-0 last:pb-0"
              >
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {log.action}
                      </span>
                      <Badge variant="outline" className="text-[10px] py-0">
                        {log.entityType}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.createdAt), "MMM dd, HH:mm:ss")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>
                          Admin: {log.adminName || "System"} ({log.adminEmail})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        <span>IP: {log.ipAddress}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Monitor className="h-3 w-3" />
                        <span
                          className="truncate max-w-[200px]"
                          title={log.userAgent || ""}
                        >
                          {log.userAgent}
                        </span>
                      </div>
                    </div>
                  </div>

                  {log.details && (
                    <div className="mt-3 bg-muted rounded-md p-3">
                      <pre className="text-[10px] font-mono text-muted-foreground whitespace-pre-wrap">
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
