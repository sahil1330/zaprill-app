import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import db from "@/db";
import {
  coachPlan,
  coachProgram,
  coachProgress,
  resumeAnalysis,
} from "@/db/schema";
import {
  CareerProfileError,
  getCareerProfile,
  syncCareerProfileFromResume,
} from "@/services/career/career-profile.service";
import {
  coachAllowance,
  resolveCoachTier,
} from "@/services/coach/entitlement.service";
import {
  type CoachOutline,
  gapFingerprint,
  isShellOutline,
  prepareCoachGaps,
  shellOutline,
} from "@/services/coach/gaps";
import { type CoachTier, tierLimits } from "@/services/coach/limits";
import type { RoadmapItem, SkillGap } from "@/types";
import type { CareerProfileView } from "@/types/career-profile";

export interface CoachPlanView {
  id: string;
  skillKey: string;
  displayName: string;
  priority: string;
  category: string;
  status: string;
  outline: CoachOutline;
  outlineSource: string;
  progress: {
    state: string;
    currentModuleKey: string | null;
    tasksAttempted: number;
    tasksPassed: number;
    masteryScore: number | null;
  };
}

export interface CoachProgramView {
  id: string;
  roleKey: string;
  roleTitle: string;
  status: string;
  advice: string | null;
  plans: CoachPlanView[];
}

function asSkillGaps(value: unknown): SkillGap[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is SkillGap =>
      !!item &&
      typeof item === "object" &&
      typeof (item as SkillGap).skill === "string",
  );
}

function asRoadmap(value: unknown): RoadmapItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is RoadmapItem =>
      !!item &&
      typeof item === "object" &&
      typeof (item as RoadmapItem).skill === "string",
  );
}

function asOutline(value: unknown, displayName: string): CoachOutline {
  if (!value || typeof value !== "object") return shellOutline(displayName);
  const outline = value as Partial<CoachOutline>;
  if (!Array.isArray(outline.modules)) return shellOutline(displayName);
  return {
    why: typeof outline.why === "string" ? outline.why : "",
    estimatedTime:
      typeof outline.estimatedTime === "string" ? outline.estimatedTime : "",
    modules: outline.modules,
  };
}

async function loadProfile(userId: string): Promise<CareerProfileView> {
  try {
    return await getCareerProfile(userId);
  } catch (error) {
    if (error instanceof CareerProfileError && error.status === 404) {
      return syncCareerProfileFromResume(userId);
    }
    throw error;
  }
}

async function loadPrograms(userId: string): Promise<CoachProgramView[]> {
  const programs = await db
    .select()
    .from(coachProgram)
    .where(eq(coachProgram.userId, userId));
  const plans = await db
    .select()
    .from(coachPlan)
    .where(eq(coachPlan.userId, userId));
  const progressRows = await db
    .select()
    .from(coachProgress)
    .where(eq(coachProgress.userId, userId));
  const progressByPlan = new Map(progressRows.map((row) => [row.planId, row]));

  return programs
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "active" ? -1 : 1;
      return a.roleTitle.localeCompare(b.roleTitle);
    })
    .map((program) => ({
      id: program.id,
      roleKey: program.roleKey,
      roleTitle: program.roleTitle,
      status: program.status,
      advice: program.advice,
      plans: plans
        .filter((plan) => plan.programId === program.id)
        .sort((a, b) => a.displayName.localeCompare(b.displayName))
        .map((plan) => {
          const progress = progressByPlan.get(plan.id);
          return {
            id: plan.id,
            skillKey: plan.skillKey,
            displayName: plan.displayName,
            priority: plan.priority,
            category: plan.category,
            status: plan.status,
            outline: asOutline(plan.outline, plan.displayName),
            outlineSource: plan.outlineSource,
            progress: {
              state: progress?.state ?? "not_started",
              currentModuleKey: progress?.currentModuleKey ?? null,
              tasksAttempted: progress?.tasksAttempted ?? 0,
              tasksPassed: progress?.tasksPassed ?? 0,
              masteryScore: progress?.masteryScore ?? null,
            },
          };
        }),
    }));
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String(error.code) : "";
  const message = error instanceof Error ? error.message : "";
  return code === "23505" || message.includes("coach_program_active_role_uidx");
}

