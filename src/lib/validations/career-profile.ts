import { z } from "zod";
import {
  CAREER_EMPLOYMENT_TYPES,
  CAREER_SEGMENTS,
  CAREER_SKILL_CATEGORIES,
  CAREER_SKILL_LEVELS,
  CAREER_TARGET_SENIORITIES,
  SKILL_EVIDENCE_KINDS,
} from "@/types/career-profile";

function zodEnum<const T extends string>(values: readonly T[]) {
  return z.enum(values as unknown as [T, ...T[]]);
}

const optionalId = z.string().trim().min(1).max(64).optional();

const emptyToNull = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((value) => {
      if (value == null) return value;
      return value.length === 0 ? null : value;
    });

const careerDate = z
  .string()
  .trim()
  .max(10)
  .regex(/^\d{4}(-\d{2})?(-\d{2})?$/, "Use YYYY, YYYY-MM, or YYYY-MM-DD")
  .nullable()
  .optional()
  .transform((value) => {
    if (value == null) return value;
    return value.length === 0 ? null : value;
  });

export const skillEvidenceSchema = z.object({
  kind: zodEnum(SKILL_EVIDENCE_KINDS),
  label: z.string().trim().min(1).max(200),
  refId: z.string().trim().min(1).max(64).optional(),
});

export const careerProfilePatchSchema = z
  .object({
    segment: zodEnum(CAREER_SEGMENTS).nullable().optional(),
    headline: emptyToNull(160),
    city: emptyToNull(80),
    region: emptyToNull(80),
    countryCode: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{2}$/, "Use a 2-letter country code")
      .transform((value) => value.toUpperCase())
      .optional(),
    currentSalaryInr: z
      .number()
      .int()
      .min(0)
      .max(100_000_000)
      .nullable()
      .optional(),
    expectedSalaryInr: z
      .number()
      .int()
      .min(0)
      .max(100_000_000)
      .nullable()
      .optional(),
    yearsOfExperience: z.number().min(0).max(60).nullable().optional(),
    noticePeriodDays: z.number().int().min(0).max(365).nullable().optional(),
    openToRelocate: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  });

export const careerSyncSchema = z.object({
  refreshSegment: z.boolean().optional(),
});

export const careerSkillWriteSchema = z.object({
  id: optionalId,
  name: z.string().trim().min(1).max(80),
  category: zodEnum(CAREER_SKILL_CATEGORIES).optional(),
  level: zodEnum(CAREER_SKILL_LEVELS).optional(),
  evidence: z.array(skillEvidenceSchema).max(12).optional(),
});

export const careerAcademicWriteSchema = z.object({
  id: optionalId,
  institution: z.string().trim().min(1).max(200),
  studyType: emptyToNull(80),
  area: emptyToNull(120),
  startDate: careerDate,
  endDate: careerDate,
  score: emptyToNull(32),
  isCurrent: z.boolean().optional(),
});

export const careerExperienceWriteSchema = z.object({
  id: optionalId,
  company: z.string().trim().min(1).max(160),
  title: z.string().trim().min(1).max(160),
  location: emptyToNull(120),
  employmentType: zodEnum(CAREER_EMPLOYMENT_TYPES).optional(),
  startDate: careerDate,
  endDate: careerDate,
  isCurrent: z.boolean().optional(),
  summary: emptyToNull(4000),
  highlights: z.array(z.string().trim().min(1).max(500)).max(20).optional(),
});

export const careerTargetWriteSchema = z.object({
  id: optionalId,
  title: z.string().trim().min(1).max(120),
  seniority: zodEnum(CAREER_TARGET_SENIORITIES).optional(),
  isPrimary: z.boolean().optional(),
});

export type CareerProfilePatch = z.infer<typeof careerProfilePatchSchema>;
export type CareerSkillWrite = z.infer<typeof careerSkillWriteSchema>;
export type CareerAcademicWrite = z.infer<typeof careerAcademicWriteSchema>;
export type CareerExperienceWrite = z.infer<typeof careerExperienceWriteSchema>;
export type CareerTargetWrite = z.infer<typeof careerTargetWriteSchema>;
