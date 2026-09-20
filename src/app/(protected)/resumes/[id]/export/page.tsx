"use client";

import { Loader2 } from "lucide-react";
import { use, useEffect, useRef, useState } from "react";
import CreativePortfolioTemplate from "@/components/resume/templates/CreativePortfolioTemplate";
import ExecutiveProTemplate from "@/components/resume/templates/ExecutiveProTemplate";
import MinimalistTemplate from "@/components/resume/templates/MinimalistTemplate";
import ModernSplitTemplate from "@/components/resume/templates/ModernSplitTemplate";
import TechStackTemplate from "@/components/resume/templates/TechStackTemplate";
import type { ResumeData, ResumeMetadata } from "@/types/resume";
import "@/components/resume/templates/resume-templates.css";

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

export default function ResumeExportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const printedRef = useRef(false);
  const { id } = use(params);
  const [resumeData, setResumeData] = useState<{
    data: ResumeData;
    metadata: ResumeMetadata;
    templateSlug: string;
    title: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAndPrint = async () => {
      try {
        const res = await fetch(`/api/resumes/${id}/export`, {
          method: "POST",
        });
        if (!res.ok) {
          if (isMounted) setError("Failed to load resume for export");
          return;
        }
        const { resume } = await res.json();
        if (!isMounted) return;

        setResumeData({
          data: resume.data,
          metadata: resume.metadata,
          templateSlug: resume.templateSlug,
          title: resume.title,
        });

        // Set document title for the PDF filename
        document.title = `${resume.title} — Resume`;

        // Check if we are in preview mode
        const isPreview =
          new URLSearchParams(window.location.search).get("preview") === "true";

        // Trigger print dialog after a short delay for rendering (only if NOT preview)
        if (!isPreview && !printedRef.current) {
          printedRef.current = true;
          setTimeout(() => {
            if (isMounted) {
              window.print();
            }
          }, 1000);
        }
      } catch {
        if (isMounted) setError("Failed to export resume");
      }
    };

    fetchAndPrint();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="font-bold text-red-500">{error}</p>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white print:hidden">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
          <p className="font-medium text-gray-500 text-sm">
            Preparing export...
          </p>
        </div>
      </div>
    );
  }

  const TemplateComponent =
    TEMPLATE_COMPONENTS[resumeData.templateSlug] ?? MinimalistTemplate;
  const pageFormat =
    resumeData.metadata?.page?.format === "letter" ? "letter" : "A4";
  const pageMargin = resumeData.metadata?.page?.margin ?? 12;

  return (
    <div className="resume-export-page">
      <style>{`@page { size: ${pageFormat}; margin: ${pageMargin}mm; }`}</style>
      <TemplateComponent
        data={resumeData.data}
        metadata={resumeData.metadata}
      />
    </div>
  );
}
