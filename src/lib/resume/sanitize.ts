import type { ResumeData } from "@/types/resume";

/** Mirrors `src/lib/validations/resume.ts` max lengths so AI/ATS writes cannot fail Zod. */
export const RESUME_LIMITS = {
  name: 100,
  label: 100,
  phone: 30,
  keyword: 50,
  highlight: 500,
  workHighlights: 20,
  projectHighlights: 10,
  volunteerHighlights: 10,
  summary: 5000,
  description: 2000,
  skillName: 100,
  skillLevel: 50,
  company: 100,
  position: 100,
  location: 100,
} as const;

export function clampText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.slice(0, max);
}

export function clampStringList(
  values: unknown,
  itemMax: number,
  listMax?: number,
): string[] {
  if (!Array.isArray(values)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of values) {
    const s = (typeof raw === "string" ? raw : String(raw ?? "")).trim();
    if (!s) continue;
    const clipped = s.slice(0, itemMax);
    if (seen.has(clipped)) continue;
    seen.add(clipped);
    out.push(clipped);
    if (listMax !== undefined && out.length >= listMax) break;
  }
  return out;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Wrap plain-text AI summaries so TipTap/rich preview still renders. */
export function asRichText(
  value: unknown,
  max = RESUME_LIMITS.summary,
): string {
  const trimmed = clampText(value, max).trim();
  if (!trimmed) return "";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
  return `<p>${escapeHtml(trimmed)}</p>`;
}

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim() === "";
}

export function isBlankWorkItem(item: ResumeData["work"][number]): boolean {
  return (
    isBlank(item.company) &&
    isBlank(item.position) &&
    isBlank(item.summary) &&
    isBlank(item.location) &&
    isBlank(item.website) &&
    !(item.highlights || []).some((h) => !isBlank(h))
  );
}

export function isBlankEducationItem(
  item: ResumeData["education"][number],
): boolean {
  return (
    isBlank(item.institution) &&
    isBlank(item.area) &&
    isBlank(item.studyType) &&
    isBlank(item.score) &&
    !(item.courses || []).some((c) => !isBlank(c))
  );
}

export function isBlankSkillItem(item: ResumeData["skills"][number]): boolean {
  return isBlank(item.name) && !(item.keywords || []).some((k) => !isBlank(k));
}

export function isBlankProjectItem(
  item: ResumeData["projects"][number],
): boolean {
  return (
    isBlank(item.name) &&
    isBlank(item.description) &&
    !(item.highlights || []).some((h) => !isBlank(h)) &&
    !(item.keywords || []).some((k) => !isBlank(k))
  );
}

export function isBlankCertificationItem(
  item: ResumeData["certifications"][number],
): boolean {
  return isBlank(item.name) && isBlank(item.issuer);
}

export function isBlankLanguageItem(
  item: ResumeData["languages"][number],
): boolean {
  return isBlank(item.language);
}

export function isBlankVolunteerItem(
  item: ResumeData["volunteer"][number],
): boolean {
  return (
    isBlank(item.organization) &&
    isBlank(item.position) &&
    isBlank(item.summary) &&
    !(item.highlights || []).some((h) => !isBlank(h))
  );
}

export function isBlankAwardItem(item: ResumeData["awards"][number]): boolean {
  return isBlank(item.title) && isBlank(item.awarder) && isBlank(item.summary);
}

export function isBlankPublicationItem(
  item: ResumeData["publications"][number],
): boolean {
  return isBlank(item.name) && isBlank(item.publisher) && isBlank(item.summary);
}

export function isBlankReferenceItem(
  item: ResumeData["references"][number],
): boolean {
  return isBlank(item.name) && isBlank(item.reference);
}

/**
 * Drop never-started rows so auto-save does not 400 on "Add Experience"
 * with empty company/position. Partially filled rows are kept so Zod can
 * still surface real validation errors on manual save.
 */
export function stripBlankResumeItems(data: ResumeData): ResumeData {
  return {
    ...data,
    work: (data.work || []).filter((item) => !isBlankWorkItem(item)),
    education: (data.education || []).filter(
      (item) => !isBlankEducationItem(item),
    ),
    skills: (data.skills || []).filter((item) => !isBlankSkillItem(item)),
    projects: (data.projects || []).filter((item) => !isBlankProjectItem(item)),
    certifications: (data.certifications || []).filter(
      (item) => !isBlankCertificationItem(item),
    ),
    languages: (data.languages || []).filter(
      (item) => !isBlankLanguageItem(item),
    ),
    volunteer: (data.volunteer || []).filter(
      (item) => !isBlankVolunteerItem(item),
    ),
    awards: (data.awards || []).filter((item) => !isBlankAwardItem(item)),
    publications: (data.publications || []).filter(
      (item) => !isBlankPublicationItem(item),
    ),
    references: (data.references || []).filter(
      (item) => !isBlankReferenceItem(item),
    ),
  };
}

