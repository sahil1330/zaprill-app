import { and, asc, desc, eq, ne } from "drizzle-orm";
import { nanoid } from "nanoid";
import db from "@/db";
import {
  careerAcademic,
  careerExperience,
  careerProfile,
  careerSkill,
  careerTargetRole,
  resume,
  resumeAnalysis,
  userProfile,
} from "@/db/schema";
import {
  type CareerDraft,
  type DraftAcademic,
  type DraftExperience,
  type DraftSkill,
  type DraftTarget,
  deriveCareerDraft,
  monthsToYears,
  normalizeCareerKey,
  yearsToMonths,
} from "@/lib/career/derive";
import { toAnnualInr, usesMonthlyStipend } from "@/lib/career/pay";
import { scoreCareerProfile } from "@/lib/career/score";
import { normalizeResumeData } from "@/lib/resume";
import { ensureUserProfile } from "@/lib/user-profile";
import type {
  CareerAcademicWrite,
  CareerExperienceWrite,
  CareerProfilePatch,
  CareerSkillWrite,
  CareerTargetWrite,
  RecordVerifiedSkillInput,
} from "@/lib/validations/career-profile";
import type {
  CareerAcademicRecord,
  CareerExperienceRecord,
  CareerFieldKey,
  CareerFieldSource,
  CareerFieldSources,
  CareerProfileView,
  CareerSkillRecord,
  CareerTargetRoleRecord,
  SkillEvidence,
} from "@/types/career-profile";
import {
  CAREER_EMPLOYMENT_TYPES,
  CAREER_FIELD_KEYS,
  CAREER_PAY_PERIODS,
  CAREER_SEGMENTS,
  CAREER_SKILL_CATEGORIES,
  CAREER_SKILL_LEVELS,
  CAREER_TARGET_SENIORITIES,
  SKILL_EVIDENCE_KINDS,
  VERIFIED_SKILL_LABEL,
} from "@/types/career-profile";

export class CareerProfileError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "CareerProfileError";
    this.status = status;
  }
}

const FIELD_SOURCES = new Set<CareerFieldSource>([
  "inferred",
  "resume",
  "self_reported",
  "legacy_profile",
]);

type SkillRow = typeof careerSkill.$inferSelect;
type AcademicRow = typeof careerAcademic.$inferSelect;
type ExperienceRow = typeof careerExperience.$inferSelect;
type TargetRow = typeof careerTargetRole.$inferSelect;
type HeaderRow = typeof careerProfile.$inferSelect;

export async function ensureCareerProfile(
  userId: string,
): Promise<CareerProfileView> {
  const existing = await loadHeader(userId);
  if (!existing?.lastDerivedAt) {
    return syncCareerProfileFromResume(userId);
  }
  const view = await loadView(userId);
  if (!view) return syncCareerProfileFromResume(userId);
  return view;
}

export async function getCareerProfile(
  userId: string,
): Promise<CareerProfileView> {
  const view = await loadView(userId);
  if (!view) {
    throw new CareerProfileError("Career profile not found", 404);
  }
  return view;
}

export async function syncCareerProfileFromResume(
  userId: string,
  opts?: { refreshSegment?: boolean },
): Promise<CareerProfileView> {
  const ctx = await loadResumeContext(userId);
  const draft = deriveCareerDraft({
    resume: ctx.data,
    targetRole: ctx.targetRole,
    now: new Date(),
  });
  const existing = await loadHeader(userId);
  const header = nextHeader(existing, draft, ctx.legacySalaryInr, opts);
  const id = existing?.id ?? nanoid();

  await db
    .insert(careerProfile)
    .values({
      id,
      userId,
      ...header,
      expectedPayPeriod: existing?.expectedPayPeriod ?? "annual",
      expectedMinInr: existing?.expectedMinInr ?? null,
      expectedMaxInr: existing?.expectedMaxInr ?? null,
      expectedMinAnnualInr: existing?.expectedMinAnnualInr ?? null,
      expectedMaxAnnualInr: existing?.expectedMaxAnnualInr ?? null,
      noticePeriodDays: existing?.noticePeriodDays ?? null,
      openToRelocate: existing?.openToRelocate ?? false,
      derivedFromResumeId: ctx.resumeId,
      lastDerivedAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: careerProfile.userId,
      set: {
        ...header,
        derivedFromResumeId: ctx.resumeId,
        lastDerivedAt: new Date(),
        updatedAt: new Date(),
      },
    });

  const saved = await loadHeader(userId);
  if (!saved) {
    throw new CareerProfileError("Career profile could not be saved", 500);
  }

  await syncAcademics(saved.id, userId, draft.academics);
  await syncExperience(saved.id, userId, draft.experience);
  await syncSkills(saved.id, userId, draft.skills);
  await syncTargets(saved.id, userId, draft.targetRoles);

  return getCareerProfile(userId);
}

