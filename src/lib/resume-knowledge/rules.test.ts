import assert from "node:assert/strict";
import test from "node:test";
import { scoreResumeAts } from "@/lib/resume-knowledge/ats-score";
import { detectAudience } from "@/lib/resume-knowledge/detect";
import { guidanceFor } from "@/lib/resume-knowledge/prompt";
import { reviewResume } from "@/lib/resume-knowledge/review";
import {
  DEFAULT_RESUME_DATA,
  DEFAULT_RESUME_METADATA,
  type ResumeData,
  type ResumeEducationItem,
  type ResumeWorkItem,
} from "@/types/resume";

function work(id: string, highlights: string[]): ResumeWorkItem {
  return {
    id,
    company: "Acme",
    position: "Software Engineer",
    website: "",
    startDate: "2024-01",
    endDate: null,
    summary: "",
    highlights,
    location: "Pune",
  };
}

function education(id: string): ResumeEducationItem {
  return {
    id,
    institution: "State University",
    url: "",
    area: "Computer Science",
    studyType: "Bachelor",
    startDate: "2022-08",
    endDate: "2026-05",
    score: "",
    courses: [],
  };
}

function resume(partial: Partial<ResumeData>): ResumeData {
  return {
    ...DEFAULT_RESUME_DATA,
    ...partial,
    basics: { ...DEFAULT_RESUME_DATA.basics, ...partial.basics },
  };
}

const fresher = {
  field: "software" as const,
  stage: "fresher" as const,
  region: "IN" as const,
  years: 0,
  switching: false,
};

test("fresher software order puts education and projects above work", () => {
  const data = resume({
    work: [work("w1", ["Shipped the campus portal"])],
    education: [education("e1")],
    projects: [
      {
        id: "p1",
        name: "Campus portal",
        description: "A portal",
        highlights: ["Built the portal"],
        keywords: [],
        startDate: "2025-01",
        endDate: "2025-06",
        url: "",
        githubUrl: "",
      },
    ],
  });
  const review = reviewResume({
    audience: fresher,
    data,
    metadata: DEFAULT_RESUME_METADATA,
    templateSlug: "minimalist",
  });
  const order = review.recommended.sectionOrder;
  assert.ok(order.indexOf("education") < order.indexOf("projects"));
  assert.ok(order.indexOf("projects") < order.indexOf("work"));
  assert.ok(review.violations.some((item) => item.id === "section-order"));
});

test("a short fresher resume stays within one page", () => {
  const data = resume({
    basics: {
      ...DEFAULT_RESUME_DATA.basics,
      summary: "Computer science graduate seeking a software role.",
    },
    work: [work("w1", ["Built an internal tool", "Wrote unit tests"])],
    education: [education("e1")],
  });
  const review = reviewResume({
    audience: fresher,
    data,
    metadata: DEFAULT_RESUME_METADATA,
    templateSlug: "minimalist",
  });
  assert.ok(review.estimatedPages <= 1);
  assert.equal(
    review.violations.some((item) => item.id === "length-one-page"),
    false,
  );
});

test("a bloated fresher resume is flagged as longer than one page", () => {
  const bullet = "Implemented a service used by the campus operations team.";
  const data = resume({
    basics: {
      ...DEFAULT_RESUME_DATA.basics,
      summary: "A".repeat(500),
    },
    work: Array.from({ length: 8 }, (_, index) =>
      work(
        `w${index}`,
        Array.from({ length: 6 }, () => bullet),
      ),
    ),
    education: [education("e1")],
  });
  const review = reviewResume({
    audience: fresher,
    data,
    metadata: DEFAULT_RESUME_METADATA,
    templateSlug: "minimalist",
  });
  assert.ok(review.estimatedPages > 1);
  assert.ok(review.violations.some((item) => item.id === "length-one-page"));
});

test("software resumes flag multi-column templates", () => {
  const review = reviewResume({
    audience: fresher,
    data: resume({ education: [education("e1")] }),
    metadata: DEFAULT_RESUME_METADATA,
    templateSlug: "tech-stack",
  });
  assert.ok(review.violations.some((item) => item.id === "multi-column"));
  assert.equal(review.recommended.templateSlug, "minimalist");
});

test("keyword coverage matches TypeScript and misses Kubernetes", () => {
  const data = resume({
    skills: [
      {
        id: "s1",
        name: "TypeScript",
        level: "",
        keywords: [],
        category: "technical",
      },
    ],
  });
  const scored = scoreResumeAts({
    data,
    metadata: DEFAULT_RESUME_METADATA,
    templateSlug: "minimalist",
    targetRole: "Software Engineer",
    jobDescription: "We need TypeScript and Kubernetes experience on the team.",
  });
  assert.ok(scored.keywordMatches.includes("TypeScript"));
  assert.ok(scored.missingKeywords.includes("Kubernetes"));
  assert.equal(scored.explanation.keywordCoverage, 50);
  assert.ok(scored.explanation.citations.length > 0);
});

test("guidance injects one field slice and cites a source url", () => {
  const text = guidanceFor(fresher);
  assert.match(text, /Software resumes/);
  assert.doesNotMatch(text, /Healthcare resumes/);
  assert.match(text, /https:\/\/careerservices\.fas\.harvard\.edu/);
});

test("a target role in another field is a switcher", () => {
  const audience = detectAudience({
    targetRole: "Product Designer",
    workTitles: ["Software Engineer"],
    workCount: 2,
    educationCount: 1,
    profile: {
      segment: "professional",
      countryCode: "US",
      yearsOfExperience: 4,
      headline: null,
      targetRoles: ["Product Designer"],
      experienceTitles: ["Software Engineer"],
    },
  });
  assert.equal(audience.field, "design");
  assert.equal(audience.stage, "switcher");
  assert.equal(audience.region, "US");
  const order = reviewResume({
    audience,
    data: resume({
      work: [work("w1", ["Shipped a feature"])],
      education: [education("e1")],
      skills: [
        { id: "s1", name: "Figma", level: "", keywords: [], category: "tool" },
      ],
    }),
    metadata: DEFAULT_RESUME_METADATA,
    templateSlug: "minimalist",
  }).recommended.sectionOrder;
  assert.ok(order.indexOf("skills") < order.indexOf("work"));
  assert.ok(order.indexOf("work") < order.indexOf("education"));
});
