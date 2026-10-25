import assert from "node:assert/strict";
import test from "node:test";
import { recommendNextSteps } from "@/lib/career/next-steps";

const base = {
  segment: "professional" as const,
  skillCount: 2,
  targetCount: 1,
  hasPay: true,
  hasAnalysis: true,
  hasResume: true,
  coachEnabled: false,
  topGap: null,
};

test("an empty file points at onboarding, then a target and an analysis", () => {
  const steps = recommendNextSteps({
    ...base,
    segment: null,
    skillCount: 0,
    targetCount: 0,
    hasPay: false,
    hasAnalysis: false,
    hasResume: false,
  });
  assert.deepEqual(
    steps.map((step) => step.href),
    ["/onboarding", "/resumes", "/analyze", "/intelligence#pay"],
  );
  assert.equal(
    steps.some((step) => step.href === "/skill-coach"),
    false,
  );
});

test("a skill gap links to the resume, and to Skill Coach only when the flag is on", () => {
  const gap = { skill: "Go", priority: "high" as const };
  const hidden = recommendNextSteps({
    ...base,
    topGap: gap,
    coachEnabled: false,
  });
  assert.equal(
    hidden.some((step) => step.action === "coach"),
    false,
  );
  assert.equal(hidden[0]?.href, "/resumes");

  const shown = recommendNextSteps({
    ...base,
    topGap: gap,
    coachEnabled: true,
  });
  assert.equal(shown[1]?.href, "/skill-coach");
  assert.equal(shown[1]?.title, "Practice Go");
});

test("a resume that already exists does not send the member back to onboarding", () => {
  const steps = recommendNextSteps({
    ...base,
    skillCount: 0,
    hasResume: true,
    hasAnalysis: false,
  });
  assert.equal(steps[0]?.href, "/resumes");
  assert.equal(steps[1]?.href, "/analyze");
});
