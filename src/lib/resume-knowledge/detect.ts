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

export type AudienceSignals = {
  targetRole?: string | null;
  industry?: string | null;
  label?: string | null;
  summary?: string | null;
  countryCode?: string | null;
  workTitles?: string[];
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
    /\b(software|frontend|front-end|backend|back-end|full[- ]?stack|devops|site reliability|sre|programmer|developer|typescript|javascript|react|node\.?js|python|golang|java|kubernetes)\b/i,
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

  const years = profile?.yearsOfExperience ?? null;
  const switching =
    targetField !== "general" &&
    historyField !== "general" &&
    targetField !== historyField &&
    profile?.segment !== "student" &&
    (signals.workCount ?? 0) > 0;

  let stage: CareerStage;
  if (switching) stage = "switcher";
  else if (profile?.segment === "student") stage = "student";
  else if (profile?.segment === "fresher") stage = "fresher";
  else if (years != null && years < 2) stage = "fresher";
  else if (profile?.segment === "professional" || (years != null && years >= 2))
    stage = "experienced";
  else if ((signals.workCount ?? 0) === 0 && (signals.educationCount ?? 0) > 0)
    stage = "student";
  else if ((signals.workCount ?? 0) <= 1) stage = "fresher";
  else stage = "experienced";

  const region = detectRegion(
    profile?.countryCode || signals.countryCode || null,
  );

  return { field, stage, region, years, switching };
}
