import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { CareerProfileError } from "@/services/career/career-profile.service";
import { CoachServiceError } from "@/services/coach/errors";

function providerDetail(error: unknown): string | null {
  if (!(error instanceof Error)) return null;
  if (!error.name.startsWith("AI_")) return null;
  const message = error.message.trim();
  return (message || error.name).slice(0, 500);
}

function logCoachFailure(error: unknown): void {
  if (!(error instanceof Error)) {
    console.error("[coach]", error);
    return;
  }
  const extra = error as Error & {
    statusCode?: number;
    url?: string;
    responseBody?: unknown;
  };
  const responseBody =
    typeof extra.responseBody === "string"
      ? extra.responseBody.slice(0, 500)
      : undefined;
  console.error("[coach]", {
    name: error.name,
    message: error.message,
    statusCode: extra.statusCode,
    url: extra.url,
    responseBody,
  });
}

export function coachErrorResponse(error: unknown) {
  if (error instanceof CoachServiceError) {
    return NextResponse.json(error.body, { status: error.status });
  }
  if (error instanceof CareerProfileError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  logCoachFailure(error);
  const detail = providerDetail(error);
  if (detail) {
    return NextResponse.json(
      { error: "COACH_PROVIDER", detail },
      { status: 502 },
    );
  }
  return NextResponse.json({ error: "Coach request failed" }, { status: 500 });
}
