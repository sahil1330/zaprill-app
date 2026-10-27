import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { CareerFileEditors } from "@/components/intelligence/career-file-editors";
import type { CareerProfileView } from "@/types/career-profile";

function fixture(): CareerProfileView {
  return {
    id: "cp",
    userId: "user",
    segment: null,
    headline: null,
    location: { city: null, region: null, countryCode: "IN" },
    compensation: {
      currency: "INR",
      stipend: false,
      current: { period: "annual", amountInr: null, annualInr: null },
      expected: {
        period: "annual",
        minInr: null,
        maxInr: null,
        minAnnualInr: null,
        maxAnnualInr: null,
      },
      noticePeriodDays: null,
    },
    yearsOfExperience: null,
    openToRelocate: false,
    fieldSources: {},
    derivedFromResumeId: null,
    lastDerivedAt: null,
    academics: [],
    experience: [],
    skills: [],
    targetRoles: [],
    intelligence: {
      careerScore: null,
      readiness: null,
      completeness: 0,
      basis: "none",
      analysisId: null,
      roles: [],
      skillGaps: [],
    },
    createdAt: "2026-10-26T00:00:00.000Z",
    updatedAt: "2026-10-26T00:00:00.000Z",
  };
}

describe("CareerFileEditors", () => {
  it("renders path and pay anchors only", () => {
    const html = renderToStaticMarkup(
      <CareerFileEditors profile={fixture()} onProfile={() => undefined} />,
    );
    assert.match(html, /id="path"/);
    assert.match(html, /id="pay"/);
    assert.match(html, /Student/);
    assert.match(html, /Fresher/);
    assert.match(html, /Professional/);
    assert.match(html, /Save pay/);
    assert.match(html, /Choose the path that fits you right now/);
    assert.doesNotMatch(html, /Academics/);
    assert.doesNotMatch(html, /Target roles/);
    assert.doesNotMatch(html, /Skills on file/);
  });
});