export async function updateCareerProfile(
  userId: string,
  patch: CareerProfilePatch,
): Promise<CareerProfileView> {
  await ensureCareerProfile(userId);
  const existing = await loadHeader(userId);
  if (!existing) {
    throw new CareerProfileError("Career profile not found", 404);
  }

  const sources = asFieldSources(existing.fieldSources);
  const set: Partial<typeof careerProfile.$inferInsert> = {
    updatedAt: new Date(),
  };

  if ("segment" in patch) {
    set.segment = patch.segment ?? null;
    sources.segment = "self_reported";
  }
  if ("headline" in patch) {
    set.headline = patch.headline ?? null;
    sources.headline = "self_reported";
  }
  if ("city" in patch || "region" in patch || "countryCode" in patch) {
    if ("city" in patch) set.city = patch.city ?? null;
    if ("region" in patch) set.region = patch.region ?? null;
    if ("countryCode" in patch && patch.countryCode) {
      set.countryCode = patch.countryCode;
    }
    sources.location = "self_reported";
  }
  if ("yearsOfExperience" in patch) {
    set.experienceMonths =
      patch.yearsOfExperience == null
        ? null
        : yearsToMonths(patch.yearsOfExperience);
    sources.yearsOfExperience = "self_reported";
  }
  if ("currentPayInr" in patch || "currentPayPeriod" in patch) {
    const period = patch.currentPayPeriod ?? existing.currentPayPeriod;
    const amount =
      "currentPayInr" in patch
        ? (patch.currentPayInr ?? null)
        : existing.currentPayInr;
    set.currentPayPeriod = period;
    set.currentPayInr = amount;
    set.currentSalaryInr = toAnnualInr(period, amount);
    sources.currentSalaryInr = "self_reported";
  }
  if (
    "expectedMinInr" in patch ||
    "expectedMaxInr" in patch ||
    "expectedPayPeriod" in patch
  ) {
    const period = patch.expectedPayPeriod ?? existing.expectedPayPeriod;
    const min =
      "expectedMinInr" in patch
        ? (patch.expectedMinInr ?? null)
        : existing.expectedMinInr;
    const max =
      "expectedMaxInr" in patch
        ? (patch.expectedMaxInr ?? null)
        : existing.expectedMaxInr;
    if (min != null && max != null && min > max) {
      throw new CareerProfileError(
        "Expected minimum cannot exceed the maximum",
        400,
      );
    }
    set.expectedPayPeriod = period;
    set.expectedMinInr = min;
    set.expectedMaxInr = max;
    set.expectedMinAnnualInr = toAnnualInr(period, min);
    set.expectedMaxAnnualInr = toAnnualInr(period, max);
  }
  if ("noticePeriodDays" in patch) {
    set.noticePeriodDays = patch.noticePeriodDays ?? null;
  }
  if ("openToRelocate" in patch) {
    set.openToRelocate = patch.openToRelocate;
  }
  set.fieldSources = cleanSources(sources);

  await db
    .update(careerProfile)
    .set(set)
    .where(eq(careerProfile.userId, userId));

  if ("currentPayInr" in patch || "currentPayPeriod" in patch) {
    await ensureUserProfile(userId);
    await db
      .update(userProfile)
      .set({
        currentSalary:
          "currentSalaryInr" in set ? (set.currentSalaryInr ?? null) : null,
        updatedAt: new Date(),
      })
      .where(eq(userProfile.userId, userId));
  }

  return getCareerProfile(userId);
}

/** Legacy profile salary is annual CTC. This is the only writer for that figure. */
export async function setCurrentAnnualSalary(
  userId: string,
  annualInr: number | null,
): Promise<CareerProfileView> {
  if (
    annualInr != null &&
    (!Number.isInteger(annualInr) || annualInr < 0 || annualInr > 100_000_000)
  ) {
    throw new CareerProfileError(
      "Current salary must be a whole number of rupees up to 10 crore",
      400,
    );
  }
  return updateCareerProfile(userId, {
    currentPayPeriod: "annual",
    currentPayInr: annualInr,
  });
}

/**
 * Skill Coach records a passing check. Does not lock the level.
 * Replaces any previous verified evidence on that skill.
 * Recruiter visibility is a later surface; the evidence is stored now.
 */
export async function recordVerifiedSkill(
  userId: string,
  input: RecordVerifiedSkillInput,
): Promise<CareerProfileView> {
  const profile = await ensureCareerProfile(userId);
  const normalizedName = normalizeCareerKey(input.skill);
  if (!normalizedName) {
    throw new CareerProfileError("Skill name is required", 400);
  }

  const verifiedAt = input.verifiedAt ? new Date(input.verifiedAt) : new Date();
  if (Number.isNaN(verifiedAt.getTime())) {
    throw new CareerProfileError("verifiedAt is not a valid date", 400);
  }
  const verified: SkillEvidence = {
    kind: "verified",
    label: VERIFIED_SKILL_LABEL,
    score: input.score,
    verifiedAt: verifiedAt.toISOString(),
  };

  const existingRows = await db
    .select()
    .from(careerSkill)
    .where(eq(careerSkill.userId, userId));
  const target = existingRows.find(
    (row) => row.normalizedName === normalizedName,
  );

  if (target) {
    await db
      .update(careerSkill)
      .set({
        evidence: replaceVerifiedEvidence(
          asEvidence(target.evidence),
          verified,
        ),
        updatedAt: new Date(),
      })
      .where(eq(careerSkill.id, target.id));
  } else {
    await db.insert(careerSkill).values({
      id: nanoid(),
      careerProfileId: profile.id,
      userId,
      name: input.skill.trim(),
      normalizedName,
      category: "other",
      level: "unspecified",
      levelLocked: false,
      evidence: [verified],
      source: "self_reported",
      sortOrder: nextSort(existingRows.map((row) => row.sortOrder)),
    });
  }

  return getCareerProfile(userId);
}

