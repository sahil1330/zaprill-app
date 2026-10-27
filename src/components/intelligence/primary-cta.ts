import type { IntelligenceReport } from "@/types/intelligence";

export type IntelligencePrimaryCta = {
  kind: "coach" | "resume" | "analyze";
  href: "/skill-coach" | "/resumes" | "/analyze" | "/onboarding";
  label: "Skill Coach" | "Resume Builder" | "Run analysis" | "Add your resume";
};

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

export function selectIntelligencePrimaryCta(
  report: IntelligenceReport,
): IntelligencePrimaryCta {
  if (report.coachEnabled && intelligenceGapNames(report).length > 0) {
    return {
      kind: "coach",
      href: "/skill-coach",
      label: "Skill Coach",
    };
  }
  if (report.score.careerScore == null || report.market.basis === "none") {
    const needsResume = report.nextSteps.some(
      (step) => step.id === "resume" && step.href === "/onboarding",
    );
    if (needsResume) {
      return {
        kind: "analyze",
        href: "/onboarding",
        label: "Add your resume",
      };
    }
    return {
      kind: "analyze",
      href: "/analyze",
      label: "Run analysis",
    };
  }
  return {
    kind: "resume",
    href: "/resumes",
    label: "Resume Builder",
  };
}
