import type { CareerStage, ResumeField, ResumeRegion } from "./types";

export const CORE_SECTIONS = [
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

const ORDER: Record<CareerStage, Record<ResumeField, string[]>> = {
  student: orderFor("student"),
  fresher: orderFor("fresher"),
  experienced: orderFor("experienced"),
  switcher: orderFor("switcher"),
};

function orderFor(stage: CareerStage): Record<ResumeField, string[]> {
  const academic = [
    "summary",
    "education",
    "publications",
    "work",
    "projects",
    "awards",
    "skills",
    "certifications",
    "languages",
    "volunteer",
    "references",
  ];
  const early = [
    "summary",
    "education",
    "projects",
    "work",
    "skills",
    "certifications",
    "volunteer",
    "awards",
    "languages",
    "publications",
    "references",
  ];
  const experienced = [
    "summary",
    "work",
    "skills",
    "education",
    "projects",
    "certifications",
    "awards",
    "volunteer",
    "languages",
    "publications",
    "references",
  ];
  const switcher = [
    "summary",
    "skills",
    "projects",
    "work",
    "education",
    "certifications",
    "volunteer",
    "awards",
    "languages",
    "publications",
    "references",
  ];
  const base =
    stage === "student" || stage === "fresher"
      ? early
      : stage === "switcher"
        ? switcher
        : experienced;
  return {
    software: base,
    marketing: base,
    design: base,
    finance: base,
    consulting: stage === "experienced" ? experienced : base,
    academia: academic,
    healthcare: base,
    general: base,
  };
}

export function sectionOrderFor(
  stage: CareerStage,
  field: ResumeField,
): string[] {
  return ORDER[stage][field];
}

/** Academic CVs are not held to the one-page rule. Unknown years on an experienced resume allow two pages so a missing date does not force a false cut. */
export function maxPagesFor(
  field: ResumeField,
  stage: CareerStage,
  years: number | null,
): number {
  if (field === "academia") return 8;
  if (stage === "experienced") {
    if (years != null && years < 10) return 1;
    return 2;
  }
  return 1;
}

export function fieldGuidance(field: ResumeField): {
  summary: string;
  sourceIds: string[];
  singleColumn: boolean;
  templateSlug: "minimalist" | "executive-pro" | "creative-portfolio";
} {
  switch (field) {
    case "software":
      return {
        summary:
          "Software resumes are one page, single column, and scannable. Put languages and tools in a plain skills list, not icon bars. Projects matter for students; once there is relevant work, experience leads. Link GitHub only in the contact line. No photo.",
        sourceIds: ["stanford-beam", "harvard-gsas-2024", "greenhouse-parse"],
        singleColumn: true,
        templateSlug: "minimalist",
      };
    case "marketing":
      return {
        summary:
          "Marketing resumes lead with quantified campaigns: audience, channel, and result. A short summary is useful. Keep the page single column for ATS even if the portfolio lives at a URL.",
        sourceIds: ["wharton-bullets", "wharton-industries", "usc-format"],
        singleColumn: true,
        templateSlug: "minimalist",
      };
    case "design":
      return {
        summary:
          "Design resumes still have to parse. Keep one column, name the tools in words, and put the portfolio URL in the contact line. Visual templates are a human extra, not a substitute for the file an ATS reads.",
        sourceIds: ["greenhouse-parse", "berkeley-ats", "usc-format"],
        singleColumn: true,
        templateSlug: "minimalist",
      };
    case "finance":
      return {
        summary:
          "Finance resumes are dense, one page, and consistent. Bullets name the analysis, the scale, and the outcome. Dates and figures must line up. No graphics.",
        sourceIds: ["wharton-bullets", "harvard-gsas-2024", "usc-format"],
        singleColumn: true,
        templateSlug: "executive-pro",
      };
    case "consulting":
      return {
        summary:
          "Consulting screens for structure. One page unless the person is far into their career. Every bullet is a distinct action verb plus a number. Education can stay high for current students; experience leads after school.",
        sourceIds: [
          "wharton-bullets",
          "wharton-industries",
          "harvard-gsas-2024",
        ],
        singleColumn: true,
        templateSlug: "executive-pro",
      };
    case "academia":
      return {
        summary:
          "An academic CV is not a one-page resume. Include education, research, teaching, publications, and talks. It may run past two pages. Industry applications that do not require the doctorate should still be cut to one or two pages.",
        sourceIds: ["oxford-academic", "harvard-phd-2024", "oxford-cvs"],
        singleColumn: true,
        templateSlug: "minimalist",
      };
    case "healthcare":
      return {
        summary:
          "Healthcare resumes show credentials, licenses, and clinical scope with dates. Use standard headings. Skip photos and personal data for US and UK applications.",
        sourceIds: ["usc-format", "wharton-industries", "greenhouse-parse"],
        singleColumn: true,
        templateSlug: "minimalist",
      };
    default:
      return {
        summary:
          "Default to a one-page, single-column resume with standard headings, a readable font, and bullets that start with an action verb and a result.",
        sourceIds: ["harvard-gsas-2024", "oxford-cvs", "usc-format"],
        singleColumn: true,
        templateSlug: "minimalist",
      };
  }
}

export function stageGuidance(stage: CareerStage): {
  summary: string;
  sourceIds: string[];
  maxPages: number;
} {
  switch (stage) {
    case "student":
    case "fresher":
      return {
        summary:
          "Students and freshers put education and projects above sparse work history. One page. A summary is optional and short. Internships, societies, and projects count as experience.",
        sourceIds: ["oxford-cvs", "stanford-beam", "harvard-gsas-2024"],
        maxPages: 1,
      };
    case "switcher":
      return {
        summary:
          "Career switchers lead with a summary, then transferable skills and projects, then the work that proves those skills. Do not hide the old career; retitle bullets around what transfers.",
        sourceIds: [
          "oxford-cvs",
          "wharton-industries",
          "harvard-college-verbs",
        ],
        maxPages: 1,
      };
    default:
      return {
        summary:
          "Experienced candidates put a short summary on top and experience first. One page under about ten years in most fields. Two pages are normal after that, and for academic CVs.",
        sourceIds: ["usc-format", "harvard-gsas-2024", "harvard-phd-2024"],
        maxPages: 2,
      };
  }
}

export function regionGuidance(region: ResumeRegion): {
  summary: string;
  sourceIds: string[];
  allowPhoto: boolean;
  allowDob: boolean;
} {
  switch (region) {
    case "US":
      return {
        summary:
          "US resumes omit photo, date of birth, marital status, religion, and father's name. One page is standard; two pages after about ten years. Spell out degrees a US reader may not know.",
        sourceIds: ["usc-format", "harvard-gsas-2024"],
        allowPhoto: false,
        allowDob: false,
      };
    case "UK":
      return {
        summary:
          "UK CVs omit photo, date of birth, and marital status. One or two full pages. Education leads for recent graduates; experience can lead for researchers. A personal profile is a short summary, not a biography.",
        sourceIds: ["oxford-cvs", "usc-format"],
        allowPhoto: false,
        allowDob: false,
      };
    case "IN":
      return {
        summary:
          "For Indian private-sector and MNC applications, follow the US resume: no photo, no date of birth, no father's name. Government and PSU forms sometimes still ask for those; do not add them unless the user says the employer requires them. One page for freshers and most tech roles.",
        sourceIds: ["usc-format", "harvard-gsas-2024", "stanford-beam"],
        allowPhoto: false,
        allowDob: false,
      };
    default:
      return {
        summary:
          "When the country is unknown, omit photo and date of birth and keep a single column. Ask before adding personal data.",
        sourceIds: ["usc-format", "oxford-cvs"],
        allowPhoto: false,
        allowDob: false,
      };
  }
}

export const LAYOUT_RULES = {
  fontSizeMin: 10,
  fontSizeMax: 12,
  marginMmMin: 19,
  marginMmFloor: 13,
  preferredFont: "Inter",
  safeFonts: [
    "Inter",
    "Roboto",
    "Lato",
    "Open Sans",
    "Source Sans 3",
    "Merriweather",
    "Georgia",
    "Cambria",
  ],
  bullet:
    "Each bullet is one sentence: action verb, what you did, and a metric or scope the user actually gave. Do not invent numbers. Avoid 'responsible for' and 'duties included'.",
  dates:
    "Use YYYY-MM. Current roles end with Present. Keep the same pattern on every entry.",
  contact:
    "Name, email, phone, city, and one profile URL. No full street address required.",
  ats: "Parsers extract text into a profile. Greenhouse documents failures from columns, tables, text boxes, headers and footers, photos, graphics, and contact details stored only in a header. It does not auto-reject on keywords; recruiters search the parsed text and score against the job's own words. Mirror the posting's terms, including both a name and its acronym when both appear. Standard headings such as Experience, Education, and Skills parse more reliably than clever labels.",
};
