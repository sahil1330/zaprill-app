import { customAlphabet } from "nanoid";

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
