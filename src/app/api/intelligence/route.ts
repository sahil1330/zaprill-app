import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/api-session";
import { careerErrorResponse } from "@/lib/career/http";
import { getIntelligenceReport } from "@/services/career/intelligence.service";

export async function GET() {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const report = await getIntelligenceReport(authResult.userId);
    return NextResponse.json({ report });
  } catch (error) {
    return careerErrorResponse(error);
  }
}
