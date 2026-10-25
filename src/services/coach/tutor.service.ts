import { openai } from "@ai-sdk/openai";
import { generateText, isStepCount, type ModelMessage } from "ai";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import db from "@/db";
import { coachProgress, coachSession } from "@/db/schema";
import { createSkillCoachTools } from "@/lib/agents/skill-coach-tools";
import {
  ensureSharedOutline,
  loadPlanContext,
  settleFailure,
} from "@/services/coach/context.service";
import {
  assertCoachModelsEnabled,
  resolveCoachTier,
} from "@/services/coach/entitlement.service";
import { coachNotFound, coachProviderError } from "@/services/coach/errors";
import { COACH_LIMITS } from "@/services/coach/limits";
import { openCoachMeter } from "@/services/coach/meter.service";
import {
  actualPaise,
  coachModelOptions,
  logCoachCall,
  paiseForTokens,
  readTokenUsage,
  usageFromError,
} from "@/services/coach/model";
import {
  COACH_FACT_RULES,
  COACH_LANGUAGE_RULES,
} from "@/services/coach/prompts";

interface StoredTurn {
  role: "user" | "assistant";
  content: string;
}

function asTurns(value: unknown): StoredTurn[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is StoredTurn =>
      !!item &&
      typeof item === "object" &&
      ((item as StoredTurn).role === "user" ||
        (item as StoredTurn).role === "assistant") &&
      typeof (item as StoredTurn).content === "string",
  );
}

async function activeTutorSession(
  userId: string,
  planId: string,
  programId: string,
) {
  const [existing] = await db
    .select()
    .from(coachSession)
    .where(
      and(
        eq(coachSession.userId, userId),
        eq(coachSession.planId, planId),
        eq(coachSession.kind, "tutor"),
        eq(coachSession.status, "active"),
      ),
    )
    .orderBy(desc(coachSession.startedAt))
    .limit(1);
  if (existing) return existing;
  const id = nanoid();
  const [created] = await db
    .insert(coachSession)
    .values({
      id,
      planId,
      programId,
      userId,
      kind: "tutor",
      status: "active",
      messages: [],
      turnCount: 0,
    })
    .returning();
  return created;
}

async function summarize(input: {
  userId: string;
  tier: string;
  planId: string;
  sessionId: string;
  skillKey: string;
  turns: StoredTurn[];
}): Promise<{
  summary: string;
  paise: number | null;
  usage: ReturnType<typeof readTokenUsage>;
} | null> {
  const older = input.turns.slice(0, Math.floor(input.turns.length / 2));
  if (older.length === 0) return null;
  const started = Date.now();
  try {
    const { text, usage } = await generateText({
      model: openai(COACH_LIMITS.model),
      maxOutputTokens: COACH_LIMITS.summaryMaxOutputTokens,
      providerOptions: coachModelOptions,
      prompt: `Compress this tutoring span into at most 150 words. Keep the language of the span. Keep technical names in English.
${older.map((turn) => `${turn.role}: ${turn.content}`).join("\n")}`,
    });
    const tokens = readTokenUsage(usage);
    const summary = text.trim();
    if (!summary) return null;
    logCoachCall({
      userId: input.userId,
      action: "coach_tutor",
      usage: tokens,
      latencyMs: Date.now() - started,
      success: true,
      metadata: {
        planId: input.planId,
        sessionId: input.sessionId,
        normalizedName: input.skillKey,
        kind: "summary",
        tier: input.tier,
      },
    });
    return {
      summary,
      paise: paiseForTokens(
        COACH_LIMITS.model,
        tokens.promptTokens,
        tokens.completionTokens,
      ),
      usage: tokens,
    };
  } catch (error) {
    const usage = usageFromError(error) ?? {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      reasoningTokens: 0,
    };
    logCoachCall({
      userId: input.userId,
      action: "coach_tutor",
      usage,
      latencyMs: Date.now() - started,
      success: false,
      errorCode: "SCHEMA_VALIDATION_FAILED",
      metadata: {
        planId: input.planId,
        sessionId: input.sessionId,
        kind: "summary",
        tier: input.tier,
      },
    });
    return {
      summary: "",
      paise: usage.totalTokens
        ? paiseForTokens(
            COACH_LIMITS.model,
            usage.promptTokens,
            usage.completionTokens,
          )
        : null,
      usage,
    };
  }
}

