import { nanoid } from "nanoid";
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
    location: {
      ...DEFAULT_RESUME_DATA.basics.location,
      ...(raw.basics?.location || {}),
    },
    profiles: Array.isArray(raw.basics?.profiles) ? raw.basics.profiles : [],
  };

  // 1. Normalize Skills to Grouped ResumeSkillItem[]
  let normalizedSkills: ResumeSkillItem[] = [];
  if (Array.isArray(raw.skills)) {
    const groups: Record<string, ResumeSkillItem> = {};

    raw.skills.forEach((s: any) => {
      // Case 1: String skill (e.g. "JavaScript")
      if (typeof s === "string") {
        const groupName = "General";
        if (!groups[groupName]) {
          groups[groupName] = {
            id: nanoid(),
            name: groupName,
            level: "Intermediate",
            category: "technical",
            keywords: [],
          };
        }
        if (!groups[groupName].keywords.includes(s)) {
          groups[groupName].keywords.push(s);
        }
      }
      // Case 2: Grouped skill object (e.g. { name: "Languages", keywords: ["JS", "TS"] })
      else if (s && s.keywords && Array.isArray(s.keywords)) {
        const groupName = s.name || s.category || "General";
        if (!groups[groupName]) {
          groups[groupName] = {
            id: s.id || nanoid(),
            name: groupName,
            level: s.level || "Intermediate",
            category: s.category || "technical",
            keywords: [],
          };
        }
        s.keywords.forEach((kw: string) => {
          if (
            typeof kw === "string" &&
            !groups[groupName].keywords.includes(kw)
          ) {
            groups[groupName].keywords.push(kw);
          }
        });
      }
      // Case 3: Flat skill object (e.g. { name: "JavaScript", category: "Languages" })
      else if (s && s.name) {
        const groupName = s.category || "General";
        if (!groups[groupName]) {
          groups[groupName] = {
            id: nanoid(),
            name: groupName,
            level: s.level || "Intermediate",
            category: "technical",
            keywords: [],
          };
        }
        if (!groups[groupName].keywords.includes(s.name)) {
          groups[groupName].keywords.push(s.name);
        }
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
    highlights: Array.isArray(w.highlights) ? w.highlights : [],
  }));

  // 3. Normalize Education
  const education = (Array.isArray(raw.education) ? raw.education : []).map(
    (e: any) => ({
      ...e,
      id: e.id || nanoid(),
      courses: Array.isArray(e.courses) ? e.courses : [],
    }),
  );

  // 4. Normalize Projects
  const projects = (Array.isArray(raw.projects) ? raw.projects : []).map(
    (p: any) => ({
      ...p,
      id: p.id || nanoid(),
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
    certifications: Array.isArray(raw.certifications) ? raw.certifications : [],
    languages: Array.isArray(raw.languages) ? raw.languages : [],
    awards: Array.isArray(raw.awards) ? raw.awards : [],
    publications: Array.isArray(raw.publications) ? raw.publications : [],
    references: Array.isArray(raw.references) ? raw.references : [],
    volunteer: Array.isArray(raw.volunteer) ? raw.volunteer : [],
    customSections: Array.isArray(raw.customSections) ? raw.customSections : [],
  };
}
