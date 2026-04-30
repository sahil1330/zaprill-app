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

    // Build resume text
    const resumeText = buildResumeText(data);

    const llmStart = Date.now();
    const { text, usage } = await generateText({
      model: hackclub(MODEL),
      prompt: `You are a stand-up comedian who also happens to be a brutal career advisor. Your job is to ROAST this resume like it's an open mic night.

Rules:
- Be genuinely funny — use sarcasm, exaggeration, and witty observations
- Reference specific things from their actual resume (don't be generic)
- After each roast point, sneak in actually useful advice disguised as more roasting
- Use emojis liberally 🔥💀😭
- Start with a savage opening line about the overall resume
- Cover: their job title, experience descriptions, skills section, formatting choices, and any gaps or red flags
- End with a backhanded compliment ("But seriously though...")
- Keep it to 6-8 roast points
- Format as a numbered list with each point being 1-2 sentences
- Don't be mean about things they can't control (age, education institution, etc.)
- DO be mean about things they CAN control (weak bullet points, buzzword overload, etc.)

Resume to roast:
${resumeText}`,
    });
    const latencyMs = Date.now() - llmStart;

    logAiUsage({
      userId: session.user.id,
      action: "resume_roast",
      model: MODEL,
      promptTokens: usage.inputTokens ?? 0,
      completionTokens: usage.outputTokens ?? 0,
      totalTokens: usage.totalTokens ?? 0,
      latencyMs,
      success: true,
    });

    return NextResponse.json({ roast: text.trim() });
  } catch (error) {
    console.error("Resume roast error:", error);
    return NextResponse.json(
      { error: "Failed to roast resume" },
      { status: 500 },
    );
  }
}

function buildResumeText(data: ResumeData): string {
  const lines: string[] = [];

  if (data.basics.name) lines.push(`Name: ${data.basics.name}`);
  if (data.basics.label) lines.push(`Title: ${data.basics.label}`);
  if (data.basics.summary) lines.push(`Summary: ${data.basics.summary}`);

  if (data.work.length > 0) {
    lines.push("\nWork Experience:");
    for (const w of data.work) {
      lines.push(
        `- ${w.position} at ${w.company} (${w.startDate} - ${w.endDate ?? "Present"})`,
      );
      for (const h of w.highlights) {
        if (h) lines.push(`  • ${h}`);
      }
    }
  }

  if (data.skills.length > 0) {
    lines.push("\nSkills:");
    for (const s of data.skills) {
      lines.push(`- ${s.name}: ${s.keywords.join(", ")}`);
    }
  }

  if (data.education.length > 0) {
    lines.push("\nEducation:");
    for (const e of data.education) {
      lines.push(`- ${e.studyType} in ${e.area} at ${e.institution}`);
    }
  }

  if (data.projects.length > 0) {
    lines.push("\nProjects:");
    for (const p of data.projects) {
      lines.push(`- ${p.name}: ${p.description}`);
    }
  }

  return lines.join("\n");
}
