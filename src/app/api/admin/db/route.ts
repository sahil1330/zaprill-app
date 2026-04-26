import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { auth } from "@/lib/auth";

// Allowlist of tables to prevent arbitrary SQL execution
const ALLOWED_TABLES = [
  "user",
  "session",
  "account",
  "verification",
  "jwks",
  "user_profile",
  "resume_analysis",
  "saved_job",
  "plan",
  "coupons",
  "coupon_usage",
  "subscription",
  "invoice",
  "payment",
  "ai_usage_log",
  "audit_log",
  "received_email",
];

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = (page - 1) * limit;

  // 1. List all tables if no table specified
  if (!table) {
    try {
      const result = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      return NextResponse.json(result.rows.map((r) => r.table_name));
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch tables" },
        { status: 500 },
      );
    }
  }

  // 2. Security: Validate table name
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json(
      { error: "Table not allowed or doesn't exist" },
      { status: 403 },
    );
  }

  const isExport = searchParams.get("export") === "true";

  // 3. Fetch data for specific table
  try {
    if (isExport) {
      const result = await db.execute(sql.raw(`SELECT * FROM "${table}"`));
      return NextResponse.json({ data: result.rows });
    }

    const dataPromise = db.execute(
      sql.raw(`SELECT * FROM "${table}" LIMIT ${limit} OFFSET ${offset}`),
    );
    const countPromise = db.execute(
      sql.raw(`SELECT COUNT(*) as count FROM "${table}"`),
    );

    const [dataResult, countResult] = await Promise.all([
      dataPromise,
      countPromise,
    ]);

    return NextResponse.json({
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count as string),
      page,
      limit,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
