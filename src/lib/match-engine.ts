import type { JobListing, JobMatch, SkillGap } from '@/types'
import { categorizeSkill, normalizeSkill } from './skill-extractor'

/**
 * Compute match percentage between resume skills and job required skills
 */
export function computeMatchScore(
  resumeSkills: string[],
  jobSkills: string[]
): number {
  if (jobSkills.length === 0) return 0
  const userSet = new Set(resumeSkills.map(normalizeSkill))
  const matched = jobSkills.filter((s) => userSet.has(normalizeSkill(s)))
  return Math.round((matched.length / jobSkills.length) * 100)
}

/**
 * Find skills user has that the job needs
 */
export function findMatchedSkills(
  resumeSkills: string[],
  jobSkills: string[]
): string[] {
  const userSet = new Set(resumeSkills.map(normalizeSkill))
  return jobSkills.filter((s) => userSet.has(normalizeSkill(s)))
}

/**
 * Find skills the job needs that the user doesn't have
 */
export function findMissingSkills(
  resumeSkills: string[],
  jobSkills: string[]
): string[] {
  const userSet = new Set(resumeSkills.map(normalizeSkill))
  return jobSkills.filter((s) => !userSet.has(normalizeSkill(s)))
}

/**
 * Enrich job listings with match data against the user's resume skills
 */
export function matchJobsToResume(
  resumeSkills: string[],
  jobs: JobListing[]
): JobMatch[] {
  return jobs
    .map((job) => ({
      ...job,
      matchPercentage: computeMatchScore(resumeSkills, job.requiredSkills),
      matchedSkills: findMatchedSkills(resumeSkills, job.requiredSkills),
      missingSkills: findMissingSkills(resumeSkills, job.requiredSkills),
    }))
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
}

/**
 * Aggregate skill gaps across all jobs, ranked by frequency and priority
 */
export function aggregateSkillGaps(
  resumeSkills: string[],
  jobs: JobMatch[]
): SkillGap[] {
  const gapMap = new Map<string, number>()

  for (const job of jobs) {
    for (const skill of job.missingSkills) {
      const normalized = normalizeSkill(skill)
      gapMap.set(normalized, (gapMap.get(normalized) ?? 0) + 1)
    }
  }

  const totalJobs = jobs.length || 1

  return Array.from(gapMap.entries())
    .map(([skill, frequency]) => {
      const ratio = frequency / totalJobs
      const priority: SkillGap['priority'] =
        ratio > 0.5 ? 'high' : ratio > 0.25 ? 'medium' : 'low'

      return {
        skill,
        frequency,
        priority,
        category: categorizeSkill(skill),
      }
    })
    .sort((a, b) => b.frequency - a.frequency)
}

/**
 * Get overall stats summary
 */
export function getAnalysisSummary(jobs: JobMatch[]) {
  const avg = jobs.length
    ? Math.round(jobs.reduce((s, j) => s + j.matchPercentage, 0) / jobs.length)
    : 0
  const topMatch = jobs[0]?.matchPercentage ?? 0
  const strongMatches = jobs.filter((j) => j.matchPercentage >= 70).length
  const weakMatches = jobs.filter((j) => j.matchPercentage < 40).length

  return { avg, topMatch, strongMatches, weakMatches, total: jobs.length }
}
