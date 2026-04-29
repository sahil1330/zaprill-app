import { z } from "zod";

// ─────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────

const optionalUrl = z.string().url().or(z.literal("")).default("");
const optionalDate = z
  .string()
  .regex(/^\d{4}(-\d{2})?(-\d{2})?$/, "Use YYYY, YYYY-MM, or YYYY-MM-DD format")
  .or(z.literal(""))
  .default("");

// ─────────────────────────────────────────────────
// Section Schemas
// ─────────────────────────────────────────────────

export const socialProfileSchema = z.object({
  network: z.string().max(50).default(""),
  username: z.string().max(100).default(""),
  url: optionalUrl,
});

export const basicsSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  label: z.string().max(100).default(""),
  email: z.string().email("Invalid email").or(z.literal("")).default(""),
  phone: z.string().max(30).default(""),
  url: optionalUrl,
  location: z.object({
    city: z.string().max(100).default(""),
    region: z.string().max(100).default(""),
    countryCode: z.string().max(5).default(""),
  }),
  summary: z.string().max(5000).default(""), // rich text HTML, ~400 words
  picture: z.string().nullable().default(null),
  profiles: z.array(socialProfileSchema).default([]),
});

export const workItemSchema = z.object({
  id: z.string(),
  company: z.string().min(1, "Company is required").max(100),
  position: z.string().min(1, "Position is required").max(100),
  website: optionalUrl,
  startDate: optionalDate,
  endDate: z.string().nullable().default(null),
  summary: z.string().max(5000).default(""),
  highlights: z.array(z.string().max(500)).max(20).default([]),
  location: z.string().max(100).default(""),
});

export const educationItemSchema = z.object({
  id: z.string(),
  institution: z.string().min(1, "Institution is required").max(100),
  url: optionalUrl,
  area: z.string().max(100).default(""),
  studyType: z.string().max(50).default(""),
  startDate: optionalDate,
  endDate: z.string().nullable().default(null),
  score: z.string().max(20).default(""),
  courses: z.array(z.string().max(200)).max(20).default([]),
});

export const skillItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Skill group name is required").max(100),
  level: z
    .enum(["Beginner", "Intermediate", "Advanced", "Expert", ""])
    .default(""),
  keywords: z.array(z.string().max(50)).max(30).default([]),
  category: z
    .enum(["technical", "soft", "domain", "tool", ""])
    .default("technical"),
});

export const projectItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().max(2000).default(""),
  highlights: z.array(z.string().max(500)).max(10).default([]),
  url: optionalUrl,
  githubUrl: optionalUrl,
  startDate: optionalDate,
  endDate: z.string().nullable().default(null),
  keywords: z.array(z.string().max(50)).max(20).default([]),
});

export const certificationItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Certification name is required").max(200),
  issuer: z.string().max(100).default(""),
  date: optionalDate,
  url: optionalUrl,
});

export const languageItemSchema = z.object({
  id: z.string(),
  language: z.string().min(1, "Language is required").max(50),
  fluency: z
    .enum(["Native", "Fluent", "Advanced", "Intermediate", "Beginner", ""])
    .default(""),
});

export const volunteerItemSchema = z.object({
  id: z.string(),
  organization: z.string().min(1, "Organization is required").max(100),
  position: z.string().max(100).default(""),
  url: optionalUrl,
  startDate: optionalDate,
  endDate: z.string().nullable().default(null),
  summary: z.string().max(2000).default(""),
  highlights: z.array(z.string().max(500)).max(10).default([]),
});

export const awardItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Award title is required").max(200),
  date: optionalDate,
  awarder: z.string().max(100).default(""),
  summary: z.string().max(1000).default(""),
});

export const publicationItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Publication name is required").max(200),
  publisher: z.string().max(100).default(""),
  releaseDate: optionalDate,
  url: optionalUrl,
  summary: z.string().max(2000).default(""),
});

export const referenceItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").max(100),
  reference: z.string().max(2000).default(""),
});

export const customSectionItemSchema = z.object({
  id: z.string(),
  title: z.string().max(200).default(""),
  subtitle: z.string().max(200).default(""),
  date: optionalDate,
  description: z.string().max(2000).default(""),
  highlights: z.array(z.string().max(500)).max(10).default([]),
});

