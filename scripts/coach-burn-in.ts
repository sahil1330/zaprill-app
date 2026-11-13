/**
 * Dev-branch burn-in for Skill Coach. Refuses any host other than the
 * Neon development endpoint. Deletes the users it creates.
 *
 *   pnpm exec tsx scripts/coach-burn-in.ts
 */
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import db from "@/db";
import {
  appSettings,
  careerProfile,
  careerSkill,
  careerTargetRole,
  coachTask,
  resumeAnalysis,
  user,
} from "@/db/schema";
import { isCoachEnabled } from "@/lib/app-settings";
import { getCareerProfile } from "@/services/career/career-profile.service";
import { settleFailure } from "@/services/coach/context.service";
import { assertCoachModelsEnabled } from "@/services/coach/entitlement.service";
import { CoachServiceError } from "@/services/coach/errors";
import { COACH_LIMITS, quotaCap } from "@/services/coach/limits";
import { openCoachMeter, readCoachUsage } from "@/services/coach/meter.service";
import { commitGradedAttempt } from "@/services/coach/practice.service";
import {
  getOwnedPlan,
  getPlanView,
  syncCoachPrograms,
} from "@/services/coach/program.service";

const DEV_HOST = "ep-fragrant-unit-a1hitczr";
const PROD_HOST = "ep-damp-mud-a1l53ng6";

function assertDevDatabase(): void {
  const raw = process.env.DATABASE_URL ?? "";
  const host = new URL(raw).hostname;
  if (host.includes(PROD_HOST) || host.includes("damp-mud")) {
    throw new Error("Refusing to run against production");
  }
  if (!host.startsWith(DEV_HOST)) {
    throw new Error(`Refusing unexpected database host: ${host}`);
  }
}

