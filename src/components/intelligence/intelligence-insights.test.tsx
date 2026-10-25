import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { IntelligenceInsights } from "@/components/intelligence/intelligence-insights";
import type { IntelligenceReport } from "@/types/intelligence";

function report(
  overrides: Partial<IntelligenceReport> = {},
): IntelligenceReport {
  return {
    segment: "professional",
    coachEnabled: false,
    score: {
      careerScore: 62,
      readiness: 70,
      completeness: 50,
      weights: { readiness: 0.75, completeness: 0.25 },
      signals: [
        { id: "segment", label: "Path chosen", present: true, points: 25 },
        { id: "target", label: "Target role", present: true, points: 25 },
        { id: "skill", label: "Skill on file", present: false, points: 25 },
        { id: "pay", label: "Pay set", present: false, points: 25 },
      ],
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
          salary: {
            sampleSize: 2,
            lowInr: 1_200_000,
            medianInr: 1_500_000,
            highInr: 1_800_000,
          },
          remoteCount: 1,
          remoteKnown: 2,
          companies: [{ name: "Razorpay", count: 2 }],
          skills: [
            {
              name: "Go",
              frequency: 2,
              jobCount: 2,
              onProfile: false,
              level: null,
              priority: "high",
            },
            {
              name: "TypeScript",
              frequency: 1,
              jobCount: 2,
              onProfile: true,
              level: "advanced",
              priority: null,
            },
          ],
        },
      ],
    },
    nextSteps: [
      {
        id: "resume-gap",
        title: "Show Go on your resume",
        detail: "Roles in the analysis ask for this.",
        href: "/resumes",
        action: "resume",
      },
    ],
    ...overrides,
  };
}

test("the dashboard explains the score, the market, and the resume link", () => {
  const html = renderToStaticMarkup(<IntelligenceInsights report={report()} />);
  assert.match(html, /Career score/);
  assert.match(html, />62</);
  assert.match(html, /75% readiness, 25% completeness/);
  assert.match(html, /Public ATS boards are not connected/);
  assert.match(html, /Backend Engineer/);
  assert.match(html, /Razorpay/);
  assert.match(html, /₹12 LPA/);
  assert.match(html, /₹18 LPA/);
  assert.match(html, /Go/);
  assert.match(html, /high/);
  assert.match(html, /TypeScript/);
  assert.match(html, /advanced/);
  assert.match(html, /href="\/resumes"/);
  assert.doesNotMatch(html, /skill-coach/);
});

test("an empty analysis tells the member to run one", () => {
  const html = renderToStaticMarkup(
    <IntelligenceInsights
      report={report({
        score: {
          ...report().score,
          careerScore: null,
          readiness: null,
          basis: "none",
        },
        market: { basis: "none", roles: [] },
        nextSteps: [],
      })}
    />,
  );
  assert.match(html, /Not scored/);
  assert.match(html, /Run an analysis/);
  assert.match(html, /Skill gaps show up here/);
  assert.match(html, /Nothing urgent/);
});

test("Skill Coach is linked only when a next step points there", () => {
  const html = renderToStaticMarkup(
    <IntelligenceInsights
      report={report({
        coachEnabled: true,
        nextSteps: [
          {
            id: "coach",
            title: "Practice Go",
            detail: "Skill Coach opens a plan from this gap.",
            href: "/skill-coach",
            action: "coach",
          },
        ],
      })}
    />,
  );
  assert.match(html, /Practice Go/);
  assert.match(html, /href="\/skill-coach"/);
});
