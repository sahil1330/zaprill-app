import Link from "next/link";
import type { JSX } from "react";
import {
  matchedJobCount,
  primaryMarketRole,
} from "@/components/intelligence/home-metrics";
import {
  type IntelligencePrimaryCta,
  intelligenceGapNames,
  selectIntelligencePrimaryCta,
} from "@/components/intelligence/primary-cta";
import { Button } from "@/components/ui/button";
import { APP_NAV_LINKED } from "@/lib/app-nav";
import type { RoleSkillDemand } from "@/lib/career/market";
import { VERIFIED_SKILL_LABEL } from "@/types/career-profile";
import type { IntelligenceReport } from "@/types/intelligence";

const NEXT_STEP_LIMIT = 3;

export function IntelligenceInsights({
  report,
  atsScore,
  verifiedSkills,
}: {
  report: IntelligenceReport;
  atsScore: number | null;
  verifiedSkills: { name: string }[];
}): JSX.Element {
  const cta = selectIntelligencePrimaryCta(report);
  const gaps = collectGaps(report);
  const role = primaryMarketRole(report);
  const jobs = matchedJobCount(report);
  const salary = role?.salary ?? null;
  const meaning =
    report.score.careerScore == null
      ? `Completeness is ${report.score.completeness}. The score appears after an analysis.`
      : `${Math.round(report.score.weights.readiness * 100)}% readiness, ${Math.round(report.score.weights.completeness * 100)}% completeness.`;

  return (
    <div
      data-slot="home-board-regions"
      className="mx-auto w-full max-w-[1100px] space-y-4"
    >
      <section
        data-slot="intelligence-hero"
        className="rounded-lg border border-border bg-card px-5 py-4 shadow-none"
      >
        <p className="text-muted-foreground text-sm">Career score</p>
        <p className="font-heading text-5xl tabular-nums">
          {report.score.careerScore == null
            ? "Not scored"
            : report.score.careerScore}
        </p>
        <p className="text-muted-foreground text-sm">{meaning}</p>
        <div data-primary-cta={cta.kind}>
          <PrimaryCtaButton cta={cta} />
        </div>
      </section>

      <section
        data-slot="home-metrics"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <article
          data-slot="metric-ats"
          className="rounded-lg border border-border bg-card p-4 shadow-none"
        >
          <p className="text-muted-foreground text-sm">ATS</p>
          <p className="font-heading text-2xl tabular-nums">
            {atsScore == null ? "Not scored" : `${atsScore}%`}
          </p>
          <Link href="/resumes" className="text-muted-foreground text-sm">
            Resume
          </Link>
        </article>
        {salary ? (
          <article
            data-slot="metric-salary"
            className="rounded-lg border border-border bg-card p-4 shadow-none"
          >
            <p className="text-muted-foreground text-sm">Market</p>
            <p className="font-heading text-2xl tabular-nums">
              {formatInr(salary.lowInr)} – {formatInr(salary.highInr)}
            </p>
          </article>
        ) : null}
        <article
          data-slot="metric-jobs"
          className="rounded-lg border border-border bg-card p-4 shadow-none"
        >
          <p className="text-muted-foreground text-sm">Jobs matched</p>
          <p className="font-heading text-2xl tabular-nums">{jobs}</p>
        </article>
      </section>

      <section className="space-y-3" data-slot="intelligence-gaps">
        <h2 className="text-muted-foreground text-sm">Gaps</h2>
        {gaps.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {report.market.roles.some((role) => role.jobCount > 0)
              ? "No missing skills in the latest analysis."
              : "Skill gaps show up here once an analysis has jobs for a target."}
          </p>
        ) : (
          <>
            <ul className="flex flex-wrap gap-2">
              {gaps.map((gap) => {
                const className =
                  "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 text-foreground text-sm";
                const body = (
                  <>
                    <span>{gap.name}</span>
                    {gap.priority ? (
                      <span className="text-muted-foreground text-xs uppercase tracking-wide">
                        {gap.priority}
                      </span>
                    ) : null}
                  </>
                );
                return (
                  <li key={gap.name}>
                    {report.coachEnabled ? (
                      <Link
                        href="/skill-coach"
                        data-slot="gap-chip"
                        className={className}
                      >
                        {body}
                      </Link>
                    ) : (
                      <span data-slot="gap-chip" className={className}>
                        {body}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            {report.coachEnabled ? null : (
              <p className="text-muted-foreground text-sm">
                Coaching is paused. These gaps stay listed until you update your
                resume.
              </p>
            )}
          </>
        )}
      </section>

      <section className="space-y-3" data-slot="intelligence-next">
        <h2 className="text-muted-foreground text-sm">Next</h2>
        {report.nextSteps.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nothing urgent. Sync again when your resume or target changes.
          </p>
        ) : (
          <ol className="space-y-3">
            {report.nextSteps.slice(0, NEXT_STEP_LIMIT).map((step, index) => (
              <li
                key={step.id}
                data-slot="next-step"
                className="flex gap-3 text-sm"
              >
                <span className="w-5 text-muted-foreground tabular-nums">
                  {index + 1}
                </span>
                <div>
                  <Link
                    href={step.href}
                    className="inline-flex min-h-11 items-center font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {step.title}
                  </Link>
                  <p className="text-muted-foreground">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section
        data-slot="home-verified"
        className="text-muted-foreground text-sm"
      >
        <h2 className="text-sm">Verified skills</h2>
        {verifiedSkills.length === 0 ? (
          <p>No skills verified in Skill Coach yet.</p>
        ) : (
          <ul>
            {verifiedSkills.map((skill) => (
              <li key={skill.name}>
                {skill.name} · {VERIFIED_SKILL_LABEL}
              </li>
            ))}
          </ul>
        )}
      </section>

      <nav data-slot="home-secondary-strip" aria-label="More career tools">
        <ul className="flex flex-wrap items-center gap-x-2 text-muted-foreground text-sm">
          {APP_NAV_LINKED.map((item, index) => (
            <li key={item.url} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">·</span> : null}
              <Link href={item.url} className="hover:text-foreground">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function PrimaryCtaButton({ cta }: { cta: IntelligencePrimaryCta }) {
  return (
    <Button
      className="mt-4 h-11 w-full shadow-none sm:w-auto"
      render={<Link href={cta.href} />}
    >
      {cta.label}
    </Button>
  );
}

function collectGaps(report: IntelligenceReport): RoleSkillDemand[] {
  const names = new Set(intelligenceGapNames(report));
  const gaps: RoleSkillDemand[] = [];
  const seen = new Set<string>();
  for (const role of report.market.roles) {
    for (const skill of role.skills) {
      if (!names.has(skill.name) || seen.has(skill.name)) continue;
      seen.add(skill.name);
      gaps.push(skill);
    }
  }
  return gaps;
}

function formatInr(amount: number): string {
  if (amount >= 10_000_000) {
    const crore = amount / 10_000_000;
    const text = Number.isInteger(crore) ? String(crore) : crore.toFixed(1);
    return `₹${text} Cr`;
  }
  if (amount >= 100_000) {
    const lakh = amount / 100_000;
    const text = Number.isInteger(lakh) ? String(lakh) : lakh.toFixed(1);
    return `₹${text} LPA`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}
