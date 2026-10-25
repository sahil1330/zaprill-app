import { titlesMatch } from "@/lib/career/score";
import { normalizeSkill } from "@/lib/skill-extractor";
import type { CareerSkillLevel } from "@/types/career-profile";

export type MarketJob = {
  title: string;
  company: string;
  salary: string | null;
  requiredSkills: string[];
  isRemote: boolean | null;
};

export type ProfileSkillRef = {
  name: string;
  level: CareerSkillLevel;
};

export type MarketTarget = {
  id: string;
  title: string;
  isPrimary: boolean;
};

export type RoleSkillDemand = {
  name: string;
  frequency: number;
  jobCount: number;
  onProfile: boolean;
  level: CareerSkillLevel | null;
  /** Gap priority. Null when the skill is already on the career file. */
  priority: "high" | "medium" | "low" | null;
};

export type RoleMarket = {
  id: string;
  title: string;
  isPrimary: boolean;
  jobCount: number;
  salary: {
    sampleSize: number;
    lowInr: number;
    medianInr: number;
    highInr: number;
  } | null;
  remoteCount: number;
  remoteKnown: number;
  companies: { name: string; count: number }[];
  skills: RoleSkillDemand[];
};

export type MarketReport = {
  basis: "target_roles" | "all_jobs" | "none";
  roles: RoleMarket[];
};

const SKILL_CAP = 8;
const COMPANY_CAP = 4;

/**
 * Pay and skill demand for each target role, taken from analysis jobs whose
 * titles match. This does not call a model and does not read Adzuna or ATS boards.
 */
export function buildMarketReport(input: {
  skills: ProfileSkillRef[];
  targets: MarketTarget[];
  jobs: MarketJob[];
}): MarketReport {
  const jobs = input.jobs.filter(
    (job) => job.title.trim().length > 0 || job.requiredSkills.length > 0,
  );
  if (jobs.length === 0) {
    return {
      basis: "none",
      roles: input.targets.map((target) => emptyRole(target)),
    };
  }

  const matchedTargets = input.targets.filter((target) =>
    jobs.some((job) => titlesMatch(target.title, job.title)),
  );

  if (input.targets.length === 0 || matchedTargets.length === 0) {
    return {
      basis: "all_jobs",
      roles: [
        ...input.targets.map((target) =>
          summarizeRole(
            target,
            jobs.filter((job) => titlesMatch(target.title, job.title)),
            input.skills,
          ),
        ),
        summarizeRole(
          {
            id: "analysis",
            title: "Latest analysis",
            isPrimary: input.targets.length === 0,
          },
          jobs,
          input.skills,
        ),
      ],
    };
  }

  return {
    basis: "target_roles",
    roles: input.targets.map((target) =>
      summarizeRole(
        target,
        jobs.filter((job) => titlesMatch(target.title, job.title)),
        input.skills,
      ),
    ),
  };
}

export function topMissingSkill(
  roles: RoleMarket[],
): { skill: string; priority: "high" | "medium" | "low" } | null {
  const rank = { high: 3, medium: 2, low: 1 };
  const withJobs = roles.filter((role) => role.jobCount > 0);
  const source = withJobs.some((role) => role.id !== "analysis")
    ? withJobs.filter((role) => role.id !== "analysis")
    : withJobs;
  const missing = source
    .flatMap((role) => role.skills)
    .filter(
      (
        skill,
      ): skill is RoleSkillDemand & {
        priority: "high" | "medium" | "low";
      } => !skill.onProfile && skill.priority != null,
    );
  missing.sort(
    (a, b) => rank[b.priority] - rank[a.priority] || b.frequency - a.frequency,
  );
  const top = missing[0];
  if (!top) return null;
  return { skill: top.name, priority: top.priority };
}

