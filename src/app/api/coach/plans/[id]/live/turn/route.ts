import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUserId } from "@/lib/api-session";
import { coachErrorResponse } from "@/lib/coach/http";
import {
  CoachLiveDisabledError,
  recordLiveExchange,
} from "@/services/coach/live-session.service";

export const maxDuration = 30;

const usageSchema = z.object({
  inputTextTokens: z.number().int().nonnegative(),
  inputAudioTokens: z.number().int().nonnegative(),
  outputTextTokens: z.number().int().nonnegative(),
  outputAudioTokens: z.number().int().nonnegative(),
});

const bodySchema = z.object({
  userText: z.string().max(8000),
  assistantText: z.string().max(8000),
  tools: z
    .array(
      z.object({
        name: z.string().max(80),
        callId: z.string().max(120),
      }),
    )
    .max(8),
  usage: usageSchema.nullable(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const { id } = await params;
    const body = bodySchema.parse(await request.json());
    const result = await recordLiveExchange({
      userId: authResult.userId,
      planId: id,
      userText: body.userText,
      assistantText: body.assistantText,
      tools: body.tools,
      usage: body.usage,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof CoachLiveDisabledError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    return coachErrorResponse(error);
  }
}
