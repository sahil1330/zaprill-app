export function clampedResumePage(
  metadata:
    | { page?: { format?: string | null; margin?: unknown } | null }
    | null
    | undefined,
): { format: "a4" | "letter"; marginMm: number } {
  const format = metadata?.page?.format === "letter" ? "letter" : "a4";
  const raw = Number(metadata?.page?.margin);
  const marginMm = Number.isFinite(raw) ? Math.min(40, Math.max(10, raw)) : 20;
  return { format, marginMm };
}

/** `@page` rule for the HTML preview. Format and margin are clamped so metadata cannot inject CSS. */
export function exportPageStyle(
  metadata:
    | { page?: { format?: string | null; margin?: unknown } | null }
    | null
    | undefined,
): string {
  const { format, marginMm } = clampedResumePage(metadata);
  const size = format === "letter" ? "letter" : "A4";
  return `@page { size: ${size}; margin: ${marginMm}mm; }`;
}
