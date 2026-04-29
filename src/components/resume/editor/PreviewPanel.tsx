"use client";

import MinimalistTemplate from "@/components/resume/templates/MinimalistTemplate";
import type { ResumeData, ResumeMetadata } from "@/types/resume";

/**
 * PreviewPanel — Renders the active template inside a paper-like container.
 * For V1, only the MinimalistTemplate is implemented.
 */
export default function PreviewPanel({
  data,
  metadata,
}: {
  data: ResumeData;
  metadata: ResumeMetadata;
}) {
  return (
    <div className="resume-preview-container w-full h-full p-6">
      <div className="resume-preview-paper">
        <MinimalistTemplate data={data} metadata={metadata} />
      </div>
    </div>
  );
}
