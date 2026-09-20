import type { ResumeData, ResumeMetadata } from "@/types/resume";

export interface ResumeDraftSnapshot {
  resumeId: string;
  data: ResumeData;
  metadata: ResumeMetadata;
  title: string;
  templateSlug?: string;
  industry?: string;
  version?: number;
}

const DRAFT_KEY_PREFIX = "resume_draft_";

export function getResumeDraftKey(resumeId: string) {
  return `${DRAFT_KEY_PREFIX}${resumeId}`;
}

/** Read a locally cached draft saved by useAutoSave. */
export function loadResumeDraft(resumeId: string): ResumeDraftSnapshot | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(getResumeDraftKey(resumeId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ResumeDraftSnapshot;
    if (parsed?.resumeId !== resumeId || !parsed.data || !parsed.metadata) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function hasResumeDraft(resumeId: string): boolean {
  return loadResumeDraft(resumeId) !== null;
}

/** Extract resume id from `/resumes/:id` paths. */
export function getResumeIdFromPath(pathname: string): string | null {
  const match = pathname.match(/\/resumes\/([^/]+)/);
  return match?.[1] ?? null;
}
