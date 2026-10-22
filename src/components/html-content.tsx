import type { HTMLAttributes } from "react";

type HtmlContentProps = HTMLAttributes<HTMLDivElement> & {
  html: string;
};

/**
 * Renders HTML that the product already stores (resume rich text, email bodies).
 * Callers keep their existing class names; only the injection site is shared.
 */
export function HtmlContent({ html, ...props }: HtmlContentProps) {
  return (
    <div
      {...props}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: content is stored HTML and must render as authored
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
