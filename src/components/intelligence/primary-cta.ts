import type { IntelligenceReport } from "@/types/intelligence";

export type IntelligencePrimaryCta = {
  kind: "coach" | "resume";
  href: "/skill-coach" | "/resumes";
  label: "Skill Coach" | "Resume Builder";
};

type CtaReport = {
  coachEnabled: boolean;
  market: IntelligenceReport["market"];
};

/** Missing market skills, first-seen order, one chip per name. */
export function intelligenceGapNames(report: {
  market: IntelligenceReport["market"];
}): string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const role of report.market.roles) {
    for (const skill of role.skills) {
      const name = skill.name.trim();
      if (skill.onProfile || name.length === 0 || seen.has(name)) continue;
      seen.add(name);
      names.push(name);
    }
  }
  return names;
}

/**
 * One primary action: Skill Coach when coaching is on and a gap exists,
 * otherwise Resume Builder.
 */
export function selectIntelligencePrimaryCta(
  report: CtaReport,
): IntelligencePrimaryCta {
  if (report.coachEnabled && intelligenceGapNames(report).length > 0) {
    return {
      kind: "coach",
      href: "/skill-coach",
      label: "Skill Coach",
    };
  }
  return {
    kind: "resume",
    href: "/resumes",
    label: "Resume Builder",
  };
}