export function clampResumeData(data: ResumeData): ResumeData {
  return {
    ...data,
    basics: {
      ...data.basics,
      name: clampText(data.basics?.name, RESUME_LIMITS.name),
      label: clampText(data.basics?.label, RESUME_LIMITS.label),
      phone: clampText(data.basics?.phone, RESUME_LIMITS.phone),
      summary: clampText(data.basics?.summary, RESUME_LIMITS.summary),
    },
    work: (data.work || []).map((item) => ({
      ...item,
      company: clampText(item.company, RESUME_LIMITS.company),
      position: clampText(item.position, RESUME_LIMITS.position),
      location: clampText(item.location, RESUME_LIMITS.location),
      summary: clampText(item.summary, RESUME_LIMITS.summary),
      highlights: clampStringList(
        item.highlights,
        RESUME_LIMITS.highlight,
        RESUME_LIMITS.workHighlights,
      ),
    })),
    education: (data.education || []).map((item) => ({
      ...item,
      institution: clampText(item.institution, 100),
      area: clampText(item.area, 100),
      studyType: clampText(item.studyType, 50),
      score: clampText(item.score, 20),
      courses: clampStringList(item.courses, 200, 20),
    })),
    skills: (data.skills || []).map((item) => ({
      ...item,
      name: clampText(item.name, RESUME_LIMITS.skillName),
      level: clampText(item.level, RESUME_LIMITS.skillLevel),
      keywords: clampStringList(item.keywords, RESUME_LIMITS.keyword),
    })),
    projects: (data.projects || []).map((item) => ({
      ...item,
      name: clampText(item.name, 100),
      description: clampText(item.description, RESUME_LIMITS.description),
      highlights: clampStringList(
        item.highlights,
        RESUME_LIMITS.highlight,
        RESUME_LIMITS.projectHighlights,
      ),
      keywords: clampStringList(item.keywords, RESUME_LIMITS.keyword),
    })),
    certifications: (data.certifications || []).map((item) => ({
      ...item,
      name: clampText(item.name, 200),
      issuer: clampText(item.issuer, 100),
    })),
    languages: (data.languages || []).map((item) => ({
      ...item,
      language: clampText(item.language, 50),
    })),
    volunteer: (data.volunteer || []).map((item) => ({
      ...item,
      organization: clampText(item.organization, 100),
      position: clampText(item.position, 100),
      summary: clampText(item.summary, RESUME_LIMITS.description),
      highlights: clampStringList(
        item.highlights,
        RESUME_LIMITS.highlight,
        RESUME_LIMITS.volunteerHighlights,
      ),
    })),
    awards: (data.awards || []).map((item) => ({
      ...item,
      title: clampText(item.title, 200),
      awarder: clampText(item.awarder, 100),
      summary: clampText(item.summary, 1000),
    })),
    publications: (data.publications || []).map((item) => ({
      ...item,
      name: clampText(item.name, 200),
      publisher: clampText(item.publisher, 100),
      summary: clampText(item.summary, RESUME_LIMITS.description),
    })),
    references: (data.references || []).map((item) => ({
      ...item,
      name: clampText(item.name, 100),
      reference: clampText(item.reference, RESUME_LIMITS.description),
    })),
  };
}

export function prepareResumeDataForSave(
  data: ResumeData,
  options: { stripBlankItems?: boolean } = {},
): ResumeData {
  const clamped = clampResumeData(data);
  return options.stripBlankItems ? stripBlankResumeItems(clamped) : clamped;
}

export type TailoredPayloadInput = {
  summary?: string;
  work?: Array<{ id: string; highlights?: string[] }>;
  projects?: Array<{ id: string; highlights?: string[] }>;
  skills?: Array<{ id: string; keywords?: string[] }>;
};

export function clampTailoredPayload<T extends TailoredPayloadInput>(
  payload: T,
): T {
  return {
    ...payload,
    summary:
      payload.summary !== undefined
        ? asRichText(payload.summary)
        : payload.summary,
    work: payload.work?.map((item) => ({
      ...item,
      highlights: clampStringList(
        item.highlights,
        RESUME_LIMITS.highlight,
        RESUME_LIMITS.workHighlights,
      ),
    })),
    projects: payload.projects?.map((item) => ({
      ...item,
      highlights: clampStringList(
        item.highlights,
        RESUME_LIMITS.highlight,
        RESUME_LIMITS.projectHighlights,
      ),
    })),
    skills: payload.skills?.map((item) => ({
      ...item,
      keywords: clampStringList(item.keywords, RESUME_LIMITS.keyword),
    })),
  };
}

export function stripEmoji(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\uFE0F/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export const PAGE_DIMENSIONS_MM = {
  a4: { width: 210, height: 297 },
  letter: { width: 216, height: 279 },
} as const;
