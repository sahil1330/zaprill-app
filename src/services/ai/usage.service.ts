import { nanoid } from "nanoid";
import db from "@/db";
import { aiUsageLog } from "@/db/schema";

// ─────────────────────────────────────────────────────────────────────────────
// Model Pricing Table
// Rates are USD per 1 000 tokens (input / output).
//
// Last verified: April 2026
// Sources:
//   Google Gemini → https://ai.google.dev/pricing
//   OpenAI        → https://openai.com/api/pricing
//
// HOW TO ADD A NEW MODEL:
//   1. Add one entry below with the exact model string used in hackclub() / SDK call.
//   2. No other file needs changing — cost is computed dynamically from this table.
//
// NOTE: Historical DB rows keep their computed cost_usd value at the time of the
// call, so updating rates here does NOT retroactively change old records.
// ─────────────────────────────────────────────────────────────────────────────

interface ModelRate {
  /** USD per 1 000 input (prompt) tokens */
  inputPer1k: number;
  /** USD per 1 000 output (completion) tokens */
  outputPer1k: number;
}

/**
 * Canonical model identifier → pricing rate.
 *
 * Keys must exactly match the string passed to the Vercel AI SDK model call,
 * e.g. hackclub("google/gemini-2.5-flash") → key "google/gemini-2.5-flash".
 */
export const MODEL_RATES: Record<string, ModelRate> = {
  // ── Google Gemini ─────────────────────────────────────────────────────────
  // Verified April 2026: https://ai.google.dev/pricing
  //
  // gemini-2.5-flash: $0.30/1M input, $2.50/1M output (non-thinking)
  "google/gemini-2.5-flash": { inputPer1k: 0.0003, outputPer1k: 0.0025 },
  "gemini-2.5-flash": { inputPer1k: 0.0003, outputPer1k: 0.0025 },

  // gemini-2.5-flash-lite: $0.10/1M input, $0.40/1M output
  "google/gemini-2.5-flash-lite": { inputPer1k: 0.0001, outputPer1k: 0.0004 },
  "gemini-2.5-flash-lite": { inputPer1k: 0.0001, outputPer1k: 0.0004 },

  // gemini-2.5-pro: $1.25/1M input (≤200k), $10.00/1M output
  "google/gemini-2.5-pro": { inputPer1k: 0.00125, outputPer1k: 0.01 },
  "gemini-2.5-pro": { inputPer1k: 0.00125, outputPer1k: 0.01 },

  // gemini-2.0-flash: $0.10/1M input, $0.40/1M output
  "google/gemini-2.0-flash": { inputPer1k: 0.0001, outputPer1k: 0.0004 },
  "gemini-2.0-flash": { inputPer1k: 0.0001, outputPer1k: 0.0004 },

  // gemini-1.5-pro: $1.25/1M input (≤128k), $5.00/1M output
  "google/gemini-1.5-pro": { inputPer1k: 0.00125, outputPer1k: 0.005 },
  "gemini-1.5-pro": { inputPer1k: 0.00125, outputPer1k: 0.005 },

  // ── OpenAI ────────────────────────────────────────────────────────────────
  // Verified April 2026: https://openai.com/api/pricing
  //
  // gpt-4o-mini: $0.15/1M input, $0.60/1M output
  "gpt-4o-mini": { inputPer1k: 0.00015, outputPer1k: 0.0006 },
  "openai/gpt-4o-mini": { inputPer1k: 0.00015, outputPer1k: 0.0006 },

  // gpt-4o: $2.50/1M input, $10.00/1M output
  "gpt-4o": { inputPer1k: 0.0025, outputPer1k: 0.01 },
  "openai/gpt-4o": { inputPer1k: 0.0025, outputPer1k: 0.01 },

  // gpt-4.1-mini: $0.40/1M input, $1.60/1M output
  "gpt-4.1-mini": { inputPer1k: 0.0004, outputPer1k: 0.0016 },
  "openai/gpt-4.1-mini": { inputPer1k: 0.0004, outputPer1k: 0.0016 },

  // gpt-4.1: $2.00/1M input, $8.00/1M output
  "gpt-4.1": { inputPer1k: 0.002, outputPer1k: 0.008 },
  "openai/gpt-4.1": { inputPer1k: 0.002, outputPer1k: 0.008 },

  // gpt-4.1-nano: $0.10/1M input, $0.40/1M output
  "gpt-4.1-nano": { inputPer1k: 0.0001, outputPer1k: 0.0004 },
  "openai/gpt-4.1-nano": { inputPer1k: 0.0001, outputPer1k: 0.0004 },
};

