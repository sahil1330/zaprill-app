import {
  type RealtimeUsageParts,
  readRealtimeUsage,
} from "@/services/coach/live-session";

export interface LiveDraft {
  userText: string;
  assistantText: string;
  tools: Array<{ name: string; callId: string }>;
  usage: RealtimeUsageParts | null;
}

export interface LiveToolCall {
  callId: string;
  name: string;
  arguments: string;
}

export function emptyLiveDraft(): LiveDraft {
  return { userText: "", assistantText: "", tools: [], usage: null };
}

function textField(event: Record<string, unknown>, key: string): string {
  const value = event[key];
  return typeof value === "string" ? value : "";
}

export function applyLiveEvent(
  draft: LiveDraft,
  event: unknown,
): {
  draft: LiveDraft;
  toolCall: LiveToolCall | null;
  exchange: {
    userText: string;
    assistantText: string;
    tools: Array<{ name: string; callId: string }>;
    usage: RealtimeUsageParts | null;
  } | null;
} {
  if (!event || typeof event !== "object") {
    return { draft, toolCall: null, exchange: null };
  }
  const record = event as Record<string, unknown>;
  const type = typeof record.type === "string" ? record.type : "";
  if (type === "conversation.item.input_audio_transcription.completed") {
    return {
      draft: {
        ...draft,
        userText: textField(record, "transcript") || draft.userText,
      },
      toolCall: null,
      exchange: null,
    };
  }
  if (
    type === "response.output_audio_transcript.done" ||
    type === "response.audio_transcript.done"
  ) {
    const transcript = textField(record, "transcript");
    return {
      draft: {
        ...draft,
        assistantText: transcript
          ? `${draft.assistantText}${draft.assistantText ? "\n" : ""}${transcript}`
          : draft.assistantText,
      },
      toolCall: null,
      exchange: null,
    };
  }
  if (type === "response.function_call_arguments.done") {
    const callId = textField(record, "call_id");
    const name = textField(record, "name");
    const toolCall =
      callId && name
        ? { callId, name, arguments: textField(record, "arguments") || "{}" }
        : null;
    return {
      draft: toolCall
        ? { ...draft, tools: [...draft.tools, { name, callId }] }
        : draft,
      toolCall,
      exchange: null,
    };
  }
  if (type === "response.done") {
    const usage = readRealtimeUsage(event) ?? draft.usage;
    // A function-call response often has no spoken answer yet. Keep the draft
    // so the follow-up transcript joins this exchange instead of billing a second tutor turn.
    if (draft.tools.length > 0 && draft.assistantText.trim().length === 0) {
      return { draft: { ...draft, usage }, toolCall: null, exchange: null };
    }
    const exchange =
      draft.userText.trim() || draft.assistantText.trim()
        ? {
            userText: draft.userText,
            assistantText: draft.assistantText,
            tools: draft.tools,
            usage,
          }
        : null;
    return { draft: emptyLiveDraft(), toolCall: null, exchange };
  }
  return { draft, toolCall: null, exchange: null };
}
