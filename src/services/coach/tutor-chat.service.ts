import { openai } from "@ai-sdk/openai";
import { generateText, type UIMessage } from "ai";
import { and, desc, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import db from "@/db";
import { coachProgress, coachSession } from "@/db/schema";
import { COACH_LIMITS } from "@/services/coach/limits";
import {
  coachModelOptions,
  logCoachCall,
  paiseForTokens,
  readTokenUsage,
  usageFromError,
} from "@/services/coach/model";
import {
  textFromUIMessage,
  toUIMessages,
} from "@/services/coach/tutor-messages";

const OPEN_STATUSES = ["active", "live_hold"] as const;

export async function loadActiveTutorSession(userId: string, planId: string) {
  const [existing] = await db
    .select()
    .from(coachSession)
    .where(
      and(
        eq(coachSession.userId, userId),
        eq(coachSession.planId, planId),
        eq(coachSession.kind, "tutor"),
        inArray(coachSession.status, [...OPEN_STATUSES]),
      ),
    )
    .orderBy(desc(coachSession.startedAt))
    .limit(1);
  return existing ?? null;
}

export async function insertTutorSession(input: {
  userId: string;
  planId: string;
  programId: string;
  messages: UIMessage[];
  summary: string | null;
  moduleKey: string | null;
  turnCount: number;
}) {
  const id = nanoid();
  const [created] = await db
    .insert(coachSession)
    .values({
      id,
      planId: input.planId,
      programId: input.programId,
      userId: input.userId,
      kind: "tutor",
      status: "active",
      messages: input.messages,
      summary: input.summary,
      moduleKey: input.moduleKey,
      turnCount: input.turnCount,
    })
    .returning();
  return created;
}

export async function saveTutorSession(input: {
  sessionId: string;
  messages: UIMessage[];
  summary: string | null;
  moduleKey: string | null;
  turnCount: number;
}) {
  await db
    .update(coachSession)
    .set({
      messages: input.messages,
      summary: input.summary,
      moduleKey: input.moduleKey,
      turnCount: input.turnCount,
    })
    .where(eq(coachSession.id, input.sessionId));
}

export async function touchCoachProgress(planId: string) {
  await db
    .update(coachProgress)
    .set({ lastSessionAt: new Date() })
    .where(eq(coachProgress.planId, planId));
}

export function sessionUiMessages(value: unknown): UIMessage[] {
  return toUIMessages(value);
}

/**
 * Runs only after the streamed tutor turn has settled.
 * A failed call returns null and the caller keeps the previous summary.
 */
export async function compressTutorSummary(input: {
  userId: string;
  tier: string;
  planId: string;
  sessionId: string;
  skillKey: string;
  messages: UIMessage[];
}): Promise<{ summary: string; paise: number | null } | null> {
  const older = input.messages.slice(0, Math.floor(input.messages.length / 2));
  if (older.length === 0) return null;
  const started = Date.now();
  try {
    const { text, usage } = await generateText({
      model: openai(COACH_LIMITS.model),
      maxOutputTokens: COACH_LIMITS.summaryMaxOutputTokens,
      providerOptions: coachModelOptions,
      prompt: `Compress this tutoring span into at most 150 words. Keep the language of the span. Keep technical names in English.
${older.map((turn) => `${turn.role}: ${textFromUIMessage(turn)}`).join("\n")}`,
    });
    const tokens = readTokenUsage(usage);
    const summary = text.trim();
    logCoachCall({
      userId: input.userId,
      action: "coach_tutor",
      usage: tokens,
      latencyMs: Date.now() - started,
      success: Boolean(summary),
      errorCode: summary ? undefined : "EMPTY_SUMMARY",
      metadata: {
        planId: input.planId,
        sessionId: input.sessionId,
        normalizedName: input.skillKey,
        kind: "summary",
        adapter: "chat",
        tier: input.tier,
      },
    });
    if (!summary) {
      return {
        summary: "",
        paise: paiseForTokens(
          COACH_LIMITS.model,
          tokens.promptTokens,
          tokens.completionTokens,
        ),
      };
    }
    return {
      summary,
      paise: paiseForTokens(
        COACH_LIMITS.model,
        tokens.promptTokens,
        tokens.completionTokens,
      ),
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
        adapter: "chat",
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
    };
  }
}
