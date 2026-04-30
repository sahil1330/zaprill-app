import { generateText } from "ai";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { resume } from "@/db/schema";
import { auth } from "@/lib/auth";
import { hackclub } from "@/lib/hackClubClient";
import { logAiUsage } from "@/services/ai/usage.service";
import type { ResumeData } from "@/types/resume";

export const maxDuration = 30;

const MODEL = "google/gemini-2.5-flash" as const;

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify resume belongs to user
    const [row] = await db
      .select({ userId: resume.userId })
      .from(resume)
      .where(eq(resume.id, id))
      .limit(1);

    if (!row || row.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = body.data as ResumeData;

    if (!data) {
      return NextResponse.json(
        { error: "Resume data is required" },
        { status: 400 },
      );
    }

    // Build context from resume data
    const workContext =
      data.work.length > 0
        ? `Work experience:\n${data.work
            .slice(0, 5)
            .map(
              (w) =>
                `- ${w.position} at ${w.company}${w.highlights.length > 0 ? ` (${w.highlights.slice(0, 3).join("; ")})` : ""}`,
            )
            .join("\n")}`
        : "";

    const educationContext =
      data.education.length > 0
        ? `Education:\n${data.education
            .slice(0, 3)
            .map((e) => `- ${e.studyType} in ${e.area} at ${e.institution}`)
            .join("\n")}`
        : "";

    const skillsContext =
      data.skills.length > 0
        ? `Skills: ${data.skills
            .flatMap((s) => s.keywords)
            .slice(0, 20)
            .join(", ")}`
        : "";

    const llmStart = Date.now();
    const { text, usage } = await generateText({
      model: hackclub(MODEL),
      prompt: `You are an expert resume writer. Generate a professional summary for this candidate.

Rules:
- Write exactly 2-3 sentences
- Highlight years of experience, key skills, and career focus
- Use confident, active language
- Do NOT use first person ("I", "my")
- Do NOT use generic phrases like "results-driven professional" or "team player"
- Be specific to their actual experience and skills
- Return ONLY the summary text, no labels or formatting

${workContext}

${educationContext}

${skillsContext}

${data.basics.label ? `Current title: ${data.basics.label}` : ""}`,
    });
    const latencyMs = Date.now() - llmStart;

    logAiUsage({
      userId: session.user.id,
      action: "generate_summary",
      model: MODEL,
      promptTokens: usage.inputTokens ?? 0,
      completionTokens: usage.outputTokens ?? 0,
      totalTokens: usage.totalTokens ?? 0,
      latencyMs,
      success: true,
    });

    return NextResponse.json({ summary: text.trim() });
  } catch (error) {
    console.error("Generate summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 },
    );
  }
}
