"use client";

import { format, parseISO } from "date-fns";
import { Activity, Clock, MousePointer2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { OverviewChart } from "@/components/admin/overview-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type AnalyticsData = {
  coreData: any;
  eventData: any;
  realtimeUsers: number;
};

function KpiSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[60px] mb-2" />
        <Skeleton className="h-3 w-[100px]" />
      </CardContent>
    </Card>
  );
}

export function AnalyticsContent() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics?days=30")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError("Failed to load analytics data"));
  }, []);

  if (error) {
    return (
      <p className="text-sm text-destructive text-center py-12">{error}</p>
    );
  }

  if (!data) {
    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
          <Skeleton className="col-span-4 h-[380px] rounded-xl" />
          <Skeleton className="col-span-3 h-[380px] rounded-xl" />
        </div>
      </>
    );
  }

  const chartData =
    data.coreData?.rows
      ?.map((row: any) => ({
        date: format(parseISO(row.dimensionValues?.[0]?.value || ""), "MMM dd"),
        users: parseInt(row.metricValues?.[0]?.value || "0"),
        sessions: parseInt(row.metricValues?.[1]?.value || "0"),
        views: parseInt(row.metricValues?.[2]?.value || "0"),
      }))
      .sort(
        (a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime(),
      ) || [];

  const eventDistribution =
    data.eventData?.rows?.map((row: any) => ({
      name: row.dimensionValues?.[0]?.value || "Unknown",
      value: parseInt(row.metricValues?.[0]?.value || "0"),
    })) || [];

  const totalUsers = chartData.reduce(
    (acc: number, curr: any) => acc + curr.users,
    0,
  );
  const totalViews = chartData.reduce(
    (acc: number, curr: any) => acc + curr.views,
    0,
  );

  return (
    <>
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-500">
              Real-time Users
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.realtimeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active in last 30 minutes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users (30d)
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Unique visitors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <MousePointer2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total screens viewed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1m 24s</div>
            <p className="text-xs text-muted-foreground">
              Time spent per session
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Growth Trends</CardTitle>
            <CardDescription>
              Users and sessions over the last 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Events</CardTitle>
            <CardDescription>Most frequent user interactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {eventDistribution.map((item: any) => (
                <div key={item.name} className="flex items-center">
                  <div className="ml-4 space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none capitalize">
                      {item.name.replace(/_/g, " ")}
                    </p>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${
                            eventDistribution[0]?.value > 0
                              ? (item.value / eventDistribution[0].value) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="ml-auto font-medium text-sm">
                    {item.value.toLocaleString()}
                  </div>
                </div>
              ))}
              {eventDistribution.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No event data available.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
