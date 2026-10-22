import type {
  CareerEmploymentType,
  CareerSegment,
  CareerSkillCategory,
  CareerSkillLevel,
  CareerTargetSeniority,
  SkillEvidence,
} from "@/types/career-profile";
import type { ResumeData } from "@/types/resume";

const NOW_FALLBACK = () => new Date();

/**
 * Under this many years of substantive work, the member is a fresher.
 * Substantive work is full-time, contract, or freelance. Internships,
 * apprenticeships, and part-time campus jobs do not count.
 */
export const FRESHER_UNDER_YEARS = 2;

const GENERIC_SKILL_NAMES = new Set([
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

const LEVEL_RANK: Record<CareerSkillLevel, number> = {
  unspecified: 0,
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

export type DraftAcademic = {
  institution: string;
  studyType: string | null;
  area: string | null;
  startDate: string | null;
  endDate: string | null;
  score: string | null;
  isCurrent: boolean;
  sourceItemId: string | null;
  sortOrder: number;
};

export type DraftExperience = {
  company: string;
  title: string;
  location: string | null;
  employmentType: CareerEmploymentType;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  summary: string | null;
  highlights: string[];
  sourceItemId: string | null;
  sortOrder: number;
};

export type DraftSkill = {
  name: string;
  normalizedName: string;
  category: CareerSkillCategory;
  level: CareerSkillLevel;
  evidence: SkillEvidence[];
  sortOrder: number;
};

export type DraftTarget = {
  title: string;
  normalizedTitle: string;
  seniority: CareerTargetSeniority;
  isPrimary: boolean;
  sourceItemId: null;
  sortOrder: number;
};

export type CareerDraft = {
  segment: CareerSegment | null;
  headline: string | null;
  city: string | null;
  region: string | null;
  countryCode: string;
  yearsOfExperience: number | null;
  academics: DraftAcademic[];
  experience: DraftExperience[];
  skills: DraftSkill[];
  targetRoles: DraftTarget[];
};

export function normalizeCareerKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 120);
}

export function yearsToMonths(years: number): number {
  return Math.max(0, Math.round(years * 12));
}

export function monthsToYears(months: number): number {
  return Math.round((months / 12) * 10) / 10;
}

export function deriveCareerDraft(input: {
  resume: ResumeData;
  targetRole?: string | null;
  now?: Date;
}): CareerDraft {
  const now = input.now ?? NOW_FALLBACK();
  const resume = input.resume;
  const yearsOfExperience = deriveYears(
    resume.totalYearsOfExperience,
    resume.work,
    now,
  );

  return {
    segment: inferSegment(resume, now),
    headline: headlineFrom(resume),
    city: blankToNull(resume.basics?.location?.city),
    region: blankToNull(resume.basics?.location?.region),
    countryCode: countryCode(resume.basics?.location?.countryCode),
    yearsOfExperience,
    academics: deriveAcademics(resume, now),
    experience: deriveExperience(resume, now),
    skills: deriveSkills(resume),
    targetRoles: deriveTargets(resume, input.targetRole ?? null),
  };
}

function headlineFrom(resume: ResumeData): string | null {
  const label = blankToNull(resume.basics?.label);
  if (!label) return null;
  const name = blankToNull(resume.basics?.name);
  if (name && normalizeCareerKey(label) === normalizeCareerKey(name)) {
    return null;
  }
  return label.slice(0, 160);
}

function inferSegment(resume: ResumeData, now: Date): CareerSegment | null {
  const jobs = (resume.work ?? []).filter((job) =>
    Boolean(job.company?.trim() || job.position?.trim()),
  );
  const education = (resume.education ?? []).filter(hasEducation);
  if (jobs.length === 0 && education.length === 0) return null;

  const substantive = jobs.filter((job) =>
    isSubstantiveEmployment(employmentTypeFrom(job.position ?? "")),
  );
  const studying = education.some((item) => educationOngoing(item, now));

  if (substantive.length === 0) {
    if (studying) return "student";
    return "fresher";
  }

  const substantiveYears = substantiveYearsOf(resume, now);
  if (substantiveYears == null || substantiveYears < FRESHER_UNDER_YEARS) {
    return "fresher";
  }
  return "professional";
}

function substantiveYearsOf(resume: ResumeData, now: Date): number | null {
  const jobs = (resume.work ?? []).filter(
    (job) =>
      Boolean(job.company?.trim() || job.position?.trim()) &&
      isSubstantiveEmployment(employmentTypeFrom(job.position ?? "")),
  );
  if (jobs.length === 0) return null;

  const explicit = resume.totalYearsOfExperience;
  if (
    typeof explicit === "number" &&
    Number.isFinite(explicit) &&
    explicit > 0 &&
    explicit <= 60
  ) {
    return Math.round(explicit * 10) / 10;
  }

  return deriveYears(undefined, jobs, now);
}

function deriveYears(
  explicit: number | undefined,
  work: ResumeData["work"],
  now: Date,
): number | null {
  if (
    typeof explicit === "number" &&
    Number.isFinite(explicit) &&
    explicit > 0 &&
    explicit <= 60
  ) {
    return Math.round(explicit * 10) / 10;
  }

  let minStart: number | null = null;
  let maxEnd: number | null = null;
  const nowIndex = monthIndexFromDate(now);

  for (const job of work ?? []) {
    if (!job.company?.trim() && !job.position?.trim()) continue;
    const start = parseYearMonth(job.startDate);
    if (!start) continue;
    const startIndex = start.y * 12 + start.m;
    let endIndex = nowIndex;
    if (job.endDate) {
      const end = parseYearMonth(job.endDate);
      if (end) endIndex = end.y * 12 + end.m;
    }
    if (endIndex < startIndex) endIndex = startIndex;
    minStart = minStart == null ? startIndex : Math.min(minStart, startIndex);
    maxEnd = maxEnd == null ? endIndex : Math.max(maxEnd, endIndex);
  }

  if (minStart == null || maxEnd == null) return null;
  return monthsToYears(maxEnd - minStart);
}

function deriveAcademics(resume: ResumeData, now: Date): DraftAcademic[] {
  const rows: DraftAcademic[] = [];
  for (const item of resume.education ?? []) {
    const institution = blankToNull(item.institution)?.slice(0, 200);
    if (!institution) continue;
    const startDate = cleanDate(item.startDate);
    const endDate = cleanDate(item.endDate);
    rows.push({
      institution,
      studyType: blankToNull(item.studyType)?.slice(0, 80) ?? null,
      area: blankToNull(item.area)?.slice(0, 120) ?? null,
      startDate,
      endDate,
      score: blankToNull(item.score)?.slice(0, 32) ?? null,
      isCurrent: educationOngoing(item, now),
      sourceItemId: blankToNull(item.id),
      sortOrder: rows.length,
    });
    if (rows.length >= 20) break;
  }
  return rows;
}

function deriveExperience(resume: ResumeData, now: Date): DraftExperience[] {
  const rows: DraftExperience[] = [];
  for (const item of resume.work ?? []) {
    const company = blankToNull(item.company)?.slice(0, 160);
    const title = blankToNull(item.position)?.slice(0, 160);
    if (!company || !title) continue;
    const startDate = cleanDate(item.startDate);
    const endDate = cleanDate(item.endDate);
    const highlights = (item.highlights ?? [])
      .map((line) => stripHtml(line))
      .filter((line) => line.length > 0)
      .slice(0, 8);
    const summary =
      blankToNull(stripHtml(item.summary ?? ""))?.slice(0, 2000) ?? null;
    rows.push({
      company,
      title,
      location: blankToNull(item.location)?.slice(0, 120) ?? null,
      employmentType: employmentTypeFrom(title),
      startDate,
      endDate,
      isCurrent: workIsCurrent(item.endDate, endDate, startDate, now),
      summary,
      highlights,
      sourceItemId: blankToNull(item.id),
      sortOrder: rows.length,
    });
    if (rows.length >= 30) break;
  }
  return rows;
}

function deriveSkills(resume: ResumeData): DraftSkill[] {
  const byKey = new Map<string, DraftSkill>();

  const add = (
    rawName: string,
    meta: {
      category: CareerSkillCategory;
      level: CareerSkillLevel;
      evidence?: SkillEvidence;
    },
  ) => {
    const name = rawName.trim().slice(0, 80);
    const normalizedName = normalizeCareerKey(name);
    if (!normalizedName || GENERIC_SKILL_NAMES.has(normalizedName)) return;
    if (normalizedName.length > 80) return;

    const existing = byKey.get(normalizedName);
    if (!existing) {
      if (byKey.size >= 60) return;
      byKey.set(normalizedName, {
        name,
        normalizedName,
        category: meta.category,
        level: meta.level,
        evidence: meta.evidence ? [meta.evidence] : [],
        sortOrder: byKey.size,
      });
      return;
    }
    if (LEVEL_RANK[meta.level] > LEVEL_RANK[existing.level]) {
      existing.level = meta.level;
    }
    if (existing.category === "other" && meta.category !== "other") {
      existing.category = meta.category;
    }
    if (meta.evidence) pushEvidence(existing.evidence, meta.evidence);
  };

  const groups = resume.skills ?? [];
  for (const group of groups) {
    const keywords = (group.keywords ?? []).filter(
      (keyword) => typeof keyword === "string" && keyword.trim().length > 0,
    );
    const category = mapCategory(group.category ?? "", group.name ?? "");
    const level = mapLevel(group.level ?? "");
    const names =
      keywords.length > 0
        ? keywords
        : GENERIC_SKILL_NAMES.has(normalizeCareerKey(group.name ?? ""))
          ? []
          : [group.name];
    const groupEvidence: SkillEvidence = {
      kind: "resume_keyword",
      label: (group.name || "Resume").slice(0, 200),
      refId: group.id || undefined,
    };
    for (const name of names) {
      add(name, { category, level, evidence: groupEvidence });
    }
  }

  if (byKey.size === 0) {
    for (const project of resume.projects ?? []) {
      for (const keyword of project.keywords ?? []) {
        add(keyword, {
          category: "other",
          level: "unspecified",
          evidence: {
            kind: "project",
            label: (project.name || "Project").slice(0, 200),
            refId: project.id || undefined,
          },
        });
      }
    }
  }

  for (const skill of byKey.values()) {
    attachContextualEvidence(skill, resume);
  }

  return [...byKey.values()];
}

function attachContextualEvidence(skill: DraftSkill, resume: ResumeData) {
  for (const project of resume.projects ?? []) {
    const keywordHit = (project.keywords ?? []).some(
      (keyword) => normalizeCareerKey(keyword) === skill.normalizedName,
    );
    const proseHit =
      mentionsSkill(project.description ?? "", skill.name) ||
      (project.highlights ?? []).some((line) =>
        mentionsSkill(line, skill.name),
      );
    if (keywordHit || proseHit) {
      pushEvidence(skill.evidence, {
        kind: "project",
        label: (project.name || "Project").slice(0, 200),
        refId: project.id || undefined,
      });
    }
  }

  for (const job of resume.work ?? []) {
    const haystack = [job.position, job.summary, ...(job.highlights ?? [])]
      .filter((part): part is string => typeof part === "string")
      .join(" ");
    if (mentionsSkill(haystack, skill.name)) {
      pushEvidence(skill.evidence, {
        kind: "work",
        label: (job.company || job.position || "Experience").slice(0, 200),
        refId: job.id || undefined,
      });
    }
  }

  for (const cert of resume.certifications ?? []) {
    if (mentionsSkill(cert.name ?? "", skill.name)) {
      pushEvidence(skill.evidence, {
        kind: "certification",
        label: cert.name.slice(0, 200),
        refId: cert.id || undefined,
      });
    }
  }

  for (const school of resume.education ?? []) {
    const haystack = [school.area, ...(school.courses ?? [])]
      .filter((part): part is string => typeof part === "string")
      .join(" ");
    if (mentionsSkill(haystack, skill.name)) {
      pushEvidence(skill.evidence, {
        kind: "academic",
        label: (school.institution || school.area || "Academics").slice(0, 200),
        refId: school.id || undefined,
      });
    }
  }
}

function deriveTargets(
  resume: ResumeData,
  targetRole: string | null,
): DraftTarget[] {
  const candidates: string[] = [];
  const push = (value: string | null | undefined) => {
    const title = blankToNull(value);
    if (!title || !roleLike(title)) return;
    candidates.push(title.slice(0, 120));
  };

  push(targetRole);
  push(headlineFrom(resume));
  for (const title of resume.inferredJobTitles ?? []) push(title);

  const rows: DraftTarget[] = [];
  const seen = new Set<string>();
  for (const title of candidates) {
    const normalizedTitle = normalizeCareerKey(title);
    if (!normalizedTitle || seen.has(normalizedTitle)) continue;
    seen.add(normalizedTitle);
    rows.push({
      title,
      normalizedTitle,
      seniority: seniorityFrom(title),
      isPrimary: rows.length === 0,
      sourceItemId: null,
      sortOrder: rows.length,
    });
    if (rows.length >= 8) break;
  }
  return rows;
}

function pushEvidence(list: SkillEvidence[], item: SkillEvidence) {
  if (list.length >= 8) return;
  const key = `${item.kind}|${normalizeCareerKey(item.label)}|${item.refId ?? ""}`;
  const exists = list.some(
    (current) =>
      `${current.kind}|${normalizeCareerKey(current.label)}|${current.refId ?? ""}` ===
      key,
  );
  if (!exists) list.push(item);
}

export function mentionsSkill(text: string, skill: string): boolean {
  const trimmed = skill.trim();
  if (trimmed.length <= 2) return false;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `(^|[^A-Za-z0-9+#])${escaped}(?=$|[^A-Za-z0-9+#])`,
    "i",
  );
  return pattern.test(stripHtml(text));
}

