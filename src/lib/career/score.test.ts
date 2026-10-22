import assert from "node:assert/strict";
import test from "node:test";
import { scoreCareerProfile, titlesMatch } from "@/lib/career/score";

test("a score waits for analysis jobs, completeness does not", () => {
  const scored = scoreCareerProfile({
    segment: "professional",
    skillNames: ["TypeScript"],
    targetRoles: [{ id: "role-1", title: "Backend Engineer", isPrimary: true }],
    hasPay: true,
    jobs: [],
    analysisId: null,
  });

  assert.equal(scored.careerScore, null);
  assert.equal(scored.readiness, null);
  assert.equal(scored.completeness, 100);
  assert.equal(scored.basis, "none");
  assert.deepEqual(scored.skillGaps, []);
  assert.equal(scored.roles[0]?.readiness, null);
});

test("completeness is 25 points for each signal", () => {
  assert.equal(
    scoreCareerProfile({
      segment: "student",
      skillNames: [],
      targetRoles: [],
      hasPay: false,
      jobs: [],
      analysisId: null,
    }).completeness,
    25,
  );
  assert.equal(
    scoreCareerProfile({
      segment: null,
      skillNames: [],
      targetRoles: [],
      hasPay: false,
      jobs: [],
      analysisId: null,
    }).completeness,
    0,
  );
});

test("readiness uses the match engine and ignores a stored percentage", () => {
  const scored = scoreCareerProfile({
    segment: "professional",
    skillNames: ["TypeScript", "React"],
    targetRoles: [{ id: "be", title: "Backend Engineer", isPrimary: true }],
    hasPay: false,
    analysisId: "analysis-1",
    jobs: [
      {
        title: "Backend Engineer",
        requiredSkills: ["TypeScript", "Go"],
      },
      {
        title: "Product Designer",
        requiredSkills: ["Figma"],
      },
    ],
  });

  assert.equal(scored.roles[0]?.readiness, 50);
  assert.equal(scored.roles[0]?.jobCount, 1);
  assert.equal(scored.readiness, 50);
  assert.equal(scored.basis, "target_roles");
  assert.equal(scored.completeness, 75);
  assert.equal(scored.careerScore, 56);
  assert.deepEqual(
    scored.skillGaps.map((gap) => gap.skill),
    ["go"],
  );
  assert.equal(scored.skillGaps[0]?.priority, "high");
});

test("the primary target is counted twice in overall readiness", () => {
  const scored = scoreCareerProfile({
    segment: "professional",
    skillNames: ["TypeScript"],
    targetRoles: [
      { id: "be", title: "Backend Engineer", isPrimary: true },
      { id: "ds", title: "Data Scientist", isPrimary: false },
    ],
    hasPay: true,
    analysisId: "analysis-1",
    jobs: [
      { title: "Backend Engineer", requiredSkills: ["TypeScript"] },
      {
        title: "Senior Backend Engineer",
        requiredSkills: ["TypeScript", "Go"],
      },
      { title: "Data Scientist", requiredSkills: ["Python"] },
    ],
  });

  assert.equal(scored.roles[0]?.readiness, 75);
  assert.equal(scored.roles[1]?.readiness, 0);
  assert.equal(scored.readiness, 50);
  assert.equal(scored.basis, "target_roles");
});

test("unmatched targets fall back to every analysis job", () => {
  const scored = scoreCareerProfile({
    segment: null,
    skillNames: ["TypeScript"],
    targetRoles: [{ id: "chef", title: "Chef", isPrimary: true }],
    hasPay: false,
    analysisId: "analysis-1",
    jobs: [{ title: "Backend Engineer", requiredSkills: ["Go"] }],
  });

  assert.equal(scored.basis, "all_jobs");
  assert.equal(scored.roles[0]?.readiness, null);
  assert.equal(scored.roles[0]?.jobCount, 0);
  assert.equal(scored.readiness, 0);
  assert.equal(scored.skillGaps[0]?.skill, "go");
  assert.equal(scored.careerScore, 13);
});

test("title matching is by words, so Go is not Golang and Java is not JavaScript", () => {
  assert.equal(
    titlesMatch("Backend Engineer", "Senior Backend Engineer"),
    true,
  );
  assert.equal(titlesMatch("Engineer", "Staff Engineer"), true);
  assert.equal(titlesMatch("Data Scientist", "Backend Engineer"), false);
  assert.equal(titlesMatch("Go", "Golang Engineer"), false);
  assert.equal(titlesMatch("Java", "JavaScript Engineer"), false);
  assert.equal(titlesMatch("Software Engineer", "Staff Engineer"), true);
});
