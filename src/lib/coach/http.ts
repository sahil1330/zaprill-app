import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { CareerProfileError } from "@/services/career/career-profile.service";
import { CoachServiceError } from "@/services/coach/errors";

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
  console.error("[coach]", error);
  return NextResponse.json({ error: "Coach request failed" }, { status: 500 });
}
