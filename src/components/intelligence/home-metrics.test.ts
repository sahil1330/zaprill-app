import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  matchedJobCount,
  primaryMarketRole,
  verifiedSkillNames,
} from "@/components/intelligence/home-metrics";
import type { IntelligenceReport } from "@/types/intelligence";

function report(
  roles: IntelligenceReport["market"]["roles"],
): IntelligenceReport {
  return {
    segment: "professional",
    coachEnabled: false,
    score: {
      careerScore: 62,
      readiness: 70,
      completeness: 50,
      weights: { readiness: 0.75, completeness: 0.25 },
      signals: [],
      basis: "target_roles",
      analysisId: "analysis-1",
    },
    market: { basis: "target_roles", roles },
    nextSteps: [],
  };
}

const salary = {
  sampleSize: 2,
  lowInr: 1_200_000,
  medianInr: 1_500_000,
  highInr: 1_800_000,
};

describe("primaryMarketRole", () => {
  it("prefers the primary role and sums every job count", () => {
    const value = report([
      {
        id: "fe",
        title: "Frontend",
        isPrimary: false,
        jobCount: 1,
        salary: null,
        remoteCount: 0,
        remoteKnown: 0,
        companies: [],
        skills: [],
      },
      {
        id: "be",
        title: "Backend",
        isPrimary: true,
        jobCount: 2,
        salary,
        remoteCount: 0,
        remoteKnown: 0,
        companies: [],
        skills: [],
      },
    ]);
    assert.equal(primaryMarketRole(value)?.title, "Backend");
    assert.equal(matchedJobCount(value), 3);
  });

  it("returns null salary source and zero jobs when nothing was analyzed", () => {
    const value = report([]);
    value.market.basis = "none";
    assert.equal(primaryMarketRole(value), null);
    assert.equal(matchedJobCount(value), 0);
  });
});

describe("verifiedSkillNames", () => {
  it("keeps only verified evidence, first seen", () => {
    assert.deepEqual(
      verifiedSkillNames([
        { name: "Go", evidence: [{ kind: "resume_keyword" }] },
        {
          name: "TypeScript",
          evidence: [{ kind: "verified" }, { kind: "work" }],
        },
        { name: "TypeScript", evidence: [{ kind: "verified" }] },
      ]),
      ["TypeScript"],
    );
  });
});