function mapCategory(category: string, groupName: string): CareerSkillCategory {
  const blob = `${category} ${groupName}`.toLowerCase();
  if (/\bsoft\b/.test(blob)) return "soft";
  if (/language/.test(blob)) return "language";
  if (/framework|library/.test(blob)) return "framework";
  if (/database|\bdb\b/.test(blob)) return "database";
  if (/cloud|devops/.test(blob)) return "cloud";
  if (/\btool/.test(blob)) return "tool";
  return "other";
}

function mapLevel(level: string): CareerSkillLevel {
  const value = level.toLowerCase();
  if (/expert|master|principal/.test(value)) return "expert";
  if (/advanced|proficient|strong/.test(value)) return "advanced";
  if (/intermediate|\bmid\b/.test(value)) return "intermediate";
  if (/beginner|basic|novice|familiar/.test(value)) return "beginner";
  return "unspecified";
}

export function employmentTypeFrom(position: string): CareerEmploymentType {
  const value = position.toLowerCase();
  if (/intern/.test(value)) return "internship";
  if (/apprentice/.test(value)) return "apprenticeship";
  if (/freelance/.test(value)) return "freelance";
  if (/contract/.test(value)) return "contract";
  if (/part[- ]?time/.test(value)) return "part_time";
  return "full_time";
}

