/** Cookie that marks a public resume as already counted for this browser. */
export function publicViewCookieName(slug: string): string {
  const safe = slug.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48);
  return `zaprill_rv_${safe || "resume"}`;
}

/** A repeat visit with the same cookie does not increment view_count. */
export function shouldCountPublicView(
  cookieValue: string | undefined,
  slug: string,
): boolean {
  return cookieValue !== slug;
}
