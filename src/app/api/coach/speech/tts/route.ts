import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUserId } from "@/lib/api-session";
import { coachErrorResponse } from "@/lib/coach/http";
import { speechHttpError, synthesizeWithSarvam } from "@/lib/speech/sarvam";

export const maxDuration = 60;

const bodySchema = z.object({
  text: z.string(),
  languageCode: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const body = bodySchema.parse(raw);
    const result = await synthesizeWithSarvam(body.text, {
      languageCode: body.languageCode,
    });
    return NextResponse.json({
      audioBase64: result.audioBase64,
      mimeType: result.mimeType,
    });
  } catch (error) {
    const mapped = speechHttpError(error);
    if (mapped) {
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    return coachErrorResponse(error);
  }
}
