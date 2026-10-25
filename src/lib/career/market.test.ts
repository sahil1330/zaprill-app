import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMarketReport,
  parseIndianSalaryInr,
  topMissingSkill,
} from "@/lib/career/market";

test("salary strings become annual INR midpoints", () => {
  assert.equal(parseIndianSalaryInr("12 LPA"), 1_200_000);
  assert.equal(parseIndianSalaryInr("12L - 18L"), 1_500_000);
  assert.equal(parseIndianSalaryInr("Not disclosed"), null);
  assert.equal(parseIndianSalaryInr(null), null);
});

test("target roles compare career skills with required skills", () => {
  const report = buildMarketReport({
    skills: [{ name: "TypeScript", level: "advanced" }],
    targets: [{ id: "be", title: "Backend Engineer", isPrimary: true }],
    jobs: [
      {
        title: "Senior Backend Engineer",
        company: "Razorpay",
        salary: "18 LPA",
        requiredSkills: ["TypeScript", "Go"],
        isRemote: false,
      },
      {
        title: "Backend Engineer",
        company: "Razorpay",
        salary: "12 LPA",
        requiredSkills: ["Go", "PostgreSQL"],
        isRemote: true,
      },
      {
        title: "Product Designer",
        company: "Figma",
        salary: "20 LPA",
        requiredSkills: ["Figma"],
        isRemote: true,
      },
    ],
  });

  assert.equal(report.basis, "target_roles");
  assert.equal(report.roles.length, 1);
  const role = report.roles[0];
  assert.equal(role?.jobCount, 2);
  assert.equal(role?.salary?.medianInr, 1_500_000);
  assert.equal(role?.salary?.sampleSize, 2);
  assert.equal(role?.remoteCount, 1);
  assert.deepEqual(role?.companies, [{ name: "Razorpay", count: 2 }]);

  const go = role?.skills.find((skill) => skill.name === "Go");
  const typescript = role?.skills.find((skill) => skill.name === "TypeScript");
  assert.equal(go?.onProfile, false);
  assert.equal(go?.priority, "high");
  assert.equal(typescript?.onProfile, true);
  assert.equal(typescript?.level, "advanced");
  assert.equal(typescript?.priority, null);
  assert.equal(
    role?.skills.some((skill) => skill.name === "Figma"),
    false,
  );
  assert.deepEqual(topMissingSkill(report.roles), {
    skill: "Go",
    priority: "high",
  });
});

test("unmatched targets fall back to the whole analysis", () => {
  const report = buildMarketReport({
    skills: [],
    targets: [{ id: "chef", title: "Chef", isPrimary: true }],
    jobs: [
      {
        title: "Backend Engineer",
        company: "Postman",
        salary: null,
        requiredSkills: ["Go"],
        isRemote: null,
      },
    ],
  });

  assert.equal(report.basis, "all_jobs");
  const analysis = report.roles.find((role) => role.id === "analysis");
  assert.equal(analysis?.jobCount, 1);
  assert.equal(analysis?.skills[0]?.name, "Go");
  assert.equal(analysis?.skills[0]?.onProfile, false);
  assert.deepEqual(topMissingSkill(report.roles), {
    skill: "Go",
    priority: "high",
  });
});

test("no analysis jobs leaves the market empty", () => {
  const report = buildMarketReport({
    skills: [{ name: "React", level: "intermediate" }],
    targets: [{ id: "fe", title: "Frontend Engineer", isPrimary: true }],
    jobs: [],
  });
  assert.equal(report.basis, "none");
  assert.equal(report.roles[0]?.jobCount, 0);
  assert.equal(topMissingSkill(report.roles), null);
});
