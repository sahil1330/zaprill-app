import { generateText } from "ai";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/db";
import { resume } from "@/db/schema";
import { auth } from "@/lib/auth";
import { hackclub } from "@/lib/hackClubClient";
import { logAiUsage } from "@/services/ai/usage.service";
import type { ResumeData } from "@/types/resume";

export const maxDuration = 60;

const MODEL = "google/gemini-2.5-flash" as const;

const RequestSchema = z.object({
  jobDescription: z.string().min(10, "Job description is too short"),
  data: z.record(z.unknown()),
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

    const resumeText = JSON.stringify({
      basics: { summary: data.basics.summary },
      work: data.work.map((w) => ({
        id: w.id,
        position: w.position,
        company: w.company,
        highlights: w.highlights,
      })),
      projects: data.projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        highlights: p.highlights,
      })),
      skills: data.skills.map((s) => ({
        id: s.id,
        name: s.name,
        keywords: s.keywords,
      })),
    });

    const llmStart = Date.now();
    const { text, usage } = await generateText({
      model: hackclub(MODEL),
      prompt: `You are an expert resume writer specializing in ATS-friendly, high-impact resumes. 
Rewrite the provided resume sections to better align with the target job description while adhering to these strict quality standards:

1. USE POWER VERBS: Replace passive language with high-impact action verbs. 
   - Leadership: Spearheaded, Orchestrated, Directed, Mentored, Cultivated.
   - Achievement: Maximized, Optimized, Surpassed, Generated, Capitalized.
   - Technical: Engineered, Architected, Deployed, Automated, Integrated.
   - Strategy: Devised, Formulated, Pioneered, Transformed, Reengineered.
2. BE CONCISE: Decrease wordiness. Every word must earn its place. Avoid filler phrases like "Responsible for" or "Tasked with".
3. IMPACT-DRIVEN: Use the "Action Verb + Task + Measurable Result" formula for every bullet point. If specific metrics are not provided in the original text, use realistic estimations based on the context, but NEVER use bracketed placeholders like "[specific percentage]" or "[specific number]".
4. TAILOR STRATEGICALLY: Prioritize skills and experiences that match the Job Description's keywords and requirements.
5. 1-PAGE LIMIT: Resumes must be 1 page. Ensure rewritten content is extremely concise and punchy. Avoid long sentences. Use the high-density pattern: [Action Verb] + [Result] + [Context/Tool]. No fluff.

Original Resume Sections (JSON):
${resumeText}

Target Job Description:
${jobDescription}

You must return a JSON object containing the proposed changes. You MUST include the original \`id\` fields for work, projects, and skills so we can merge them back.
DO NOT return full objects for work/projects, ONLY return the \`id\` and the rewritten \`highlights\`. For skills, return \`id\` and \`keywords\`.

Return ONLY valid JSON in this exact shape:
{
  "summary": "Rewritten compelling summary...",
  "work": [
    { "id": "original-id", "highlights": ["New bullet 1", "New bullet 2"] }
  ],
  "projects": [
    { "id": "original-id", "highlights": ["New bullet 1", "New bullet 2"] }
  ],
  "skills": [
    { "id": "original-id", "keywords": ["React", "Next.js", "TypeScript"] }
  ]
}`,
    });
    const latencyMs = Date.now() - llmStart;

    logAiUsage({
      userId: session.user.id,
      action: "tailor_resume",
      model: MODEL,
      promptTokens: usage.inputTokens ?? 0,
      completionTokens: usage.outputTokens ?? 0,
      totalTokens: usage.totalTokens ?? 0,
      latencyMs,
      success: true,
    });

    // Parse result
    const jsonStr = extractJSON(text) ?? text;
    let tailoredData;
    try {
      tailoredData = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }

    return NextResponse.json(tailoredData);
  } catch (error) {
    console.error("Job tailoring error:", error);
    return NextResponse.json(
      { error: "Failed to tailor resume" },
      { status: 500 },
    );
  }
}
