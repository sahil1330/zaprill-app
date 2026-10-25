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
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
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
        {["s1", "s2", "s3"].map((slot) => (
          <Skeleton key={slot} className="h-[110px] rounded-xl" />
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

  const growthData =
    data?.growth?.map((g: any) => ({
      date: format(parseISO(g.date), "MMM dd"),
      users: parseInt(g.users),
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
  const totalNewUsers = growthData.reduce(
    (acc: number, curr: any) => acc + curr.users,
    0,
  );

  const netMargin = totalRevenue - totalAiCost * 84; // Assuming 1 USD = 84 INR
  const efficiencyRatio = totalRevenue / (totalAiCost * 84 || 1);
  const costPerUser = (totalAiCost * 84) / (totalNewUsers || 1);

  // Combine all data for correlation chart
  const combinedData = revenueData.map((r: any) => {
    const ai = aiData.find((a: any) => a.date === r.date);
    const growth = growthData.find((g: any) => g.date === r.date);
    return {
      date: r.date,
      revenue: r.amount,
      cost: (ai?.cost || 0) * 84,
      users: growth?.users || 0,
    };
  });

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={fetchStats} variant="outline" size="icon">
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Net Margin</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              ₹
              {netMargin.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </div>
            <div className="mt-1 flex items-center text-emerald-500 text-xs">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              Healthy Profitability
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Efficiency</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {efficiencyRatio.toFixed(1)}x
            </div>
            <p className="mt-1 text-muted-foreground text-xs">
              Revenue per ₹1 AI Spend
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Cost per User</CardTitle>
            <Coins className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">₹{costPerUser.toFixed(2)}</div>
            <p className="mt-1 text-muted-foreground text-xs">
              AI cost per registration
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">New Users</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{totalNewUsers}</div>
            <p className="mt-1 text-muted-foreground text-xs">
              Last 30 days growth
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Usage vs Price vs Growth Correlation</CardTitle>
          <CardDescription>
            How user growth scales with AI costs and revenue generation.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={combinedData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.6 0.18 160)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.6 0.18 160)"
                    stopOpacity={0.2}
                  />
                </linearGradient>
              </defs>
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
                yAxisId="left"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                fill="url(#colorRev)"
                stroke="oklch(0.6 0.18 160)"
                strokeWidth={2}
                name="Revenue (INR)"
              />
              <Bar
                yAxisId="left"
                dataKey="cost"
                fill="oklch(0.62 0.22 303)"
                opacity={0.6}
                radius={[4, 4, 0, 0]}
                name="AI Cost (INR)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="users"
                stroke="oklch(0.68 0.13 260)"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="New Users"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
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
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="oklch(0.79 0.15 160)"
                      stopOpacity={1}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(0.6 0.18 160)"
                      stopOpacity={1}
                    />
                  </linearGradient>
                </defs>
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
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="url(#colorRevenue)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
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
              <AreaChart data={aiData}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="oklch(0.62 0.22 303)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(0.62 0.22 303)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
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
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tokens"
                  stroke="oklch(0.62 0.22 303)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTokens)"
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </AreaChart>
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
                  <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">
                    Efficiency
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
                    <td className="p-2 text-right align-middle">
                      {parseInt(m.usage_count).toLocaleString()}
                    </td>
                    <td className="p-2 text-right align-middle">
                      {(parseInt(m.total_tokens) / 1000).toFixed(1)}k
                    </td>
                    <td className="p-2 text-right align-middle font-mono text-amber-500">
                      ${parseFloat(m.total_cost).toFixed(4)}
                    </td>
                    <td className="p-2 text-right align-middle font-medium text-blue-500">
                      {(
                        parseInt(m.total_tokens) /
                        (parseFloat(m.total_cost) || 1) /
                        1000
                      ).toFixed(0)}
                      k t/$
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
