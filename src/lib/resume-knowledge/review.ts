import type { ResumeData, ResumeMetadata } from "@/types/resume";
import {
  fieldGuidance,
  LAYOUT_RULES,
  maxPagesFor,
  regionGuidance,
  sectionOrderFor,
} from "./catalog";
import type { ResumeAudience } from "./detect";
import { sourceById } from "./sources";
import type { LayoutTarget } from "./types";

const MULTI_COLUMN = new Set([
  "tech-stack",
  "modern-split",
  "creative-portfolio",
]);

export type ViolationId =
  | "section-order"
  | "length-one-page"
  | "multi-column"
  | "font"
  | "margin"
  | "density"
  | "bullets"
  | "photo"
  | "dob";

export type ResumeViolation = {
  id: ViolationId;
  severity: "high" | "medium";
  message: string;
  sourceIds: string[];
};

export type ResumeCitation = {
  id: string;
  title: string;
  publisher: string;
  url: string;
};

export type ResumeReview = {
  audience: ResumeAudience;
  estimatedPages: number;
  maxPages: number;
  violations: ResumeViolation[];
  recommended: LayoutTarget;
  citations: ResumeCitation[];
};

const CONTENT_SECTIONS = [
  "summary",
  "work",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
  "volunteer",
  "awards",
  "publications",
  "references",
] as const;

