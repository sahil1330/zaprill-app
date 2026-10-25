import { desc, eq } from "drizzle-orm";
import db from "@/db";
import { resume, resumeAnalysis } from "@/db/schema";
import { isCoachEnabled } from "@/lib/app-settings";
import {
  buildMarketReport,
  type MarketJob,
  topMissingSkill,
} from "@/lib/career/market";
import { recommendNextSteps } from "@/lib/career/next-steps";
import { CAREER_SCORE_WEIGHTS, COMPLETENESS_POINT } from "@/lib/career/score";
import { ensureCareerProfile } from "@/services/career/career-profile.service";
import type { IntelligenceReport, ScoreBreakdown } from "@/types/intelligence";

export async function getIntelligenceReport(
  userId: string,
): Promise<IntelligenceReport> {
  const profile = await ensureCareerProfile(userId);
  const [latestAnalysis, resumeRow, coachEnabled] = await Promise.all([
    db
      .select({ id: resumeAnalysis.id, jobs: resumeAnalysis.jobs })
      .from(resumeAnalysis)
      .where(eq(resumeAnalysis.userId, userId))
      .orderBy(desc(resumeAnalysis.createdAt))
      .limit(1),
    db
      .select({ id: resume.id })
      .from(resume)
      .where(eq(resume.userId, userId))
      .limit(1),
    isCoachEnabled(),
  ]);

  const analysis = latestAnalysis[0] ?? null;
  const jobs = asMarketJobs(analysis?.jobs);
  const hasPay =
    profile.compensation.current.annualInr != null ||
    profile.compensation.expected.minAnnualInr != null ||
    profile.compensation.expected.maxAnnualInr != null;
  const market = buildMarketReport({
    skills: profile.skills.map((skill) => ({
      name: skill.name,
      level: skill.level,
    })),
    targets: profile.targetRoles.map((role) => ({
      id: role.id,
      title: role.title,
      isPrimary: role.isPrimary,
    })),
    jobs,
  });

  const score: ScoreBreakdown = {
    careerScore: profile.intelligence.careerScore,
    readiness: profile.intelligence.readiness,
    completeness: profile.intelligence.completeness,
    weights: {
      readiness: CAREER_SCORE_WEIGHTS.readiness,
      completeness: CAREER_SCORE_WEIGHTS.completeness,
    },
    signals: [
      {
        id: "segment",
        label: "Path chosen",
        present: profile.segment != null,
        points: COMPLETENESS_POINT,
      },
      {
        id: "target",
        label: "Target role",
        present: profile.targetRoles.length > 0,
        points: COMPLETENESS_POINT,
      },
      {
        id: "skill",
        label: "Skill on file",
        present: profile.skills.length > 0,
        points: COMPLETENESS_POINT,
      },
      {
        id: "pay",
        label: "Pay set",
        present: hasPay,
        points: COMPLETENESS_POINT,
      },
    ],
    basis: profile.intelligence.basis,
    analysisId: profile.intelligence.analysisId,
  };

  return {
    segment: profile.segment,
    score,
    market,
    coachEnabled,
    nextSteps: recommendNextSteps({
      segment: profile.segment,
      skillCount: profile.skills.length,
      targetCount: profile.targetRoles.length,
      hasPay,
      hasAnalysis: jobs.length > 0,
      hasResume: Boolean(resumeRow[0] || profile.derivedFromResumeId),
      coachEnabled,
      topGap: topMissingSkill(market.roles),
    }),
  };
}

function asMarketJobs(value: unknown): MarketJob[] {
  if (!Array.isArray(value)) return [];
  const jobs: MarketJob[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const record = item as {
      title?: unknown;
      company?: unknown;
      salary?: unknown;
      requiredSkills?: unknown;
      isRemote?: unknown;
    };
    const title = typeof record.title === "string" ? record.title : "";
    const requiredSkills = Array.isArray(record.requiredSkills)
      ? record.requiredSkills.filter(
          (skill): skill is string => typeof skill === "string",
        )
      : [];
    if (!title.trim() && requiredSkills.length === 0) continue;
    jobs.push({
      title,
      company: typeof record.company === "string" ? record.company : "",
      salary: typeof record.salary === "string" ? record.salary : null,
      requiredSkills,
      isRemote: typeof record.isRemote === "boolean" ? record.isRemote : null,
    });
  }
  return jobs;
}