/**
 * Compute the estimated USD cost for a single LLM call.
 * Returns `null` when the model is not in the pricing table (cost is unknown).
 */
function estimateCostUsd(
  model: string,
  promptTokens: number,
  completionTokens: number,
): number | null {
  const rate = MODEL_RATES[model];
  if (!rate) return null;
  return (
    (promptTokens / 1000) * rate.inputPer1k +
    (completionTokens / 1000) * rate.outputPer1k
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Log params
// ─────────────────────────────────────────────────────────────────────────────

export interface LogUsageParams {
  /** Authenticated user ID — null / undefined for anonymous calls */
  userId?: string | null;
  /** `resumeAnalysis.id` if this call is part of an analysis run */
  analysisId?: string | null;
  /** Which application feature triggered the LLM call */
  action:
    | "parse_resume"
    | "analyze_gaps"
    | "enhance_bullet"
    | "generate_summary"
    | "tailor_resume"
    | "ats_scan"
    | "resume_roast";
  /**
   * The exact model identifier string used when constructing the SDK call,
   * e.g. `hackclub("google/gemini-2.5-flash")` → pass `"google/gemini-2.5-flash"`.
   * This is stored as-is in the DB — nothing is hardcoded.
   */
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  /** Wall-clock milliseconds for the LLM call only (not the full route) */
  latencyMs?: number | null;
  /** True when the response was served from the analysis cache (0 tokens consumed) */
  cacheHit?: boolean;
  /** False when the LLM call succeeded but downstream parsing failed */
  success?: boolean;
  /** Machine-readable error code, e.g. "PARSE_FAILED", "SCHEMA_VALIDATION_FAILED" */
  errorCode?: string;
  /** Any extra context you want to store alongside the log entry */
  metadata?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Persist one AI usage record.
 *
 * This is **fire-and-forget** — it never throws and never awaits the DB write,
 * so it cannot delay or block the HTTP response.
 *
 * Usage:
 * ```ts
 * const t0 = Date.now();
 * const { text, usage } = await generateText({ model: hackclub(MODEL), ... });
 *
 * logAiUsage({
 *   userId: session?.user?.id,
 *   action:  "analyze_gaps",
 *   model:   MODEL,               // ← pass the string, not a hardcoded value
 *   promptTokens:     usage.promptTokens,
 *   completionTokens: usage.completionTokens,
 *   totalTokens:      usage.totalTokens,
 *   latencyMs: Date.now() - t0,
 * });
 * ```
 */
export function logAiUsage(params: LogUsageParams): void {
  const isCacheHit = params.cacheHit ?? false;

  // For cache hits we record 0 tokens; skip cost computation.
  const costUsd = isCacheHit
    ? 0
    : estimateCostUsd(
        params.model,
        params.promptTokens,
        params.completionTokens,
      );

  void db
    .insert(aiUsageLog)
    .values({
      id: nanoid(),
      userId: params.userId ?? null,
      analysisId: params.analysisId ?? null,
      action: params.action,
      model: params.model,
      promptTokens: params.promptTokens,
      completionTokens: params.completionTokens,
      totalTokens: params.totalTokens,
      // Store as fixed-point string for Postgres NUMERIC; null when unknown.
      costUsd: costUsd !== null ? costUsd.toFixed(8) : undefined,
      latencyMs: params.latencyMs ?? null,
      cacheHit: isCacheHit,
      success: params.success ?? true,
      errorCode: params.errorCode ?? null,
      metadata: params.metadata ?? {},
    })
    .catch((err) =>
      // Never crash the request — just log to server console.
      console.error("[ai-usage] Failed to write usage log:", err),
    );
}
