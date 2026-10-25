import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import db from "@/db";
import {
  coachOutlineCache,
  coachPlan,
  coachProgram,
  coachProgress,
} from "@/db/schema";
import { getCareerProfile } from "@/services/career/career-profile.service";
import { assertCoachModelsEnabled } from "@/services/coach/entitlement.service";
import { type CoachOutline, isShellOutline } from "@/services/coach/gaps";
import type { CoachTier } from "@/services/coach/limits";
import { COACH_LIMITS } from "@/services/coach/limits";
import type { MeterHold } from "@/services/coach/meter.service";
import { openCoachMeter } from "@/services/coach/meter.service";
import {
  actualPaise,
  logCoachCall,
  paiseForTokens,
  readTokenUsage,
  usageFromError,
} from "@/services/coach/model";
import { COACH_LANGUAGE_RULES } from "@/services/coach/prompts";

const outlineSchema = z.object({
  why: z.string().min(1).max(600),
  estimatedTime: z.string().min(1).max(80),
  modules: z
    .array(
      z.object({
        key: z.string().min(1).max(80),
        title: z.string().min(1).max(120),
        objective: z.string().min(1).max(400),
        estimatedMinutes: z.number().int().min(10).max(600),
        resources: z
          .array(
            z.object({
              type: z.enum([
                "course",
                "book",
                "tutorial",
                "documentation",
                "practice",
              ]),
              name: z.string().min(1).max(160),
              free: z.boolean(),
              estimatedTime: z.string().max(80).optional(),
            }),
          )
          .max(4),
      }),
    )
    .min(1)
    .max(4),
});

const SEGMENTS = new Set(["student", "fresher", "professional"]);

export async function loadPlanContext(userId: string, planId: string) {
  const [row] = await db
    .select({
      plan: coachPlan,
      program: coachProgram,
      progress: coachProgress,
    })
    .from(coachPlan)
    .innerJoin(coachProgram, eq(coachProgram.id, coachPlan.programId))
    .leftJoin(coachProgress, eq(coachProgress.planId, coachPlan.id))
    .where(and(eq(coachPlan.id, planId), eq(coachPlan.userId, userId)))
    .limit(1);
  if (!row || row.plan.status === "archived") return null;

  let segment: string | null = null;
  try {
    const profile = await getCareerProfile(userId);
    segment = profile.segment;
  } catch {
    segment = null;
  }

  const outline = row.plan.outline as CoachOutline;
  const module = outline.modules?.[0] ?? null;
  return {
    plan: row.plan,
    program: row.program,
    progress: row.progress,
    segment,
    module: module
      ? {
          key: module.key,
          title: module.title,
          objective: module.objective,
        }
      : null,
    outline,
  };
}

async function copyOutline(
  planId: string,
  outline: CoachOutline,
  source: string,
): Promise<void> {
  await db
    .update(coachPlan)
    .set({ outline, outlineSource: source, updatedAt: new Date() })
    .where(eq(coachPlan.id, planId));
}

/**
 * Shared English outline for (skill, segment). A null segment skips the cache.
 * Refresh itself does not call this.
 */
export async function ensureSharedOutline(input: {
  userId: string;
  tier: CoachTier;
  planId: string;
  skillKey: string;
  displayName: string;
  segment: string | null;
  outline: CoachOutline;
}): Promise<CoachOutline> {
  if (!isShellOutline(input.outline)) return input.outline;
  if (!input.segment || !SEGMENTS.has(input.segment)) return input.outline;

  const [cached] = await db
    .select()
    .from(coachOutlineCache)
    .where(
      and(
        eq(coachOutlineCache.skillKey, input.skillKey),
        eq(coachOutlineCache.segment, input.segment),
      ),
    )
    .limit(1);
  if (cached) {
    const outline = cached.outline as CoachOutline;
    await copyOutline(input.planId, outline, "shared_cache");
    logCoachCall({
      userId: input.userId,
      action: "coach_plan",
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        reasoningTokens: 0,
      },
      latencyMs: 0,
      success: true,
      cacheHit: true,
      metadata: {
        planId: input.planId,
        normalizedName: input.skillKey,
        segment: input.segment,
        kind: "outline_cache_hit",
        tier: input.tier,
      },
    });
    return outline;
  }

  await assertCoachModelsEnabled();
  const meter = await openCoachMeter({
    userId: input.userId,
    tier: input.tier,
    quota: null,
    spend: "outline",
  });
  const started = Date.now();
  try {
    const { output, usage } = await generateText({
      model: openai(COACH_LIMITS.model),
      output: Output.object({ schema: outlineSchema }),
      maxOutputTokens: COACH_LIMITS.tutorMaxOutputTokens,
      providerOptions: { openai: { reasoningEffort: "low" } },
      prompt: `Write a short English learning outline for the skill "${input.displayName}" aimed at a ${input.segment} in India.
The outline is shared across users. Do not mention a person, employer, salary, or city.
No URLs. Name resource types only.
${COACH_LANGUAGE_RULES}`,
    });
    const tokens = readTokenUsage(usage);
    const outline: CoachOutline = output;
    await db
      .insert(coachOutlineCache)
      .values({
        skillKey: input.skillKey,
        segment: input.segment,
        outline,
        model: COACH_LIMITS.model,
      })
      .onConflictDoNothing({
        target: [coachOutlineCache.skillKey, coachOutlineCache.segment],
      });
    await copyOutline(input.planId, outline, "shared_cache");
    const paise = paiseForTokens(
      COACH_LIMITS.model,
      tokens.promptTokens,
      tokens.completionTokens,
    );
    await meter.reconcile(actualPaise([paise], meter.reservePaise));
    logCoachCall({
      userId: input.userId,
      action: "coach_plan",
      usage: tokens,
      latencyMs: Date.now() - started,
      success: true,
      metadata: {
        planId: input.planId,
        normalizedName: input.skillKey,
        segment: input.segment,
        kind: "outline_cache_miss",
        tier: input.tier,
      },
    });
    return outline;
  } catch (error) {
    await settleFailure(meter, error);
    logCoachCall({
      userId: input.userId,
      action: "coach_plan",
      usage: usageFromError(error) ?? {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        reasoningTokens: 0,
      },
      latencyMs: Date.now() - started,
      success: false,
      errorCode: "SCHEMA_VALIDATION_FAILED",
      metadata: {
        planId: input.planId,
        normalizedName: input.skillKey,
        kind: "outline_cache_miss",
        tier: input.tier,
      },
    });
    throw error;
  }
}

export async function settleFailure(
  meter: MeterHold,
  error: unknown,
): Promise<void> {
  const usage = usageFromError(error);
  if (!usage) {
    await meter.abort();
    return;
  }
  const paise = paiseForTokens(
    COACH_LIMITS.model,
    usage.promptTokens,
    usage.completionTokens,
  );
  await meter.refundQuota(actualPaise([paise], meter.reservePaise));
}
