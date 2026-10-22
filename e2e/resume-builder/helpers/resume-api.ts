import type { APIRequestContext } from "@playwright/test";

export interface ResumeBasics {
  name: string;
  label: string;
  email: string;
  phone: string;
  url: string;
  location: { city: string; region: string; countryCode: string };
  summary: string;
  picture: string | null;
  profiles: Array<{ network: string; username: string; url: string }>;
}

export interface ResumeData {
  basics: ResumeBasics;
  work: unknown[];
  education: unknown[];
  skills: unknown[];
  projects: unknown[];
  certifications: unknown[];
  languages: unknown[];
  volunteer: unknown[];
  awards: unknown[];
  publications: unknown[];
  references: unknown[];
  customSections: unknown[];
}

export interface ResumeMetadata {
  theme: {
    primary: string;
    background: string;
    text: string;
    accent: string;
  };
  typography: {
    font: { family: string; size: number };
    lineHeight: number;
  };
  page: { format: "a4" | "letter"; margin: number };
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
}

export interface ResumeRecord {
  id: string;
  title: string;
  version: number;
  templateSlug: string;
  data: ResumeData;
  metadata: ResumeMetadata;
}

export const VALID_BASELINE_METADATA: ResumeMetadata = {
  theme: {
    primary: "#1a1a2e",
    background: "#ffffff",
    text: "#333333",
    accent: "#4a6cf7",
  },
  typography: {
    font: { family: "Inter", size: 11 },
    lineHeight: 1.5,
  },
  page: { format: "a4", margin: 10 },
  sectionOrder: [
    "summary",
    "work",
    "education",
    "skills",
    "projects",
    "certifications",
    "languages",
    "volunteer",
    "awards",
    "publications",
    "references",
  ],
  sectionVisibility: {
    summary: true,
    work: true,
    education: true,
    skills: true,
    projects: false,
    certifications: false,
    languages: false,
    volunteer: false,
    awards: false,
    publications: false,
    references: false,
  },
};

/** Valid baseline used to reset resume state between tests. */
export const VALID_BASELINE_DATA: ResumeData = {
  basics: {
    name: "E2E Test User",
    label: "Software Engineer",
    email: "e2e.test@example.com",
    phone: "+1 555-0100",
    url: "https://e2e-test.example.com",
    location: { city: "San Francisco", region: "CA", countryCode: "US" },
    summary: "<p>Experienced engineer focused on quality and reliability.</p>",
    picture: null,
    profiles: [],
  },
  work: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  volunteer: [],
  awards: [],
  publications: [],
  references: [],
  customSections: [],
};

export async function listResumes(
  request: APIRequestContext,
): Promise<ResumeRecord[]> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await request.get("/api/resumes");
      if (!res.ok()) {
        throw new Error(`Failed to list resumes: ${res.status()}`);
      }
      const body = await res.json();
      return body.resumes ?? [];
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw lastError;
}

/** Ensure exactly one resume exists and return the full record (with version). */
export async function ensureResume(
  request: APIRequestContext,
): Promise<ResumeRecord> {
  const resumes = await listResumes(request);

  if (resumes.length === 0) {
    const createRes = await request.post("/api/resumes", {
      data: {},
    });
    if (!createRes.ok()) {
      throw new Error(`Failed to create resume: ${createRes.status()}`);
    }
    const body = await createRes.json();
    return body.resume;
  }

  // Spec isolation only. The product library lists every resume.
  for (const extra of resumes.slice(1)) {
    await request.delete(`/api/resumes/${extra.id}`);
  }

  const full = await getResume(request, resumes[0].id);
  if (!full) {
    throw new Error(`Resume ${resumes[0].id} not found after list`);
  }
  return full;
}

export async function getResume(
  request: APIRequestContext,
  id: string,
): Promise<ResumeRecord | null> {
  const res = await request.get(`/api/resumes/${id}`);
  if (res.status() === 404) return null;
  if (!res.ok()) {
    throw new Error(`Failed to fetch resume: ${res.status()}`);
  }
  const body = await res.json();
  return body.resume;
}

export async function patchResume(
  request: APIRequestContext,
  id: string,
  payload: Record<string, unknown>,
) {
  return request.patch(`/api/resumes/${id}`, { data: payload });
}

/** Reset resume to a known valid state for deterministic tests. */
export async function resetResumeToBaseline(
  request: APIRequestContext,
  resume: ResumeRecord,
): Promise<ResumeRecord> {
  const res = await patchResume(request, resume.id, {
    title: "E2E Test Resume",
    data: VALID_BASELINE_DATA,
    metadata: VALID_BASELINE_METADATA,
    templateSlug: "minimalist",
    version: resume.version,
  });

  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Failed to reset resume: ${res.status()} ${body}`);
  }

  const { resume: updated } = await res.json();
  return updated;
}

export async function deleteExtraResumes(request: APIRequestContext) {
  const resumes = await listResumes(request);
  for (const r of resumes.slice(1)) {
    await request.delete(`/api/resumes/${r.id}`);
  }
}