async function refreshPlans(input: {
  programId: string;
  userId: string;
  gaps: ReturnType<typeof prepareCoachGaps>;
  fingerprint: string;
  currentFingerprint: string | null;
}): Promise<void> {
  if (input.currentFingerprint === input.fingerprint) return;

  const existing = await db
    .select()
    .from(coachPlan)
    .where(eq(coachPlan.programId, input.programId));
  const incoming = new Map(input.gaps.map((gap) => [gap.skillKey, gap]));

  for (const plan of existing) {
    const gap = incoming.get(plan.skillKey);
    if (!gap) {
      if (plan.status !== "archived") {
        await db
          .update(coachPlan)
          .set({ status: "archived", updatedAt: new Date() })
          .where(eq(coachPlan.id, plan.id));
      }
      continue;
    }
    incoming.delete(plan.skillKey);
    const outline = isShellOutline(asOutline(plan.outline, plan.displayName))
      ? gap.outline
      : asOutline(plan.outline, plan.displayName);
    await db
      .update(coachPlan)
      .set({
        displayName: gap.displayName,
        priority: gap.priority,
        category: gap.category,
        status: "active",
        gapEvidence: gap.gapEvidence,
        outline,
        outlineSource: isShellOutline(outline)
          ? plan.outlineSource
          : "gap_roadmap",
        updatedAt: new Date(),
      })
      .where(eq(coachPlan.id, plan.id));
  }

  for (const gap of incoming.values()) {
    const id = nanoid();
    await db.insert(coachPlan).values({
      id,
      programId: input.programId,
      userId: input.userId,
      skillKey: gap.skillKey,
      displayName: gap.displayName,
      priority: gap.priority,
      category: gap.category,
      status: "active",
      outline: gap.outline,
      outlineSource: "gap_roadmap",
      gapEvidence: gap.gapEvidence,
    });
    await db.insert(coachProgress).values({
      planId: id,
      userId: input.userId,
      state: "not_started",
      currentModuleKey: gap.outline.modules[0]?.key ?? null,
    });
  }
}

