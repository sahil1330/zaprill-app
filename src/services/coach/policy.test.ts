import assert from "node:assert/strict";
import test from "node:test";
import {
  gapFingerprint,
  prepareCoachGaps,
  shellOutline,
} from "@/services/coach/gaps";
import {
  COACH_LIMITS,
  isPassingScore,
  monthlySpendCeilingPaise,
  nextSpendPaise,
  periodStartFor,
  quotaAllowed,
  quotaCap,
  refundedCount,
  reservePaiseFor,
  spendAllowed,
  tierFromPlanCategory,
  upgradeTier,
  usdToPaise,
  utcWeekStart,
} from "@/services/coach/limits";
import { actualPaise } from "@/services/coach/model";
import { COACH_LANGUAGE_RULES } from "@/services/coach/prompts";
import type { SkillGap } from "@/types";

test("free interactive limits stay in COACH_LIMITS", () => {
  const free = COACH_LIMITS.tiers.free;
  assert.equal(quotaCap("free", "tutor"), free.tutorTurnsPerDay);
  assert.equal(quotaCap("free", "grade"), free.gradedPracticePerWeek);
  assert.equal(quotaCap("free", "mock"), free.mockInterviewsPerMonth);
  assert.equal(free.activePrograms, 1);
  assert.equal(
    monthlySpendCeilingPaise("free"),
    free.monthlySpendCeilingInr * 100,
  );
  assert.equal(
    monthlySpendCeilingPaise("pro"),
    COACH_LIMITS.tiers.pro.monthlySpendCeilingInr * 100,
  );
  assert.equal(
    monthlySpendCeilingPaise("max"),
    COACH_LIMITS.tiers.max.monthlySpendCeilingInr * 100,
  );
});

test("quota and spend decisions read the passed cap", () => {
  const cap = quotaCap("free", "tutor");
  assert.equal(quotaAllowed(cap - 1, cap), true);
  assert.equal(quotaAllowed(cap, cap), false);
  const ceiling = monthlySpendCeilingPaise("free");
  const reserve = reservePaiseFor("tutor");
  assert.equal(spendAllowed(ceiling - reserve, reserve, ceiling), true);
  assert.equal(spendAllowed(ceiling - reserve + 1, reserve, ceiling), false);
});

test("reconcile swaps the reservation for actual paise", () => {
  const reserve = reservePaiseFor("grade");
  const current = 1000 + reserve;
  assert.equal(nextSpendPaise(current, reserve, 20), 1020);
  assert.equal(nextSpendPaise(current, reserve, 0), 1000);
  assert.equal(refundedCount(0), 0);
  assert.equal(refundedCount(2), 1);
});

test("unknown paid category maps to pro", () => {
  assert.deepEqual(tierFromPlanCategory(false, "max"), {
    tier: "free",
    unknownCategory: false,
  });
  assert.deepEqual(tierFromPlanCategory(true, "mystery"), {
    tier: "pro",
    unknownCategory: true,
  });
  assert.equal(upgradeTier("free"), "pro");
  assert.equal(upgradeTier("max"), null);
});

test("week period starts on Monday UTC", () => {
  assert.equal(
    utcWeekStart(new Date("2026-10-22T18:30:00.000Z")),
    "2026-10-19",
  );
  assert.equal(
    periodStartFor("tutor", new Date("2026-10-22T18:30:00.000Z")),
    "2026-10-22",
  );
  assert.equal(
    periodStartFor("mock", new Date("2026-10-22T18:30:00.000Z")),
    "2026-10-01",
  );
});

test("pass threshold comes from config", () => {
  assert.equal(isPassingScore(COACH_LIMITS.passScore), true);
  assert.equal(isPassingScore(COACH_LIMITS.passScore - 1), false);
});

test("technical gaps drop owned, soft, and other skills", () => {
  const gaps: SkillGap[] = [
    { skill: "React", frequency: 4, priority: "high", category: "framework" },
    {
      skill: "Communication",
      frequency: 3,
      priority: "high",
      category: "soft",
    },
    { skill: "Excel", frequency: 2, priority: "medium", category: "other" },
    {
      skill: "PostgreSQL",
      frequency: 2,
      priority: "low",
      category: "database",
    },
  ];
  const prepared = prepareCoachGaps({
    skillGaps: gaps,
    roadmap: [
      {
        skill: "React",
        priority: "high",
        estimatedTime: "2 weeks",
        why: "Most matched roles ask for it.",
        resources: [],
        category: "framework",
      },
    ],
    ownedNormalizedNames: new Set(["postgresql"]),
  });
  assert.deepEqual(
    prepared.map((gap) => gap.skillKey),
    ["react"],
  );
  assert.equal(prepared[0]?.outline.why, "Most matched roles ask for it.");
  assert.equal(shellOutline("Go").modules[0]?.title, "Go");
  assert.equal(
    gapFingerprint(["react", "go"]),
    gapFingerprint(["go", "react"]),
  );
});

test("token cost uses output tokens only once", () => {
  const paise = usdToPaise(0.00515);
  assert.equal(paise, Math.round(0.00515 * COACH_LIMITS.usdInr * 100));
  assert.equal(actualPaise([10, null], 25), 25);
  assert.equal(actualPaise([10, 5], 25), 15);
});

test("language rules keep technical English and follow the user", () => {
  assert.match(COACH_LANGUAGE_RULES, /Hinglish/);
  assert.match(COACH_LANGUAGE_RULES, /React/);
  assert.match(COACH_LANGUAGE_RULES, /Hindi/);
});