export async function upsertCareerSkill(
  userId: string,
  input: CareerSkillWrite,
): Promise<CareerProfileView> {
  const profile = await ensureCareerProfile(userId);
  const normalizedName = normalizeCareerKey(input.name);
  if (!normalizedName) {
    throw new CareerProfileError("Skill name is required", 400);
  }

  const existingRows = await db
    .select()
    .from(careerSkill)
    .where(eq(careerSkill.userId, userId));
  const byId = input.id
    ? existingRows.find((row) => row.id === input.id)
    : undefined;
  if (input.id && !byId) {
    throw new CareerProfileError("Skill not found", 404);
  }
  const byName = existingRows.find(
    (row) => row.normalizedName === normalizedName && row.id !== byId?.id,
  );
  if (byId && byName) {
    throw new CareerProfileError("A skill with that name already exists", 409);
  }

  const target = byId ?? byName;
  const levelEdit = input.level != null;
  const incomingEvidence = input.evidence ?? [];
  if (target) {
    const identityEdit =
      normalizedName !== target.normalizedName ||
      (input.category != null && input.category !== target.category);
    await db
      .update(careerSkill)
      .set({
        name: input.name.trim(),
        normalizedName,
        category: input.category ?? target.category,
        level: levelEdit ? input.level : target.level,
        levelLocked: levelEdit ? true : target.levelLocked,
        evidence:
          input.evidence != null
            ? unionEvidence(asEvidence(target.evidence), incomingEvidence)
            : asEvidence(target.evidence),
        source: levelEdit || identityEdit ? "self_reported" : target.source,
        updatedAt: new Date(),
      })
      .where(eq(careerSkill.id, target.id));
  } else {
    await db.insert(careerSkill).values({
      id: nanoid(),
      careerProfileId: profile.id,
      userId,
      name: input.name.trim(),
      normalizedName,
      category: input.category ?? "other",
      level: input.level ?? "unspecified",
      levelLocked: levelEdit,
      evidence: incomingEvidence,
      source: "self_reported",
      sortOrder: nextSort(existingRows.map((row) => row.sortOrder)),
    });
  }

  return getCareerProfile(userId);
}

export async function deleteCareerSkill(
  userId: string,
  id: string,
): Promise<CareerProfileView> {
  await deleteOwned(careerSkill, userId, id, "Skill not found");
  return getCareerProfile(userId);
}

export async function upsertCareerAcademic(
  userId: string,
  input: CareerAcademicWrite,
): Promise<CareerProfileView> {
  const profile = await ensureCareerProfile(userId);

  if (input.id) {
    const owned = await assertOwned<AcademicRow>(
      careerAcademic,
      userId,
      input.id,
      "Academic record not found",
    );
    await db
      .update(careerAcademic)
      .set({
        institution: input.institution.trim(),
        studyType:
          "studyType" in input ? (input.studyType ?? null) : owned.studyType,
        area: "area" in input ? (input.area ?? null) : owned.area,
        startDate:
          "startDate" in input ? (input.startDate ?? null) : owned.startDate,
        endDate: "endDate" in input ? (input.endDate ?? null) : owned.endDate,
        score: "score" in input ? (input.score ?? null) : owned.score,
        isCurrent: input.isCurrent ?? owned.isCurrent,
        source: "self_reported",
        updatedAt: new Date(),
      })
      .where(eq(careerAcademic.id, owned.id));
  } else {
    const existing = await db
      .select({ sortOrder: careerAcademic.sortOrder })
      .from(careerAcademic)
      .where(eq(careerAcademic.userId, userId));
    await db.insert(careerAcademic).values({
      id: nanoid(),
      careerProfileId: profile.id,
      userId,
      institution: input.institution.trim(),
      studyType: input.studyType ?? null,
      area: input.area ?? null,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      score: input.score ?? null,
      isCurrent: input.isCurrent ?? false,
      source: "self_reported",
      sortOrder: nextSort(existing.map((row) => row.sortOrder)),
    });
  }

  return getCareerProfile(userId);
}

export async function deleteCareerAcademic(
  userId: string,
  id: string,
): Promise<CareerProfileView> {
  await deleteOwned(careerAcademic, userId, id, "Academic record not found");
  return getCareerProfile(userId);
}

export async function upsertCareerExperience(
  userId: string,
  input: CareerExperienceWrite,
): Promise<CareerProfileView> {
  const profile = await ensureCareerProfile(userId);

  if (input.id) {
    const owned = await assertOwned<ExperienceRow>(
      careerExperience,
      userId,
      input.id,
      "Experience record not found",
    );
    await db
      .update(careerExperience)
      .set({
        company: input.company.trim(),
        title: input.title.trim(),
        location:
          "location" in input ? (input.location ?? null) : owned.location,
        employmentType: input.employmentType ?? owned.employmentType,
        startDate:
          "startDate" in input ? (input.startDate ?? null) : owned.startDate,
        endDate: "endDate" in input ? (input.endDate ?? null) : owned.endDate,
        isCurrent: input.isCurrent ?? owned.isCurrent,
        summary: "summary" in input ? (input.summary ?? null) : owned.summary,
        highlights: input.highlights ?? asStringList(owned.highlights),
        source: "self_reported",
        updatedAt: new Date(),
      })
      .where(eq(careerExperience.id, owned.id));
  } else {
    const existing = await db
      .select({ sortOrder: careerExperience.sortOrder })
      .from(careerExperience)
      .where(eq(careerExperience.userId, userId));
    await db.insert(careerExperience).values({
      id: nanoid(),
      careerProfileId: profile.id,
      userId,
      company: input.company.trim(),
      title: input.title.trim(),
      location: input.location ?? null,
      employmentType: input.employmentType ?? "full_time",
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      isCurrent: input.isCurrent ?? false,
      summary: input.summary ?? null,
      highlights: input.highlights ?? [],
      source: "self_reported",
      sortOrder: nextSort(existing.map((row) => row.sortOrder)),
    });
  }

  return getCareerProfile(userId);
}

