import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { and, desc, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import db from "@/db";
import { coachAttempt, coachProgress, coachTask } from "@/db/schema";
import { recordVerifiedSkill } from "@/services/career/career-profile.service";
import {
  ensureSharedOutline,
  loadPlanContext,
  settleFailure,
} from "@/services/coach/context.service";
import {
  assertCoachModelsEnabled,
  resolveCoachTier,
} from "@/services/coach/entitlement.service";
import { coachNotFound } from "@/services/coach/errors";
import { COACH_LIMITS, isPassingScore } from "@/services/coach/limits";
import { openCoachMeter } from "@/services/coach/meter.service";
import {
  actualPaise,
  logCoachCall,
  paiseForTokens,
  readTokenUsage,
  usageFromError,
} from "@/services/coach/model";
import { COACH_LANGUAGE_RULES } from "@/services/coach/prompts";

const taskSchema = z.object({
  prompt: z.string().min(1).max(2000),
  rubric: z.array(z.string().min(1).max(240)).min(1).max(6),
});

const gradeSchema = z.object({
  score: z.number().int().min(0).max(100),
  feedback: z.string().min(1).max(2000),
});

async function openTask(planId: string) {
  const tasks = await db
    .select()
    .from(coachTask)
    .where(and(eq(coachTask.planId, planId), eq(coachTask.kind, "exercise")))
    .orderBy(desc(coachTask.createdAt))
    .limit(5);
  for (const task of tasks) {
    const [attempt] = await db
      .select({ id: coachAttempt.id })
      .from(coachAttempt)
      .where(eq(coachAttempt.taskId, task.id))
      .limit(1);
    if (!attempt) return task;
  }
  return null;
}

export async function startPracticeTest(userId: string, planId: string) {
  await assertCoachModelsEnabled();
  const tier = await resolveCoachTier(userId);
  const context = await loadPlanContext(userId, planId);
  if (!context) throw coachNotFound("Plan not found");
  const existing = await openTask(planId);
  if (existing) {
    return {
      taskId: existing.id,
      prompt: existing.prompt,
      tier,
    };
  }

  await ensureSharedOutline({
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
    quota: null,
    spend: "outline",
  });
  const started = Date.now();
  try {
    const { output, usage } = await generateText({
      model: openai(COACH_LIMITS.model),
      output: Output.object({ schema: taskSchema }),
      maxOutputTokens: COACH_LIMITS.gradeMaxOutputTokens,
      providerOptions: { openai: { reasoningEffort: "low" } },
      prompt: `Write one practice question for the skill "${context.plan.displayName}" in the role "${context.program.roleTitle}".
The prompt the learner sees must be English. The rubric is private and lists observable technical points.
Do not include the answer.
${COACH_LANGUAGE_RULES}`,
    });
    const tokens = readTokenUsage(usage);
    const id = nanoid();
    await db.insert(coachTask).values({
      id,
      planId,
      moduleKey: context.module?.key ?? null,
      kind: "exercise",
      prompt: output.prompt,
      rubric: { points: output.rubric },
    });
    await meter.reconcile(
      actualPaise(
        [
          paiseForTokens(
            COACH_LIMITS.model,
            tokens.promptTokens,
            tokens.completionTokens,
          ),
        ],
        meter.reservePaise,
      ),
    );
    logCoachCall({
      userId,
      action: "coach_practice",
      usage: tokens,
      latencyMs: Date.now() - started,
      success: true,
      metadata: {
        planId,
        normalizedName: context.plan.skillKey,
        kind: "task",
        tier,
      },
    });
    return { taskId: id, prompt: output.prompt, tier };
  } catch (error) {
    await settleFailure(meter, error);
    const failedUsage = usageFromError(error);
    logCoachCall({
      userId,
      action: "coach_practice",
      usage: failedUsage ?? {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        reasoningTokens: 0,
      },
      latencyMs: Date.now() - started,
      success: false,
      errorCode: "SCHEMA_VALIDATION_FAILED",
      metadata: { planId, kind: "task", tier },
    });
    throw error;
  }
}

export async function gradePracticeTest(input: {
  userId: string;
  planId: string;
  taskId: string;
  answer: string;
}) {
  await assertCoachModelsEnabled();
  const tier = await resolveCoachTier(input.userId);
  const context = await loadPlanContext(input.userId, input.planId);
  if (!context) throw coachNotFound("Plan not found");
  const [task] = await db
    .select()
    .from(coachTask)
    .where(
      and(eq(coachTask.id, input.taskId), eq(coachTask.planId, input.planId)),
    )
    .limit(1);
  if (!task) throw coachNotFound("Practice task not found");

  const meter = await openCoachMeter({
    userId: input.userId,
    tier,
    quota: "grade",
    spend: "grade",
  });
  const started = Date.now();
  try {
    const { output, usage } = await generateText({
      model: openai(COACH_LIMITS.model),
      output: Output.object({ schema: gradeSchema }),
      maxOutputTokens: COACH_LIMITS.gradeMaxOutputTokens,
      providerOptions: { openai: { reasoningEffort: "low" } },
      prompt: `Grade this practice answer for the skill "${context.plan.displayName}".
Question: ${task.prompt}
Private rubric: ${JSON.stringify(task.rubric)}
Answer: ${input.answer}
Give an integer score from 0 to 100 for the skill, not for English fluency.
Feedback must use the language of the answer.
${COACH_LANGUAGE_RULES}`,
    });
    const tokens = readTokenUsage(usage);
    const passed = isPassingScore(output.score);
    const attemptId = nanoid();
    await db.insert(coachAttempt).values({
      id: attemptId,
      taskId: task.id,
      userId: input.userId,
      answer: input.answer,
      score: output.score,
      feedback: output.feedback,
      passed,
    });
    await db
      .update(coachProgress)
      .set({
        state: passed ? "demonstrated" : "practiced",
        masteryScore: output.score,
        tasksAttempted: sql`${coachProgress.tasksAttempted} + 1`,
        tasksPassed: passed
          ? sql`${coachProgress.tasksPassed} + 1`
          : coachProgress.tasksPassed,
        lastSessionAt: new Date(),
      })
      .where(eq(coachProgress.planId, input.planId));

    let verified = false;
    if (passed) {
      try {
        await recordVerifiedSkill(input.userId, {
          skill: context.plan.skillKey,
          score: output.score,
          verifiedAt: new Date().toISOString(),
        });
        verified = true;
      } catch (error) {
        console.error("[coach] recordVerifiedSkill failed", error);
      }
    }

    await meter.reconcile(
      actualPaise(
        [
          paiseForTokens(
            COACH_LIMITS.model,
            tokens.promptTokens,
            tokens.completionTokens,
          ),
        ],
        meter.reservePaise,
      ),
    );
    logCoachCall({
      userId: input.userId,
      action: "coach_practice",
      usage: tokens,
      latencyMs: Date.now() - started,
      success: true,
      metadata: {
        planId: input.planId,
        normalizedName: context.plan.skillKey,
        kind: "grade",
        tier,
        score: output.score,
        passed,
      },
    });
    return {
      attemptId,
      score: output.score,
      passed,
      feedback: output.feedback,
      verified,
      tier,
    };
  } catch (error) {
    await settleFailure(meter, error);
    const failedUsage = usageFromError(error);
    logCoachCall({
      userId: input.userId,
      action: "coach_practice",
      usage: failedUsage ?? {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        reasoningTokens: 0,
      },
      latencyMs: Date.now() - started,
      success: false,
      errorCode: "SCHEMA_VALIDATION_FAILED",
      metadata: { planId: input.planId, kind: "grade", tier },
    });
    throw error;
  }
}
