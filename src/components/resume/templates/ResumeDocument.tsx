"use client";

import CreativePortfolioTemplate from "@/components/resume/templates/CreativePortfolioTemplate";
import ExecutiveProTemplate from "@/components/resume/templates/ExecutiveProTemplate";
import MinimalistTemplate from "@/components/resume/templates/MinimalistTemplate";
import ModernSplitTemplate from "@/components/resume/templates/ModernSplitTemplate";
import TechStackTemplate from "@/components/resume/templates/TechStackTemplate";
import { PAGE_DIMENSIONS_MM } from "@/lib/resume/sanitize";
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

/**
 * Read-only resume paper. Used by version preview and the public share page.
 * Template choice is passed in so this does not depend on the editor store.
 */
export default function ResumeDocument({
  data,
  metadata,
  templateSlug,
}: {
  data: ResumeData;
  metadata: ResumeMetadata;
  templateSlug: string;
}) {
  const TemplateComponent =
    TEMPLATE_COMPONENTS[templateSlug] ?? MinimalistTemplate;
  const format = metadata?.page?.format === "letter" ? "letter" : "a4";
  const size = PAGE_DIMENSIONS_MM[format];

  return (
    <div
      className="resume-preview-paper mx-auto"
      data-page-format={format}
      style={{
        maxWidth: `${size.width}mm`,
        minHeight: `${size.height}mm`,
      }}
    >
      <TemplateComponent data={data} metadata={metadata} />
    </div>
  );
}
