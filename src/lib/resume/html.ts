const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "del",
  "em",
  "hr",
  "i",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "span",
  "strike",
  "strong",
  "u",
  "ul",
]);

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function readSafeHref(attrs: string): string | null {
  const match = /href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i.exec(
    attrs,
  );
  const href = (match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim();
  if (!href || /\s/.test(href)) return null;
  for (let i = 0; i < href.length; i++) {
    const code = href.charCodeAt(i);
    if (code < 32 || code === 127) return null;
  }
  if (!/^(https?:|mailto:)/i.test(href)) return null;
  return href;
}

/**
 * Keep the small HTML set TipTap writes for resume summaries.
 * Public share and PDF export render this HTML, so scripts and handlers go.
 */
export function sanitizeResumeHtml(input: unknown): string {
  if (typeof input !== "string" || input.length === 0) return "";

  let html = input.replace(/\0/g, "");
  for (let pass = 0; pass < 3; pass++) {
    const next = html
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(
        /<(script|style|iframe|object|embed|svg|math|noscript|template)\b[^>]*>[\s\S]*?<\/\1>/gi,
        "",
      )
      .replace(
        /<(script|style|iframe|object|embed|svg|math|noscript|template)\b[^>]*\/?>/gi,
        "",
      );
    if (next === html) break;
    html = next;
  }

  return html.replace(
    /<\/?\s*([a-zA-Z][\w:-]*)\b([^>]*)>/g,
    (match, rawTag: string, rawAttrs: string) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";
      if (match.startsWith("</")) return `</${tag}>`;
      if (tag === "br" || tag === "hr") return `<${tag}>`;
      if (tag === "a") {
        const href = readSafeHref(rawAttrs);
        if (!href) return "<a>";
        return `<a href="${escapeAttr(href)}" rel="noopener noreferrer" target="_blank">`;
      }
      return `<${tag}>`;
    },
  );
}
