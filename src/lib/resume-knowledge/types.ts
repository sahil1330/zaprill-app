export const KNOWLEDGE_VERSION = "2026-10-22";

export const RESUME_FIELDS = [
  "software",
  "marketing",
  "design",
  "finance",
  "consulting",
  "academia",
  "healthcare",
  "general",
] as const;

export type ResumeField = (typeof RESUME_FIELDS)[number];

export const CAREER_STAGES = [
  "student",
  "fresher",
  "experienced",
  "switcher",
] as const;

export type CareerStage = (typeof CAREER_STAGES)[number];

export const RESUME_REGIONS = ["IN", "US", "UK", "other"] as const;

export type ResumeRegion = (typeof RESUME_REGIONS)[number];

export type KnowledgeSource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  retrieved: string;
};

export type LayoutTarget = {
  templateSlug: "minimalist" | "executive-pro" | "creative-portfolio";
  fontFamily: string;
  fontSize: number;
  marginMm: number;
  sectionOrder: string[];
  maxPages: number;
  singleColumn: boolean;
};
