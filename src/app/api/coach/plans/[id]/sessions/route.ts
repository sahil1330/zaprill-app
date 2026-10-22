import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUserId } from "@/lib/api-session";
import { coachErrorResponse } from "@/lib/coach/http";
import { sendTutorMessage } from "@/services/coach/tutor.service";

export const maxDuration = 60;

const bodySchema = z.object({
  message: z.string().trim().min(1).max(4000),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const { id } = await params;
    const body = bodySchema.parse(await request.json());
    const result = await sendTutorMessage(authResult.userId, id, body.message);
    return NextResponse.json(result);
  } catch (error) {
    return coachErrorResponse(error);
  }
}
