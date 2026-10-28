import { startOfDay, subDays } from "date-fns";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { auth } from "@/lib/auth";
import { shapeActionStats, shapeErrorStats } from "@/services/ai/admin-usage";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");
  const startDate = startOfDay(subDays(new Date(), days));

  try {
    // 1. Revenue Stats
    const revenueStats = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        SUM(CAST(amount_paid as NUMERIC) - CAST(tax_amount as NUMERIC)) as revenue,
        COUNT(*) as count
      FROM invoice
      WHERE status = 'paid' AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `);

    // 2. AI Usage Stats
    const aiStats = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        SUM(total_tokens) as tokens,
        SUM(cost_usd) as cost,
        COUNT(*) as calls
      FROM ai_usage_log
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `);

    // 3. User Growth Stats
    const growthStats = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as users
      FROM "user"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `);

    // 4. Top AI Models
    const modelStats = await db.execute(sql`
      SELECT 
        model,
        COUNT(*) as usage_count,
        SUM(total_tokens) as total_tokens,
        SUM(cost_usd) as total_cost
      FROM ai_usage_log
      GROUP BY model
      ORDER BY usage_count DESC
    `);

    const actionStats = await db.execute(sql`
      SELECT
        action,
        COUNT(*)::int as calls,
        COALESCE(SUM(total_tokens), 0)::int as tokens,
        COALESCE(SUM(cost_usd), 0) as cost,
        COUNT(*) FILTER (WHERE success = true)::int as success_count,
        COUNT(*) FILTER (WHERE success = false)::int as failure_count
      FROM ai_usage_log
      WHERE created_at >= ${startDate}
      GROUP BY action
      ORDER BY cost DESC
    `);

    const errorStats = await db.execute(sql`
      SELECT action, model, error_code, latency_ms, created_at
      FROM ai_usage_log
      WHERE created_at >= ${startDate}
        AND success = false
      ORDER BY created_at DESC
      LIMIT 20
    `);

    return NextResponse.json({
      revenue: revenueStats.rows,
      ai: aiStats.rows,
      growth: growthStats.rows,
      models: modelStats.rows,
      actions: shapeActionStats(actionStats.rows),
      aiErrors: shapeErrorStats(errorStats.rows),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
