import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/db";
import { resume, resumeAtsAnalysis } from "@/db/schema";
import { auth } from "@/lib/auth";
import { scoreResumeAts } from "@/lib/resume-knowledge/ats-score";
import { KNOWLEDGE_VERSION } from "@/lib/resume-knowledge/types";
import { logAiUsage } from "@/services/ai/usage.service";
import { getCareerProfile } from "@/services/career/career-profile.service";

export const maxDuration = 60;

const RequestSchema = z.object({
  jobDescription: z.string().max(20000).optional(),
  data: z.record(z.unknown()),
  metadata: z.record(z.unknown()).optional(),
  templateSlug: z.string().max(80).optional(),
  targetRole: z.string().max(200).optional(),
  industry: z.string().max(80).optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [row] = await db
      .select({
        userId: resume.userId,
        templateSlug: resume.templateSlug,
        metadata: resume.metadata,
        targetRole: resume.targetRole,
        industry: resume.industry,
      })
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

    let profile = null;
    try {
      const view = await getCareerProfile(session.user.id);
      profile = {
        segment: view.segment,
        countryCode: view.location.countryCode,
        yearsOfExperience: view.yearsOfExperience,
        headline: view.headline,
        targetRoles: view.targetRoles.map((role) => role.title),
        experienceTitles: view.experience.map((item) => item.title),
      };
    } catch {
      profile = null;
    }

    const started = Date.now();
    const result = scoreResumeAts({
      data: parsed.data.data,
      metadata: parsed.data.metadata ?? row.metadata,
      templateSlug: parsed.data.templateSlug ?? row.templateSlug,
      targetRole: parsed.data.targetRole ?? row.targetRole,
      industry: parsed.data.industry ?? row.industry,
      jobDescription: parsed.data.jobDescription,
      profile,
    });

    logAiUsage({
      userId: session.user.id,
      action: "ats_scan",
      model: "resume-knowledge",
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      latencyMs: Date.now() - started,
      success: true,
      metadata: {
        scorer: "deterministic",
        knowledgeVersion: KNOWLEDGE_VERSION,
        keywordCoverage: result.explanation.keywordCoverage,
      },
    });

    const analysisId = nanoid();
    await db.insert(resumeAtsAnalysis).values({
      id: analysisId,
      resumeId: id,
      jobDescription: parsed.data.jobDescription ?? null,
      score: result.score,
      breakdown: result,
    });

    await db
      .update(resume)
      .set({ lastAtsScore: result.score })
      .where(eq(resume.id, id));

    return NextResponse.json({
      id: analysisId,
      ...result,
    });
  } catch (error) {
    console.error("ATS scoring error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 },
    );
  }
}
