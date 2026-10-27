import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { IntelligenceInsights } from "@/components/intelligence/intelligence-insights";
import { selectIntelligencePrimaryCta } from "@/components/intelligence/primary-cta";
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

function renderInsights(
  value: IntelligenceReport,
  extras: {
    atsScore?: number | null;
    verifiedSkills?: { name: string }[];
  } = {},
) {
  return renderToStaticMarkup(
    <IntelligenceInsights
      report={value}
      atsScore={extras.atsScore === undefined ? 75 : extras.atsScore}
      verifiedSkills={extras.verifiedSkills ?? []}
    />,
  );
}

test("the board shows score, ATS, salary, jobs, one resume CTA, and the strip", () => {
  const html = renderInsights(report());
  assert.match(html, /data-slot="intelligence-hero"/);
  assert.match(html, />62</);
  assert.match(html, /75% readiness, 25% completeness/);
  assert.match(html, /data-slot="metric-ats"/);
  assert.match(html, /75%/);
  assert.match(html, /href="\/resumes"/);
  assert.match(html, /data-slot="metric-salary"/);
  assert.match(html, /₹12 LPA/);
  assert.match(html, /₹18 LPA/);
  assert.match(html, /data-slot="metric-jobs"/);
  assert.match(html, /Jobs matched/);
  assert.match(html, /data-slot="gap-chip"/);
  assert.match(html, /Go/);
  assert.match(html, /data-slot="home-verified"/);
  assert.match(html, /No skills verified in Skill Coach yet/);
  assert.match(html, /data-slot="home-secondary-strip"/);
  assert.match(html, /href="\/analyze"/);
  assert.match(html, /href="\/jobs"/);
  assert.match(html, /href="\/history"/);
  assert.match(html, /max-w-\[1100px\]/);
  assert.match(html, /shadow-none/);
  assert.doesNotMatch(html, /data-slot="intelligence-market"/);
  assert.doesNotMatch(html, /data-slot="intelligence-sticky-cta"/);
  assert.doesNotMatch(html, /data-slot="intelligence-score-detail"/);
  assert.doesNotMatch(html, /Public ATS boards/);
  assert.doesNotMatch(html, /Razorpay/);
  assert.doesNotMatch(html, /Personal Dashboard/);
  assert.doesNotMatch(html, /Welcome back/);
  assert.doesNotMatch(html, /Analytical Search/);
  assert.doesNotMatch(html, /Synthesizing/);
  assert.equal(html.match(/data-primary-cta=/g)?.length, 1);
  const order = [
    "intelligence-hero",
    "home-metrics",
    "intelligence-gaps",
    "intelligence-next",
    "home-verified",
    "home-secondary-strip",
  ].map((slot) => html.indexOf(`data-slot="${slot}"`));
  assert.deepEqual(
    order,
    [...order].sort((a, b) => a - b),
  );
  assert.ok(order.every((index) => index >= 0));
});

test("an empty analysis has one Run analysis button and a zero job count", () => {
  const html = renderInsights(
    report({
      score: {
        ...report().score,
        careerScore: null,
        readiness: null,
        basis: "none",
      },
      market: { basis: "none", roles: [] },
      nextSteps: [],
    }),
    { atsScore: null },
  );
  assert.match(html, /Not scored/);
  assert.match(html, /The score appears after an analysis/);
  assert.match(html, /data-primary-cta="analyze"/);
  assert.match(html, /Run analysis/);
  assert.match(html, /href="\/analyze"/);
  assert.match(html, /Skill gaps show up here once an analysis has jobs/);
  assert.match(html, /Nothing urgent/);
  assert.match(html, /data-slot="metric-jobs"/);
  assert.doesNotMatch(html, /data-slot="metric-salary"/);
  assert.match(html, /data-slot="home-secondary-strip"/);
  assert.equal(html.match(/data-primary-cta=/g)?.length, 1);
  assert.doesNotMatch(html, /Activate Job Match Engine/);
  assert.doesNotMatch(html, /No matches detected/);
});

test("a coach next step still links to Skill Coach", () => {
  const html = renderInsights(
    report({
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
    }),
  );
  assert.match(html, /Practice Go/);
  assert.match(html, /href="\/skill-coach"/);
});

