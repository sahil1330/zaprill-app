import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  HomeBoardSkeleton,
  HomeBoardView,
} from "@/components/intelligence/home-board";
import type { CareerProfileView } from "@/types/career-profile";
import type { IntelligenceReport } from "@/types/intelligence";

function profile(): CareerProfileView {
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
    skills: [
      {
        id: "skill-go",
        name: "Go",
        normalizedName: "go",
        category: "language",
        level: "advanced",
        levelLocked: false,
        evidence: [{ kind: "verified", label: "Verified on Zaprill" }],
        source: "self_reported",
        sortOrder: 0,
      },
    ],
    targetRoles: [],
    intelligence: {
      careerScore: 62,
      readiness: 70,
      completeness: 50,
      basis: "target_roles",
      analysisId: "analysis-1",
      roles: [],
      skillGaps: [],
    },
    createdAt: "2026-10-26T00:00:00.000Z",
    updatedAt: "2026-10-26T00:00:00.000Z",
  };
}

function readyReport(): IntelligenceReport {
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
    market: {
      basis: "target_roles",
      roles: [
        {
          id: "be",
          title: "Backend Engineer",
          isPrimary: true,
          jobCount: 2,
          salary: null,
          remoteCount: 0,
          remoteKnown: 0,
          companies: [],
          skills: [],
        },
      ],
    },
    nextSteps: [],
  };
}

const noop = () => undefined;

describe("HomeBoardSkeleton", () => {
  it("follows the six board regions", () => {
    const html = renderToStaticMarkup(<HomeBoardSkeleton />);
    const slots = [
      "skeleton-hero",
      "skeleton-metrics",
      "skeleton-gaps",
      "skeleton-next",
      "skeleton-verified",
      "skeleton-strip",
    ];
    const order = slots.map((slot) => html.indexOf(`data-slot="${slot}"`));
    assert.deepEqual(
      order,
      [...order].sort((a, b) => a - b),
    );
    assert.ok(order.every((index) => index >= 0));
    assert.match(html, /max-w-\[1100px\]/);
    assert.doesNotMatch(html, /Synthesizing/);
  });
});

describe("HomeBoardView", () => {
  it("blocks the board when the career file fails", () => {
    const html = renderToStaticMarkup(
      <HomeBoardView
        status="profile-error"
        onRetryProfile={noop}
        onRetryReport={noop}
        atsScore={null}
        report={null}
        profile={null}
        onProfile={noop}
      />,
    );
    assert.match(html, /data-slot="page-error"/);
    assert.match(html, /Your career file could not be loaded/);
    assert.doesNotMatch(html, /id="pay"/);
  });

  it("keeps path and pay when the report fails", () => {
    const html = renderToStaticMarkup(
      <HomeBoardView
        status="report-error"
        onRetryProfile={noop}
        onRetryReport={noop}
        atsScore={null}
        report={null}
        profile={profile()}
        onProfile={noop}
      />,
    );
    assert.match(html, /Market insights could not be loaded/);
    assert.match(html, /id="pay"/);
    assert.match(html, /id="path"/);
    assert.doesNotMatch(html, /data-slot="intelligence-hero"/);
  });

  it("renders the board and the editors when both loads succeed", () => {
    const html = renderToStaticMarkup(
      <HomeBoardView
        status="ready"
        onRetryProfile={noop}
        onRetryReport={noop}
        atsScore={75}
        report={readyReport()}
        profile={profile()}
        onProfile={noop}
      />,
    );
    assert.match(html, /data-slot="intelligence-hero"/);
    assert.match(html, /75%/);
    assert.match(html, /Go/);
    assert.match(html, /Verified on Zaprill/);
    assert.match(html, /id="path"/);
    assert.match(html, /id="pay"/);
  });
});
