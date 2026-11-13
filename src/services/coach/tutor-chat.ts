import { COACH_LIMITS } from "@/services/coach/limits";

export function chatTurnDisposition(input: {
  aborted: boolean;
  assistantText: string;
}): "refund" | "persist" {
  if (input.aborted) return "refund";
  if (input.assistantText.trim().length === 0) return "refund";
  return "persist";
}

export function summaryDue(
  messageCount: number,
  threshold: number = COACH_LIMITS.summaryAfterMessages,
): boolean {
  return messageCount >= threshold;
}

export function tutorSessionMigrationBody(): {
  error: "TUTOR_MOVED";
  detail: string;
} {
  return {
    error: "TUTOR_MOVED",
    detail: "Tutor chat moved to POST /api/coach/plans/:id/ai/chat",
  };
}
