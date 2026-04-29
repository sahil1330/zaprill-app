"use client";

import { Loader2 } from "lucide-react";
import { use, useEffect, useState } from "react";
import ExecutiveProTemplate from "@/components/resume/templates/ExecutiveProTemplate";
import MinimalistTemplate from "@/components/resume/templates/MinimalistTemplate";
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
};

export default function ResumeExportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [resumeData, setResumeData] = useState<{
    data: ResumeData;
    metadata: ResumeMetadata;
    templateSlug: string;
    title: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndPrint = async () => {
      try {
        const res = await fetch(`/api/resumes/${id}/export`, {
          method: "POST",
        });
        if (!res.ok) {
          setError("Failed to load resume for export");
          return;
        }
        const { resume } = await res.json();
        setResumeData({
          data: resume.data,
          metadata: resume.metadata,
          templateSlug: resume.templateSlug,
          title: resume.title,
        });

        // Set document title for the PDF filename
        document.title = `${resume.title} — Resume`;

        // Trigger print dialog after a short delay for rendering
        setTimeout(() => {
          window.print();
        }, 500);
      } catch {
        setError("Failed to export resume");
      }
    };

    fetchAndPrint();
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-red-500 font-bold">{error}</p>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white print:hidden">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
          <p className="text-sm font-medium text-gray-500">
            Preparing export...
          </p>
        </div>
      </div>
    );
  }

  const TemplateComponent =
    TEMPLATE_COMPONENTS[resumeData.templateSlug] ?? MinimalistTemplate;

  return (
    <div className="resume-export-page">
      <TemplateComponent
        data={resumeData.data}
        metadata={resumeData.metadata}
      />
    </div>
  );
}
