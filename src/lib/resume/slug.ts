import { customAlphabet } from "nanoid";

export function isUniqueViolation(error: unknown): boolean {
  const seen = new Set<unknown>();
  let current: unknown = error;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const record = current as {
      code?: unknown;
      message?: unknown;
      cause?: unknown;
    };
    if (record.code === "23505") return true;
    if (
      typeof record.message === "string" &&
      /duplicate key value violates unique constraint/i.test(record.message)
    ) {
      return true;
    }
    current = record.cause;
  }
  return false;
}

const suffixId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);

/**
 * Public resume path segment for /r/{slug}.
 * Readable when a name or title is available, always unique enough to retry.
 */
export function generateResumeSlug(seed?: string | null): string {
  const base = (seed ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  const suffix = suffixId();
  return base ? `${base}-${suffix}` : suffix;
}
