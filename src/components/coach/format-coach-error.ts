export interface FormattedCoachError {
  /** Copy that is safe to show in the coach UI. */
  message: string;
  /** Server code or detail kept for logs. Omitted when there is nothing extra. */
  detail?: string;
}

const FRIENDLY_MESSAGE = "Something went wrong. Try again.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isBareFailure(error: string): boolean {
  const normalized = error
    .replace(/[.!\s]+$/g, "")
    .trim()
    .toLowerCase();
  return (
    normalized === "coach request failed" ||
    normalized === "request failed" ||
    normalized === "tutor failed" ||
    normalized === "failed to fetch" ||
    normalized === "load failed" ||
    normalized === "network request failed" ||
    normalized.startsWith("networkerror")
  );
}

function joinDetail(parts: Array<string | undefined>): string | undefined {
  const present = parts.filter((part): part is string => Boolean(part));
  return present.length > 0 ? present.join(": ") : undefined;
}

/**
 * Maps a coach API error body to user-facing copy.
 * A bare `Coach request failed` (or a machine code such as `COACH_PROVIDER`)
 * becomes a friendly sentence. The original code stays on `detail` for logs.
 */
export function formatCoachError(body: unknown): FormattedCoachError {
  const record = isRecord(body) ? body : {};
  const error = text(record.error);
  const serverDetail = text(record.detail);
  const capability = text(record.capability);
  const upgradeTo = text(record.upgradeTo);

  if (error === "COACH_LIMIT") {
    const what = capability?.replaceAll("_", " ") ?? "this action";
    const upgrade = upgradeTo
      ? ` Upgrade to ${upgradeTo} for a higher limit.`
      : "";
    return {
      message: `Limit reached for ${what}.${upgrade}`,
      detail: joinDetail(["COACH_LIMIT", serverDetail]),
    };
  }

  if (error === "COACH_DISABLED") {
    return {
      message: "Coaching is paused right now.",
      detail: joinDetail(["COACH_DISABLED", serverDetail]),
    };
  }

  if (error === "NOT_FOUND") {
    return {
      message: "That plan could not be found.",
      detail: joinDetail(["NOT_FOUND", serverDetail]),
    };
  }

  if (!error || isBareFailure(error)) {
    return {
      message: FRIENDLY_MESSAGE,
      detail: joinDetail([error, serverDetail]),
    };
  }

  if (/^[A-Z][A-Z0-9_]+$/.test(error)) {
    return {
      message: FRIENDLY_MESSAGE,
      detail: joinDetail([error, serverDetail]),
    };
  }

  return {
    message: error,
    detail: serverDetail,
  };
}
