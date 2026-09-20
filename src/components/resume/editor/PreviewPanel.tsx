"use client";

import { AlertTriangle, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import CreativePortfolioTemplate from "@/components/resume/templates/CreativePortfolioTemplate";
import ExecutiveProTemplate from "@/components/resume/templates/ExecutiveProTemplate";
import MinimalistTemplate from "@/components/resume/templates/MinimalistTemplate";
import ModernSplitTemplate from "@/components/resume/templates/ModernSplitTemplate";
import TechStackTemplate from "@/components/resume/templates/TechStackTemplate";
import { PAGE_DIMENSIONS_MM } from "@/lib/resume/sanitize";
import type { RootState } from "@/store/store";
import type { ResumeData, ResumeMetadata } from "@/types/resume";

const TEMPLATE_COMPONENTS: Record<
  string,
  React.ComponentType<{ data: ResumeData; metadata: ResumeMetadata }>
> = {
  minimalist: MinimalistTemplate,
  "tech-stack": TechStackTemplate,
  "executive-pro": ExecutiveProTemplate,
  "creative-portfolio": CreativePortfolioTemplate,
  "modern-split": ModernSplitTemplate,
};

function usePageCount(
  paperRef: React.RefObject<HTMLDivElement | null>,
  format: "a4" | "letter",
) {
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const paper = paperRef.current;
    if (!paper) return;

    const measure = () => {
      const heightPx = paper.scrollHeight;
      const pageHeightMm = PAGE_DIMENSIONS_MM[format].height;
      const pageHeightPx = (pageHeightMm / 25.4) * 96;
      const next = Math.max(1, Math.ceil(heightPx / pageHeightPx - 0.02));
      setPages(next);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(paper);
    return () => observer.disconnect();
  }, [format, paperRef]);

  return pages;
}

/**
 * PreviewPanel — Renders the active template inside a paper-like container.
 * Falls back to Minimalist if the selected template component isn't available yet.
 */
export default function PreviewPanel({
  data,
  metadata,
}: {
  data: ResumeData;
  metadata: ResumeMetadata;
}) {
  const templateSlug = useSelector((s: RootState) => s.resume.templateSlug);
  const TemplateComponent =
    TEMPLATE_COMPONENTS[templateSlug] ?? MinimalistTemplate;
  const format = metadata?.page?.format === "letter" ? "letter" : "a4";
  const size = PAGE_DIMENSIONS_MM[format];
  const paperRef = useRef<HTMLDivElement>(null);
  const pages = usePageCount(paperRef, format);
  const over = pages > 1;

  return (
    <div className="resume-preview-container relative h-full w-full p-6">
      <div
        className={`pointer-events-none absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium text-[11px] shadow-sm ${
          over
            ? "border-score-low-fg/30 bg-score-low text-score-low-fg"
            : "border-border bg-background/90 text-muted-foreground"
        }`}
      >
        {over ? (
          <AlertTriangle className="h-3 w-3" />
        ) : (
          <FileText className="h-3 w-3" />
        )}
        {over
          ? `${pages} pages — trim content for a one-page resume`
          : "1 page"}
      </div>
      <div
        ref={paperRef}
        className="resume-preview-paper"
        data-page-format={format}
        style={{
          maxWidth: `${size.width}mm`,
          minHeight: `${size.height}mm`,
        }}
      >
        <TemplateComponent data={data} metadata={metadata} />
      </div>
    </div>
  );
}
