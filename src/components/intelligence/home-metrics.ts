import type { RoleMarket } from "@/lib/career/market";
import type { IntelligenceReport } from "@/types/intelligence";

export function primaryMarketRole(
  report: IntelligenceReport,
): RoleMarket | null {
  return (
    report.market.roles.find((role) => role.isPrimary) ??
    report.market.roles[0] ??
    null
  );
}

export function matchedJobCount(report: IntelligenceReport): number {
  return report.market.roles.reduce((sum, role) => sum + role.jobCount, 0);
}

export function verifiedSkillNames(
  skills: { name: string; evidence: { kind: string }[] }[],
): string[] {
  const names: string[] = [];
  for (const skill of skills) {
    const verified = skill.evidence.some((item) => item.kind === "verified");
    if (!verified || names.includes(skill.name)) continue;
    names.push(skill.name);
  }
  return names;
}