export async function deleteCareerExperience(
  userId: string,
  id: string,
): Promise<CareerProfileView> {
  await deleteOwned(
    careerExperience,
    userId,
    id,
    "Experience record not found",
  );
  return getCareerProfile(userId);
}

export async function upsertCareerTarget(
  userId: string,
  input: CareerTargetWrite,
): Promise<CareerProfileView> {
  const profile = await ensureCareerProfile(userId);
  const normalizedTitle = normalizeCareerKey(input.title);
  if (!normalizedTitle) {
    throw new CareerProfileError("Target role title is required", 400);
  }

  const existingRows = await db
    .select()
    .from(careerTargetRole)
    .where(eq(careerTargetRole.userId, userId));
  const byId = input.id
    ? existingRows.find((row) => row.id === input.id)
    : undefined;
  if (input.id && !byId) {
    throw new CareerProfileError("Target role not found", 404);
  }
  const byTitle = existingRows.find(
    (row) => row.normalizedTitle === normalizedTitle && row.id !== byId?.id,
  );
  if (byId && byTitle) {
    throw new CareerProfileError("That target role already exists", 409);
  }

  const target = byId ?? byTitle;
  const hasPrimary = existingRows.some(
    (row) => row.isPrimary && row.id !== target?.id,
  );
  let isPrimary = target?.isPrimary ?? false;
  if (input.isPrimary === true) isPrimary = true;
  else if (input.isPrimary === false) isPrimary = false;
  else if (!target && !hasPrimary) isPrimary = true;

  const id = target?.id ?? nanoid();
  if (isPrimary) {
    await db
      .update(careerTargetRole)
      .set({ isPrimary: false, updatedAt: new Date() })
      .where(
        and(eq(careerTargetRole.userId, userId), ne(careerTargetRole.id, id)),
      );
  }

  if (target) {
    await db
      .update(careerTargetRole)
      .set({
        title: input.title.trim(),
        normalizedTitle,
        seniority: input.seniority ?? target.seniority,
        isPrimary,
        source: "self_reported",
        updatedAt: new Date(),
      })
      .where(eq(careerTargetRole.id, target.id));
  } else {
    await db.insert(careerTargetRole).values({
      id,
      careerProfileId: profile.id,
      userId,
      title: input.title.trim(),
      normalizedTitle,
      seniority: input.seniority ?? "unspecified",
      isPrimary,
      source: "self_reported",
      sortOrder: nextSort(existingRows.map((row) => row.sortOrder)),
    });
  }

  return getCareerProfile(userId);
}

export async function deleteCareerTarget(
  userId: string,
  id: string,
): Promise<CareerProfileView> {
  await deleteOwned(careerTargetRole, userId, id, "Target role not found");
  return getCareerProfile(userId);
}

function nextHeader(
  existing: HeaderRow | null,
  draft: CareerDraft,
  legacySalaryInr: number | null,
  opts?: { refreshSegment?: boolean },
) {
  const sources = asFieldSources(existing?.fieldSources);
  const refreshSegment = opts?.refreshSegment ?? false;

  let segment = existing?.segment ?? null;
  if (!isLocked(sources, "segment", refreshSegment)) {
    segment = draft.segment;
    if (draft.segment) sources.segment = "inferred";
    else delete sources.segment;
  }

  let headline = existing?.headline ?? null;
  if (!isLocked(sources, "headline", false)) {
    headline = draft.headline;
    if (draft.headline) sources.headline = "resume";
    else delete sources.headline;
  }

  let city = existing?.city ?? null;
  let region = existing?.region ?? null;
  let countryCode = existing?.countryCode ?? "IN";
  if (!isLocked(sources, "location", false)) {
    city = draft.city;
    region = draft.region;
    countryCode = draft.countryCode;
    if (draft.city || draft.region) sources.location = "resume";
    else delete sources.location;
  }

  let experienceMonths = existing?.experienceMonths ?? null;
  if (!isLocked(sources, "yearsOfExperience", false)) {
    experienceMonths =
      draft.yearsOfExperience == null
        ? null
        : yearsToMonths(draft.yearsOfExperience);
    if (experienceMonths != null) sources.yearsOfExperience = "resume";
    else delete sources.yearsOfExperience;
  }

  let currentPayPeriod = existing?.currentPayPeriod ?? "annual";
  let currentPayInr = existing?.currentPayInr ?? null;
  let currentSalaryInr = existing?.currentSalaryInr ?? null;
  if (!isLocked(sources, "currentSalaryInr", false)) {
    currentPayPeriod = "annual";
    currentPayInr = legacySalaryInr;
    currentSalaryInr = legacySalaryInr;
    if (legacySalaryInr != null) sources.currentSalaryInr = "legacy_profile";
    else delete sources.currentSalaryInr;
  }

  return {
    segment,
    headline,
    city,
    region,
    countryCode,
    currentPayPeriod,
    currentPayInr,
    currentSalaryInr,
    experienceMonths,
    fieldSources: cleanSources(sources),
  };
}

