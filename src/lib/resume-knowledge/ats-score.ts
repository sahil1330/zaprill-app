import { normalizeResumeData, normalizeResumeMetadata } from "@/lib/resume";
import type { ResumeData } from "@/types/resume";
import { LAYOUT_RULES } from "./catalog";
import { detectAudience, type ProfileHint } from "./detect";
import { type ResumeCitation, reviewResume } from "./review";

const STOP = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "into",
  "is",
  "it",
  "of",
  "on",
  "or",
  "our",
  "that",
  "the",
  "their",
  "this",
  "to",
  "we",
  "with",
  "you",
  "your",
  "will",
  "ability",
  "candidate",
  "description",
  "experience",
  "including",
  "job",
  "looking",
  "required",
  "requirements",
  "responsibilities",
  "role",
  "skills",
  "strong",
  "team",
  "using",
  "work",
  "years",
  "year",
]);

export type AtsExplanation = {
  keywordCoverage: number | null;
  keywordTermCount: number;
  parseability: number;
  formatting: number;
  estimatedPages: number;
  maxPages: number;
  field: string;
  stage: string;
  region: string;
  citations: ResumeCitation[];
  rules: string[];
};

export type DeterministicAtsResult = {
  score: number;
  keywordMatches: string[];
  missingKeywords: string[];
  suggestions: Array<{
    section: string;
    issue: string;
    fix: string;
    action: { type: "no_action_needed" };
  }>;
  sectionScores: Record<string, number>;
  explanation: AtsExplanation;
};

