import type {
  CareerEmploymentType,
  CareerPayPeriod,
  CareerSegment,
} from "@/types/career-profile";

/** Monthly stipend becomes annual CTC by multiplying by 12. Annual amounts pass through. */
export function toAnnualInr(
  period: CareerPayPeriod,
  amountInr: number | null,
): number | null {
  if (amountInr == null) return null;
  const whole = Math.round(amountInr);
  if (period === "monthly") return whole * 12;
  return whole;
}

/**
 * Students enter a monthly stipend. So does anyone currently in an
 * internship or apprenticeship, even if their segment is fresher.
 * Professionals and other freshers enter annual CTC.
 */
export function usesMonthlyStipend(input: {
  segment: CareerSegment | null;
  experience: {
    employmentType: CareerEmploymentType;
    isCurrent: boolean;
  }[];
}): boolean {
  if (input.segment === "student") return true;
  return input.experience.some(
    (row) =>
      row.isCurrent &&
      (row.employmentType === "internship" ||
        row.employmentType === "apprenticeship"),
  );
}
