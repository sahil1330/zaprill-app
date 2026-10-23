import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import db from "@/db";
import { coachSession } from "@/db/schema";
import {
  loadPlanContext,
  settleFailure,
} from "@/services/coach/context.service";
import {
  assertCoachModelsEnabled,
  resolveCoachTier,
} from "@/services/coach/entitlement.service";
import { coachNotFound } from "@/services/coach/errors";
import { COACH_LIMITS } from "@/services/coach/limits";
import { openCoachMeter } from "@/services/coach/meter.service";
import {
  actualPaise,
  logCoachCall,
  paiseForTokens,
  readTokenUsage,
  usageFromError,
} from "@/services/coach/model";
import {
  COACH_FACT_RULES,
  COACH_LANGUAGE_RULES,
} from "@/services/coach/prompts";

const questionSchema = z.object({
  questions: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(40),
        prompt: z.string().trim().min(1).max(200),
      }),
    )
    .min(3)
    .max(5),
});

const reviewSchema = z.object({
  score: z.number().int().min(0).max(100),
  feedback: z.string().min(1).max(800),
});

interface MockMessage {
  role: "user" | "assistant";
  content: string;
  questions?: Array<{ id: string; prompt: string }>;
  score?: number;
}

export async function startMockInterview(userId: string, planId: string) {
  await assertCoachModelsEnabled();
  const tier = await resolveCoachTier(userId);
  const context = await loadPlanContext(userId, planId);
  if (!context) throw coachNotFound("Plan not found");

  const meter = await openCoachMeter({
    userId,
    tier,
    quota: "mock",
    spend: "mock",
  });
  const started = Date.now();
  try {
    const { output, usage } = await generateText({
      model: openai(COACH_LIMITS.model),
      output: Output.object({ schema: questionSchema }),
      maxOutputTokens: COACH_LIMITS.tutorMaxOutputTokens,
      providerOptions: { openai: { reasoningEffort: "low" } },
      prompt: `Write 3 spoken-style mock interview questions for the skill "${context.plan.displayName}" and the role "${context.program.roleTitle}".
Questions are in English. Each question is one sentence under 160 characters. Ids are short stable slugs.
Do not include model answers.
${COACH_FACT_RULES}`,
    });
    const tokens = readTokenUsage(usage);
    const sessionId = nanoid();
    const message: MockMessage = {
      role: "assistant",
      content: output.questions.map((item) => item.prompt).join("\n"),
      questions: output.questions,
    };
    await db.insert(coachSession).values({
      id: sessionId,
      planId,
      programId: context.program.id,
      userId,
      kind: "mock",
      status: "active",
      messages: [message],
      moduleKey: context.module?.key ?? null,
      turnCount: 1,
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
      action: "coach_mock",
      usage: tokens,
      latencyMs: Date.now() - started,
      success: true,
      metadata: {
        planId,
        sessionId,
        normalizedName: context.plan.skillKey,
        kind: "mock_questions",
        tier,
      },
    });
    return { sessionId, questions: output.questions, tier };
  } catch (error) {
    await settleFailure(meter, error);
    const failedUsage = usageFromError(error);
    logCoachCall({
      userId,
      action: "coach_mock",
      usage: failedUsage ?? {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        reasoningTokens: 0,
      },
      latencyMs: Date.now() - started,
      success: false,
      errorCode: "SCHEMA_VALIDATION_FAILED",
      metadata: { planId, kind: "mock_questions", tier },
    });
    throw error;
  }
}

export async function reviewMockInterview(input: {
  userId: string;
  planId: string;
  sessionId: string;
  answers: Array<{ id: string; text: string }>;
}) {
  await assertCoachModelsEnabled();
  const tier = await resolveCoachTier(input.userId);
  const context = await loadPlanContext(input.userId, input.planId);
  if (!context) throw coachNotFound("Plan not found");
  const [session] = await db
    .select()
    .from(coachSession)
    .where(
      and(
        eq(coachSession.id, input.sessionId),
        eq(coachSession.userId, input.userId),
        eq(coachSession.planId, input.planId),
        eq(coachSession.kind, "mock"),
      ),
    )
    .limit(1);
  if (!session) throw coachNotFound("Mock interview not found");

  const meter = await openCoachMeter({
    userId: input.userId,
    tier,
    quota: null,
    spend: "grade",
  });
  const started = Date.now();
  try {
    const { output, usage } = await generateText({
      model: openai(COACH_LIMITS.model),
      output: Output.object({ schema: reviewSchema }),
      maxOutputTokens: COACH_LIMITS.gradeMaxOutputTokens,
      providerOptions: { openai: { reasoningEffort: "low" } },
      prompt: `Review this mock interview for ${context.plan.displayName}. This is practice feedback only. Do not say the skill is verified.
Questions and answers:
${JSON.stringify({ transcript: session.messages, answers: input.answers })}
Feedback must use the language of the answers, in at most 80 words.
${COACH_LANGUAGE_RULES}
${COACH_FACT_RULES}`,
    });
    const tokens = readTokenUsage(usage);
    const messages = [
      ...(Array.isArray(session.messages) ? session.messages : []),
      {
        role: "user",
        content: input.answers.map((answer) => answer.text).join("\n"),
      },
      {
        role: "assistant",
        content: output.feedback,
        score: output.score,
      },
    ];
    await db
      .update(coachSession)
      .set({
        messages,
        summary: output.feedback,
        status: "completed",
        endedAt: new Date(),
      })
      .where(eq(coachSession.id, session.id));
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
      action: "coach_mock",
      usage: tokens,
      latencyMs: Date.now() - started,
      success: true,
      metadata: {
        planId: input.planId,
        sessionId: session.id,
        normalizedName: context.plan.skillKey,
        kind: "mock_review",
        tier,
        score: output.score,
      },
    });
    return {
      sessionId: session.id,
      score: output.score,
      feedback: output.feedback,
      tier,
    };
  } catch (error) {
    await settleFailure(meter, error);
    const failedUsage = usageFromError(error);
    logCoachCall({
      userId: input.userId,
      action: "coach_mock",
      usage: failedUsage ?? {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        reasoningTokens: 0,
      },
      latencyMs: Date.now() - started,
      success: false,
      errorCode: "SCHEMA_VALIDATION_FAILED",
      metadata: { planId: input.planId, kind: "mock_review", tier },
    });
    throw error;
  }
}
