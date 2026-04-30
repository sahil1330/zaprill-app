"use client";

import { useSelector } from "react-redux";
import CreativePortfolioTemplate from "@/components/resume/templates/CreativePortfolioTemplate";
import ExecutiveProTemplate from "@/components/resume/templates/ExecutiveProTemplate";
import MinimalistTemplate from "@/components/resume/templates/MinimalistTemplate";
import ModernSplitTemplate from "@/components/resume/templates/ModernSplitTemplate";
import TechStackTemplate from "@/components/resume/templates/TechStackTemplate";
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

  return (
    <div className="resume-preview-container w-full h-full p-6">
      <div className="resume-preview-paper">
        <TemplateComponent data={data} metadata={metadata} />
      </div>
    </div>
  );
}