test("selectIntelligencePrimaryCta is Coach, else analysis, else Resume", () => {
  assert.deepEqual(
    selectIntelligencePrimaryCta(report({ coachEnabled: true })),
    {
      kind: "coach",
      href: "/skill-coach",
      label: "Skill Coach",
    },
  );
  assert.deepEqual(selectIntelligencePrimaryCta(report()), {
    kind: "resume",
    href: "/resumes",
    label: "Resume Builder",
  });
  assert.deepEqual(
    selectIntelligencePrimaryCta(
      report({
        coachEnabled: true,
        market: { basis: "none", roles: [] },
      }),
    ),
    {
      kind: "analyze",
      href: "/analyze",
      label: "Run analysis",
    },
  );
  assert.deepEqual(
    selectIntelligencePrimaryCta(
      report({
        score: {
          ...report().score,
          careerScore: null,
          readiness: null,
          basis: "none",
        },
        market: { basis: "none", roles: [] },
        nextSteps: [
          {
            id: "resume",
            title: "Add your resume",
            detail: "Skills are read from the resume you sync.",
            href: "/onboarding",
            action: "resume",
          },
        ],
      }),
    ),
    {
      kind: "analyze",
      href: "/onboarding",
      label: "Add your resume",
    },
  );
});

test("the hero CTA is Coach when coaching is on and a gap exists", () => {
  const html = renderInsights(
    report({
      coachEnabled: true,
      nextSteps: [
        {
          id: "resume-gap",
          title: "Show Go on your resume",
          detail: "Roles in the analysis ask for this.",
          href: "/resumes",
          action: "resume",
        },
      ],
    }),
  );
  assert.match(html, /data-slot="intelligence-hero"/);
  assert.match(html, /data-primary-cta="coach"/);
  assert.match(html, /Skill Coach/);
  assert.match(html, /href="\/skill-coach"/);
  assert.doesNotMatch(html, /data-primary-cta="resume"/);
  assert.match(html, /data-slot="gap-chip"/);
});

test("the hero CTA is Resume when coaching is off, and gaps stay unlinked", () => {
  const html = renderInsights(report());
  assert.match(html, /data-primary-cta="resume"/);
  assert.match(html, /Resume Builder/);
  assert.match(html, /href="\/resumes"/);
  assert.doesNotMatch(html, /data-primary-cta="coach"/);
  assert.doesNotMatch(html, /href="\/skill-coach"/);
  assert.match(html, /data-slot="gap-chip"/);
  assert.match(html, /Go/);
  assert.match(html, /Coaching is paused/);
});

test("the hero CTA is Resume when coaching is on but nothing is missing", () => {
  const base = report();
  const html = renderInsights(
    report({
      coachEnabled: true,
      market: {
        ...base.market,
        roles: base.market.roles.map((role) => ({
          ...role,
          skills: role.skills.map((skill) => ({
            ...skill,
            onProfile: true,
            priority: null,
            level: skill.level ?? "advanced",
          })),
        })),
      },
    }),
  );
  assert.match(html, /data-primary-cta="resume"/);
  assert.doesNotMatch(html, /data-primary-cta="coach"/);
  assert.doesNotMatch(html, /href="\/skill-coach"/);
  assert.doesNotMatch(html, /Coaching is paused/);
});

test("next steps render at most three", () => {
  const html = renderInsights(
    report({
      nextSteps: [1, 2, 3, 4].map((n) => ({
        id: `step-${n}`,
        title: `Step ${n}`,
        detail: `Detail ${n}`,
        href: "/resumes",
        action: "resume" as const,
      })),
    }),
  );
  assert.match(html, /Step 1/);
  assert.match(html, /Step 3/);
  assert.doesNotMatch(html, /Step 4/);
  assert.equal(html.match(/data-slot="next-step"/g)?.length, 3);
});

test("the primary CTA is only in the hero", () => {
  const html = renderInsights(report());
  assert.match(html, /data-slot="intelligence-hero"/);
  assert.doesNotMatch(html, /data-slot="intelligence-sticky-cta"/);
  assert.doesNotMatch(html, /fixed/);
  assert.equal(html.match(/data-primary-cta="resume"/g)?.length, 1);
});

test("verified skills list only the names passed in", () => {
  const html = renderInsights(report(), {
    verifiedSkills: [{ name: "Go" }],
  });
  assert.match(html, /Go/);
  assert.match(html, /Verified on Zaprill/);
  assert.doesNotMatch(html, /No skills verified in Skill Coach yet/);
});
