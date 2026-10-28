/** Pinned for this slice. Re-check https://platform.openai.com/docs/models before changing the id. */
export const COACH_LIVE_MODEL = "gpt-realtime";

/**
 * gpt-realtime published split, USD per 1k tokens:
 * text in 0.004, text out 0.016, audio in 0.032, audio out 0.064.
 * Re-verify https://openai.com/api/pricing in this commit if those cards moved.
 */
const REALTIME_RATES = {
  inputTextPer1k: 0.004,
  inputAudioPer1k: 0.032,
  outputTextPer1k: 0.016,
  outputAudioPer1k: 0.064,
};

export interface RealtimeUsageParts {
  inputTextTokens: number;
  inputAudioTokens: number;
  outputTextTokens: number;
  outputAudioTokens: number;
}

export function estimateRealtimeCostUsd(usage: RealtimeUsageParts): number {
  return (
    (usage.inputTextTokens / 1000) * REALTIME_RATES.inputTextPer1k +
    (usage.inputAudioTokens / 1000) * REALTIME_RATES.inputAudioPer1k +
    (usage.outputTextTokens / 1000) * REALTIME_RATES.outputTextPer1k +
    (usage.outputAudioTokens / 1000) * REALTIME_RATES.outputAudioPer1k
  );
}

function numberFrom(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function readRealtimeUsage(event: unknown): RealtimeUsageParts | null {
  if (!event || typeof event !== "object") return null;
  const record = event as {
    type?: unknown;
    response?: { usage?: Record<string, unknown> };
  };
  if (record.type !== "response.done" || !record.response?.usage) return null;
  const usage = record.response.usage;
  const inputDetails = usage.input_token_details as
    | { text_tokens?: unknown; audio_tokens?: unknown }
    | undefined;
  const outputDetails = usage.output_token_details as
    | { text_tokens?: unknown; audio_tokens?: unknown }
    | undefined;
  return {
    inputTextTokens: numberFrom(inputDetails?.text_tokens),
    inputAudioTokens: numberFrom(inputDetails?.audio_tokens),
    outputTextTokens: numberFrom(outputDetails?.text_tokens),
    outputAudioTokens: numberFrom(outputDetails?.audio_tokens),
  };
}

export function liveTurnMeterAction(
  status: string,
): "settle_hold" | "open_new" {
  return status === "live_hold" ? "settle_hold" : "open_new";
}

export function liveExchangeDisposition(
  assistantText: string,
): "count" | "refund" {
  return assistantText.trim().length === 0 ? "refund" : "count";
}

const SECRET_TEXT = /(?:sk-|ek_)[A-Za-z0-9_-]{8,}|Bearer\s+\S+/g;

export function redactSecrets(value: unknown): unknown {
  if (typeof value === "string")
    return value.replace(SECRET_TEXT, "[redacted]");
  if (Array.isArray(value)) return value.map((item) => redactSecrets(item));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(
      value as Record<string, unknown>,
    )) {
      out[key] = /api[_-]?key|authorization|secret|token/i.test(key)
        ? "[redacted]"
        : redactSecrets(item);
    }
    return out;
  }
  return value;
}

export function functionCallOutputPayload(callId: string, output: unknown) {
  return {
    type: "conversation.item.create" as const,
    item: {
      type: "function_call_output" as const,
      call_id: callId,
      output: JSON.stringify(redactSecrets(output)),
    },
  };
}

export const RESPONSE_CREATE = { type: "response.create" as const };

export async function mintRealtimeClientSecret(input: {
  instructions: string;
  tools: unknown[];
  apiKey: string;
  fetchImpl?: typeof fetch;
}): Promise<{ value: string; expiresAt: number | null }> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const response = await fetchImpl(
    "https://api.openai.com/v1/realtime/client_secrets",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: COACH_LIVE_MODEL,
          instructions: input.instructions,
          tools: input.tools,
          tool_choice: "auto",
        },
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`Realtime session mint failed (${response.status}).`);
  }
  const body = (await response.json()) as {
    value?: unknown;
    expires_at?: unknown;
  };
  if (typeof body.value !== "string" || body.value.length === 0) {
    throw new Error("Realtime session mint failed (missing client secret).");
  }
  return {
    value: body.value,
    expiresAt: typeof body.expires_at === "number" ? body.expires_at : null,
  };
}
