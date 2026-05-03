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
      action: z
        .object({
          type: z.enum([
            "update_summary",
            "add_work_highlight",
            "update_work_highlights",
            "add_skill_keywords",
            "update_education",
            "add_project_highlight",
            "update_project_highlights",
            "update_basics",
            "update_work",
            "update_project",
            "update_skill",
            "no_action_needed",
          ]),
          id: z.string().optional(),
          content: z.string().optional(),
          value: z.string().optional(),
          keywords: z.array(z.string()).optional(),
          highlights: z.array(z.string()).optional(),
          data: z.record(z.any()).optional(),
        })
        .optional(),
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
    const currentDate = new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const jdContext = jobDescription
      ? `\n\nJob Description to match against:\n${jobDescription}`
      : "\n\nNo specific job description provided. Score against general best practices for the candidate's target industry.";

    const llmStart = Date.now();
    const { text, usage } = await generateText({
      model: hackclub(MODEL),
      prompt: `You are an ELITE ATS (Applicant Tracking System) analyzer. Optimize this resume for high-impact professional standards and keyword compatibility.
Current Date: ${currentDate}

STABILITY & GROUND TRUTH RULES:
1. SOURCE OF TRUTH: The provided JSON resume data is the absolute ground truth. If data exists (e.g., graduation year, GPA, summary), do NOT say it's missing.
2. NO REVERSALS: If a section has already been improved with high-impact action verbs and metrics, do NOT suggest changing it back or adding minor "filler" tweaks.
3. CONSISTENCY: Be objective. Do not fluctuate scores for identical content.
4. DIMINISHING RETURNS: If a section score is 90 or higher, it is "Excellent". Do NOT provide minor nitpicks just to have suggestions.
5. NO NITPICKING: Your goal is to reach a stable, high-quality profile (90+). Once there, stay consistent.

CONTENT RULES:
1. ACTION VERBS: Use elite, high-impact verbs (e.g., "Spearheaded", "Orchestrated", "Engineered", "Optimized").
2. METRICS: Every fix for Work or Projects MUST include a quantified result (e.g., "reduced latency by 15%", "saved $50k/year", "scaled to 1M+ users").
3. GPA: If GPA is missing and likely high, suggest adding it. If already present, don't mention it.
4. 1-PAGE LIMIT: Elite tech resumes must be 1 page. All suggestions must be extremely concise, punchy, and avoid fluff. Use high-density information patterns: [Action Verb] + [Quantifiable Impact] + [Tool/Tech Used]. No flowery intros or conclusions.

JSON Resume Data:
${resumeText}${jdContext}

ACTION TYPES & SCHEMAS:
- "update_summary": { "type": "update_summary", "content": "..." }
- "add_work_highlight": { "type": "add_work_highlight", "id": "...", "content": "..." }
- "update_work_highlights": { "type": "update_work_highlights", "id": "...", "highlights": ["..."] }
- "add_skill_keywords": { "type": "add_skill_keywords", "id": "...", "keywords": ["..."] }
- "update_education": { "type": "update_education", "id": "...", "data": { ... } }
- "add_project_highlight": { "type": "add_project_highlight", "id": "...", "content": "..." }
- "update_project_highlights": { "type": "update_project_highlights", "id": "...", "highlights": ["..."] }
- "update_basics": { "type": "update_basics", "data": { ... } }
- "update_work": { "type": "update_work", "id": "...", "data": { ... } }
- "no_action_needed": Use this if a suggestion is purely advice.

Response JSON Format:
{
  "score": number,
  "keywordMatches": string[],
  "missingKeywords": string[],
  "suggestions": [
    {
      "section": string,
      "issue": string,
      "fix": string,
      "action": { type, id?, content?, keywords?, highlights?, data? }
    }
  ],
  "sectionScores": { "Summary": 0-100, "Experience": 0-100, "Education": 0-100, "Skills": 0-100, "Projects": 0-100, "Formatting": 0-100 }
}

IMPORTANT: Only provide suggestions for sections with scores below 85. For scores 85-100, only provide a suggestion if there is a CRITICAL missing keyword or a MAJOR impact metric missing.`,
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
        { error: "Failed to parse ATS analysis", details: result.error.issues },
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

/** Build a clean JSON representation for the LLM */
function buildResumeText(data: ResumeData): string {
  return JSON.stringify(
    {
      basics: {
        name: data.basics.name,
        label: data.basics.label,
        summary: data.basics.summary,
        location: data.basics.location,
      },
      work: data.work.map((w) => ({
        id: w.id,
        position: w.position,
        company: w.company,
        startDate: w.startDate,
        endDate: w.endDate,
        highlights: w.highlights,
      })),
      skills: data.skills.map((s) => ({
        id: s.id,
        name: s.name,
        keywords: s.keywords,
      })),
      projects: data.projects.map((p) => ({
        id: p.id,
        name: p.name,
        startDate: p.startDate,
        endDate: p.endDate,
        highlights: p.highlights,
      })),
      education: data.education.map((e) => ({
        id: e.id,
        institution: e.institution,
        studyType: e.studyType,
        area: e.area,
        startDate: e.startDate,
        endDate: e.endDate,
        score: e.score,
      })),
    },
    null,
    2,
  );
}
