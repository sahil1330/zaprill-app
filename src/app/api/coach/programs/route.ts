import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/api-session";
import { coachErrorResponse } from "@/lib/coach/http";
import { syncCoachPrograms } from "@/services/coach/program.service";

export async function GET() {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const body = await syncCoachPrograms(authResult.userId);
    return NextResponse.json(body);
  } catch (error) {
    return coachErrorResponse(error);
  }
}

export async function POST() {
  return GET();
}
