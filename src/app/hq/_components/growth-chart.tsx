"use client";

import { format } from "date-fns";
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

type ChartRow = {
  date: string;
  users: number;
  sessions: number;
  views: number;
};

export function GrowthChart() {
  const [chartData, setChartData] = useState<ChartRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats/growth")
      .then((r) => r.json())
      .then((json) => {
        const rows: ChartRow[] = (json.rows ?? []).map((r: any) => ({
          date: format(new Date(r.date), "MMM dd"),
          users: parseInt(r.users),
          sessions: 0,
          views: 0,
        }));
        setChartData(rows);
      })
      .catch(() => setError("Failed to load growth data"));
  }, []);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
        <CardDescription>
          New registrations over the last 30 days.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {error ? (
          <p className="text-sm text-destructive py-10 text-center">{error}</p>
        ) : !chartData ? (
          <Skeleton className="h-[300px] w-full rounded-md" />
        ) : (
          <OverviewChart data={chartData} />
        )}
      </CardContent>
    </Card>
  );
}
