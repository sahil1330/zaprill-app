import { normalizeResumeData } from "@/lib/resume";
import type { ResumeData } from "@/types/resume";

/**
 * ATS, tailor, summary, and roast read a full ResumeData shape.
 * A partial editor payload is filled from defaults instead of throwing
 * before the model runs. Missing `data` is a client error.
 */
export function resumePayloadForAi(body: unknown): ResumeData | null {
  if (!body || typeof body !== "object" || !("data" in body)) return null;
  const data = (body as { data?: unknown }).data;
  if (data == null || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }
  return normalizeResumeData(data);
}