function isSubstantiveEmployment(type: CareerEmploymentType): boolean {
  return type === "full_time" || type === "contract" || type === "freelance";
}

function seniorityFrom(title: string): CareerTargetSeniority {
  const value = title.toLowerCase();
  if (/\bintern\b/.test(value)) return "intern";
  if (/fresher|graduate|entry[- ]level|\bentry\b/.test(value)) return "fresher";
  if (/\bjunior\b|\bjr\b/.test(value)) return "junior";
  if (/\blead\b|\bprincipal\b|\bstaff\b|\bhead\b/.test(value)) return "lead";
  if (/\bsenior\b|\bsr\b/.test(value)) return "senior";
  if (/\bmid\b|mid-level/.test(value)) return "mid";
  return "unspecified";
}

function roleLike(title: string): boolean {
  const words = title.trim().split(/\s+/).filter(Boolean);
  return words.length > 0 && words.length <= 6 && title.trim().length <= 80;
}

function hasEducation(item: ResumeData["education"][number]): boolean {
  return Boolean(
    item.institution?.trim() || item.area?.trim() || item.studyType?.trim(),
  );
}

function educationOngoing(
  item: ResumeData["education"][number],
  now: Date,
): boolean {
  const rawEnd = item.endDate?.trim() ?? "";
  if (/^(present|current|now)$/i.test(rawEnd)) return true;
  const end = cleanDate(item.endDate);
  if (end) return !isPastMonth(end, now);
  return Boolean(cleanDate(item.startDate));
}