async function syncAcademics(
  careerProfileId: string,
  userId: string,
  incoming: DraftAcademic[],
) {
  const existing = await db
    .select()
    .from(careerAcademic)
    .where(eq(careerAcademic.userId, userId));

  await reconcileSourced({
    existing,
    contentKeyOf: academicKey,
    remove: async (id) => {
      await db.delete(careerAcademic).where(eq(careerAcademic.id, id));
    },
    incoming: incoming.map((item) => ({
      sourceItemId: item.sourceItemId,
      contentKey: academicKey(item),
      write: async (id, isNew) => {
        const values = {
          careerProfileId,
          userId,
          institution: item.institution,
          studyType: item.studyType,
          area: item.area,
          startDate: item.startDate,
          endDate: item.endDate,
          score: item.score,
          isCurrent: item.isCurrent,
          source: "resume" as const,
          sourceItemId: item.sourceItemId,
          sortOrder: item.sortOrder,
          updatedAt: new Date(),
        };
        if (isNew) {
          await db.insert(careerAcademic).values({ id, ...values });
        } else {
          await db
            .update(careerAcademic)
            .set(values)
            .where(eq(careerAcademic.id, id));
        }
      },
    })),
  });
}

async function syncExperience(
  careerProfileId: string,
  userId: string,
  incoming: DraftExperience[],
) {
  const existing = await db
    .select()
    .from(careerExperience)
    .where(eq(careerExperience.userId, userId));

  await reconcileSourced({
    existing,
    contentKeyOf: experienceKey,
    remove: async (id) => {
      await db.delete(careerExperience).where(eq(careerExperience.id, id));
    },
    incoming: incoming.map((item) => ({
      sourceItemId: item.sourceItemId,
      contentKey: experienceKey(item),
      write: async (id, isNew) => {
        const values = {
          careerProfileId,
          userId,
          company: item.company,
          title: item.title,
          location: item.location,
          employmentType: item.employmentType,
          startDate: item.startDate,
          endDate: item.endDate,
          isCurrent: item.isCurrent,
          summary: item.summary,
          highlights: item.highlights,
          source: "resume" as const,
          sourceItemId: item.sourceItemId,
          sortOrder: item.sortOrder,
          updatedAt: new Date(),
        };
        if (isNew) {
          await db.insert(careerExperience).values({ id, ...values });
        } else {
          await db
            .update(careerExperience)
            .set(values)
            .where(eq(careerExperience.id, id));
        }
      },
    })),
  });
}

