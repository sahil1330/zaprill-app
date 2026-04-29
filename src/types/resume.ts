// ─────────────────────────────────────────────────
// Resume Builder — Core Type Definitions
// Follows JSON Resume standard, extended for multi-industry support
// ─────────────────────────────────────────────────

// ─────────────────────────────────────────────────
// Resume Data (the `data` JSONB column)
// ─────────────────────────────────────────────────

export interface ResumeBasics {
  name: string;
  label: string; // e.g. "Senior Software Engineer"
  email: string;
  phone: string;
  url: string; // personal website
  location: {
    city: string;
    region: string;
    countryCode: string;
  };
  summary: string; // professional summary (rich text HTML)
  picture: string | null; // URL to uploaded image
  profiles: SocialProfile[];
}

export interface SocialProfile {
  network: string; // "LinkedIn", "GitHub", "Twitter", etc.
  username: string;
  url: string;
}

export interface ResumeWorkItem {
  id: string; // nanoid — used as React key + drag handle
  company: string;
  position: string;
  website: string;
  startDate: string; // "YYYY-MM" or "YYYY-MM-DD"
  endDate: string | null; // null = "Present"
  summary: string; // rich text HTML
  highlights: string[]; // bullet points
  location: string;
}

export interface ResumeEducationItem {
  id: string;
  institution: string;
  url: string;
  area: string; // major / field of study
  studyType: string; // "Bachelor", "Master", "PhD", etc.
  startDate: string;
  endDate: string | null;
  score: string; // GPA or grade
  courses: string[];
}

export interface ResumeSkillItem {
  id: string;
  name: string; // e.g. "Frontend Development"
  level: string; // "Beginner" | "Intermediate" | "Advanced" | "Expert"
  keywords: string[]; // e.g. ["React", "TypeScript", "Next.js"]
  category: string; // "technical" | "soft" | "domain" | "tool"
}

export interface ResumeProjectItem {
  id: string;
  name: string;
  description: string;
  highlights: string[];
  url: string;
  githubUrl: string;
  startDate: string;
  endDate: string | null;
  keywords: string[];
}

export interface ResumeCertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface ResumeLanguageItem {
  id: string;
  language: string;
  fluency: string; // "Native" | "Fluent" | "Advanced" | "Intermediate" | "Beginner"
}

export interface ResumeVolunteerItem {
  id: string;
  organization: string;
  position: string;
  url: string;
  startDate: string;
  endDate: string | null;
  summary: string;
  highlights: string[];
}

export interface ResumeAwardItem {
  id: string;
  title: string;
  date: string;
  awarder: string;
  summary: string;
}

export interface ResumePublicationItem {
  id: string;
  name: string;
  publisher: string;
  releaseDate: string;
  url: string;
  summary: string;
}

export interface ResumeReferenceItem {
  id: string;
  name: string;
  reference: string; // the actual reference text
}

export interface ResumeCustomSectionItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
  highlights: string[];
}

export interface ResumeCustomSection {
  id: string;
  sectionName: string;
  items: ResumeCustomSectionItem[];
}

/**
 * The complete resume data structure.
 * Stored as JSONB in the `resume.data` column.
 * Validated by Zod on every API write.
 */
export interface ResumeData {
  basics: ResumeBasics;
  work: ResumeWorkItem[];
  education: ResumeEducationItem[];
  skills: ResumeSkillItem[];
  projects: ResumeProjectItem[];
  certifications: ResumeCertificationItem[];
  languages: ResumeLanguageItem[];
  volunteer: ResumeVolunteerItem[];
  awards: ResumeAwardItem[];
  publications: ResumePublicationItem[];
  references: ResumeReferenceItem[];
  customSections: ResumeCustomSection[];
}

// ─────────────────────────────────────────────────
// Resume Metadata (the `metadata` JSONB column)
// ─────────────────────────────────────────────────

export interface ResumeTheme {
  primary: string; // hex color
  background: string;
  text: string;
  accent: string;
}

export interface ResumeTypography {
  font: {
    family: string; // "Inter", "Roboto", "Merriweather", etc.
    size: number; // in pt (10-14)
  };
  lineHeight: number; // 1.2 - 2.0
}

export interface ResumePage {
  format: "a4" | "letter";
  margin: number; // in mm (15-30)
}

export interface ResumeSectionVisibility {
  summary: boolean;
  work: boolean;
  education: boolean;
  skills: boolean;
  projects: boolean;
  certifications: boolean;
  languages: boolean;
  volunteer: boolean;
  awards: boolean;
  publications: boolean;
  references: boolean;
}

/**
 * Rendering preferences for the resume.
 * Stored as JSONB in the `resume.metadata` column.
 */
export interface ResumeMetadata {
  theme: ResumeTheme;
  typography: ResumeTypography;
  page: ResumePage;
  sectionOrder: string[];
  sectionVisibility: ResumeSectionVisibility;
}

// ─────────────────────────────────────────────────
// Template System
// ─────────────────────────────────────────────────

/**
 * Props passed to every resume template component.
 * Templates are pure render functions: (props) => JSX.Element
 */
export interface TemplateProps {
  data: ResumeData;
  metadata: ResumeMetadata;
  cssVariables: Record<string, string>;
}

export type TemplateCategory =
  | "general"
  | "tech"
  | "business"
  | "creative"
  | "academic";

export type TemplateLayout =
  | "single-column"
  | "two-column"
  | "sidebar"
  | "hybrid";

/**
 * Static metadata about a template.
 * Defined in the code-driven registry, NOT in the database.
 */
export interface TemplateMeta {
  slug: string;
  name: string;
  description: string;
  category: TemplateCategory;
  layout: TemplateLayout;
  atsScore: number; // 0-100
  isPremium: boolean;
  thumbnailUrl?: string;
}

// ─────────────────────────────────────────────────
// ATS Analysis
// ─────────────────────────────────────────────────

export interface AtsBreakdown {
  keywordMatches: string[];
  missingKeywords: string[];
  suggestions: AtsSuggestion[];
  criteriaScores: Record<string, number>;
}

export interface AtsSuggestion {
  type: "keyword" | "format" | "content" | "structure";
  message: string;
  section?: string; // which section to improve
  priority: "high" | "medium" | "low";
}

// ─────────────────────────────────────────────────
// Industry Profiles
// ─────────────────────────────────────────────────

export type Industry =
  | "technology"
  | "marketing"
  | "business"
  | "sales"
  | "hr"
  | "healthcare"
  | "legal"
  | "academic"
  | "creative"
  | "other";

// ─────────────────────────────────────────────────
// Resume list/card types for dashboard
// ─────────────────────────────────────────────────

export interface ResumeListItem {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "complete" | "archived";
  templateSlug: string;
  industry: string;
  targetRole: string | null;
  lastAtsScore: number | null;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────────

export const DEFAULT_RESUME_DATA: ResumeData = {
  basics: {
    name: "",
    label: "",
    email: "",
    phone: "",
    url: "",
    location: { city: "", region: "", countryCode: "" },
    summary: "",
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

export const DEFAULT_RESUME_METADATA: ResumeMetadata = {
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
  page: { format: "a4", margin: 20 },
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
