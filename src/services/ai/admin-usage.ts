const LABELS: Record<string, string> = {
  parse_resume: "Resume parse",
  analyze_gaps: "Gap analysis",
  enhance_bullet: "Bullet enhance",
  generate_summary: "Summary",
  tailor_resume: "Tailor resume",
  ats_scan: "ATS scan",
  resume_roast: "Resume roast",
  resume_chat: "Resume chat",
  coach_plan: "Coach plan",
  coach_tutor: "Coach tutor",
  coach_practice: "Coach practice",
  coach_mock: "Coach mock",
  coach_live: "Coach live",
};

export function actionLabel(action: string): string {
  return LABELS[action] ?? action;
}

export function failureRate(
  successCount: number,
  failureCount: number,
): number {
  const total = successCount + failureCount;
  if (total <= 0) return 0;
  return failureCount / total;
}

export function formatFailurePercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export interface AiActionStat {
  action: string;
  label: string;
  calls: number;
  tokens: number;
  costUsd: number;
  successCount: number;
  failureCount: number;
}

export interface AiErrorStat {
  action: string;
  label: string;
  model: string;
  errorCode: string | null;
  latencyMs: number | null;
  createdAt: string;
}

function rowsOf(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (row): row is Record<string, unknown> =>
      !!row && typeof row === "object" && !Array.isArray(row),
  );
}

function num(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) return Number(value) || 0;
  return 0;
}

export function shapeActionStats(rows: unknown): AiActionStat[] {
  return rowsOf(rows).map((row) => {
    const action = String(row.action ?? "");
    return {
      action,
      label: actionLabel(action),
      calls: num(row.calls),
      tokens: num(row.tokens),
      costUsd: num(row.cost),
      successCount: num(row.success_count),
      failureCount: num(row.failure_count),
    };
  });
}

export function shapeErrorStats(rows: unknown): AiErrorStat[] {
  return rowsOf(rows).map((row) => {
    const action = String(row.action ?? "");
    const created =
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at ?? "");
    return {
      action,
      label: actionLabel(action),
      model: String(row.model ?? ""),
      errorCode:
        typeof row.error_code === "string" && row.error_code.length > 0
          ? row.error_code
          : null,
      latencyMs:
        row.latency_ms === null || row.latency_ms === undefined
          ? null
          : num(row.latency_ms),
      createdAt: created,
    };
  });
}
