export const MAX_RESUME_VERSION_RETRIES = 2;

type ResumePatchBody = {
  title?: string;
  data?: unknown;
  metadata?: unknown;
  templateSlug?: string;
  industry?: string;
  status?: string;
};

/**
 * PATCH a resume and, on version conflict, retry with this tab's payload
 * using the server's currentVersion (last-write-wins for the same user).
 */
export async function patchResumeWithVersionRetry({
  resumeId,
  version,
  body,
  maxRetries = MAX_RESUME_VERSION_RETRIES,
}: {
  resumeId: string;
  version: number;
  body: ResumePatchBody;
  maxRetries?: number;
}): Promise<Response> {
  let versionToUse = version;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(`/api/resumes/${resumeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        version: versionToUse,
      }),
    });

    if (res.status !== 409 || attempt === maxRetries) {
      return res;
    }

    let nextVersion: number | null = null;
    try {
      const payload = (await res.json()) as { currentVersion?: unknown };
      if (typeof payload.currentVersion === "number") {
        nextVersion = payload.currentVersion;
      }
    } catch {
      return res;
    }

    if (nextVersion === null || nextVersion === versionToUse) {
      return res;
    }

    versionToUse = nextVersion;
  }

  throw new Error("Resume save retry loop exited unexpectedly");
}