/** Midpoint of an Indian salary string, in annual whole INR. */
export function parseIndianSalaryInr(
  raw: string | null | undefined,
): number | null {
  if (!raw) return null;
  const text = raw.replace(/,/g, "").toLowerCase().trim();
  if (
    /not\s*disclosed|negotiable|competitive|as\s*per|based\s*on/i.test(text)
  ) {
    return null;
  }
  const nums = [...text.matchAll(/[\d]+(?:\.\d+)?/g)].map((match) =>
    Number.parseFloat(match[0]),
  );
  if (nums.length === 0 || nums.some((value) => !Number.isFinite(value))) {
    return null;
  }
  const isCrore = /crore|cr\b/.test(text);
  const isLpa = /lpa|lakh|lakhs|lac|\bl\b/.test(text);
  const toInr = (value: number) => {
    if (isCrore) return Math.round(value * 10_000_000);
    if (isLpa) return Math.round(value * 100_000);
    if (value >= 10_000) return Math.round(value);
    return Math.round(value * 100_000);
  };
  if (nums.length >= 2) {
    return Math.round((toInr(nums[0]) + toInr(nums[1])) / 2);
  }
  return toInr(nums[0]);
}

function emptyRole(target: MarketTarget): RoleMarket {
  return {
    id: target.id,
    title: target.title,
    isPrimary: target.isPrimary,
    jobCount: 0,
    salary: null,
    remoteCount: 0,
    remoteKnown: 0,
    companies: [],
    skills: [],
  };
}

function summarizeRole(
  target: MarketTarget,
  jobs: MarketJob[],
  skills: ProfileSkillRef[],
): RoleMarket {
  if (jobs.length === 0) return emptyRole(target);
  const levels = new Map<string, CareerSkillLevel>();
  for (const skill of skills) {
    const key = normalizeSkill(skill.name);
    if (key && !levels.has(key)) levels.set(key, skill.level);
  }

  const salaries = jobs
    .map((job) => parseIndianSalaryInr(job.salary))
    .filter((value): value is number => value != null && value > 0)
    .sort((a, b) => a - b);

  const companies = new Map<string, { name: string; count: number }>();
  let remoteCount = 0;
  let remoteKnown = 0;
  const demand = new Map<string, { name: string; frequency: number }>();

  for (const job of jobs) {
    const company = job.company.trim().replace(/\s+/g, " ");
    if (company) {
      const key = company.toLowerCase();
      const current = companies.get(key);
      if (current) current.count += 1;
      else companies.set(key, { name: company, count: 1 });
    }
    if (job.isRemote != null) {
      remoteKnown += 1;
      if (job.isRemote) remoteCount += 1;
    }
    const seen = new Set<string>();
    for (const skill of job.requiredSkills) {
      const key = normalizeSkill(skill);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const current = demand.get(key);
      if (current) current.frequency += 1;
      else demand.set(key, { name: skill.trim(), frequency: 1 });
    }
  }

  const roleSkills = [...demand.values()]
    .map((skill) => {
      const key = normalizeSkill(skill.name);
      const onProfile = levels.has(key);
      const ratio = skill.frequency / jobs.length;
      const priority = onProfile
        ? null
        : ratio > 0.5
          ? "high"
          : ratio > 0.25
            ? "medium"
            : "low";
      return {
        name: skill.name,
        frequency: skill.frequency,
        jobCount: jobs.length,
        onProfile,
        level: onProfile ? (levels.get(key) ?? null) : null,
        priority,
      } satisfies RoleSkillDemand;
    })
    .sort((a, b) => {
      if (a.onProfile !== b.onProfile) return a.onProfile ? 1 : -1;
      const rank = { high: 3, medium: 2, low: 1 };
      const left = a.priority ? rank[a.priority] : 0;
      const right = b.priority ? rank[b.priority] : 0;
      return right - left || b.frequency - a.frequency;
    })
    .slice(0, SKILL_CAP);

  return {
    id: target.id,
    title: target.title,
    isPrimary: target.isPrimary,
    jobCount: jobs.length,
    salary: salaries.length >= 2 ? salaryBand(salaries) : null,
    remoteCount,
    remoteKnown,
    companies: [...companies.values()]
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, COMPANY_CAP),
    skills: roleSkills,
  };
}

function salaryBand(sorted: number[]): RoleMarket["salary"] {
  return {
    sampleSize: sorted.length,
    lowInr: percentile(sorted, 25),
    medianInr: median(sorted),
    highInr: percentile(sorted, 75),
  };
}

function median(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

function percentile(sorted: number[], p: number): number {
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}