export function extractJdTerms(jobDescription: string): string[] {
  const terms: string[] = [];
  const seen = new Set<string>();
  const add = (raw: string) => {
    const cleaned = raw.trim();
    const key = cleaned.toLowerCase();
    if (key.length < 2 || seen.has(key) || STOP.has(key)) return;
    seen.add(key);
    terms.push(cleaned);
  };

  for (const match of jobDescription.matchAll(/\b[A-Z][A-Z0-9+#.]{1,}\b/g)) {
    add(match[0]);
  }
  for (const match of jobDescription.matchAll(
    /\b[A-Za-z][A-Za-z0-9+#.]{2,}\b/g,
  )) {
    const word = match[0];
    const lower = word.toLowerCase();
    if (STOP.has(lower)) continue;
    const technical =
      /[A-Z]/.test(word.slice(1)) || /[+#.]/.test(word) || word.length >= 6;
    if (technical) add(word);
  }
  return terms.slice(0, 40);
}

function resumeHaystack(data: ResumeData): string {
  const chunks = [
    data.basics.label,
    data.basics.summary,
    ...data.work.flatMap((item) => [
      item.position,
      item.company,
      item.summary ?? "",
      ...item.highlights,
    ]),
    ...data.education.flatMap((item) => [
      item.area,
      item.studyType,
      item.institution,
    ]),
    ...data.skills.flatMap((item) => [item.name, ...item.keywords]),
    ...data.projects.flatMap((item) => [
      item.name,
      item.description,
      ...item.highlights,
      ...item.keywords,
    ]),
    ...data.certifications.map((item) => item.name),
  ];
  return chunks.join("\n").toLowerCase();
}

function keywordScores(data: ResumeData, jobDescription: string | undefined) {
  const terms = extractJdTerms(jobDescription ?? "");
  if (terms.length === 0) {
    return {
      coverage: null as number | null,
      matches: [] as string[],
      missing: [] as string[],
    };
  }
  const haystack = resumeHaystack(data);
  const matches: string[] = [];
  const missing: string[] = [];
  for (const term of terms) {
    const needle = term.toLowerCase();
    const found = new RegExp(
      `\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i",
    ).test(haystack);
    if (found) matches.push(term);
    else missing.push(term);
  }
  return {
    coverage: Math.round((matches.length / terms.length) * 100),
    matches,
    missing,
  };
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function scoreResumeAts(input: {
  data: unknown;
  metadata?: unknown;
  templateSlug?: string | null;
  targetRole?: string | null;
  industry?: string | null;
  jobDescription?: string;
  profile?: ProfileHint | null;
}): DeterministicAtsResult {
  const data = normalizeResumeData(input.data);
  const metadata = normalizeResumeMetadata(input.metadata);
  const audience = detectAudience({
    targetRole: input.targetRole,
    industry: input.industry,
    label: data.basics.label,
    summary: data.basics.summary,
    countryCode: data.basics.location.countryCode,
    workTitles: data.work.map((item) => item.position),
    educationCount: data.education.length,
    workCount: data.work.length,
    profile: input.profile,
  });
  const review = reviewResume({
    audience,
    data,
    metadata,
    templateSlug: input.templateSlug || "minimalist",
  });
  const keywords = keywordScores(data, input.jobDescription);

  let parseability = 100;
  if (review.violations.some((item) => item.id === "multi-column")) {
    parseability -= 30;
  }
  if (review.violations.some((item) => item.id === "photo")) parseability -= 15;
  if (review.violations.some((item) => item.id === "margin"))
    parseability -= 10;
  if (review.violations.some((item) => item.id === "font")) parseability -= 10;
  parseability = clampScore(parseability);

  let formatting = 100;
  if (review.violations.some((item) => item.id === "section-order")) {
    formatting -= 20;
  }
  if (review.violations.some((item) => item.id === "length-one-page")) {
    formatting -= 15;
  }
  if (review.violations.some((item) => item.id === "density")) formatting -= 10;
  if (review.violations.some((item) => item.id === "bullets")) formatting -= 10;
  if (review.violations.some((item) => item.id === "dob")) formatting -= 10;
  formatting = clampScore(formatting);

  const score =
    keywords.coverage == null
      ? clampScore(parseability * 0.55 + formatting * 0.45)
      : clampScore(
          keywords.coverage * 0.5 + parseability * 0.3 + formatting * 0.2,
        );

  const sectionScores: Record<string, number> = {
    Summary: data.basics.summary.trim()
      ? 85
      : audience.stage === "student" || audience.stage === "fresher"
        ? 70
        : 45,
    Experience:
      data.work.length > 0 &&
      data.work.some((item) => item.highlights.length > 0)
        ? 82
        : data.work.length > 0
          ? 60
          : 40,
    Education: data.education.length > 0 ? 85 : 40,
    Skills: data.skills.length > 0 ? 80 : 45,
    Projects:
      data.projects.length > 0
        ? 85
        : audience.stage === "student" || audience.stage === "fresher"
          ? 40
          : 75,
    Formatting: formatting,
    Parseability: parseability,
  };
  if (keywords.coverage != null) {
    sectionScores.Keywords = keywords.coverage;
  }

  const suggestions: DeterministicAtsResult["suggestions"] =
    review.violations.map((violation) => ({
      section: violation.id,
      issue: violation.message,
      fix: "Ask Resume Architect to apply the recommended layout, or edit the section yourself. Do not invent metrics.",
      action: { type: "no_action_needed" as const },
    }));

  if (keywords.missing.length > 0) {
    suggestions.push({
      section: "Keywords",
      issue: `The job description uses words this resume does not: ${keywords.missing.slice(0, 8).join(", ")}.`,
      fix: "Add a term only where the person actually did that work. Coverage is a search aid, not an automatic rejection.",
      action: { type: "no_action_needed" },
    });
  } else if (!input.jobDescription?.trim()) {
    suggestions.push({
      section: "Keywords",
      issue:
        "No job description was provided, so keyword coverage was not scored.",
      fix: "Paste a target job description to see which of its terms already appear.",
      action: { type: "no_action_needed" },
    });
  }

  return {
    score,
    keywordMatches: keywords.matches,
    missingKeywords: keywords.missing,
    suggestions,
    sectionScores,
    explanation: {
      keywordCoverage: keywords.coverage,
      keywordTermCount: keywords.matches.length + keywords.missing.length,
      parseability,
      formatting,
      estimatedPages: review.estimatedPages,
      maxPages: review.maxPages,
      field: audience.field,
      stage: audience.stage,
      region: audience.region,
      citations: review.citations,
      rules: [
        LAYOUT_RULES.ats,
        ...review.violations.map((item) => item.message),
      ],
    },
  };
}