function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  assertDevDatabase();
  const userA = nanoid();
  const userB = nanoid();
  const results: string[] = [];

  try {
    const [setting] = await db
      .select({ value: appSettings.value })
      .from(appSettings)
      .where(eq(appSettings.key, "coach_enabled"))
      .limit(1);
    check(setting?.value === "false", "coach_enabled must be false after 0018");
    check((await isCoachEnabled()) === false, "isCoachEnabled must be false");
    results.push("kill switch is false");

    await db.insert(user).values([
      {
        id: userA,
        name: "Coach Burn-in A",
        email: `coach-burnin-a-${userA}@example.com`,
        emailVerified: false,
      },
      {
        id: userB,
        name: "Coach Burn-in B",
        email: `coach-burnin-b-${userB}@example.com`,
        emailVerified: false,
      },
    ]);

    const profileA = nanoid();
    const profileB = nanoid();
    await db.insert(careerProfile).values([
      { id: profileA, userId: userA, segment: "fresher" },
      { id: profileB, userId: userB, segment: "professional" },
    ]);
    await db.insert(careerTargetRole).values([
      {
        id: nanoid(),
        careerProfileId: profileA,
        userId: userA,
        title: "Backend Engineer",
        normalizedTitle: "backend engineer",
        isPrimary: true,
        source: "self_reported",
      },
      {
        id: nanoid(),
        careerProfileId: profileA,
        userId: userA,
        title: "Data Engineer",
        normalizedTitle: "data engineer",
        isPrimary: false,
        source: "self_reported",
      },
    ]);
    await db.insert(careerSkill).values({
      id: nanoid(),
      careerProfileId: profileA,
      userId: userA,
      name: "TypeScript",
      normalizedName: "typescript",
      category: "language",
      source: "self_reported",
    });

    const analysisId = nanoid();
    await db.insert(resumeAnalysis).values({
      id: analysisId,
      userId: userA,
      advice: "Focus on React.",
      skillGaps: [
        {
          skill: "React",
          frequency: 4,
          priority: "high",
          category: "framework",
        },
        {
          skill: "Communication",
          frequency: 3,
          priority: "high",
          category: "soft",
        },
        {
          skill: "TypeScript",
          frequency: 5,
          priority: "high",
          category: "language",
        },
      ],
      roadmap: [
        {
          skill: "React",
          priority: "high",
          estimatedTime: "2 weeks",
          why: "Roles ask for it.",
          resources: [],
          category: "framework",
        },
      ],
    });

    const first = await syncCoachPrograms(userA);
    check(
      first.programs.length === 1,
      "free tier opened more than one program",
    );
    check(
      first.programs[0]?.roleTitle === "Backend Engineer",
      "primary target was not the free program",
    );
    check(
      first.programs[0]?.plans.length === 1,
      "expected only the React plan",
    );
    check(
      first.programs[0]?.plans[0]?.skillKey === "react",
      "skill key mismatch",
    );
    check(
      first.programs[0]?.plans[0]?.outline.why === "Roles ask for it.",
      "roadmap outline was not copied",
    );
    check(
      first.coachEnabled === false,
      "program read should report the switch",
    );
    const reactPlanId = first.programs[0].plans[0].id;
    results.push("program refresh created the primary React plan");

    await db
      .update(resumeAnalysis)
      .set({
        skillGaps: [
          {
            skill: "React",
            frequency: 4,
            priority: "medium",
            category: "framework",
          },
          {
            skill: "PostgreSQL",
            frequency: 3,
            priority: "high",
            category: "database",
          },
        ],
      })
      .where(eq(resumeAnalysis.id, analysisId));

    const second = await syncCoachPrograms(userA);
    const keys = second.programs[0]?.plans
      .filter((plan) => plan.status === "active")
      .map((plan) => plan.skillKey)
      .sort();
    check(
      JSON.stringify(keys) === JSON.stringify(["postgresql", "react"]),
      `refresh did not keep React and add PostgreSQL: ${keys?.join(",")}`,
    );
    const reactAgain = second.programs[0]?.plans.find(
      (plan) => plan.skillKey === "react",
    );
    check(reactAgain?.id === reactPlanId, "refresh replaced the React plan");
    check(reactAgain?.priority === "medium", "refresh did not update priority");
    const third = await syncCoachPrograms(userA);
    const thirdReact = third.programs[0]?.plans.find(
      (plan) => plan.skillKey === "react",
    );
    check(
      thirdReact?.id === reactPlanId,
      "unchanged fingerprint rewrote the plan",
    );
    results.push("program refresh kept progress and added the new gap");

    let disabled = false;
    try {
      await assertCoachModelsEnabled();
    } catch (error) {
      disabled =
        error instanceof CoachServiceError &&
        error.status === 503 &&
        error.body.error === "COACH_DISABLED";
    }
    check(disabled, "tutor did not stop while coach_enabled is false");
    const beforeCap = await readCoachUsage(userA);
    check(beforeCap.tutorTurns === 0, "disabled tutor still consumed a turn");
    results.push("disabled tutor did not consume quota");

    const tutorCap = quotaCap("free", "tutor");
    check(
      tutorCap === COACH_LIMITS.tiers.free.tutorTurnsPerDay,
      "tutor cap drifted",
    );
    for (let i = 0; i < tutorCap; i++) {
      const meter = await openCoachMeter({
        userId: userA,
        tier: "free",
        quota: "tutor",
        spend: "tutor",
      });
      await meter.reconcile(1);
    }
    let tutorBlocked = false;
    try {
      await openCoachMeter({
        userId: userA,
        tier: "free",
        quota: "tutor",
        spend: "tutor",
      });
    } catch (error) {
      tutorBlocked =
        error instanceof CoachServiceError &&
        error.body.error === "COACH_LIMIT" &&
        error.body.capability === "tutor";
    }
    check(tutorBlocked, "free tutor cap did not block the next turn");
    results.push(`free tutor cap blocked turn ${tutorCap + 1}`);

    const gradeMeter = await openCoachMeter({
      userId: userA,
      tier: "free",
      quota: "grade",
      spend: "grade",
    });
    await settleFailure(gradeMeter, new Error("schema"));
    const afterRefund = await readCoachUsage(userA);
    check(
      afterRefund.practiceGrades === 0,
      `parse failure left practice grades at ${afterRefund.practiceGrades}`,
    );
    const gradeAgain = await openCoachMeter({
      userId: userA,
      tier: "free",
      quota: "grade",
      spend: "grade",
    });
    await gradeAgain.reconcile(1);
    let gradeBlocked = false;
    try {
      await openCoachMeter({
        userId: userA,
        tier: "free",
        quota: "grade",
        spend: "grade",
      });
    } catch (error) {
      gradeBlocked =
        error instanceof CoachServiceError && error.body.capability === "grade";
    }
    check(
      gradeBlocked,
      "refunded grade did not restore exactly one weekly test",
    );
    results.push("parse-failure refund restored the weekly test");

    const taskId = nanoid();
    await db.insert(coachTask).values({
      id: taskId,
      planId: reactPlanId,
      kind: "exercise",
      prompt: "Explain React state.",
      rubric: { points: ["mentions state"] },
    });
    const passed = await commitGradedAttempt({
      userId: userA,
      planId: reactPlanId,
      taskId,
      skillKey: "react",
      answer: "State is data a component owns.",
      score: COACH_LIMITS.passScore,
      feedback: "Covers the idea.",
    });
    check(passed.passed && passed.verified, "passing grade did not verify");
    const profile = await getCareerProfile(userA);
    const reactSkill = profile.skills.find(
      (skill) => skill.normalizedName === "react",
    );
    const evidence = reactSkill?.evidence.find(
      (item) => item.kind === "verified",
    );
    check(
      evidence?.score === COACH_LIMITS.passScore,
      "verified score mismatch",
    );
    check(evidence?.label === "Verified on Zaprill", "verified label mismatch");
    const viewed = await getPlanView(userA, reactPlanId);
    check(
      viewed.plan?.progress.state === "demonstrated",
      "progress did not become demonstrated",
    );
    results.push("passing test wrote verified evidence");

    check(
      (await getOwnedPlan(userB, reactPlanId)) === null,
      "user B could read user A's plan",
    );
    const foreign = await getPlanView(userB, reactPlanId);
    check(foreign.plan === null, "user B received user A's plan view");
    check(
      foreign.programs.every((program) => program.id !== first.programs[0]?.id),
      "user B received user A's program",
    );
    results.push("tenant isolation held");

    console.log(results.map((line) => `ok ${line}`).join("\n"));
  } finally {
    await db.delete(user).where(eq(user.id, userA));
    await db.delete(user).where(eq(user.id, userB));
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
