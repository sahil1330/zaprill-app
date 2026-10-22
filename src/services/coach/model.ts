import type { LanguageModelUsage } from "ai";
import { estimateCostUsd, logAiUsage } from "@/services/ai/usage.service";
import { COACH_LIMITS, usdToPaise } from "@/services/coach/limits";

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  reasoningTokens: number;
}

export function readTokenUsage(
  usage:
    | (Partial<LanguageModelUsage> & {
        promptTokens?: number;
        completionTokens?: number;
        reasoningTokens?: number;
      })
    | null
    | undefined,
): TokenUsage {
  const promptTokens = usage?.inputTokens ?? usage?.promptTokens ?? 0;
  const completionTokens = usage?.outputTokens ?? usage?.completionTokens ?? 0;
  const reasoningTokens =
    usage?.outputTokenDetails?.reasoningTokens ?? usage?.reasoningTokens ?? 0;
  return {
    promptTokens,
    completionTokens,
    totalTokens: usage?.totalTokens ?? promptTokens + completionTokens,
    reasoningTokens,
  };
}

/** Null when the model has no rate. Caller keeps the reservation in that case. */
export function paiseForTokens(
  model: string,
  promptTokens: number,
  completionTokens: number,
): number | null {
  const usd = estimateCostUsd(model, promptTokens, completionTokens);
  if (usd === null) return null;
  return usdToPaise(usd);
}

export function actualPaise(
  parts: Array<number | null>,
  reservePaise: number,
): number {
  if (parts.length === 0) return 0;
  if (parts.some((part) => part === null)) {
    const known = parts.reduce<number>((sum, part) => sum + (part ?? 0), 0);
    return Math.max(reservePaise, known);
  }
  return parts.reduce<number>((sum, part) => sum + (part ?? 0), 0);
}

export function usageFromError(error: unknown): TokenUsage | null {
  if (!error || typeof error !== "object" || !("usage" in error)) return null;
  const usage = (error as { usage?: unknown }).usage;
  if (!usage || typeof usage !== "object") return null;
  return readTokenUsage(usage as LanguageModelUsage);
}

export function logCoachCall(input: {
  userId: string;
  action: "coach_plan" | "coach_tutor" | "coach_practice" | "coach_mock";
  usage: TokenUsage;
  latencyMs: number;
  success: boolean;
  errorCode?: string;
  cacheHit?: boolean;
  metadata: Record<string, unknown>;
}): void {
  logAiUsage({
    userId: input.userId,
    action: input.action,
    model: input.cacheHit ? COACH_LIMITS.model : COACH_LIMITS.model,
    promptTokens: input.usage.promptTokens,
    completionTokens: input.usage.completionTokens,
    totalTokens: input.usage.totalTokens,
    reasoningTokens: input.usage.reasoningTokens,
    latencyMs: input.latencyMs,
    cacheHit: input.cacheHit,
    success: input.success,
    errorCode: input.errorCode,
    metadata: input.metadata,
  });
}
