import { customAlphabet } from "nanoid";

export function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const record = error as { code?: string; cause?: { code?: string } };
  return record.code === "23505" || record.cause?.code === "23505";
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
