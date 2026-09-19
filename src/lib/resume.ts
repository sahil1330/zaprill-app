import { nanoid } from "nanoid";
import { ensureHttps } from "@/lib/utils";
import type {
  ResumeData,
  ResumeMetadata,
  ResumeSkillItem,
} from "@/types/resume";
import { DEFAULT_RESUME_DATA, DEFAULT_RESUME_METADATA } from "@/types/resume";

/**
 * Normalizes resume metadata to ensure all required fields exist.
 */
export function normalizeResumeMetadata(raw: any): ResumeMetadata {
  if (!raw) return DEFAULT_RESUME_METADATA;

  return {
    ...DEFAULT_RESUME_METADATA,
    ...raw,
    theme: {
      ...DEFAULT_RESUME_METADATA.theme,
      ...(raw.theme || {}),
    },
    typography: {
      ...DEFAULT_RESUME_METADATA.typography,
      ...(raw.typography || {}),
      font: {
        ...DEFAULT_RESUME_METADATA.typography.font,
        ...(raw.typography?.font || {}),
      },
    },
    page: {
      ...DEFAULT_RESUME_METADATA.page,
      ...(raw.page || {}),
    },
    sectionVisibility: {
      ...DEFAULT_RESUME_METADATA.sectionVisibility,
      ...(raw.sectionVisibility || {}),
    },
    sectionOrder: Array.isArray(raw.sectionOrder)
      ? raw.sectionOrder
      : DEFAULT_RESUME_METADATA.sectionOrder,
  };
}

/**
 * Normalizes resume data from various versions/formats into a consistent shape
 * for the frontend. Specifically handles skills (grouping) and
 * mappings between legacy 'work' and 'experience' arrays.
 */
