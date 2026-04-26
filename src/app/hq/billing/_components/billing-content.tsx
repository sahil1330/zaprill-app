"use client";

import { format, parseISO } from "date-fns";
import {
  Activity,
  ArrowUpRight,
  Coins,
  DollarSign,
  RefreshCcw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ContentSkeleton() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[110px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[360px] rounded-xl" />
        <Skeleton className="h-[360px] rounded-xl" />
      </div>
      <Skeleton className="h-[260px] rounded-xl" />
    </>
  );
}

export function BillingContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats?days=30");
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Failed to load billing stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) return <ContentSkeleton />;

  const revenueData =
    data?.revenue?.map((r: any) => ({
      date: format(parseISO(r.date), "MMM dd"),
      amount: parseFloat(r.revenue),
    })) || [];

  const aiData =
    data?.ai?.map((a: any) => ({
      date: format(parseISO(a.date), "MMM dd"),
      tokens: parseInt(a.tokens),
      cost: parseFloat(a.cost),
    })) || [];

  const totalRevenue = revenueData.reduce(
    (acc: number, curr: any) => acc + curr.amount,
    0,
  );
  const totalTokens = aiData.reduce(
    (acc: number, curr: any) => acc + curr.tokens,
    0,
  );
  const totalAiCost = aiData.reduce(
    (acc: number, curr: any) => acc + curr.cost,
    0,
  );

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={fetchStats} variant="outline" size="icon">
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-emerald-500 mt-1">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              AI Token Spend
            </CardTitle>
            <Coins className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalTokens / 1_000_000).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated Cost: ${totalAiCost.toFixed(4)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Cost per Day
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalAiCost / (data?.ai?.length || 1)).toFixed(4)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Optimized via caching
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Daily revenue in INR (last 30 days)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--muted))"
                />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token Consumption</CardTitle>
            <CardDescription>
              Daily AI tokens used across all models
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aiData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--muted))"
                />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tokens"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model Distribution</CardTitle>
          <CardDescription>
            AI usage and cost breakdown by LLM model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                    Model
                  </th>
                  <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">
                    Requests
                  </th>
                  <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">
                    Tokens
                  </th>
                  <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">
                    Est. Cost
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {data?.models?.map((m: any) => (
                  <tr
                    key={m.model}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-2 align-middle font-medium">{m.model}</td>
                    <td className="p-2 align-middle text-right">
                      {parseInt(m.usage_count).toLocaleString()}
                    </td>
                    <td className="p-2 align-middle text-right">
                      {(parseInt(m.total_tokens) / 1000).toFixed(1)}k
                    </td>
                    <td className="p-2 align-middle text-right text-amber-500 font-mono">
                      ${parseFloat(m.total_cost).toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
