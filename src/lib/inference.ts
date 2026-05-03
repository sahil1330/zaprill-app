import { differenceInMonths, isBefore, isValid, max, parse } from "date-fns";
import type { ResumeData, ResumeWorkItem } from "@/types/resume";

/**
 * Parses a date string in various formats (YYYY-MM-DD, YYYY-MM, YYYY).
 */
function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;

  // Try YYYY-MM-DD
  let date = parse(dateStr, "yyyy-MM-dd", new Date());
  if (isValid(date)) return date;

  // Try YYYY-MM
  date = parse(dateStr, "yyyy-MM", new Date());
  if (isValid(date)) return date;

  // Try YYYY
  date = parse(dateStr, "yyyy", new Date());
  if (isValid(date)) return date;

  return null;
}

/**
 * Calculates total years of professional experience, merging overlapping intervals.
 */
export function calculateTotalExperience(work: ResumeWorkItem[]): number {
  if (!work || work.length === 0) return 0;

  const intervals: { start: Date; end: Date }[] = work
    .map((item) => {
      const start = parseDate(item.startDate);
      const end = item.endDate ? parseDate(item.endDate) : new Date();
      return start ? { start, end: end || new Date() } : null;
    })
    .filter(
      (i): i is { start: Date; end: Date } =>
        i !== null && isValid(i.start) && isValid(i.end),
    )
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (intervals.length === 0) return 0;

  const merged: { start: Date; end: Date }[] = [];
  let current = intervals[0];

  for (let i = 1; i < intervals.length; i++) {
    const next = intervals[i];
    // If next starts before or at current end, merge
    if (
      isBefore(next.start, current.end) ||
      next.start.getTime() === current.end.getTime()
    ) {
      current.end = max([current.end, next.end]);
    } else {
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);

  const totalMonths = merged.reduce((acc, interval) => {
    return acc + Math.max(0, differenceInMonths(interval.end, interval.start));
  }, 0);

  // Return years, rounded to nearest 0.5 or integer
  // For simplicity, let's just return integer years as the DB/UI expects
  return Math.max(0, Math.round(totalMonths / 12));
}

/**
 * Extracts unique job titles from the work history.
 */
export function extractJobTitles(work: ResumeWorkItem[]): string[] {
  if (!work) return [];
  const titles = work
    .map((item) => item.position?.trim())
    .filter((title) => title && title.length > 0);

  // Return unique titles, top 5
  return Array.from(new Set(titles)).slice(0, 5);
}

/**
 * Enriches a ResumeData object with inferred metadata if missing or if work history changed.
 * This is used to populate inferredJobTitles and totalYearsOfExperience.
 */
export function enrichResumeMetadata(data: ResumeData): ResumeData {
  const work = data.work || [];

  const inferredJobTitles = extractJobTitles(work);
  const totalYearsOfExperience = calculateTotalExperience(work);

  return {
    ...data,
    inferredJobTitles:
      inferredJobTitles.length > 0 ? inferredJobTitles : data.inferredJobTitles,
    totalYearsOfExperience:
      totalYearsOfExperience > 0
        ? totalYearsOfExperience
        : data.totalYearsOfExperience,
  };
}
