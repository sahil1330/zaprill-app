import { generateText } from "ai";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/db";
import { resume, resumeAtsAnalysis } from "@/db/schema";
import { auth } from "@/lib/auth";
import { hackclub } from "@/lib/hackClubClient";
import { logAiUsage } from "@/services/ai/usage.service";
import type { ResumeData } from "@/types/resume";

export const maxDuration = 60;

const MODEL = "google/gemini-2.5-flash" as const;

const RequestSchema = z.object({
  jobDescription: z.string().optional(),
  data: z.record(z.unknown()),
});

const AtsResultSchema = z.object({
  score: z.number().min(0).max(100),
  keywordMatches: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  suggestions: z.array(
    z.object({
      section: z.string(),
      issue: z.string(),
      fix: z.string(),
    }),
  ),
  sectionScores: z.record(z.number()),
});

/** Extract the first JSON object block from a model response */
function extractJSON(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

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
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { jobDescription } = parsed.data;
    const data = parsed.data.data as unknown as ResumeData;

    // Build resume text for analysis
    const resumeText = buildResumeText(data);

    const jdContext = jobDescription
      ? `\n\nJob Description to match against:\n${jobDescription}`
      : "\n\nNo specific job description provided. Score against general best practices for the candidate's target industry.";

    const llmStart = Date.now();
    const { text, usage } = await generateText({
      model: hackclub(MODEL),
      prompt: `You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume and return a detailed JSON assessment.

Rules:
- Score from 0-100 based on ATS compatibility
- Identify keywords that ARE present and match common ATS filters
- Identify critical keywords that are MISSING
- Provide actionable suggestions grouped by section
- Score each section individually (0-100)
- Respond ONLY with valid JSON — no markdown, no explanation, no code fences

Resume content:
${resumeText}
${jdContext}

Return ONLY a JSON object with this exact shape:
{
  "score": 85,
  "keywordMatches": ["JavaScript", "React", "Node.js"],
  "missingKeywords": ["Docker", "CI/CD", "Kubernetes"],
  "suggestions": [
    {
      "section": "work",
      "issue": "Bullet points lack quantified metrics",
      "fix": "Add specific numbers, percentages, or dollar amounts to at least 3 bullets"
    }
  ],
  "sectionScores": {
    "contact": 90,
    "summary": 75,
    "work": 80,
    "education": 85,
    "skills": 70,
    "formatting": 90
  }
}`,
    });
    const latencyMs = Date.now() - llmStart;

    logAiUsage({
      userId: session.user.id,
      action: "ats_scan",
      model: MODEL,
      promptTokens: usage.inputTokens ?? 0,
      completionTokens: usage.outputTokens ?? 0,
      totalTokens: usage.totalTokens ?? 0,
      latencyMs,
      success: true,
    });

    // Parse and validate
    const jsonStr = extractJSON(text) ?? text;
    const result = AtsResultSchema.safeParse(JSON.parse(jsonStr));

    if (!result.success) {
      console.warn("ATS result schema validation failed:", result.error.issues);
      return NextResponse.json(
        { error: "Failed to parse ATS analysis" },
        { status: 500 },
      );
    }

    // Store in DB
    const analysisId = nanoid();
    await db.insert(resumeAtsAnalysis).values({
      id: analysisId,
      resumeId: id,
      jobDescription: jobDescription ?? null,
      score: result.data.score,
      breakdown: result.data,
    });

    // Update cached score on resume
    await db
      .update(resume)
      .set({ lastAtsScore: result.data.score })
      .where(eq(resume.id, id));

    return NextResponse.json({
      id: analysisId,
      ...result.data,
    });
  } catch (error) {
    console.error("ATS scoring error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 },
    );
  }
}

/** Build a text representation of the resume for the LLM */
function buildResumeText(data: ResumeData): string {
  const lines: string[] = [];

  if (data.basics.name) lines.push(`Name: ${data.basics.name}`);
  if (data.basics.label) lines.push(`Title: ${data.basics.label}`);
  if (data.basics.email) lines.push(`Email: ${data.basics.email}`);
  if (data.basics.summary) lines.push(`\nSummary:\n${data.basics.summary}`);

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

  if (data.education.length > 0) {
    lines.push("\nEducation:");
    for (const e of data.education) {
      lines.push(`- ${e.studyType} in ${e.area} at ${e.institution}`);
    }
  }

  if (data.skills.length > 0) {
    lines.push("\nSkills:");
    for (const s of data.skills) {
      lines.push(`- ${s.name}: ${s.keywords.join(", ")}`);
    }
  }

  if (data.projects.length > 0) {
    lines.push("\nProjects:");
    for (const p of data.projects) {
      lines.push(`- ${p.name}: ${p.description}`);
      if (p.keywords.length > 0) lines.push(`  Tech: ${p.keywords.join(", ")}`);
    }
  }

  if (data.certifications.length > 0) {
    lines.push("\nCertifications:");
    for (const c of data.certifications) {
      lines.push(`- ${c.name} by ${c.issuer}`);
    }
  }

  return lines.join("\n");
}
