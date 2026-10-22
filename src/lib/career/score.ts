import { normalizeCareerKey } from "@/lib/career/derive";
import {
  aggregateSkillGaps,
  computeMatchScore,
  findMatchedSkills,
  findMissingSkills,
} from "@/lib/match-engine";
import type { JobMatch, SkillCategory } from "@/types";
import type {
  CareerIntelligence,
  CareerSegment,
  CareerSkillGapView,
} from "@/types/career-profile";

/** Documented in docs/career-profile.md. Readiness dominates; completeness fills the rest. */
export const CAREER_SCORE_WEIGHTS = {
  readiness: 0.75,
  completeness: 0.25,
} as const;

/** Each present signal is worth this many completeness points, out of 100. */
export const COMPLETENESS_POINT = 25;

const TITLE_STOP_WORDS = new Set(["and", "the", "for", "with", "from"]);

export type ScoreJob = {
  title: string;
  requiredSkills: string[];
};

export type ScoreTarget = {
  id: string;
  title: string;
  isPrimary: boolean;
};

export function scoreCareerProfile(input: {
  segment: CareerSegment | null;
  skillNames: string[];
  targetRoles: ScoreTarget[];
  hasPay: boolean;
  jobs: ScoreJob[];
  analysisId: string | null;
}): CareerIntelligence {
  const completeness = completenessScore(input);
  const jobs = input.jobs.filter(
    (job) => job.title.trim().length > 0 || job.requiredSkills.length > 0,
  );

  const roles = input.targetRoles.map((role) => {
    const matched = jobs.filter((job) => titlesMatch(role.title, job.title));
    return {
      id: role.id,
      title: role.title,
      isPrimary: role.isPrimary,
      readiness: mean(
        matched.map((job) =>
          computeMatchScore(input.skillNames, job.requiredSkills),
        ),
      ),
      jobCount: matched.length,
    };
  });

  const matchedJobs = jobs.filter((job) =>
    input.targetRoles.some((role) => titlesMatch(role.title, job.title)),
  );
  const usedTargetJobs = matchedJobs.length > 0;

  const readinessPool = usedTargetJobs
    ? roles.flatMap((role) => {
        if (role.readiness == null) return [];
        return role.isPrimary
          ? [role.readiness, role.readiness]
          : [role.readiness];
      })
    : jobs.map((job) =>
        computeMatchScore(input.skillNames, job.requiredSkills),
      );

  const readiness = mean(readinessPool);
  const basis: CareerIntelligence["basis"] =
    jobs.length === 0 ? "none" : usedTargetJobs ? "target_roles" : "all_jobs";

  const gapJobs = (usedTargetJobs ? matchedJobs : jobs).map((job) =>
    toJobMatch(job, input.skillNames),
  );

  return {
    careerScore:
      readiness == null
        ? null
        : Math.round(
            CAREER_SCORE_WEIGHTS.readiness * readiness +
              CAREER_SCORE_WEIGHTS.completeness * completeness,
          ),
    readiness,
    completeness,
    basis,
    analysisId: input.analysisId,
    roles,
    skillGaps: aggregateSkillGaps(input.skillNames, gapJobs).map(mapGap),
  };
}

export function titlesMatch(roleTitle: string, jobTitle: string): boolean {
  const roleTokens = titleTokens(roleTitle);
  const jobTokens = titleTokens(jobTitle);
  if (roleTokens.length === 0 || jobTokens.length === 0) return false;
  if (
    containsTokenSequence(jobTokens, roleTokens) ||
    containsTokenSequence(roleTokens, jobTokens)
  ) {
    return true;
  }

  const significant = roleTokens.filter(
    (token) => token.length > 2 && !TITLE_STOP_WORDS.has(token),
  );
  if (significant.length === 0) return false;
  const hits = significant.filter((token) => jobTokens.includes(token)).length;
  return hits / significant.length >= 0.5;
}

function titleTokens(value: string): string[] {
  return normalizeCareerKey(value)
    .split(" ")
    .filter((token) => token.length > 0);
}

function containsTokenSequence(haystack: string[], needle: string[]): boolean {
  if (needle.length === 0 || needle.length > haystack.length) return false;
  for (let start = 0; start <= haystack.length - needle.length; start += 1) {
    if (needle.every((token, index) => haystack[start + index] === token)) {
      return true;
    }
  }
  return false;
}

function completenessScore(input: {
  segment: CareerSegment | null;
  skillNames: string[];
  targetRoles: ScoreTarget[];
  hasPay: boolean;
}): number {
  const signals = [
    input.segment != null,
    input.targetRoles.length > 0,
    input.skillNames.length > 0,
    input.hasPay,
  ];
  return signals.filter(Boolean).length * COMPLETENESS_POINT;
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

function toJobMatch(job: ScoreJob, resumeSkills: string[]): JobMatch {
  return {
    id: job.title,
    title: job.title,
    company: "",
    location: "",
    description: "",
    requiredSkills: job.requiredSkills,
    url: "",
    matchPercentage: computeMatchScore(resumeSkills, job.requiredSkills),
    matchedSkills: findMatchedSkills(resumeSkills, job.requiredSkills),
    missingSkills: findMissingSkills(resumeSkills, job.requiredSkills),
  };
}

function mapGap(gap: {
  skill: string;
  frequency: number;
  priority: "high" | "medium" | "low";
  category: SkillCategory;
}): CareerSkillGapView {
  return {
    skill: gap.skill,
    frequency: gap.frequency,
    priority: gap.priority,
    category: gap.category,
  };
}