async function syncSkills(
  careerProfileId: string,
  userId: string,
  incoming: DraftSkill[],
) {
  const existing = await db
    .select()
    .from(careerSkill)
    .where(eq(careerSkill.userId, userId));
  const derivedKeys = new Set(incoming.map((skill) => skill.normalizedName));

  for (const skill of incoming) {
    const match = existing.find(
      (row) => row.normalizedName === skill.normalizedName,
    );
    if (!match) {
      await db.insert(careerSkill).values({
        id: nanoid(),
        careerProfileId,
        userId,
        name: skill.name,
        normalizedName: skill.normalizedName,
        category: skill.category,
        level: skill.level,
        levelLocked: false,
        evidence: skill.evidence,
        source: "resume",
        sortOrder: skill.sortOrder,
      });
      continue;
    }
    if (match.source === "self_reported") {
      await db
        .update(careerSkill)
        .set({
          level: match.levelLocked ? match.level : skill.level,
          category:
            match.category === "other" && skill.category !== "other"
              ? skill.category
              : match.category,
          evidence: unionEvidence(asEvidence(match.evidence), skill.evidence),
          updatedAt: new Date(),
        })
        .where(eq(careerSkill.id, match.id));
      continue;
    }
    await db
      .update(careerSkill)
      .set({
        careerProfileId,
        name: skill.name,
        category: skill.category,
        level: match.levelLocked ? match.level : skill.level,
        evidence: unionEvidence(asEvidence(match.evidence), skill.evidence),
        source: "resume",
        sortOrder: skill.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(careerSkill.id, match.id));
  }

  for (const row of existing) {
    if (row.source !== "resume" || derivedKeys.has(row.normalizedName)) {
      continue;
    }
    if (asEvidence(row.evidence).some((item) => item.kind === "verified")) {
      continue;
    }
    await db.delete(careerSkill).where(eq(careerSkill.id, row.id));
  }
}

async function syncTargets(
  careerProfileId: string,
  userId: string,
  incoming: DraftTarget[],
) {
  const existing = await db
    .select()
    .from(careerTargetRole)
    .where(eq(careerTargetRole.userId, userId));

  await reconcileSourced({
    existing,
    contentKeyOf: (row) => row.normalizedTitle,
    remove: async (id) => {
      await db.delete(careerTargetRole).where(eq(careerTargetRole.id, id));
    },
    incoming: incoming.map((item) => ({
      sourceItemId: null,
      contentKey: item.normalizedTitle,
      write: async (id, isNew) => {
        const values = {
          careerProfileId,
          userId,
          title: item.title,
          normalizedTitle: item.normalizedTitle,
          seniority: item.seniority,
          isPrimary: item.isPrimary,
          source: "resume" as const,
          sortOrder: item.sortOrder,
          updatedAt: new Date(),
        };
        if (isNew) {
          await db.insert(careerTargetRole).values({ id, ...values });
        } else {
          await db
            .update(careerTargetRole)
            .set(values)
            .where(eq(careerTargetRole.id, id));
        }
      },
    })),
  });

  await normalizePrimaryTarget(userId);
}

async function normalizePrimaryTarget(userId: string) {
  const rows = await db
    .select()
    .from(careerTargetRole)
    .where(eq(careerTargetRole.userId, userId))
    .orderBy(asc(careerTargetRole.sortOrder));
  if (rows.length === 0) return;

  const manualPrimary = rows.find(
    (row) => row.source === "self_reported" && row.isPrimary,
  );
  const primary = manualPrimary ?? rows.find((row) => row.isPrimary) ?? rows[0];
  if (!primary) return;

  await db
    .update(careerTargetRole)
    .set({ isPrimary: false, updatedAt: new Date() })
    .where(
      and(
        eq(careerTargetRole.userId, userId),
        ne(careerTargetRole.id, primary.id),
      ),
    );
  if (!primary.isPrimary) {
    await db
      .update(careerTargetRole)
      .set({ isPrimary: true, updatedAt: new Date() })
      .where(eq(careerTargetRole.id, primary.id));
  }
}

type SourcedRow = {
  id: string;
  source: "resume" | "self_reported";
  sourceItemId?: string | null;
};

async function reconcileSourced<T extends SourcedRow>(opts: {
  existing: T[];
  incoming: Array<{
    sourceItemId: string | null;
    contentKey: string;
    write: (id: string, isNew: boolean) => Promise<void>;
  }>;
  contentKeyOf: (row: T) => string;
  remove: (id: string) => Promise<void>;
}) {
  const used = new Set<string>();
  for (const item of opts.incoming) {
    const manual = opts.existing.find(
      (row) =>
        row.source === "self_reported" &&
        ((item.sourceItemId != null &&
          row.sourceItemId === item.sourceItemId) ||
          opts.contentKeyOf(row) === item.contentKey),
    );
    if (manual) {
      used.add(manual.id);
      continue;
    }
    const bySourceId = opts.existing.find(
      (row) =>
        row.source === "resume" &&
        !used.has(row.id) &&
        item.sourceItemId != null &&
        row.sourceItemId === item.sourceItemId,
    );
    const byContent = opts.existing.find(
      (row) =>
        row.source === "resume" &&
        !used.has(row.id) &&
        opts.contentKeyOf(row) === item.contentKey,
    );
    const match = bySourceId ?? byContent;
    const id = match?.id ?? nanoid();
    used.add(id);
    await item.write(id, !match);
  }
  for (const row of opts.existing) {
    if (row.source === "resume" && !used.has(row.id)) {
      await opts.remove(row.id);
    }
  }
}

async function loadResumeContext(userId: string) {
  const [profile] = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
    .limit(1);

  let resumeRow:
    | { id: string; data: unknown; targetRole: string | null }
    | undefined;

  if (profile?.primaryResumeId) {
    const [primary] = await db
      .select({
        id: resume.id,
        data: resume.data,
        targetRole: resume.targetRole,
      })
      .from(resume)
      .where(
        and(eq(resume.id, profile.primaryResumeId), eq(resume.userId, userId)),
      )
      .limit(1);
    resumeRow = primary;
  }

  if (!resumeRow) {
    const [latest] = await db
      .select({
        id: resume.id,
        data: resume.data,
        targetRole: resume.targetRole,
      })
      .from(resume)
      .where(eq(resume.userId, userId))
      .orderBy(desc(resume.updatedAt))
      .limit(1);
    resumeRow = latest;
  }

  return {
    resumeId: resumeRow?.id ?? null,
    targetRole: resumeRow?.targetRole ?? null,
    data: normalizeResumeData(resumeRow?.data ?? profile?.resumeRaw ?? null),
    legacySalaryInr: profile?.currentSalary ?? null,
  };
}

async function loadHeader(userId: string): Promise<HeaderRow | null> {
  const [row] = await db
    .select()
    .from(careerProfile)
    .where(eq(careerProfile.userId, userId))
    .limit(1);
  return row ?? null;
}

async function loadView(userId: string): Promise<CareerProfileView | null> {
  const header = await loadHeader(userId);
  if (!header) return null;

  const [academics, experience, skills, targetRoles, latestAnalysis] =
    await Promise.all([
      db
        .select()
        .from(careerAcademic)
        .where(eq(careerAcademic.userId, userId))
        .orderBy(asc(careerAcademic.sortOrder), asc(careerAcademic.createdAt)),
      db
        .select()
        .from(careerExperience)
        .where(eq(careerExperience.userId, userId))
        .orderBy(
          asc(careerExperience.sortOrder),
          asc(careerExperience.createdAt),
        ),
      db
        .select()
        .from(careerSkill)
        .where(eq(careerSkill.userId, userId))
        .orderBy(asc(careerSkill.sortOrder), asc(careerSkill.name)),
      db
        .select()
        .from(careerTargetRole)
        .where(eq(careerTargetRole.userId, userId))
        .orderBy(
          desc(careerTargetRole.isPrimary),
          asc(careerTargetRole.sortOrder),
        ),
      db
        .select({ id: resumeAnalysis.id, jobs: resumeAnalysis.jobs })
        .from(resumeAnalysis)
        .where(eq(resumeAnalysis.userId, userId))
        .orderBy(desc(resumeAnalysis.createdAt))
        .limit(1),
    ]);

  const segment = oneOf(header.segment, CAREER_SEGMENTS);
  const currentPeriod =
    oneOf(header.currentPayPeriod, CAREER_PAY_PERIODS) ?? "annual";
  const expectedPeriod =
    oneOf(header.expectedPayPeriod, CAREER_PAY_PERIODS) ?? "annual";
  const analysis = latestAnalysis[0] ?? null;

  return {
    id: header.id,
    userId: header.userId,
    segment,
    headline: header.headline,
    location: {
      city: header.city,
      region: header.region,
      countryCode: header.countryCode || "IN",
    },
    compensation: {
      currency: "INR",
      stipend: usesMonthlyStipend({
        segment,
        experience: experience.map((row) => ({
          employmentType:
            oneOf(row.employmentType, CAREER_EMPLOYMENT_TYPES) ?? "full_time",
          isCurrent: row.isCurrent,
        })),
      }),
      current: {
        period: currentPeriod,
        amountInr: header.currentPayInr,
        annualInr: header.currentSalaryInr,
      },
      expected: {
        period: expectedPeriod,
        minInr: header.expectedMinInr,
        maxInr: header.expectedMaxInr,
        minAnnualInr: header.expectedMinAnnualInr,
        maxAnnualInr: header.expectedMaxAnnualInr,
      },
      noticePeriodDays: header.noticePeriodDays,
    },
    yearsOfExperience:
      header.experienceMonths == null
        ? null
        : monthsToYears(header.experienceMonths),
    openToRelocate: header.openToRelocate,
    fieldSources: asFieldSources(header.fieldSources),
    derivedFromResumeId: header.derivedFromResumeId,
    lastDerivedAt: iso(header.lastDerivedAt),
    academics: academics.map(mapAcademic),
    experience: experience.map(mapExperience),
    skills: skills.map(mapSkill),
    targetRoles: targetRoles.map(mapTarget),
    intelligence: scoreCareerProfile({
      segment,
      skillNames: skills.map((skill) => skill.name),
      targetRoles: targetRoles.map((role) => ({
        id: role.id,
        title: role.title,
        isPrimary: role.isPrimary,
      })),
      hasPay:
        header.currentSalaryInr != null ||
        header.expectedMinAnnualInr != null ||
        header.expectedMaxAnnualInr != null,
      jobs: asAnalysisJobs(analysis?.jobs),
      analysisId: analysis?.id ?? null,
    }),
    createdAt: requiredIso(header.createdAt),
    updatedAt: requiredIso(header.updatedAt),
  };
}

function mapAcademic(row: AcademicRow): CareerAcademicRecord {
  return {
    id: row.id,
    institution: row.institution,
    studyType: row.studyType,
    area: row.area,
    startDate: row.startDate,
    endDate: row.endDate,
    score: row.score,
    isCurrent: row.isCurrent,
    source: row.source,
    sourceItemId: row.sourceItemId,
    sortOrder: row.sortOrder,
  };
}

function mapExperience(row: ExperienceRow): CareerExperienceRecord {
  return {
    id: row.id,
    company: row.company,
    title: row.title,
    location: row.location,
    employmentType:
      oneOf(row.employmentType, CAREER_EMPLOYMENT_TYPES) ?? "full_time",
    startDate: row.startDate,
    endDate: row.endDate,
    isCurrent: row.isCurrent,
    summary: row.summary,
    highlights: asStringList(row.highlights),
    source: row.source,
    sourceItemId: row.sourceItemId,
    sortOrder: row.sortOrder,
  };
}

function mapSkill(row: SkillRow): CareerSkillRecord {
  return {
    id: row.id,
    name: row.name,
    normalizedName: row.normalizedName,
    category: oneOf(row.category, CAREER_SKILL_CATEGORIES) ?? "other",
    level: oneOf(row.level, CAREER_SKILL_LEVELS) ?? "unspecified",
    levelLocked: row.levelLocked,
    evidence: asEvidence(row.evidence),
    source: row.source,
    sortOrder: row.sortOrder,
  };
}

function mapTarget(row: TargetRow): CareerTargetRoleRecord {
  return {
    id: row.id,
    title: row.title,
    normalizedTitle: row.normalizedTitle,
    seniority: oneOf(row.seniority, CAREER_TARGET_SENIORITIES) ?? "unspecified",
    isPrimary: row.isPrimary,
    source: row.source,
    sortOrder: row.sortOrder,
  };
}

async function assertOwned<T extends { id: string; userId: string }>(
  table:
    | typeof careerAcademic
    | typeof careerExperience
    | typeof careerSkill
    | typeof careerTargetRole,
  userId: string,
  id: string,
  message: string,
): Promise<T> {
  const rows = await db
    .select()
    .from(table)
    .where(and(eq(table.id, id), eq(table.userId, userId)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new CareerProfileError(message, 404);
  return row as T;
}

async function deleteOwned(
  table:
    | typeof careerAcademic
    | typeof careerExperience
    | typeof careerSkill
    | typeof careerTargetRole,
  userId: string,
  id: string,
  message: string,
) {
  const rows = await db
    .select({ id: table.id })
    .from(table)
    .where(and(eq(table.id, id), eq(table.userId, userId)))
    .limit(1);
  if (!rows[0]) throw new CareerProfileError(message, 404);
  await db.delete(table).where(eq(table.id, rows[0].id));
}

function academicKey(row: {
  institution: string;
  studyType: string | null;
  area: string | null;
  startDate: string | null;
}): string {
  return [
    normalizeCareerKey(row.institution),
    normalizeCareerKey(row.studyType ?? ""),
    normalizeCareerKey(row.area ?? ""),
    row.startDate ?? "",
  ].join("|");
}

function experienceKey(row: {
  company: string;
  title: string;
  startDate: string | null;
}): string {
  return [
    normalizeCareerKey(row.company),
    normalizeCareerKey(row.title),
    row.startDate ?? "",
  ].join("|");
}

function isLocked(
  sources: CareerFieldSources,
  key: CareerFieldKey,
  force: boolean,
): boolean {
  if (force) return false;
  return sources[key] === "self_reported";
}

function asFieldSources(value: unknown): CareerFieldSources {
  if (!value || typeof value !== "object") return {};
  const record = value as Record<string, unknown>;
  const out: CareerFieldSources = {};
  for (const key of CAREER_FIELD_KEYS) {
    const source = record[key];
    if (
      typeof source === "string" &&
      FIELD_SOURCES.has(source as CareerFieldSource)
    ) {
      out[key] = source as CareerFieldSource;
    }
  }
  return out;
}

function cleanSources(sources: CareerFieldSources): CareerFieldSources {
  const out: CareerFieldSources = {};
  for (const key of CAREER_FIELD_KEYS) {
    const value = sources[key];
    if (value) out[key] = value;
  }
  return out;
}

function asEvidence(value: unknown): SkillEvidence[] {
  if (!Array.isArray(value)) return [];
  const out: SkillEvidence[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const record = item as { kind?: unknown; label?: unknown; refId?: unknown };
    if (
      typeof record.kind !== "string" ||
      !SKILL_EVIDENCE_KINDS.includes(
        record.kind as (typeof SKILL_EVIDENCE_KINDS)[number],
      )
    ) {
      continue;
    }
    if (typeof record.label !== "string" || record.label.trim().length === 0) {
      continue;
    }
    const evidence: SkillEvidence = {
      kind: record.kind as SkillEvidence["kind"],
      label: record.label.trim(),
    };
    if (typeof record.refId === "string" && record.refId.trim()) {
      evidence.refId = record.refId.trim();
    }
    if (evidence.kind === "verified") {
      const score = (item as { score?: unknown }).score;
      const verifiedAt = (item as { verifiedAt?: unknown }).verifiedAt;
      if (
        typeof score === "number" &&
        Number.isInteger(score) &&
        score >= 0 &&
        score <= 100
      ) {
        evidence.score = score;
      }
      if (
        typeof verifiedAt === "string" &&
        !Number.isNaN(Date.parse(verifiedAt))
      ) {
        evidence.verifiedAt = new Date(verifiedAt).toISOString();
      }
    }
    out.push(evidence);
    if (out.length >= 12) break;
  }
  return out;
}

function replaceVerifiedEvidence(
  current: SkillEvidence[],
  verified: SkillEvidence,
): SkillEvidence[] {
  const rest = current.filter((item) => item.kind !== "verified").slice(0, 11);
  return [...rest, verified];
}

function unionEvidence(
  current: SkillEvidence[],
  incoming: SkillEvidence[],
): SkillEvidence[] {
  const out = [...current];
  for (const item of incoming) {
    const key = `${item.kind}|${item.label.toLowerCase()}|${item.refId ?? ""}`;
    const exists = out.some(
      (entry) =>
        `${entry.kind}|${entry.label.toLowerCase()}|${entry.refId ?? ""}` ===
        key,
    );
    if (exists) continue;
    if (out.length >= 12) break;
    out.push(item);
  }
  return out;
}

function asAnalysisJobs(
  value: unknown,
): { title: string; requiredSkills: string[] }[] {
  if (!Array.isArray(value)) return [];
  const jobs: { title: string; requiredSkills: string[] }[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const record = item as { title?: unknown; requiredSkills?: unknown };
    const title = typeof record.title === "string" ? record.title : "";
    const requiredSkills = Array.isArray(record.requiredSkills)
      ? record.requiredSkills.filter(
          (skill): skill is string => typeof skill === "string",
        )
      : [];
    if (!title.trim() && requiredSkills.length === 0) continue;
    jobs.push({ title, requiredSkills });
  }
  return jobs;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function oneOf<T extends string>(
  value: string | null | undefined,
  allowed: readonly T[],
): T | null {
  if (!value) return null;
  return allowed.includes(value as T) ? (value as T) : null;
}

function nextSort(values: number[]): number {
  return values.reduce((max, value) => Math.max(max, value), -1) + 1;
}

function iso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function requiredIso(value: Date | string): string {
  return iso(value) ?? new Date(0).toISOString();
}
