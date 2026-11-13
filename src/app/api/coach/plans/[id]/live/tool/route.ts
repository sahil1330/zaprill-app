import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUserId } from "@/lib/api-session";
import { coachErrorResponse } from "@/lib/coach/http";
import {
  functionCallOutputPayload,
  RESPONSE_CREATE,
} from "@/services/coach/live-session";
import {
  CoachLiveDisabledError,
  liveTurnForTool,
} from "@/services/coach/live-session.service";
import { executeSkillCoachTool } from "@/services/coach/skill-coach-core";

export const maxDuration = 30;

const bodySchema = z.object({
  callId: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(80),
  arguments: z.unknown().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const { id } = await params;
    const body = bodySchema.parse(await request.json());
    let parsed: unknown = body.arguments ?? {};
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        parsed = {};
      }
    }
    const turn = await liveTurnForTool(authResult.userId, id);
    const output = await executeSkillCoachTool(turn, body.name, parsed);
    return NextResponse.json({
      outputEvent: functionCallOutputPayload(body.callId, output),
      followUp: RESPONSE_CREATE,
    });
  } catch (error) {
    if (error instanceof CoachLiveDisabledError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    return coachErrorResponse(error);
  }
}
