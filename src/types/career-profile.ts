/**
 * Shared career profile contract.
 * Resume Builder, Skill Coach, and the Intelligence Dashboard all use this shape.
 * Compensation is annual whole rupees. There is no Adzuna dependency here.
 */

export const CAREER_SEGMENTS = ["student", "fresher", "professional"] as const;
export type CareerSegment = (typeof CAREER_SEGMENTS)[number];

export const CAREER_SKILL_LEVELS = [
  "unspecified",
  "beginner",
  "intermediate",
  "advanced",
  "expert",
] as const;
export type CareerSkillLevel = (typeof CAREER_SKILL_LEVELS)[number];

/** Mirrors the `skill_category` Postgres enum and `SkillCategory`. */
export const CAREER_SKILL_CATEGORIES = [
  "language",
  "framework",
  "database",
  "cloud",
  "tool",
  "soft",
  "other",
] as const;
export type CareerSkillCategory = (typeof CAREER_SKILL_CATEGORIES)[number];

export const CAREER_RECORD_SOURCES = ["resume", "self_reported"] as const;
export type CareerRecordSource = (typeof CAREER_RECORD_SOURCES)[number];

export const CAREER_EMPLOYMENT_TYPES = [
  "internship",
  "full_time",
  "part_time",
  "contract",
  "freelance",
  "apprenticeship",
  "other",
] as const;
export type CareerEmploymentType = (typeof CAREER_EMPLOYMENT_TYPES)[number];

export const CAREER_TARGET_SENIORITIES = [
  "intern",
  "fresher",
  "junior",
  "mid",
  "senior",
  "lead",
  "unspecified",
] as const;
export type CareerTargetSeniority = (typeof CAREER_TARGET_SENIORITIES)[number];

export const SKILL_EVIDENCE_KINDS = [
  "resume_keyword",
  "work",
  "project",
  "certification",
  "academic",
  "self_reported",
] as const;
export type SkillEvidenceKind = (typeof SKILL_EVIDENCE_KINDS)[number];

export type SkillEvidence = {
  kind: SkillEvidenceKind;
  label: string;
  refId?: string;
};

export const CAREER_FIELD_KEYS = [
  "segment",
  "headline",
  "location",
  "yearsOfExperience",
  "currentSalaryInr",
] as const;
export type CareerFieldKey = (typeof CAREER_FIELD_KEYS)[number];

/**
 * `self_reported` blocks resume sync.
 * `legacy_profile` means the figure was copied from `user_profile.current_salary`.
 */
export type CareerFieldSource =
  | "inferred"
  | "resume"
  | "self_reported"
  | "legacy_profile";

export type CareerFieldSources = Partial<
  Record<CareerFieldKey, CareerFieldSource>
>;

export type CareerAcademicRecord = {
  id: string;
  institution: string;
  studyType: string | null;
  area: string | null;
  startDate: string | null;
  endDate: string | null;
  score: string | null;
  isCurrent: boolean;
  source: CareerRecordSource;
  sourceItemId: string | null;
  sortOrder: number;
};

export type CareerExperienceRecord = {
  id: string;
  company: string;
  title: string;
  location: string | null;
  employmentType: CareerEmploymentType;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  summary: string | null;
  highlights: string[];
  source: CareerRecordSource;
  sourceItemId: string | null;
  sortOrder: number;
};

export type CareerSkillRecord = {
  id: string;
  name: string;
  normalizedName: string;
  category: CareerSkillCategory;
  level: CareerSkillLevel;
  evidence: SkillEvidence[];
  source: CareerRecordSource;
  sortOrder: number;
};

export type CareerTargetRoleRecord = {
  id: string;
  title: string;
  normalizedTitle: string;
  seniority: CareerTargetSeniority;
  isPrimary: boolean;
  source: CareerRecordSource;
  sortOrder: number;
};

/** JSON body returned by every career-profile route as `{ profile }`. */
export type CareerProfileView = {
  id: string;
  userId: string;
  segment: CareerSegment | null;
  headline: string | null;
  location: {
    city: string | null;
    region: string | null;
    countryCode: string;
  };
  compensation: {
    currency: "INR";
    period: "annual";
    currentInr: number | null;
    expectedInr: number | null;
    noticePeriodDays: number | null;
  };
  yearsOfExperience: number | null;
  openToRelocate: boolean;
  fieldSources: CareerFieldSources;
  derivedFromResumeId: string | null;
  lastDerivedAt: string | null;
  academics: CareerAcademicRecord[];
  experience: CareerExperienceRecord[];
  skills: CareerSkillRecord[];
  targetRoles: CareerTargetRoleRecord[];
  createdAt: string;
  updatedAt: string;
};
