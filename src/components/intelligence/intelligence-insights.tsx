import { ArrowRight, Check, Circle } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RoleMarket } from "@/lib/career/market";
import type { IntelligenceReport } from "@/types/intelligence";

export function IntelligenceInsights({
  report,
}: {
  report: IntelligenceReport;
}) {
  const activeRoles = report.market.roles.filter((role) => role.jobCount > 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 rounded-2xl border border-border/70 bg-card p-6 lg:grid-cols-[16rem_1fr]">
        <div>
          <p className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
            Career score
          </p>
          <p className="mt-2 font-black font-heading text-6xl tabular-nums tracking-tight">
            {report.score.careerScore == null
              ? "Not scored"
              : report.score.careerScore}
          </p>
          <p className="mt-3 font-medium text-muted-foreground text-sm leading-relaxed">
            {report.score.careerScore == null
              ? `Completeness is ${report.score.completeness}. The score appears after an analysis.`
              : `${Math.round(report.score.weights.readiness * 100)}% readiness, ${Math.round(report.score.weights.completeness * 100)}% completeness.`}
          </p>
          {report.score.basis === "all_jobs" ? (
            <p className="mt-2 font-medium text-muted-foreground text-sm leading-relaxed">
              No analysis jobs matched your target titles, so readiness uses
              every job from the latest analysis.
            </p>
          ) : null}
        </div>
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex justify-between font-medium text-muted-foreground text-xs uppercase tracking-widest">
              <span>
                Readiness{" "}
                {report.score.readiness == null
                  ? "not scored"
                  : report.score.readiness}
              </span>
              <span>Completeness {report.score.completeness}</span>
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="bg-primary"
                style={{ width: `${report.score.weights.readiness * 100}%` }}
              />
              <div
                className="bg-primary/35"
                style={{
                  width: `${report.score.weights.completeness * 100}%`,
                }}
              />
            </div>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {report.score.signals.map((signal) => (
              <li
                key={signal.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2"
              >
                <span className="flex items-center gap-2 font-semibold text-sm">
                  {signal.present ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  {signal.label}
                </span>
                <span className="font-medium text-muted-foreground text-xs tabular-nums">
                  {signal.present ? signal.points : 0}/{signal.points}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-bold text-lg">Market for your targets</h2>
          <p className="max-w-xl font-medium text-muted-foreground text-sm">
            From the jobs in your latest analysis. Public ATS boards are not
            connected yet.
          </p>
        </div>
        {report.market.basis === "none" ? (
          <p className="rounded-2xl border border-border/70 border-dashed px-5 py-6 font-medium text-muted-foreground text-sm">
            Run an analysis to see pay, companies, and the skills those roles
            ask for.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {report.market.roles.map((role) => (
              <MarketCard key={role.id} role={role} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-lg">Skills versus the role</h2>
        {activeRoles.length === 0 ? (
          <p className="font-medium text-muted-foreground text-sm">
            Skill gaps show up here once an analysis has jobs for a target.
          </p>
        ) : (
          <div className="grid gap-4">
            {activeRoles.map((role) => (
              <GapCard key={role.id} role={role} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-lg">Next</h2>
        {report.nextSteps.length === 0 ? (
          <p className="font-medium text-muted-foreground text-sm">
            Nothing urgent. Sync again when your resume or target changes.
          </p>
        ) : (
          <ol className="grid gap-3">
            {report.nextSteps.map((step, index) => (
              <li
                key={step.id}
                className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex gap-3">
                  <span className="font-black font-heading text-muted-foreground text-sm tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-bold">{step.title}</p>
                    <p className="mt-1 font-medium text-muted-foreground text-sm">
                      {step.detail}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  render={<Link href={step.href} />}
                  className="shrink-0"
                >
                  Open
                  <ArrowRight />
                </Button>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function MarketCard({ role }: { role: RoleMarket }) {
  const remote =
    role.remoteKnown > 0
      ? `${role.remoteCount} of ${role.remoteKnown} remote`
      : null;
  return (
    <article className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">{role.title}</h3>
          <p className="mt-1 font-medium text-muted-foreground text-sm">
            {role.jobCount === 0
              ? "No analysis jobs used this title"
              : `${role.jobCount} ${role.jobCount === 1 ? "job" : "jobs"}`}
            {remote ? ` · ${remote}` : ""}
          </p>
        </div>
        {role.isPrimary ? <Badge>Primary</Badge> : null}
      </div>
      <p className="mt-4 font-black font-heading text-2xl tabular-nums tracking-tight">
        {role.salary
          ? `${formatInr(role.salary.lowInr)} – ${formatInr(role.salary.highInr)}`
          : "Pay not listed"}
      </p>
      <p className="mt-1 font-medium text-muted-foreground text-xs">
        {role.salary
          ? `Median ${formatInr(role.salary.medianInr)} · ${role.salary.sampleSize} salaries`
          : "Need at least two listed salaries"}
      </p>
      {role.companies.length > 0 ? (
        <p className="mt-3 font-medium text-sm">
          {role.companies.map((company) => company.name).join(", ")}
        </p>
      ) : null}
    </article>
  );
}

function GapCard({ role }: { role: RoleMarket }) {
  const missing = role.skills.filter((skill) => !skill.onProfile);
  const have = role.skills.filter((skill) => skill.onProfile);
  return (
    <article className="rounded-2xl border border-border/70 bg-card p-5">
      <h3 className="font-bold">{role.title}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <SkillColumn title="Missing" empty="None in the top skills.">
          {missing.map((skill) => (
            <li
              key={skill.name}
              className="flex items-center justify-between gap-3"
            >
              <span className="font-semibold text-sm">{skill.name}</span>
              <span className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
                {skill.priority} · {skill.frequency}/{skill.jobCount}
              </span>
            </li>
          ))}
        </SkillColumn>
        <SkillColumn title="On your file" empty="None of the asked skills yet.">
          {have.map((skill) => (
            <li
              key={skill.name}
              className="flex items-center justify-between gap-3"
            >
              <span className="font-semibold text-sm">{skill.name}</span>
              <span className="font-medium text-muted-foreground text-xs">
                {skill.level && skill.level !== "unspecified"
                  ? skill.level
                  : "On file"}
              </span>
            </li>
          ))}
        </SkillColumn>
      </div>
    </article>
  );
}

function SkillColumn({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const present = items.some(Boolean);
  return (
    <div>
      <p className="mb-2 font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
        {title}
      </p>
      {present ? (
        <ul className="space-y-2">{children}</ul>
      ) : (
        <p className="font-medium text-muted-foreground text-sm">{empty}</p>
      )}
    </div>
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
