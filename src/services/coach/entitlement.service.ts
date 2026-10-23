import { eq } from "drizzle-orm";
import db from "@/db";
import { plan } from "@/db/schema";
import { isCoachEnabled } from "@/lib/app-settings";
import { getSubscriptionWithAccess } from "@/services/billing/subscription.service";
import { coachDisabledError } from "@/services/coach/errors";
import {
  type CoachTier,
  tierFromPlanCategory,
  tierLimits,
} from "@/services/coach/limits";
import {
  type CoachUsageSnapshot,
  readCoachUsage,
} from "@/services/coach/meter.service";

export async function resolveCoachTier(userId: string): Promise<CoachTier> {
  const subscription = await getSubscriptionWithAccess(userId);
  if (!subscription) return "free";

  const [row] = await db
    .select({ category: plan.category })
    .from(plan)
    .where(eq(plan.id, subscription.planId))
    .limit(1);

  const resolved = tierFromPlanCategory(true, row?.category);
  if (resolved.unknownCategory) {
    console.warn("[coach] unknown plan category, treating as pro", {
      planId: subscription.planId,
      category: row?.category ?? null,
    });
  }
  return resolved.tier;
}

/** Model calls only. Saved plans stay readable when this is off. */
export async function assertCoachModelsEnabled(): Promise<void> {
  if (!(await isCoachEnabled())) throw coachDisabledError();
}

export async function coachAllowance(userId: string, tier: CoachTier) {
  const usage = await readCoachUsage(userId);
  return allowanceFrom(tier, usage);
}

export function allowanceFrom(tier: CoachTier, usage: CoachUsageSnapshot) {
  const limits = tierLimits(tier);
  return {
    tier,
    activePrograms: limits.activePrograms,
    tutorTurnsPerDay: limits.tutorTurnsPerDay,
    tutorTurnsUsed: usage.tutorTurns,
    gradedPracticePerWeek: limits.gradedPracticePerWeek,
    gradedPracticeUsed: usage.practiceGrades,
    mockInterviewsPerMonth: limits.mockInterviewsPerMonth,
    mockInterviewsUsed: usage.mockSessions,
    monthlySpendCeilingInr: limits.monthlySpendCeilingInr,
    spendPaise: usage.spendPaise,
  };
}
