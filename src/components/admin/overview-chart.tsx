"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface OverviewChartProps {
  data: {
    date: string;
    users: number;
    sessions: number;
    views: number;
  }[];
}

export function OverviewChart({ data }: OverviewChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="hsl(var(--muted))"
        />
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Users
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[0].value}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Sessions
                      </span>
                      <span className="font-bold">{payload[1].value}</span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="users"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          activeDot={{
            r: 4,
            style: { fill: "hsl(var(--primary))", opacity: 0.8 },
          }}
        />
        <Line
          type="monotone"
          dataKey="sessions"
          stroke="hsl(var(--chart-2))"
          strokeWidth={2}
          dot={false}
          activeDot={{
            r: 4,
            style: { fill: "hsl(var(--chart-2))", opacity: 0.8 },
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
