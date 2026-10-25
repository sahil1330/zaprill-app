import { Check, Circle } from "lucide-react";
import Link from "next/link";
import { PageEmpty } from "@/components/app/page-state";
import {
  type IntelligencePrimaryCta,
  intelligenceGapNames,
  selectIntelligencePrimaryCta,
} from "@/components/intelligence/primary-cta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RoleMarket, RoleSkillDemand } from "@/lib/career/market";
import type { IntelligenceReport } from "@/types/intelligence";

const NEXT_STEP_LIMIT = 3;

export function IntelligenceInsights({
  report,
}: {
  report: IntelligenceReport;
}) {
  const cta = selectIntelligencePrimaryCta(report);
  const gaps = collectGaps(report);
  const onFile = collectOnFile(report);
  const meaning =
    report.score.careerScore == null
      ? `Completeness is ${report.score.completeness}. The score appears after an analysis.`
      : `${Math.round(report.score.weights.readiness * 100)}% readiness, ${Math.round(report.score.weights.completeness * 100)}% completeness.`;

  return (
    <div className="space-y-8">
      <section
        data-slot="intelligence-hero"
        className="rounded-lg border border-border bg-card px-5 py-6 sm:px-6"
      >
        <p className="font-medium text-muted-foreground text-xs">
          Career score
        </p>
        <p className="mt-1 font-heading font-semibold text-6xl text-foreground tabular-nums tracking-tight">
          {report.score.careerScore == null
            ? "Not scored"
            : report.score.careerScore}
        </p>
        <p className="mt-2 max-w-xl text-muted-foreground text-sm">{meaning}</p>
        <div
          className="mt-5 hidden md:block"
          data-primary-cta={cta.kind}
          data-slot="intelligence-primary-cta"
        >
          <PrimaryCtaButton cta={cta} />
        </div>
      </section>

      <section className="space-y-3" data-slot="intelligence-market">
        <div>
          <h2 className="font-medium text-muted-foreground text-sm">Market</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            From the jobs in your latest analysis. Public ATS boards are not
            connected yet.
          </p>
          {report.score.basis === "all_jobs" ? (
            <p className="mt-1 text-muted-foreground text-sm">
              No analysis jobs matched your target titles, so readiness uses
              every job from the latest analysis.
            </p>
          ) : null}
        </div>
        {report.market.basis === "none" ? (
          <PageEmpty
            title="No analysis yet"
            description="Pay, companies, and skill gaps show up here after an analysis."
            action={
              <Button variant="outline" render={<Link href="/analyze" />}>
                Run an analysis
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {report.market.roles.map((role) => (
              <MarketCard key={role.id} role={role} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3" data-slot="intelligence-gaps">
        <h2 className="font-medium text-muted-foreground text-sm">Gaps</h2>
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
            {onFile.length > 0 ? (
              <p className="text-muted-foreground text-sm">
                On file:{" "}
                {onFile
                  .map((skill) =>
                    skill.level ? `${skill.name} (${skill.level})` : skill.name,
                  )
                  .join(", ")}
              </p>
            ) : null}
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
        <h2 className="font-medium text-muted-foreground text-sm">Next</h2>
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
        data-slot="intelligence-score-detail"
        className="space-y-3 border-border border-t pt-4 text-muted-foreground"
      >
        <h2 className="font-medium text-sm">Score breakdown</h2>
        <div>
          <div className="mb-2 flex justify-between text-xs">
            <span>
              Readiness{" "}
              {report.score.readiness == null
                ? "not scored"
                : report.score.readiness}
            </span>
            <span>Completeness {report.score.completeness}</span>
          </div>
          <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="bg-primary/70"
              style={{ width: `${report.score.weights.readiness * 100}%` }}
            />
            <div
              className="bg-primary/25"
              style={{
                width: `${report.score.weights.completeness * 100}%`,
              }}
            />
          </div>
        </div>
        <ul className="space-y-1">
          {report.score.signals.map((signal) => (
            <li
              key={signal.id}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <span className="flex items-center gap-2">
                {signal.present ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Circle className="h-3.5 w-3.5" />
                )}
                {signal.label}
              </span>
              <span className="tabular-nums">
                {signal.present ? signal.points : 0}/{signal.points}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div
        data-slot="intelligence-sticky-cta"
        data-primary-cta={cta.kind}
        className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 border-border border-t bg-background/95 px-4 py-3 backdrop-blur md:hidden"
      >
        <PrimaryCtaButton cta={cta} />
      </div>
    </div>
  );
}

function PrimaryCtaButton({ cta }: { cta: IntelligencePrimaryCta }) {
  return (
    <Button className="h-11 w-full md:w-auto" render={<Link href={cta.href} />}>
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

function collectOnFile(
  report: IntelligenceReport,
): { name: string; level: string | null }[] {
  const rows: { name: string; level: string | null }[] = [];
  const seen = new Set<string>();
  for (const role of report.market.roles) {
    for (const skill of role.skills) {
      if (!skill.onProfile || seen.has(skill.name)) continue;
      seen.add(skill.name);
      rows.push({
        name: skill.name,
        level:
          skill.level && skill.level !== "unspecified" ? skill.level : null,
      });
    }
  }
  return rows;
}

function MarketCard({ role }: { role: RoleMarket }) {
  const remote =
    role.remoteKnown > 0
      ? `${role.remoteCount} of ${role.remoteKnown} remote`
      : null;
  return (
    <article className="rounded-lg border border-border px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-foreground text-sm">{role.title}</h3>
          <p className="mt-0.5 text-muted-foreground text-xs">
            {role.jobCount === 0
              ? "No analysis jobs used this title"
              : `${role.jobCount} ${role.jobCount === 1 ? "job" : "jobs"}`}
            {remote ? ` · ${remote}` : ""}
          </p>
        </div>
        {role.isPrimary ? <Badge variant="outline">Primary</Badge> : null}
      </div>
      <p className="mt-2 font-medium text-foreground text-sm tabular-nums">
        {role.salary
          ? `${formatInr(role.salary.lowInr)} – ${formatInr(role.salary.highInr)}`
          : "Pay not listed"}
      </p>
      <p className="mt-0.5 text-muted-foreground text-xs">
        {role.salary
          ? `Median ${formatInr(role.salary.medianInr)} · ${role.salary.sampleSize} salaries`
          : "Need at least two listed salaries"}
      </p>
      {role.companies.length > 0 ? (
        <p className="mt-2 text-muted-foreground text-sm">
          {role.companies.map((company) => company.name).join(", ")}
        </p>
      ) : null}
    </article>
  );
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
