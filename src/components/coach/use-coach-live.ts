"use client";

import type { UIMessage } from "ai";
import { useCallback, useRef, useState } from "react";
import { formatCoachError } from "@/components/coach/format-coach-error";
import { applyLiveEvent, emptyLiveDraft } from "@/components/coach/live-events";
import {
  type LivePhase,
  reduceLivePhase,
  signalFromRealtimeEvent,
} from "@/components/coach/live-phase";
import {
  connectRealtimeWebRTC,
  type RealtimeCall,
} from "@/components/coach/voice/realtime-webrtc";

export function useCoachLive(input: {
  planId: string;
  onMessages: (messages: UIMessage[]) => void;
}) {
  const [phase, setPhase] = useState<LivePhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const callRef = useRef<RealtimeCall | null>(null);
  const draftRef = useRef(emptyLiveDraft());
  const countedRef = useRef(false);
  const phaseRef = useRef<LivePhase>("idle");

  const setPhaseBoth = useCallback((next: LivePhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const leaveLive = useCallback(async () => {
    callRef.current?.stop();
    callRef.current = null;
    const shouldAbort = !countedRef.current && phaseRef.current !== "idle";
    setPhaseBoth("idle");
    if (!shouldAbort) return;
    await fetch(`/api/coach/plans/${input.planId}/live/abort`, {
      method: "POST",
    });
  }, [input.planId, setPhaseBoth]);

  const startLive = useCallback(async () => {
    setError(null);
    countedRef.current = false;
    draftRef.current = emptyLiveDraft();
    setPhaseBoth("connecting");
    const response = await fetch(
      `/api/coach/plans/${input.planId}/live/session`,
      {
        method: "POST",
      },
    );
    const body = (await response.json().catch(() => ({}))) as {
      clientSecret?: string;
      instructions?: string;
      tools?: unknown[];
      error?: string;
    };
    if (!response.ok || !body.clientSecret) {
      setError(formatCoachError(body).message);
      setPhaseBoth("error");
      return false;
    }
    try {
      const call = await connectRealtimeWebRTC({
        clientSecret: body.clientSecret,
        onEvent: (event) => {
          const type =
            event && typeof event === "object" && "type" in event
              ? String((event as { type?: unknown }).type ?? "")
              : "";
          const signal = signalFromRealtimeEvent(type);
          if (signal) {
            setPhaseBoth(reduceLivePhase(phaseRef.current, signal));
          }
          const step = applyLiveEvent(draftRef.current, event);
          draftRef.current = step.draft;
          if (step.toolCall) {
            void (async () => {
              const toolResponse = await fetch(
                `/api/coach/plans/${input.planId}/live/tool`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    callId: step.toolCall?.callId,
                    name: step.toolCall?.name,
                    arguments: step.toolCall?.arguments,
                  }),
                },
              );
              const toolBody = (await toolResponse
                .json()
                .catch(() => ({}))) as {
                outputEvent?: unknown;
                followUp?: unknown;
              };
              if (toolResponse.ok && toolBody.outputEvent) {
                call.send(toolBody.outputEvent);
                if (toolBody.followUp) call.send(toolBody.followUp);
              } else {
                call.send({
                  type: "conversation.item.create",
                  item: {
                    type: "function_call_output",
                    call_id: step.toolCall?.callId,
                    output: JSON.stringify({ error: "tool_failed" }),
                  },
                });
                call.send({ type: "response.create" });
              }
              setPhaseBoth(
                reduceLivePhase(phaseRef.current, { type: "tool_finished" }),
              );
            })();
          }
          if (step.exchange) {
            void (async () => {
              const turnResponse = await fetch(
                `/api/coach/plans/${input.planId}/live/turn`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(step.exchange),
                },
              );
              const turnBody = (await turnResponse
                .json()
                .catch(() => ({}))) as {
                saved?: boolean;
                messages?: UIMessage[];
              };
              if (turnBody.saved) countedRef.current = true;
              if (turnBody.saved && Array.isArray(turnBody.messages)) {
                input.onMessages(turnBody.messages);
              }
            })();
          }
        },
      });
      callRef.current = call;
      call.send({
        type: "session.update",
        session: {
          type: "realtime",
          instructions: body.instructions,
          tools: body.tools,
          tool_choice: "auto",
        },
      });
      setPhaseBoth("listening");
      return true;
    } catch (caught) {
      await fetch(`/api/coach/plans/${input.planId}/live/abort`, {
        method: "POST",
      });
      setError(
        formatCoachError({
          error:
            caught instanceof Error ? caught.message : "Live connect failed",
        }).message,
      );
      setPhaseBoth("error");
      return false;
    }
  }, [input.planId, input.onMessages, setPhaseBoth]);

  return { phase, error, startLive, leaveLive };
}
