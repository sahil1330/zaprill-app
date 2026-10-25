import {
  type CoachQuota,
  type CoachTier,
  upgradeTier,
} from "@/services/coach/limits";

export class CoachServiceError extends Error {
  readonly status: number;
  readonly body: Record<string, unknown>;

  constructor(message: string, status: number, body: Record<string, unknown>) {
    super(message);
    this.name = "CoachServiceError";
    this.status = status;
    this.body = body;
  }
}

export function coachDisabledError(): CoachServiceError {
  return new CoachServiceError("Skill Coach is temporarily unavailable", 503, {
    error: "COACH_DISABLED",
  });
}

export function coachLimitError(
  capability: CoachQuota | "programs" | "spend",
  tier: CoachTier,
): CoachServiceError {
  return new CoachServiceError("Skill Coach limit reached", 403, {
    error: "COACH_LIMIT",
    capability,
    tier,
    upgradeTo: upgradeTier(tier),
  });
}

export function coachNotFound(message = "Not found"): CoachServiceError {
  return new CoachServiceError(message, 404, { error: "NOT_FOUND" });
}
