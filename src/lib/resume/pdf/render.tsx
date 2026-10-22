import { renderToBuffer } from "@react-pdf/renderer";
import { normalizeResumeData, normalizeResumeMetadata } from "@/lib/resume";
import { ResumePdfDocument } from "./resume-pdf";

/**
 * Server PDF for Vercel. The on-screen templates stay HTML. This document
 * follows the same section order, theme colors, page size, and the five
 * layouts (centered, serif executive, skills rail, split sidebar, creative
 * lead). Standard PDF fonts avoid a Chromium binary in the serverless bundle.
 */
export async function renderResumePdf(input: {
  title: string;
  templateSlug: string;
  data: unknown;
  metadata: unknown;
}): Promise<Buffer> {
  const data = normalizeResumeData(input.data);
  const metadata = normalizeResumeMetadata(input.metadata);
  return renderToBuffer(
    <ResumePdfDocument
      title={input.title}
      templateSlug={input.templateSlug || "minimalist"}
      data={data}
      metadata={metadata}
    />,
  );
}