export function normalizeResumeData(raw: any): ResumeData {
  if (!raw) return DEFAULT_RESUME_DATA;

  // 0. Base basics normalization
  const basics = {
    ...DEFAULT_RESUME_DATA.basics,
    ...(raw.basics || {}),
    url: ensureHttps(raw.basics?.url),
    location: {
      ...DEFAULT_RESUME_DATA.basics.location,
      ...(raw.basics?.location || {}),
    },
    profiles: Array.isArray(raw.basics?.profiles)
      ? raw.basics.profiles.map((p: any) => ({
          ...p,
          url: ensureHttps(p.url),
        }))
      : [],
  };

  // 1. Normalize Skills to Grouped ResumeSkillItem[]
  let normalizedSkills: ResumeSkillItem[] = [];
  if (Array.isArray(raw.skills)) {
    const groups: Record<string, ResumeSkillItem> = {};

    const addKeyword = (
      groupName: string,
      keyword: string,
      meta?: { id?: string; level?: string; category?: string },
    ) => {
      const trimmed = keyword.trim();
      if (!trimmed) return;
      if (!groups[groupName]) {
        groups[groupName] = {
          id: meta?.id || nanoid(),
          name: groupName,
          level: meta?.level || "Intermediate",
          category: meta?.category || "technical",
          keywords: [],
        };
      }
      if (!groups[groupName].keywords.includes(trimmed)) {
        groups[groupName].keywords.push(trimmed);
      }
    };

    raw.skills.forEach((s: any) => {
      // Case 1: String skill (e.g. "JavaScript")
      if (typeof s === "string") {
        addKeyword("General", s);
        return;
      }

      const nonemptyKeywords = Array.isArray(s?.keywords)
        ? s.keywords.filter(
            (kw: unknown) => typeof kw === "string" && kw.trim().length > 0,
          )
        : [];

      // Case 2: Grouped skill object with actual keywords
      if (s && nonemptyKeywords.length > 0) {
        const groupName = s.name || s.category || "General";
        for (const kw of nonemptyKeywords) {
          addKeyword(groupName, kw, {
            id: s.id,
            level: s.level,
            category: s.category,
          });
        }
        return;
      }

      // Case 3: Flat skill / empty group — treat `name` as the skill itself
      // (LLM parsers often emit { name: "React", keywords: [] })
      if (s && typeof s.name === "string" && s.name.trim()) {
        const groupName =
          typeof s.category === "string" && s.category.trim()
            ? s.category
            : "General";
        addKeyword(groupName, s.name, {
          id: s.id,
          level: s.level,
          category: s.category,
        });
      }
    });

    normalizedSkills = Object.values(groups);
  }

  // 2. Normalize Work/Experience
  const work = (
    Array.isArray(raw.work)
      ? raw.work
      : Array.isArray(raw.experience)
        ? raw.experience
        : []
  ).map((w: any) => ({
    ...w,
    id: w.id || nanoid(),
    website: ensureHttps(w.website),
    highlights: Array.isArray(w.highlights) ? w.highlights : [],
  }));

  // 3. Normalize Education
  const education = (Array.isArray(raw.education) ? raw.education : []).map(
    (e: any) => ({
      ...e,
      id: e.id || nanoid(),
      url: ensureHttps(e.url),
      courses: Array.isArray(e.courses) ? e.courses : [],
    }),
  );

  // 4. Normalize Projects
  const projects = (Array.isArray(raw.projects) ? raw.projects : []).map(
    (p: any) => ({
      ...p,
      id: p.id || nanoid(),
      url: ensureHttps(p.url),
      githubUrl: ensureHttps(p.githubUrl),
      keywords: Array.isArray(p.keywords) ? p.keywords : [],
      highlights: Array.isArray(p.highlights) ? p.highlights : [],
    }),
  );

  return {
    ...DEFAULT_RESUME_DATA,
    ...raw,
    basics,
    skills: normalizedSkills,
    work,
    education,
    projects,
    certifications: (Array.isArray(raw.certifications)
      ? raw.certifications
      : []
    ).map((c: any) => ({ ...c, url: ensureHttps(c.url) })),
    languages: Array.isArray(raw.languages) ? raw.languages : [],
    awards: Array.isArray(raw.awards) ? raw.awards : [],
    publications: (Array.isArray(raw.publications) ? raw.publications : []).map(
      (p: any) => ({ ...p, url: ensureHttps(p.url) }),
    ),
    references: Array.isArray(raw.references) ? raw.references : [],
    volunteer: (Array.isArray(raw.volunteer) ? raw.volunteer : []).map(
      (v: any) => ({ ...v, url: ensureHttps(v.url) }),
    ),
    customSections: Array.isArray(raw.customSections) ? raw.customSections : [],
  };
}

const GENERIC_SKILL_GROUP_NAMES = new Set([
  "skills",
  "general",
  "technical",
  "soft",
  "other",
  "language",
  "languages",
  "framework",
  "frameworks",
  "tools",
  "tool",
  "databases",
  "database",
  "cloud",
  "cloud & devops",
  "cloud and devops",
  "frontend",
  "backend",
  "top skills",
]);

/**
 * Flatten grouped resume skills into a de-duplicated list of keywords.
 * Also recovers skills when the parser stored them as group `name` with
 * an empty `keywords` array (a common LLM structured-output failure).
 */
export function flattenResumeSkills(
  data: Pick<ResumeData, "skills" | "projects"> | null | undefined,
): string[] {
  if (!data) return [];

  const out: string[] = [];
  const seen = new Set<string>();

  const add = (raw: unknown) => {
    if (typeof raw !== "string") return;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.length > 80) return;
    const key = trimmed.toLowerCase();
    if (GENERIC_SKILL_GROUP_NAMES.has(key) || seen.has(key)) return;
    seen.add(key);
    out.push(trimmed);
  };

  for (const group of data.skills || []) {
    const keywords = Array.isArray(group.keywords)
      ? group.keywords.filter(
          (kw) => typeof kw === "string" && kw.trim().length > 0,
        )
      : [];
    if (keywords.length > 0) {
      keywords.forEach(add);
    } else {
      add(group.name);
    }
  }

  if (out.length === 0) {
    for (const project of data.projects || []) {
      (project.keywords || []).forEach(add);
    }
  }

  return out;
}
