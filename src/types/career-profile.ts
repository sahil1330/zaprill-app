/**
 * Shared career profile contract.
 * Resume Builder, Skill Coach, and the Intelligence Dashboard all use this shape.
 * Pay is stored as entered and as normalized annual INR. There is no Adzuna dependency here.
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
  "verified",
] as const;
export type SkillEvidenceKind = (typeof SKILL_EVIDENCE_KINDS)[number];

/** Evidence a member or resume import may write. Verification uses recordVerifiedSkill. */
export const USER_SKILL_EVIDENCE_KINDS = [
  "resume_keyword",
  "work",
  "project",
  "certification",
  "academic",
  "self_reported",
] as const;

export const VERIFIED_SKILL_LABEL = "Verified on Zaprill";

export const CAREER_PAY_PERIODS = ["monthly", "annual"] as const;
export type CareerPayPeriod = (typeof CAREER_PAY_PERIODS)[number];

export type SkillEvidence = {
  kind: SkillEvidenceKind;
  label: string;
  refId?: string;
  /** 0–100. Set only on verified evidence. */
  score?: number;
  verifiedAt?: string;
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
  /** True after an explicit level edit. Evidence-only writes leave this false. */
  levelLocked: boolean;
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

export type CareerPayFigure = {
  period: CareerPayPeriod;
  /** Amount in `period` units, as entered. */
  amountInr: number | null;
  /** Normalized annual whole INR. */
  annualInr: number | null;
};

export type CareerExpectedPay = {
  period: CareerPayPeriod;
  minInr: number | null;
  maxInr: number | null;
  minAnnualInr: number | null;
  maxAnnualInr: number | null;
};

export type CareerRoleReadiness = {
  id: string;
  title: string;
  isPrimary: boolean;
  /** Mean match against analysis jobs whose titles match this role. Null when none match. */
  readiness: number | null;
  jobCount: number;
};

export type CareerSkillGapView = {
  skill: string;
  frequency: number;
  priority: "high" | "medium" | "low";
  category: CareerSkillCategory;
};

/**
 * Deterministic score. `careerScore` is null until a resume analysis has jobs.
 * Weights live in `src/lib/career/score.ts` and docs/career-profile.md.
 */
export type CareerIntelligence = {
  careerScore: number | null;
  readiness: number | null;
  completeness: number;
  /** target_roles: gaps and readiness used title-matched jobs. all_jobs: no target matched. none: no analysis jobs. */
  basis: "target_roles" | "all_jobs" | "none";
  analysisId: string | null;
  roles: CareerRoleReadiness[];
  skillGaps: CareerSkillGapView[];
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
    /** Students, and anyone in a current internship or apprenticeship, enter a monthly stipend. */
    stipend: boolean;
    current: CareerPayFigure;
    expected: CareerExpectedPay;
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
  intelligence: CareerIntelligence;
  createdAt: string;
  updatedAt: string;
};
