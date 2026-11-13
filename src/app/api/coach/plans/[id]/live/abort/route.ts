import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/api-session";
import { coachErrorResponse } from "@/lib/coach/http";
import {
  abortLiveHold,
  CoachLiveDisabledError,
} from "@/services/coach/live-session.service";

export const maxDuration = 15;

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const { id } = await params;
    const result = await abortLiveHold(authResult.userId, id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof CoachLiveDisabledError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    return coachErrorResponse(error);
  }
}
