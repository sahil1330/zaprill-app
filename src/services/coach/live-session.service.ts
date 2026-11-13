import type { UIMessage } from "ai";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import db from "@/db";
import { coachSession } from "@/db/schema";
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
import { COACH_LIMITS, usdToPaise } from "@/services/coach/limits";
import { isCoachLiveEnabled } from "@/services/coach/live-flag";
import {
  COACH_LIVE_MODEL,
  estimateRealtimeCostUsd,
  liveExchangeDisposition,
  liveTurnMeterAction,
  mintRealtimeClientSecret,
  type RealtimeUsageParts,
} from "@/services/coach/live-session";
import { settleTutorReserve } from "@/services/coach/meter.service";
import { logCoachCall } from "@/services/coach/model";
import {
  activeCoachModule,
  buildSkillCoachInstructions,
  openTutorMeter,
  type SkillCoachTurnContext,
  skillCoachRealtimeTools,
} from "@/services/coach/skill-coach-core";
import {
  insertTutorSession,
  loadActiveTutorSession,
  saveTutorSession,
  sessionUiMessages,
  touchCoachProgress,
} from "@/services/coach/tutor-chat.service";

export class CoachLiveDisabledError extends Error {
  readonly status = 503;
  readonly body = {
    error: "COACH_LIVE_DISABLED",
    detail: "Live is off in this environment.",
  };

  constructor() {
    super("Live is off in this environment.");
    this.name = "CoachLiveDisabledError";
  }
}

async function turnContext(
  userId: string,
  planId: string,
): Promise<{
  context: NonNullable<Awaited<ReturnType<typeof loadPlanContext>>>;
  tier: Awaited<ReturnType<typeof resolveCoachTier>>;
  turn: SkillCoachTurnContext;
}> {
  await assertCoachModelsEnabled();
  if (!isCoachLiveEnabled()) throw new CoachLiveDisabledError();
  const context = await loadPlanContext(userId, planId);
  if (!context) throw coachNotFound("Plan not found");
  const tier = await resolveCoachTier(userId);
  const outline = await ensureSharedOutline({
    userId,
    tier,
    planId,
    skillKey: context.plan.skillKey,
    displayName: context.plan.displayName,
    segment: context.segment,
    outline: context.outline,
  });
  const turn: SkillCoachTurnContext = {
    userId,
    planId,
    skillKey: context.plan.skillKey,
    displayName: context.plan.displayName,
    roleTitle: context.program.roleTitle,
    segment: context.segment,
    module: activeCoachModule(outline, context.progress?.currentModuleKey),
    summary: null,
  };
  return { context, tier, turn };
}

export async function beginLiveSession(userId: string, planId: string) {
  const { context, turn } = await turnContext(userId, planId);
  const existing = await loadActiveTutorSession(userId, planId);
  if (existing?.status === "live_hold") {
    await settleTutorReserve({
      userId,
      actualPaise: 0,
      refundQuota: true,
    });
    await db
      .update(coachSession)
      .set({ status: "active" })
      .where(eq(coachSession.id, existing.id));
  }
  const meter = await openTutorMeter({
    userId,
    tier: await resolveCoachTier(userId),
  });
  let sessionId = existing?.id ?? null;
  let created = false;
  if (!sessionId) {
    const row = await insertTutorSession({
      userId,
      planId,
      programId: context.program.id,
      messages: [],
      summary: existing?.summary ?? null,
      moduleKey: turn.module?.key ?? null,
      turnCount: 0,
    });
    sessionId = row.id;
    created = true;
  }
  const instructions = buildSkillCoachInstructions({
    ...turn,
    summary: existing?.summary ?? null,
  });
  const tools = skillCoachRealtimeTools();
  const apiKey = process.env.OPENAI_API_KEY?.trim() ?? "";
  if (!apiKey) {
    await meter.abort();
    if (created) {
      await db.delete(coachSession).where(eq(coachSession.id, sessionId));
    }
    throw coachProviderError("Live is not configured.");
  }
  try {
    const secret = await mintRealtimeClientSecret({
      instructions,
      tools,
      apiKey,
    });
    await db
      .update(coachSession)
      .set({ status: "live_hold" })
      .where(eq(coachSession.id, sessionId));
    return {
      clientSecret: secret.value,
      expiresAt: secret.expiresAt,
      model: COACH_LIVE_MODEL,
      instructions,
      tools,
      sessionId,
    };
  } catch (error) {
    await meter.abort();
    if (created) {
      await db.delete(coachSession).where(eq(coachSession.id, sessionId));
    }
    throw coachProviderError(
      error instanceof Error ? error.message : "Live session mint failed.",
    );
  }
}

