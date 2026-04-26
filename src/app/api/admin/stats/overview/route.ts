import { count, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { aiUsageLog, invoice, subscription, user } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const [userCount, activeSubs, revenueData, aiTokens] = await Promise.all([
      db.select({ value: count() }).from(user),
      db
        .select({ value: count() })
        .from(subscription)
        .where(eq(subscription.status, "active")),
      db.execute(
        sql`SELECT SUM(CAST(total_amount as NUMERIC)) as total FROM invoice WHERE status = 'paid'`,
      ),
      db.execute(sql`SELECT SUM(total_tokens) as total FROM ai_usage_log`),
    ]);

    return NextResponse.json({
      userCount: userCount[0].value,
      activeSubs: activeSubs[0].value,
      totalRevenue: Number(revenueData.rows[0]?.total) || 0,
      totalTokens: Number(aiTokens.rows[0]?.total) || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
