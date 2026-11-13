import {
  AISDKError,
  createAgentUIStreamResponse,
  createIdGenerator,
  smoothStream,
  type UIMessage,
} from "ai";
import { NextResponse } from "next/server";
import {
  createSkillCoachAgent,
  type SkillCoachUIMessage,
} from "@/lib/agents/skill-coach-agent";
import { requireApiUserId } from "@/lib/api-session";
import { coachErrorResponse } from "@/lib/coach/http";
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
import { COACH_LIMITS } from "@/services/coach/limits";
import type { MeterHold } from "@/services/coach/meter.service";
import {
  actualPaise,
  logCoachCall,
  paiseForTokens,
  readTokenUsage,
} from "@/services/coach/model";
import {
  activeCoachModule,
  openTutorMeter,
} from "@/services/coach/skill-coach-core";
import { chatTurnDisposition, summaryDue } from "@/services/coach/tutor-chat";
import {
  compressTutorSummary,
  insertTutorSession,
  loadActiveTutorSession,
  saveTutorSession,
  sessionUiMessages,
  touchCoachProgress,
} from "@/services/coach/tutor-chat.service";
import {
  buildAgentWindow,
  latestUserUIMessage,
  messagesForPersistence,
  textFromUIMessage,
  userTurnText,
} from "@/services/coach/tutor-messages";

export const maxDuration = 60;

type RouteParams = { params: Promise<{ id: string }> };

async function requirePlan(planId: string) {
  const authResult = await requireApiUserId();
  if (!authResult.ok) return authResult;
  const context = await loadPlanContext(authResult.userId, planId);
  if (!context) throw coachNotFound("Plan not found");
  return { ok: true as const, userId: authResult.userId, context };
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authz = await requirePlan(id);
    if ("response" in authz) return authz.response;
    const session = await loadActiveTutorSession(authz.userId, id);
    return NextResponse.json({
      messages: session ? sessionUiMessages(session.messages) : [],
    });
  } catch (error) {
    return coachErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const started = Date.now();
  let meter: MeterHold | null = null;
  let settled = false;
  try {
    const { id: planId } = await params;
    await assertCoachModelsEnabled();
    const authz = await requirePlan(planId);
    if ("response" in authz) return authz.response;
    const { userId, context } = authz;
    const tier = await resolveCoachTier(userId);

    let body: { messages?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const latestUser = latestUserUIMessage(body.messages);
    const latestText = latestUser ? userTurnText(latestUser) : null;
    if (!latestUser || !latestText) {
      return NextResponse.json(
        { error: "A user message of 1 to 4000 characters is required" },
        { status: 400 },
      );
    }

    const outline = await ensureSharedOutline({
      userId,
      tier,
      planId,
      skillKey: context.plan.skillKey,
      displayName: context.plan.displayName,
      segment: context.segment,
      outline: context.outline,
    });
    const module = activeCoachModule(
      outline,
      context.progress?.currentModuleKey,
    );
    const existing = await loadActiveTutorSession(userId, planId);
    const stored = existing ? sessionUiMessages(existing.messages) : [];
    let summary = existing?.summary ?? null;
    const agentMessages = buildAgentWindow({
      history: stored,
      summary,
      latestUser,
      historyMessages: COACH_LIMITS.historyMessages,
    });

    meter = await openTutorMeter({ userId, tier });
    const hold = meter;
    const charges: Array<number | null> = [];
    let turnUsage = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      reasoningTokens: 0,
    };

    const turn = {
      userId,
      planId,
      skillKey: context.plan.skillKey,
      displayName: context.plan.displayName,
      roleTitle: context.program.roleTitle,
      segment: context.segment,
      module,
      summary,
    };
    const agent = createSkillCoachAgent({
      turn,
      onUsage: (usage) => {
        turnUsage = readTokenUsage(usage);
      },
    });

    return await createAgentUIStreamResponse({
      agent,
      uiMessages: agentMessages as SkillCoachUIMessage[],
      originalMessages: agentMessages as SkillCoachUIMessage[],
      abortSignal: request.signal,
      sendReasoning: true,
      generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
      experimental_transform: smoothStream({ chunking: "word" }),
      consumeSseStream: async ({ stream }) => {
        const reader = stream.getReader();
        try {
          while (true) {
            const { done } = await reader.read();
            if (done) break;
          }
        } catch {
          // Client disconnect is expected. Persistence still runs in onEnd.
        }
      },
      onEnd: async ({ messages, isAborted, responseMessage }) => {
        try {
          const aborted = isAborted || request.signal.aborted;
          const assistantText = textFromUIMessage(responseMessage as UIMessage);
          const disposition = chatTurnDisposition({ aborted, assistantText });
          charges.push(
            paiseForTokens(
              COACH_LIMITS.model,
              turnUsage.promptTokens,
              turnUsage.completionTokens,
            ),
          );
          if (disposition === "refund") {
            await hold.refundQuota(actualPaise(charges, hold.reservePaise));
            settled = true;
            logCoachCall({
              userId,
              action: "coach_tutor",
              usage: turnUsage,
              latencyMs: Date.now() - started,
              success: false,
              errorCode: aborted ? "ABORTED" : "EMPTY_REPLY",
              metadata: {
                planId,
                sessionId: existing?.id ?? null,
                adapter: "chat",
                tier,
                kind: "tutor_turn",
              },
            });
            return;
          }

          const nextMessages = messagesForPersistence({
            stored,
            latestUser,
            ended: messages as UIMessage[],
          });
          let sessionId = existing?.id ?? null;
          if (!sessionId) {
            const created = await insertTutorSession({
              userId,
              planId,
              programId: context.program.id,
              messages: nextMessages,
              summary,
              moduleKey: module?.key ?? null,
              turnCount: (existing?.turnCount ?? 0) + 1,
            });
            sessionId = created.id;
          }

          if (summaryDue(nextMessages.length)) {
            const compressed = await compressTutorSummary({
              userId,
              tier,
              planId,
              sessionId,
              skillKey: context.plan.skillKey,
              messages: nextMessages,
            });
            if (compressed?.summary) summary = compressed.summary;
            if (compressed) charges.push(compressed.paise);
          }

          if (existing) {
            await saveTutorSession({
              sessionId,
              messages: nextMessages,
              summary,
              moduleKey: module?.key ?? null,
              turnCount: existing.turnCount + 1,
            });
          } else if (summary) {
            await saveTutorSession({
              sessionId,
              messages: nextMessages,
              summary,
              moduleKey: module?.key ?? null,
              turnCount: 1,
            });
          }
          await touchCoachProgress(planId);
          await hold.reconcile(actualPaise(charges, hold.reservePaise));
          settled = true;
          logCoachCall({
            userId,
            action: "coach_tutor",
            usage: turnUsage,
            latencyMs: Date.now() - started,
            success: true,
            metadata: {
              planId,
              sessionId,
              adapter: "chat",
              tier,
              kind: "tutor_turn",
              normalizedName: context.plan.skillKey,
            },
          });
        } catch (error) {
          if (!settled) {
            await settleFailure(hold, error);
            settled = true;
          }
        }
      },
    });
  } catch (error) {
    if (meter && !settled) await settleFailure(meter, error);
    if (AISDKError.isInstance(error)) {
      return NextResponse.json(
        { error: "The tutor could not finish that reply. Try again." },
        { status: 400 },
      );
    }
    return coachErrorResponse(error);
  }
}