export const customSectionSchema = z.object({
  id: z.string(),
  sectionName: z.string().min(1, "Section name is required").max(100),
  items: z.array(customSectionItemSchema).default([]),
});

// ─────────────────────────────────────────────────
// Full Resume Data Schema
// ─────────────────────────────────────────────────

export const resumeDataSchema = z.object({
  basics: basicsSchema,
  work: z.array(workItemSchema).default([]),
  education: z.array(educationItemSchema).default([]),
  skills: z.array(skillItemSchema).default([]),
  projects: z.array(projectItemSchema).default([]),
  certifications: z.array(certificationItemSchema).default([]),
  languages: z.array(languageItemSchema).default([]),
  volunteer: z.array(volunteerItemSchema).default([]),
  awards: z.array(awardItemSchema).default([]),
  publications: z.array(publicationItemSchema).default([]),
  references: z.array(referenceItemSchema).default([]),
  customSections: z.array(customSectionSchema).default([]),
});

// ─────────────────────────────────────────────────
// Resume Metadata Schema
// ─────────────────────────────────────────────────

const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const resumeThemeSchema = z.object({
  primary: z
    .string()
    .regex(hexColorRegex, "Invalid hex color")
    .default("#1a1a2e"),
  background: z.string().regex(hexColorRegex).default("#ffffff"),
  text: z.string().regex(hexColorRegex).default("#333333"),
  accent: z.string().regex(hexColorRegex).default("#4a6cf7"),
});

export const resumeTypographySchema = z.object({
  font: z.object({
    family: z.string().max(50).default("Inter"),
    size: z.number().min(8).max(16).default(11),
  }),
  lineHeight: z.number().min(1).max(2.5).default(1.5),
});

export const resumePageSchema = z.object({
  format: z.enum(["a4", "letter"]).default("a4"),
  margin: z.number().min(10).max(40).default(20),
});

export const sectionVisibilitySchema = z.object({
  summary: z.boolean().default(true),
  work: z.boolean().default(true),
  education: z.boolean().default(true),
  skills: z.boolean().default(true),
  projects: z.boolean().default(false),
  certifications: z.boolean().default(false),
  languages: z.boolean().default(false),
  volunteer: z.boolean().default(false),
  awards: z.boolean().default(false),
  publications: z.boolean().default(false),
  references: z.boolean().default(false),
});

export const resumeMetadataSchema = z.object({
  theme: resumeThemeSchema.default({
    primary: "#1a1a2e",
    background: "#ffffff",
    text: "#333333",
    accent: "#4a6cf7",
  }),
  typography: resumeTypographySchema.default({
    font: { family: "Inter", size: 11 },
    lineHeight: 1.5,
  }),
  page: resumePageSchema.default({ format: "a4", margin: 20 }),
  sectionOrder: z
    .array(z.string())
    .default([
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
    ]),
  sectionVisibility: sectionVisibilitySchema.default({
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
  }),
});

// ─────────────────────────────────────────────────
// API Request Schemas
// ─────────────────────────────────────────────────

/** POST /api/resumes — create new resume */
export const createResumeSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  templateSlug: z.string().max(50).optional(),
  industry: z.string().max(50).optional(),
  sourceAnalysisId: z.string().optional(),
  data: resumeDataSchema.optional(),
  metadata: resumeMetadataSchema.optional(),
});

/** PATCH /api/resumes/[id] — update resume */
export const updateResumeSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  status: z.enum(["draft", "complete", "archived"]).optional(),
  templateSlug: z.string().max(50).optional(),
  industry: z.string().max(50).optional(),
  targetRole: z.string().max(100).nullable().optional(),
  isPublic: z.boolean().optional(),
  data: resumeDataSchema.optional(),
  metadata: resumeMetadataSchema.optional(),
  version: z.number().int().positive(), // required for optimistic locking
});

/** POST /api/resumes/[id]/versions — create snapshot */
export const createVersionSchema = z.object({
  changeDescription: z.string().max(500).optional(),
});

// ─────────────────────────────────────────────────
// Inferred types (re-exported for convenience)
// ─────────────────────────────────────────────────

export type ResumeDataInput = z.infer<typeof resumeDataSchema>;
export type ResumeMetadataInput = z.infer<typeof resumeMetadataSchema>;
export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
