import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/api-session";
import { coachErrorResponse } from "@/lib/coach/http";
import { isCoachLiveEnabled } from "@/services/coach/live-flag";
import {
  beginLiveSession,
  CoachLiveDisabledError,
} from "@/services/coach/live-session.service";

export const maxDuration = 30;

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    if (!isCoachLiveEnabled()) {
      return NextResponse.json(
        {
          error: "COACH_LIVE_DISABLED",
          detail: "Live is off in this environment.",
        },
        { status: 503 },
      );
    }
    const { id } = await params;
    const secret = await beginLiveSession(authResult.userId, id);
    return NextResponse.json({
      clientSecret: secret.clientSecret,
      expiresAt: secret.expiresAt,
      model: secret.model,
      instructions: secret.instructions,
      tools: secret.tools,
      sessionId: secret.sessionId,
    });
  } catch (error) {
    if (error instanceof CoachLiveDisabledError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    return coachErrorResponse(error);
  }
}
