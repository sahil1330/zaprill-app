import type { CareerSegment } from "@/types/career-profile";
import type { CareerStage, ResumeField, ResumeRegion } from "./types";

export type ProfileHint = {
  segment: CareerSegment | null;
  countryCode: string | null;
  yearsOfExperience: number | null;
  headline: string | null;
  targetRoles: string[];
  experienceTitles: string[];
};

export type WorkSpan = {
  startDate: string;
  endDate: string | null;
};

export type AudienceSignals = {
  targetRole?: string | null;
  industry?: string | null;
  label?: string | null;
  summary?: string | null;
  countryCode?: string | null;
  workTitles?: string[];
  workSpans?: WorkSpan[];
  educationCount?: number;
  workCount?: number;
  profile?: ProfileHint | null;
};

export type ResumeAudience = {
  field: ResumeField;
  stage: CareerStage;
  region: ResumeRegion;
  years: number | null;
  switching: boolean;
};

const FIELD_PATTERNS: Record<Exclude<ResumeField, "general">, RegExp> = {
  software:
    /\b(software engineer|frontend|front-end|backend|back-end|full[- ]?stack|devops|site reliability|sre|programmer|developer|data scientist|machine learning|ml engineer|data engineer|typescript|javascript|react|node\.?js|python|golang|java|kubernetes)\b/i,
  design:
    /\b(designer|product design|graphic design|visual design|ux|ui\/ux|user experience|user interface)\b/i,
  marketing:
    /\b(marketing|brand manager|content strateg|growth market|seo|sem|demand gen|campaign)\b/i,
  finance:
    /\b(finance|financial|accountant|accounting|investment bank|equity research|fp&a|audit|banking|controller)\b/i,
  consulting: /\b(consult(?:ant|ing)|strategy associate|case interview)\b/i,
  academia:
    /\b(professor|post-?doc|lecturer|faculty|phd candidate|academic|researcher)\b/i,
  healthcare:
    /\b(nurse|physician|doctor|clinical|pharmacist|therapist|healthcare|medical)\b/i,
};

const INDUSTRY_FIELD: Record<string, ResumeField> = {
  technology: "software",
  marketing: "marketing",
  creative: "design",
  healthcare: "healthcare",
  academic: "academia",
};

/** Finer than field, so two general titles can still be a career change. */
const PROFESSION_PATTERNS: Array<[string, RegExp]> = [
  ["teaching", /\b(teacher|teaching|tutor|schoolteacher)\b/i],
  ["product", /\b(product manager|product management|product owner)\b/i],
  ["nursing", /\b(nurse|nursing)\b/i],
  ["research", /\b(researcher|post-?doc|professor)\b/i],
];

function professionBucket(text: string): string | null {
  for (const [id, pattern] of PROFESSION_PATTERNS) {
    if (pattern.test(text)) return id;
  }
  return null;
}

function parseYearMonth(
  value: string | null | undefined,
): { year: number; month: number } | null {
  if (!value) return null;
  const match = /^(\d{4})(?:-(\d{2}))?/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = match[2] ? Number(match[2]) : 1;
  if (!Number.isFinite(year) || month < 1 || month > 12) return null;
  return { year, month };
}

/** Span from the earliest start to the latest end. Overlapping roles are not added twice. */
export function yearsFromWorkSpans(
  spans: WorkSpan[],
  now = new Date(),
): number | null {
  let earliest: number | null = null;
  let latest: number | null = null;
  const today = now.getUTCFullYear() * 12 + now.getUTCMonth() + 1;
  for (const span of spans) {
    const start = parseYearMonth(span.startDate);
    if (!start) continue;
    const end = parseYearMonth(span.endDate);
    const startIndex = start.year * 12 + start.month;
    const endIndex = end ? end.year * 12 + end.month : today;
    earliest = earliest == null ? startIndex : Math.min(earliest, startIndex);
    latest = latest == null ? endIndex : Math.max(latest, endIndex);
  }
  if (earliest == null || latest == null || latest < earliest) return null;
  return Math.round(((latest - earliest) / 12) * 10) / 10;
}

function classify(text: string): ResumeField {
  let best: ResumeField = "general";
  let bestScore = 0;
  for (const field of Object.keys(FIELD_PATTERNS) as Array<
    Exclude<ResumeField, "general">
  >) {
    const hits =
      text.match(new RegExp(FIELD_PATTERNS[field], "gi"))?.length ?? 0;
    if (hits > bestScore) {
      best = field;
      bestScore = hits;
    }
  }
  return best;
}

export function detectRegion(
  countryCode: string | null | undefined,
): ResumeRegion {
  const code = (countryCode ?? "").trim().toUpperCase();
  if (code === "IN" || code === "IND") return "IN";
  if (code === "US" || code === "USA") return "US";
  if (code === "UK" || code === "GB" || code === "GBR") return "UK";
  return "other";
}

export function detectAudience(signals: AudienceSignals): ResumeAudience {
  const profile = signals.profile ?? null;
  const targetText = [
    signals.targetRole,
    signals.label,
    profile?.headline,
    ...(profile?.targetRoles ?? []),
  ]
    .filter(Boolean)
    .join(" ");
  const historyText = [
    ...(signals.workTitles ?? []),
    ...(profile?.experienceTitles ?? []),
    signals.summary,
  ]
    .filter(Boolean)
    .join(" ");

  const targetField = classify(targetText);
  const historyField = classify(historyText);
  const industryField = signals.industry
    ? (INDUSTRY_FIELD[signals.industry] ?? "general")
    : "general";

  const field =
    targetField !== "general"
      ? targetField
      : historyField !== "general"
        ? historyField
        : industryField;

  const spannedYears = yearsFromWorkSpans(signals.workSpans ?? []);
  const years = profile?.yearsOfExperience ?? spannedYears;
  const historyJobs = Math.max(
    signals.workCount ?? 0,
    profile?.experienceTitles.filter((title) => title.trim()).length ?? 0,
  );
  const targetProfession = professionBucket(
    [signals.targetRole, ...(profile?.targetRoles ?? [])]
      .filter(Boolean)
      .join(" "),
  );
  const historyProfession = professionBucket(
    [...(signals.workTitles ?? []), ...(profile?.experienceTitles ?? [])]
      .filter(Boolean)
      .join(" "),
  );
  const fieldSwitch =
    targetField !== "general" &&
    historyField !== "general" &&
    targetField !== historyField;
  const professionSwitch =
    targetProfession != null &&
    historyProfession != null &&
    targetProfession !== historyProfession;
  const switching =
    (fieldSwitch || professionSwitch) &&
    profile?.segment !== "student" &&
    historyJobs > 0;

  let stage: CareerStage;
  if (switching) stage = "switcher";
  else if (profile?.segment === "student") stage = "student";
  else if (profile?.segment === "fresher") stage = "fresher";
  else if (years != null && years < 2) stage = "fresher";
  else if (profile?.segment === "professional" || (years != null && years >= 2))
    stage = "experienced";
  else if (historyJobs === 0 && (signals.educationCount ?? 0) > 0)
    stage = "student";
  else if (historyJobs <= 1) stage = "fresher";
  else stage = "experienced";

  const region = detectRegion(
    profile?.countryCode || signals.countryCode || null,
  );

  return { field, stage, region, years, switching };
}
