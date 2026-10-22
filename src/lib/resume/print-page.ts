/** `@page` rule for the print export. Format and margin are clamped so metadata cannot inject CSS. */
export function exportPageStyle(
  metadata:
    | { page?: { format?: string | null; margin?: unknown } | null }
    | null
    | undefined,
): string {
  const format = metadata?.page?.format === "letter" ? "letter" : "A4";
  const raw = Number(metadata?.page?.margin);
  const margin = Number.isFinite(raw) ? Math.min(40, Math.max(10, raw)) : 20;
  return `@page { size: ${format}; margin: ${margin}mm; }`;
}
