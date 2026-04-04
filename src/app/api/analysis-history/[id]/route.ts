import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import db from "@/db";
import { resumeAnalysis } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // In next 15+, params is a promise
    const { id } = await params;

    const analysis = await db.query.resumeAnalysis.findFirst({
      where: and(
        eq(resumeAnalysis.id, id),
        eq(resumeAnalysis.userId, session.user.id)
      ),
    });

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error("Get specific analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve analysis" },
      { status: 500 }
    );
  }
}
