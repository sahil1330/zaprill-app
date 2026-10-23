import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUserId } from "@/lib/api-session";
import { coachErrorResponse } from "@/lib/coach/http";
import {
  reviewMockInterview,
  startMockInterview,
} from "@/services/coach/mock.service";

export const maxDuration = 60;

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start") }),
  z.object({
    action: z.literal("review"),
    sessionId: z.string().trim().min(1),
    answers: z
      .array(
        z.object({
          id: z.string().trim().min(1).max(40),
          text: z.string().trim().min(1).max(4000),
        }),
      )
      .min(1)
      .max(5),
  }),
]);

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const { id } = await params;
    const body = bodySchema.parse(await request.json());
    if (body.action === "start") {
      const result = await startMockInterview(authResult.userId, id);
      return NextResponse.json(result);
    }
    const result = await reviewMockInterview({
      userId: authResult.userId,
      planId: id,
      sessionId: body.sessionId,
      answers: body.answers,
    });
    return NextResponse.json(result);
  } catch (error) {
    return coachErrorResponse(error);
  }
}