export async function sendTutorMessage(
  userId: string,
  planId: string,
  message: string,
) {
  await assertCoachModelsEnabled();
  const tier = await resolveCoachTier(userId);
  const context = await loadPlanContext(userId, planId);
  if (!context) throw coachNotFound("Plan not found");

  const outline = await ensureSharedOutline({
    userId,
    tier,
    planId,
    skillKey: context.plan.skillKey,
    displayName: context.plan.displayName,
    segment: context.segment,
    outline: context.outline,
  });

  const meter = await openCoachMeter({
    userId,
    tier,
    quota: "tutor",
    spend: "tutor",
  });
  const started = Date.now();
  const charges: Array<number | null> = [];
  let settled = false;
  let refunded = false;

  try {
    const session = await activeTutorSession(
      userId,
      planId,
      context.program.id,
    );
    let turns = asTurns(session.messages);
    let summary = session.summary;
    if (turns.length >= COACH_LIMITS.summaryAfterMessages) {
      const compressed = await summarize({
        userId,
        tier,
        planId,
        sessionId: session.id,
        skillKey: context.plan.skillKey,
        turns,
      });
      if (compressed?.summary) {
        summary = compressed.summary;
        charges.push(compressed.paise);
      } else if (compressed) {
        charges.push(compressed.paise);
      }
    }

    const history = turns.slice(-COACH_LIMITS.historyMessages);
    const messages: ModelMessage[] = [
      ...(summary
        ? [{ role: "user" as const, content: `Earlier summary:\n${summary}` }]
        : []),
      ...history.map((turn) => ({
        role: turn.role,
        content: turn.content,
      })),
      { role: "user", content: message },
    ];

    const module =
      outline.modules.find(
        (item) => item.key === context.progress?.currentModuleKey,
      ) ?? outline.modules[0];

    const result = await generateText({
      model: openai(COACH_LIMITS.model),
      system: `You are Zaprill Skill Coach, tutoring one technical skill for the role "${context.program.roleTitle}".
Current skill: ${context.plan.displayName}.
Module: ${module?.title ?? context.plan.displayName}. Objective: ${module?.objective || "Build working familiarity."}
Call getLearningContext before a long explanation. Use listCuratedResources when suggesting material. Use setModuleStatus only to mark the module in progress.
${COACH_LANGUAGE_RULES}
${COACH_FACT_RULES}`,
      messages,
      tools: createSkillCoachTools({
        userId,
        planId,
        skillKey: context.plan.skillKey,
        displayName: context.plan.displayName,
        roleTitle: context.program.roleTitle,
        segment: context.segment,
        module: module
          ? {
              key: module.key,
              title: module.title,
              objective: module.objective,
            }
          : null,
        summary,
      }),
      stopWhen: isStepCount(COACH_LIMITS.maxTutorSteps),
      maxOutputTokens: COACH_LIMITS.tutorMaxOutputTokens,
      providerOptions: coachModelOptions,
    });

    const steps = result.steps.length > 0 ? result.steps : [result];
    steps.forEach((step, stepIndex) => {
      const usage = readTokenUsage(step.usage);
      charges.push(
        paiseForTokens(
          COACH_LIMITS.model,
          usage.promptTokens,
          usage.completionTokens,
        ),
      );
      logCoachCall({
        userId,
        action: "coach_tutor",
        usage,
        latencyMs: Date.now() - started,
        success: true,
        metadata: {
          programId: context.program.id,
          planId,
          sessionId: session.id,
          normalizedName: context.plan.skillKey,
          turnIndex: session.turnCount + 1,
          stepIndex,
          kind: "tutor_step",
          tier,
        },
      });
    });

    const reply = result.text.trim();
    if (!reply) {
      await meter.refundQuota(actualPaise(charges, meter.reservePaise));
      refunded = true;
      throw coachProviderError(
        "The tutor did not return a reply. Try sending the message again.",
      );
    }

    turns = [
      ...turns,
      { role: "user", content: message },
      { role: "assistant", content: reply },
    ];
    await db
      .update(coachSession)
      .set({
        messages: turns,
        summary,
        moduleKey: module?.key ?? null,
        turnCount: session.turnCount + 1,
      })
      .where(eq(coachSession.id, session.id));
    await db
      .update(coachProgress)
      .set({ lastSessionAt: new Date() })
      .where(eq(coachProgress.planId, planId));
    await meter.reconcile(actualPaise(charges, meter.reservePaise));
    settled = true;

    return {
      sessionId: session.id,
      reply,
      tier,
    };
  } catch (error) {
    if (!settled && !refunded) {
      await settleFailure(meter, error);
    }
    throw error;
  }
}
