import { subDays } from "date-fns";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const growthData = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as users
      FROM "user"
      WHERE created_at >= ${subDays(new Date(), 30)}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `);

    return NextResponse.json({ rows: growthData.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