function strip(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function estimateContentLines(data: ResumeData): number {
  let lines = 4;
  const summary = strip(data.basics.summary);
  if (summary) lines += Math.max(2, Math.ceil(summary.length / 90));
  for (const job of data.work) {
    lines += 2 + job.highlights.filter((line) => strip(line)).length;
  }
  lines += data.education.length * 2;
  if (data.skills.length > 0) {
    lines += 1 + Math.ceil(data.skills.length / 3);
  }
  for (const project of data.projects) {
    lines += 2 + project.highlights.filter((line) => strip(line)).length;
    const description = strip(project.description);
    if (description) lines += Math.ceil(description.length / 90);
  }
  lines += data.certifications.length;
  lines += data.publications.length * 2;
  lines += data.volunteer.length + data.awards.length;
  if (data.languages.length > 0) lines += 1;
  return lines;
}

/** Baseline is about 48 body lines on A4 at 11pt with 15mm margins. */
export function linesPerPage(fontSize: number, marginMm: number): number {
  const size = fontSize > 0 ? fontSize : 11;
  const margin = Number.isFinite(marginMm) ? marginMm : 20;
  const usable = Math.max(120, 297 - margin * 2);
  const raw = 48 * (11 / size) * (usable / (297 - 30));
  return Math.max(28, Math.round(raw));
}

export function estimatePages(
  data: ResumeData,
  fontSize: number,
  marginMm: number,
): number {
  const pages = estimateContentLines(data) / linesPerPage(fontSize, marginMm);
  return Math.round(pages * 10) / 10;
}

function presentSections(data: ResumeData): Set<string> {
  const present = new Set<string>();
  if (strip(data.basics.summary)) present.add("summary");
  if (data.work.length > 0) present.add("work");
  if (data.education.length > 0) present.add("education");
  if (data.skills.length > 0) present.add("skills");
  if (data.projects.length > 0) present.add("projects");
  if (data.certifications.length > 0) present.add("certifications");
  if (data.languages.length > 0) present.add("languages");
  if (data.volunteer.length > 0) present.add("volunteer");
  if (data.awards.length > 0) present.add("awards");
  if (data.publications.length > 0) present.add("publications");
  if (data.references.length > 0) present.add("references");
  return present;
}

function orderViolates(
  current: string[],
  recommended: string[],
  present: Set<string>,
) {
  const ranked = recommended.filter((section) => present.has(section));
  const index = new Map(
    current.map((section, position) => [section, position]),
  );
  let last = -1;
  for (const section of ranked) {
    const position = index.get(section);
    if (position == null) continue;
    if (position < last) return true;
    last = position;
  }
  return false;
}

function citationsFor(ids: string[]): ResumeCitation[] {
  const seen = new Set<string>();
  const citations: ResumeCitation[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    const source = sourceById(id);
    if (!source) continue;
    seen.add(id);
    citations.push({
      id: source.id,
      title: source.title,
      publisher: source.publisher,
      url: source.url,
    });
  }
  return citations;
}

export function reviewResume(input: {
  audience: ResumeAudience;
  data: ResumeData;
  metadata: ResumeMetadata;
  templateSlug: string;
}): ResumeReview {
  const { audience, data, metadata, templateSlug } = input;
  const field = fieldGuidance(audience.field);
  const region = regionGuidance(audience.region);
  const order = sectionOrderFor(audience.stage, audience.field);
  const maxPages = maxPagesFor(audience.field, audience.stage, audience.years);
  const fontSize = metadata.typography.font.size;
  const margin = metadata.page.margin;
  const estimatedPages = estimatePages(data, fontSize, margin);
  const violations: ResumeViolation[] = [];
  const present = presentSections(data);

  if (
    orderViolates(metadata.sectionOrder, order, present) &&
    present.size > 1
  ) {
    violations.push({
      id: "section-order",
      severity: "high",
      message: `For a ${audience.stage} ${audience.field} resume, put sections in this order: ${order
        .filter((section) => present.has(section) || section === "summary")
        .slice(0, 6)
        .join(", ")}.`,
      sourceIds: ["oxford-cvs", "harvard-gsas-2024", "stanford-beam"],
    });
  }

  if (audience.field !== "academia" && estimatedPages > maxPages + 0.15) {
    violations.push({
      id: "length-one-page",
      severity: "high",
      message: `This reads as about ${estimatedPages} pages. The rule for this stage is ${maxPages} page${maxPages === 1 ? "" : "s"}. Cut older bullets before shrinking the type.`,
      sourceIds:
        maxPages === 1
          ? ["harvard-gsas-2024", "stanford-beam", "usc-format"]
          : ["usc-format", "harvard-phd-2024"],
    });
  }

  if (field.singleColumn && MULTI_COLUMN.has(templateSlug)) {
    violations.push({
      id: "multi-column",
      severity: "high",
      message: `${templateSlug} uses more than one column. Parsers drop text from columns, tables, and text boxes. Use ${field.templateSlug}.`,
      sourceIds: ["greenhouse-parse", "berkeley-ats"],
    });
  }

  const family = metadata.typography.font.family;
  const safe = LAYOUT_RULES.safeFonts.some(
    (name) => name.toLowerCase() === family.toLowerCase(),
  );
  if (
    fontSize < LAYOUT_RULES.fontSizeMin ||
    fontSize > LAYOUT_RULES.fontSizeMax ||
    !safe
  ) {
    violations.push({
      id: "font",
      severity: "medium",
      message: `Use a standard face between ${LAYOUT_RULES.fontSizeMin} and ${LAYOUT_RULES.fontSizeMax} pt. ${family} at ${fontSize}pt is outside that.`,
      sourceIds: ["harvard-gsas-2024", "usc-format"],
    });
  }

  if (margin < LAYOUT_RULES.marginMmMin) {
    violations.push({
      id: "margin",
      severity: margin < LAYOUT_RULES.marginMmFloor ? "high" : "medium",
      message: `Margins are ${margin}mm. Keep at least ${LAYOUT_RULES.marginMmMin}mm (about 0.75in) so the page does not look cramped and printers do not clip it.`,
      sourceIds: ["harvard-gsas-2024", "usc-format"],
    });
  }

  const highlights = data.work.flatMap((job) => job.highlights);
  const crowded = data.work.some(
    (job) => job.highlights.filter((line) => strip(line)).length > 8,
  );
  if (metadata.typography.lineHeight < 1.15 || crowded) {
    violations.push({
      id: "density",
      severity: "medium",
      message:
        "The page is too dense. Keep line spacing readable and about six bullets on a role, not a wall of text.",
      sourceIds: ["harvard-gsas-2024", "wharton-bullets"],
    });
  }

  const weak = highlights.some((line) =>
    /\b(responsible for|duties included|worked on)\b/i.test(line),
  );
  const withMetric = highlights.filter((line) => /\d/.test(line)).length;
  const needsMetric =
    audience.stage === "experienced" &&
    audience.field !== "academia" &&
    highlights.length >= 4 &&
    withMetric / highlights.length < 0.25;
  if (weak || needsMetric) {
    violations.push({
      id: "bullets",
      severity: "medium",
      message: LAYOUT_RULES.bullet,
      sourceIds: ["wharton-bullets", "harvard-college-verbs"],
    });
  }

  if (!region.allowPhoto && data.basics.picture) {
    violations.push({
      id: "photo",
      severity: "high",
      message:
        "Remove the photo unless the user says this employer requires one. US, UK, and Indian private-sector resumes leave it off.",
      sourceIds: region.sourceIds,
    });
  }

  const personal = [
    data.basics.summary,
    ...data.customSections.flatMap((section) =>
      section.items.flatMap((item) => [
        item.title,
        item.description,
        ...item.highlights,
      ]),
    ),
  ].join("\n");
  if (
    !region.allowDob &&
    /\b(date of birth|d\.?\s?o\.?\s?b\.?|dob|father'?s name|marital status)\b/i.test(
      personal,
    )
  ) {
    violations.push({
      id: "dob",
      severity: "high",
      message:
        "Remove date of birth, marital status, and father's name unless the user says a government form requires them.",
      sourceIds: region.sourceIds,
    });
  }

  const fontOk =
    safe &&
    fontSize >= LAYOUT_RULES.fontSizeMin &&
    fontSize <= LAYOUT_RULES.fontSizeMax;
  const marginOk = margin >= LAYOUT_RULES.marginMmMin && margin <= 25;

  const recommended: LayoutTarget = {
    templateSlug: field.templateSlug,
    fontFamily: fontOk ? family : LAYOUT_RULES.preferredFont,
    fontSize: fontOk ? fontSize : 11,
    marginMm: marginOk ? margin : 20,
    sectionOrder: order,
    maxPages,
    singleColumn: true,
  };

  const sourceIds = [
    ...field.sourceIds,
    ...region.sourceIds,
    ...violations.flatMap((item) => item.sourceIds),
  ];

  return {
    audience,
    estimatedPages,
    maxPages,
    violations,
    recommended,
    citations: citationsFor(sourceIds).slice(0, 6),
  };
}

export function contentSections(): readonly string[] {
  return CONTENT_SECTIONS;
}