export async function syncCoachPrograms(userId: string): Promise<{
  tier: CoachTier;
  allowance: Awaited<ReturnType<typeof coachAllowance>>;
  programs: CoachProgramView[];
  notices: string[];
}> {
  const tier = await resolveCoachTier(userId);
  const cap = tierLimits(tier).activePrograms;
  const profile = await loadProfile(userId);
  const notices: string[] = [];

  const [analysis] = await db
    .select()
    .from(resumeAnalysis)
    .where(eq(resumeAnalysis.userId, userId))
    .orderBy(desc(resumeAnalysis.createdAt))
    .limit(1);

  const owned = new Set(profile.skills.map((skill) => skill.normalizedName));
  const gaps = analysis
    ? prepareCoachGaps({
        skillGaps: asSkillGaps(analysis.skillGaps),
        roadmap: asRoadmap(analysis.roadmap),
        ownedNormalizedNames: owned,
      })
    : [];
  const fingerprint = gapFingerprint(gaps.map((gap) => gap.skillKey));

  const targets = [...profile.targetRoles].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });

  if (targets.length === 0) {
    notices.push("Add a target role to open a coaching program.");
  }
  if (!analysis) {
    notices.push("Run a job analysis to fill skill gaps for your programs.");
  } else if (gaps.length === 0) {
    notices.push("No technical skill gaps are open on your latest analysis.");
  }

  const rows = await db
    .select()
    .from(coachProgram)
    .where(eq(coachProgram.userId, userId));
  const targetKeys = new Set(targets.map((target) => target.normalizedTitle));

  for (const row of rows) {
    if (row.status === "active" && !targetKeys.has(row.roleKey)) {
      await db
        .update(coachProgram)
        .set({ status: "archived", updatedAt: new Date() })
        .where(eq(coachProgram.id, row.id));
      row.status = "archived";
    }
  }

  let activeCount = rows.filter((row) => row.status === "active").length;

  for (const target of targets) {
    const existing =
      rows.find(
        (row) =>
          row.roleKey === target.normalizedTitle && row.status === "active",
      ) ?? rows.find((row) => row.roleKey === target.normalizedTitle);

    if (!analysis || gaps.length === 0) {
      if (existing?.status === "active" && analysis && gaps.length === 0) {
        await db
          .update(coachProgram)
          .set({
            status: "archived",
            gapFingerprint: fingerprint,
            sourceAnalysisId: analysis.id,
            updatedAt: new Date(),
          })
          .where(eq(coachProgram.id, existing.id));
        existing.status = "archived";
        activeCount = Math.max(0, activeCount - 1);
      }
      continue;
    }

    if (existing?.status === "active") {
      await db
        .update(coachProgram)
        .set({
          roleTitle: target.title,
          advice: analysis.advice,
          sourceAnalysisId: analysis.id,
          updatedAt: new Date(),
        })
        .where(eq(coachProgram.id, existing.id));
      await refreshPlans({
        programId: existing.id,
        userId,
        gaps,
        fingerprint,
        currentFingerprint: existing.gapFingerprint,
      });
      await db
        .update(coachProgram)
        .set({ gapFingerprint: fingerprint })
        .where(eq(coachProgram.id, existing.id));
      existing.gapFingerprint = fingerprint;
      continue;
    }

    if (activeCount >= cap) {
      notices.push(
        "Active program limit reached. An existing program was left in place.",
      );
      continue;
    }

    if (existing) {
      await db
        .update(coachProgram)
        .set({
          status: "active",
          roleTitle: target.title,
          advice: analysis.advice,
          sourceAnalysisId: analysis.id,
          updatedAt: new Date(),
        })
        .where(eq(coachProgram.id, existing.id));
      existing.status = "active";
      activeCount += 1;
      await refreshPlans({
        programId: existing.id,
        userId,
        gaps,
        fingerprint,
        currentFingerprint: existing.gapFingerprint,
      });
      await db
        .update(coachProgram)
        .set({ gapFingerprint: fingerprint })
        .where(eq(coachProgram.id, existing.id));
      continue;
    }

    const id = nanoid();
    try {
      await db.insert(coachProgram).values({
        id,
        userId,
        roleKey: target.normalizedTitle,
        roleTitle: target.title,
        status: "active",
        advice: analysis.advice,
        sourceAnalysisId: analysis.id,
        gapFingerprint: fingerprint,
      });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      continue;
    }
    rows.push({
      id,
      userId,
      roleKey: target.normalizedTitle,
      roleTitle: target.title,
      status: "active",
      advice: analysis.advice,
      sourceAnalysisId: analysis.id,
      gapFingerprint: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    activeCount += 1;
    await refreshPlans({
      programId: id,
      userId,
      gaps,
      fingerprint,
      currentFingerprint: null,
    });
    await db
      .update(coachProgram)
      .set({ gapFingerprint: fingerprint })
      .where(eq(coachProgram.id, id));
  }

  const programs = await loadPrograms(userId);
  const allowance = await coachAllowance(userId, tier);
  return {
    tier,
    allowance,
    programs: programs.filter((program) => program.status === "active"),
    notices: [...new Set(notices)],
  };
}

export async function getOwnedPlan(userId: string, planId: string) {
  const [plan] = await db
    .select()
    .from(coachPlan)
    .where(and(eq(coachPlan.id, planId), eq(coachPlan.userId, userId)))
    .limit(1);
  return plan ?? null;
}

export async function getPlanView(userId: string, planId: string) {
  const synced = await syncCoachPrograms(userId);
  for (const program of synced.programs) {
    const plan = program.plans.find((item) => item.id === planId);
    if (plan) return { ...synced, program, plan };
  }
  return { ...synced, program: null, plan: null };
}
