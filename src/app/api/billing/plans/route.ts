import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import db from "@/db";
import { plan } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const plans = await db
      .select()
      .from(plan)
      .where(eq(plan.isActive, true))
      .orderBy(plan.sortOrder);

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 },
    );
  }
}
