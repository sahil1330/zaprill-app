import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUserId } from "@/lib/api-session";
import { coachErrorResponse } from "@/lib/coach/http";
import {
  gradePracticeTest,
  startPracticeTest,
} from "@/services/coach/practice.service";

export const maxDuration = 60;

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start") }),
  z.object({
    action: z.literal("grade"),
    taskId: z.string().trim().min(1),
    answer: z.string().trim().min(1).max(8000),
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
      const result = await startPracticeTest(authResult.userId, id);
      return NextResponse.json(result);
    }
    const result = await gradePracticeTest({
      userId: authResult.userId,
      planId: id,
      taskId: body.taskId,
      answer: body.answer,
    });
    return NextResponse.json(result);
  } catch (error) {
    return coachErrorResponse(error);
  }
}
