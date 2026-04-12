import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import db from "@/db";
import { resumeAnalysis } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await db.query.resumeAnalysis.findMany({
      where: eq(resumeAnalysis.userId, session.user.id),
      orderBy: [desc(resumeAnalysis.createdAt)],
    });

    return NextResponse.json({ history });
  } catch (error: any) {
    console.error("Get analysis history error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve history" },
      { status: 500 },
    );
  }
}
