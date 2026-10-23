/**
 * The only Skill Coach tier table.
 * Change limits and spend ceilings here. Metering reads these values.
 * Do not parse plan.features or plan.amount.
 */
export const COACH_LIMITS = {
  usdInr: 95,
  // Pre-auth before a tutor turn. Sized near the 6-step hot path (~₹1.94)
  // plus one summary (~₹0.19).
  turnReservePaise: 250,
  gradeReservePaise: 50,
  outlineReservePaise: 50,
  // One mock session, reserved up front. Reconciled to actual steps.
  mockReservePaise: 800,
  passScore: 70,
  model: "gpt-5-mini",
  maxTutorSteps: 6,
  historyMessages: 8,
  summaryAfterMessages: 16,
  tutorMaxOutputTokens: 600,
  summaryMaxOutputTokens: 250,
  gradeMaxOutputTokens: 400,
  tiers: {
    // Founder: freemium taste on every interactive surface.
    free: {
      activePrograms: 1,
      tutorTurnsPerDay: 10,
      gradedPracticePerWeek: 1,
      mockInterviewsPerMonth: 1,
      monthlySpendCeilingInr: 40,
    },
    // Every paid plan includes tutor, graded practice, and mocks.
    // Interactive caps are 4× free. Ceiling is the approved ₹200.
    pro: {
      activePrograms: 3,
      tutorTurnsPerDay: 40,
      gradedPracticePerWeek: 4,
      mockInterviewsPerMonth: 4,
      monthlySpendCeilingInr: 200,
    },
    // 8× free on messages, grades, and mocks. Ceiling is the approved ₹600.
    max: {
      activePrograms: 5,
      tutorTurnsPerDay: 80,
      gradedPracticePerWeek: 8,
      mockInterviewsPerMonth: 8,
      monthlySpendCeilingInr: 600,
    },
  },
} as const;

export type CoachTier = keyof typeof COACH_LIMITS.tiers;

export type CoachQuota = "tutor" | "grade" | "mock";

export type CoachSpend = "tutor" | "grade" | "outline" | "mock";

export const COACH_TECHNICAL_CATEGORIES = [
  "language",
  "framework",
  "database",
  "cloud",
  "tool",
] as const;

export type CoachTechnicalCategory =
  (typeof COACH_TECHNICAL_CATEGORIES)[number];

const TIER_ORDER: CoachTier[] = ["free", "pro", "max"];

export function isCoachTier(value: string): value is CoachTier {
  return TIER_ORDER.includes(value as CoachTier);
}

export function isTechnicalCategory(
  category: string,
): category is CoachTechnicalCategory {
  return (COACH_TECHNICAL_CATEGORIES as readonly string[]).includes(category);
}

export function tierLimits(tier: CoachTier) {
  return COACH_LIMITS.tiers[tier];
}

export function monthlySpendCeilingPaise(tier: CoachTier): number {
  return tierLimits(tier).monthlySpendCeilingInr * 100;
}

export function quotaCap(tier: CoachTier, quota: CoachQuota): number {
  const limits = tierLimits(tier);
  if (quota === "tutor") return limits.tutorTurnsPerDay;
  if (quota === "grade") return limits.gradedPracticePerWeek;
  return limits.mockInterviewsPerMonth;
}

export function reservePaiseFor(spend: CoachSpend): number {
  if (spend === "tutor") return COACH_LIMITS.turnReservePaise;
  if (spend === "grade") return COACH_LIMITS.gradeReservePaise;
  if (spend === "outline") return COACH_LIMITS.outlineReservePaise;
  return COACH_LIMITS.mockReservePaise;
}

/** Planning rate. Not a live FX feed. */
export function usdToPaise(usd: number): number {
  return Math.round(usd * COACH_LIMITS.usdInr * 100);
}

export function isPassingScore(score: number): boolean {
  return score >= COACH_LIMITS.passScore;
}

export function quotaAllowed(used: number, cap: number): boolean {
  return used < cap;
}

export function spendAllowed(
  currentPaise: number,
  reservePaise: number,
  ceilingPaise: number,
): boolean {
  return currentPaise + reservePaise <= ceilingPaise;
}

/** Month row already includes the reservation. Swap it for the real charge. */
export function nextSpendPaise(
  currentIncludingReserve: number,
  reservePaise: number,
  actualPaise: number,
): number {
  return Math.max(0, currentIncludingReserve - reservePaise + actualPaise);
}

export function refundedCount(used: number): number {
  return Math.max(0, used - 1);
}

/**
 * No granting subscription is free.
 * An unknown category on a granting subscription is pro.
 */
export function tierFromPlanCategory(
  hasGrantingSubscription: boolean,
  category: string | null | undefined,
): { tier: CoachTier; unknownCategory: boolean } {
  if (!hasGrantingSubscription) {
    return { tier: "free", unknownCategory: false };
  }
  if (category === "free" || category === "pro" || category === "max") {
    return { tier: category, unknownCategory: false };
  }
  return { tier: "pro", unknownCategory: true };
}

export function upgradeTier(tier: CoachTier): CoachTier | null {
  if (tier === "free") return "pro";
  if (tier === "pro") return "max";
  return null;
}

export function formatUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function utcDayStart(now: Date): string {
  return formatUtcDate(
    new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    ),
  );
}

/** ISO week, Monday 00:00 UTC. */
export function utcWeekStart(now: Date): string {
  const day = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const weekday = day.getUTCDay();
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  day.setUTCDate(day.getUTCDate() - daysFromMonday);
  return formatUtcDate(day);
}

export function utcMonthStart(now: Date): string {
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${now.getUTCFullYear()}-${month}-01`;
}

export function periodStartFor(quota: CoachQuota, now: Date): string {
  if (quota === "tutor") return utcDayStart(now);
  if (quota === "grade") return utcWeekStart(now);
  return utcMonthStart(now);
}

export function periodKindFor(quota: CoachQuota): "day" | "week" | "month" {
  if (quota === "tutor") return "day";
  if (quota === "grade") return "week";
  return "month";
}
