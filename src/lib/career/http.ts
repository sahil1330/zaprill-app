import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { CareerProfileError } from "@/services/career/career-profile.service";

export function careerErrorResponse(error: unknown) {
  if (error instanceof CareerProfileError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: error.issues[0]?.message ?? "Invalid career profile request",
        issues: error.issues,
      },
      { status: 400 },
    );
  }
  console.error("Career profile request failed:", error);
  return NextResponse.json(
    { error: "Career profile request failed" },
    { status: 500 },
  );
}

export function readResourceId(req: Request, label: string) {
  const id = new URL(req.url).searchParams.get("id")?.trim();
  if (!id) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: `${label} id is required` },
        { status: 400 },
      ),
    };
  }
  return { ok: true as const, id };
}

export async function readJson(req: Request): Promise<unknown> {
  const text = await req.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new CareerProfileError("Invalid JSON", 400);
  }
}