function workIsCurrent(
  rawEnd: string | null | undefined,
  cleanedEnd: string | null,
  cleanedStart: string | null,
  now: Date,
): boolean {
  const raw = rawEnd?.trim() ?? "";
  if (/^(present|current|now)$/i.test(raw)) return true;
  if (cleanedEnd) return !isPastMonth(cleanedEnd, now);
  return Boolean(cleanedStart);
}

function countryCode(raw: string | undefined): string {
  const code = (raw ?? "").trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(code)) return code;
  return "IN";
}

export function cleanDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || /present|current|now/i.test(trimmed)) return null;
  const match = trimmed.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/);
  if (!match) return null;
  const year = Number(match[1]);
  if (year < 1970 || year > 2100) return null;
  const month = match[2];
  const day = match[3];
  if (month && (Number(month) < 1 || Number(month) > 12)) return String(year);
  if (day && month) return `${match[1]}-${month}-${day}`;
  if (month) return `${match[1]}-${month}`;
  return match[1];
}

function parseYearMonth(
  value: string | null | undefined,
): { y: number; m: number } | null {
  const cleaned = cleanDate(value);
  if (!cleaned) return null;
  const match = cleaned.match(/^(\d{4})(?:-(\d{2}))?/);
  if (!match) return null;
  return { y: Number(match[1]), m: match[2] ? Number(match[2]) : 1 };
}

function monthIndexFromDate(date: Date): number {
  return date.getUTCFullYear() * 12 + (date.getUTCMonth() + 1);
}

function isPastMonth(value: string, now: Date): boolean {
  const parsed = parseYearMonth(value);
  if (!parsed) return false;
  return parsed.y * 12 + parsed.m < monthIndexFromDate(now);
}

function blankToNull(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