export async function liveTurnForTool(
  userId: string,
  planId: string,
): Promise<SkillCoachTurnContext> {
  const { turn } = await turnContext(userId, planId);
  const session = await loadActiveTutorSession(userId, planId);
  return { ...turn, summary: session?.summary ?? null };
}

async function claimHold(sessionId: string): Promise<boolean> {
  const rows = await db
    .update(coachSession)
    .set({ status: "active" })
    .where(
      and(eq(coachSession.id, sessionId), eq(coachSession.status, "live_hold")),
    )
    .returning({ id: coachSession.id });
  return rows.length > 0;
}

export async function abortLiveHold(userId: string, planId: string) {
  // Flag-off still refunds a hold that was opened while Live was on.
  const session = await loadActiveTutorSession(userId, planId);
  if (!session) return { refunded: false };
  const claimed = await claimHold(session.id);
  if (!claimed) return { refunded: false };
  await settleTutorReserve({ userId, actualPaise: 0, refundQuota: true });
  return { refunded: true };
}

export async function recordLiveExchange(input: {
  userId: string;
  planId: string;
  userText: string;
  assistantText: string;
  tools: Array<{ name: string; callId: string }>;
  usage: RealtimeUsageParts | null;
}) {
  const started = Date.now();
  const { context, tier, turn } = await turnContext(input.userId, input.planId);
  const session = await loadActiveTutorSession(input.userId, input.planId);
  if (!session) throw coachNotFound("Tutor session not found");
  const disposition = liveExchangeDisposition(input.assistantText);
  const action = liveTurnMeterAction(session.status);
  const reserve = COACH_LIMITS.turnReservePaise;
  const actual = input.usage
    ? usdToPaise(estimateRealtimeCostUsd(input.usage))
    : reserve;
  const promptTokens =
    (input.usage?.inputTextTokens ?? 0) + (input.usage?.inputAudioTokens ?? 0);
  const completionTokens =
    (input.usage?.outputTextTokens ?? 0) +
    (input.usage?.outputAudioTokens ?? 0);

  if (disposition === "refund") {
    if (action === "settle_hold") {
      const claimed = await claimHold(session.id);
      if (claimed) {
        await settleTutorReserve({
          userId: input.userId,
          actualPaise: 0,
          refundQuota: true,
        });
      }
    }
    logCoachCall({
      userId: input.userId,
      action: "coach_live",
      model: COACH_LIVE_MODEL,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        reasoningTokens: 0,
      },
      costUsd: input.usage ? estimateRealtimeCostUsd(input.usage) : null,
      latencyMs: Date.now() - started,
      success: false,
      errorCode: "EMPTY_REPLY",
      metadata: {
        planId: input.planId,
        sessionId: session.id,
        adapter: "live",
        tier,
        kind: "live_exchange",
      },
    });
    return { saved: false };
  }

  // One tutor-quota turn per completed user→assistant exchange.
  if (action === "settle_hold") {
    const claimed = await claimHold(session.id);
    if (claimed) {
      await settleTutorReserve({
        userId: input.userId,
        actualPaise: actual,
        refundQuota: false,
      });
    } else {
      const meter = await openTutorMeter({ userId: input.userId, tier });
      await meter.reconcile(actual);
    }
  } else {
    const meter = await openTutorMeter({ userId: input.userId, tier });
    try {
      await meter.reconcile(actual);
    } catch (error) {
      await settleFailure(meter, error);
      throw error;
    }
  }

  const stored = sessionUiMessages(session.messages);
  const userMessage: UIMessage = {
    id: `live-user-${nanoid()}`,
    role: "user",
    parts: [{ type: "text", text: input.userText }],
  };
  const assistantMessage: UIMessage = {
    id: `live-assistant-${nanoid()}`,
    role: "assistant",
    parts: [
      { type: "text", text: input.assistantText },
      ...input.tools.map((tool) => ({
        type: `tool-${tool.name}` as const,
        toolCallId: tool.callId,
        state: "output-available" as const,
        input: {},
        output: { relayed: true },
      })),
    ],
  };
  await saveTutorSession({
    sessionId: session.id,
    messages: [...stored, userMessage, assistantMessage],
    summary: session.summary,
    moduleKey: turn.module?.key ?? session.moduleKey,
    turnCount: session.turnCount + 1,
  });
  await touchCoachProgress(input.planId);
  logCoachCall({
    userId: input.userId,
    action: "coach_live",
    model: COACH_LIVE_MODEL,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      reasoningTokens: 0,
    },
    costUsd: input.usage ? estimateRealtimeCostUsd(input.usage) : null,
    latencyMs: Date.now() - started,
    success: true,
    metadata: {
      planId: input.planId,
      sessionId: session.id,
      adapter: "live",
      tier,
      kind: "live_exchange",
      normalizedName: context.plan.skillKey,
    },
  });
  return { saved: true, messages: [userMessage, assistantMessage] };
}
