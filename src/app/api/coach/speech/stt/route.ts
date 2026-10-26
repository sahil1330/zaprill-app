import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/api-session";
import { coachErrorResponse } from "@/lib/coach/http";
import {
  isSttContentLengthTooLarge,
  speechHttpError,
  transcribeWithSarvam,
} from "@/lib/speech/sarvam";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;

    if (isSttContentLengthTooLarge(request.headers.get("content-length"))) {
      return NextResponse.json({ error: "AUDIO_TOO_LARGE" }, { status: 413 });
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json({ error: "INVALID_AUDIO" }, { status: 400 });
    }

    const audio = form.get("audio");
    if (!(audio instanceof Blob)) {
      return NextResponse.json({ error: "INVALID_AUDIO" }, { status: 400 });
    }

    const language = form.get("languageCode");
    const result = await transcribeWithSarvam(audio, {
      languageCode: typeof language === "string" ? language : undefined,
    });
    return NextResponse.json({ text: result.text });
  } catch (error) {
    const mapped = speechHttpError(error);
    if (mapped) {
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    return coachErrorResponse(error);
  }
}
