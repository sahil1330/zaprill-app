"use client";

import { Loader2 } from "lucide-react";
import { use, useEffect, useState } from "react";
import CreativePortfolioTemplate from "@/components/resume/templates/CreativePortfolioTemplate";
import ExecutiveProTemplate from "@/components/resume/templates/ExecutiveProTemplate";
import MinimalistTemplate from "@/components/resume/templates/MinimalistTemplate";
import ModernSplitTemplate from "@/components/resume/templates/ModernSplitTemplate";
import TechStackTemplate from "@/components/resume/templates/TechStackTemplate";
import { normalizeResumeData, normalizeResumeMetadata } from "@/lib/resume";
import { downloadResumePdf } from "@/lib/resume/download-pdf";
import { exportPageStyle } from "@/lib/resume/print-page";
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
  const { id } = use(params);
  const [mode, setMode] = useState<
    "loading" | "preview" | "downloaded" | "error"
  >("loading");
  const [resumeData, setResumeData] = useState<{
    data: ResumeData;
    metadata: ResumeMetadata;
    templateSlug: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const isPreview =
      new URLSearchParams(window.location.search).get("preview") === "true";

    const run = async () => {
      if (!isPreview) {
        try {
          await downloadResumePdf(id);
          if (isMounted) setMode("downloaded");
        } catch {
          if (isMounted) setMode("error");
        }
        return;
      }

      try {
        const res = await fetch(`/api/resumes/${id}`);
        if (!res.ok) {
          if (isMounted) setMode("error");
          return;
        }
        const { resume } = await res.json();
        if (!isMounted) return;
        setResumeData({
          data: normalizeResumeData(resume.data),
          metadata: normalizeResumeMetadata(resume.metadata),
          templateSlug: resume.templateSlug || "minimalist",
          title: resume.title,
        });
        document.title = `${resume.title} — Resume`;
        setMode("preview");
      } catch {
        if (isMounted) setMode("error");
      }
    };

    void run();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (mode === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="font-bold text-red-500">Failed to load this resume.</p>
      </div>
    );
  }

  if (mode === "downloaded") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="font-medium text-gray-600 text-sm">
          Your PDF download has started.
        </p>
      </div>
    );
  }

  if (mode !== "preview" || !resumeData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
          <p className="font-medium text-gray-500 text-sm">
            Preparing resume...
          </p>
        </div>
      </div>
    );
  }

  const TemplateComponent =
    TEMPLATE_COMPONENTS[resumeData.templateSlug] ?? MinimalistTemplate;
  return (
    <div className="resume-export-page">
      <style>{exportPageStyle(resumeData.metadata)}</style>
      <TemplateComponent
        data={resumeData.data}
        metadata={resumeData.metadata}
      />
    </div>
  );
}
