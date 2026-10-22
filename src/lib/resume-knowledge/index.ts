import { normalizeResumeData, normalizeResumeMetadata } from "@/lib/resume";
import type { ResumeData, ResumeMetadata } from "@/types/resume";
import { detectAudience, type ProfileHint } from "./detect";
import { type ResumeReview, reviewResume } from "./review";

export function reviewStoredResume(input: {
  data: unknown;
  metadata: unknown;
  templateSlug: string;
  targetRole?: string | null;
  industry?: string | null;
  profile?: ProfileHint | null;
}): ResumeReview {
  const data = normalizeResumeData(input.data) as ResumeData;
  const metadata = normalizeResumeMetadata(input.metadata) as ResumeMetadata;
  const audience = detectAudience({
    targetRole: input.targetRole,
    industry: input.industry,
    label: data.basics.label,
    summary: data.basics.summary,
    countryCode: data.basics.location.countryCode,
    workTitles: data.work.map((item) => item.position),
    educationCount: data.education.length,
    workCount: data.work.length,
    profile: input.profile,
  });
  return reviewResume({
    audience,
    data,
    metadata,
    templateSlug: input.templateSlug,
  });
}

export type { ProfileHint, ResumeAudience } from "./detect";
export type { ResumeReview } from "./review";
