import { eq } from "drizzle-orm";
import db from "@/db";
import { userProfile } from "@/db/schema";
import { flattenResumeSkills } from "@/lib/resume";

export type OnboardingStatus = "not_started" | "in_progress" | "completed";

type ProfilePatch = {
  onboardingStatus?: OnboardingStatus;
  primaryResumeId?: string | null;
  resumeRaw?: unknown;
  /** When true, replace the primary resume even if one is already set. */
  forcePrimary?: boolean;
};

function rank(status: OnboardingStatus | undefined): number {
  if (status === "completed") return 2;
  if (status === "in_progress") return 1;
  return 0;
}

function resolveOnboardingStatus(
  current: OnboardingStatus | undefined,
  requested?: OnboardingStatus,
): OnboardingStatus {
  if (!requested) return current ?? "not_started";
  // Never regress: completed > in_progress > not_started
  return rank(requested) >= rank(current)
    ? requested
    : (current ?? "not_started");
}

/**
 * Create the user_profile row if missing, then optionally patch it.
 * Used so new users are never stuck without a profile (which previously
 * caused an infinite homepage skeleton).
 */
export async function ensureUserProfile(
  userId: string,
  patch: ProfilePatch = {},
) {
  const existing = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, userId),
  });

  const nextStatus = resolveOnboardingStatus(
    existing?.onboardingStatus as OnboardingStatus | undefined,
    patch.onboardingStatus,
  );

  const nextPrimary = patch.forcePrimary
    ? (patch.primaryResumeId ?? existing?.primaryResumeId ?? null)
    : (existing?.primaryResumeId ?? patch.primaryResumeId ?? null);

  const setValues: Record<string, unknown> = {
    onboardingStatus: nextStatus,
    primaryResumeId: nextPrimary,
    updatedAt: new Date(),
  };
  if (patch.resumeRaw !== undefined) {
    setValues.resumeRaw = patch.resumeRaw;
  }

  await db
    .insert(userProfile)
    .values({
      id: existing?.id ?? crypto.randomUUID(),
      userId,
      onboardingStatus: nextStatus,
      primaryResumeId: nextPrimary,
      resumeRaw: patch.resumeRaw ?? existing?.resumeRaw ?? null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userProfile.userId,
      set: setValues,
    });

  return db.query.userProfile.findFirst({
    where: eq(userProfile.userId, userId),
  });
}

/** True when the resume has enough content to treat onboarding as done. */
export function resumeHasSubstance(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const resume = data as {
    basics?: { summary?: string };
    work?: Array<{ company?: string; position?: string }>;
    education?: Array<{ institution?: string }>;
    skills?: unknown;
    projects?: Array<{ keywords?: string[] }>;
  };

  if (flattenResumeSkills(resume as never).length > 0) return true;

  if (
    Array.isArray(resume.work) &&
    resume.work.some((item) => Boolean(item?.company || item?.position))
  ) {
    return true;
  }

  if (
    Array.isArray(resume.education) &&
    resume.education.some((item) => Boolean(item?.institution))
  ) {
    return true;
  }

  const summary = resume.basics?.summary;
  if (typeof summary === "string") {
    const text = summary.replace(/<[^>]+>/g, "").trim();
    if (text.length > 40) return true;
  }

  return false;
}
