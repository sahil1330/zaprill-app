"use client";

import {
  Briefcase,
  GraduationCap,
  Loader2,
  MapPin,
  Radar,
  RefreshCw,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import {
  PageEmpty,
  PageError,
  PageSkeleton,
} from "@/components/app/page-state";
import { verifiedSkillNames } from "@/components/intelligence/home-metrics";
import { IntelligenceInsights } from "@/components/intelligence/intelligence-insights";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  CareerExpectedPay,
  CareerPayFigure,
  CareerPayPeriod,
  CareerProfileView,
  CareerSegment,
  CareerSkillLevel,
} from "@/types/career-profile";
import { VERIFIED_SKILL_LABEL } from "@/types/career-profile";
import type { IntelligenceReport } from "@/types/intelligence";

const SEGMENTS: { id: CareerSegment; label: string }[] = [
  { id: "student", label: "Student" },
  { id: "fresher", label: "Fresher" },
  { id: "professional", label: "Professional" },
];

const LEVEL_LABEL: Record<CareerSkillLevel, string> = {
  unspecified: "Not rated",
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

const LEVEL_WIDTH: Record<CareerSkillLevel, number> = {
  unspecified: 0,
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 100,
};

const SENIORITY_LABEL: Record<string, string> = {
  intern: "Intern",
  fresher: "Fresher",
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  lead: "Lead",
  unspecified: "Level open",
};

async function readReport(response: Response): Promise<IntelligenceReport> {
  const body = (await response.json().catch(() => ({}))) as {
    report?: IntelligenceReport;
    error?: string;
  };
  if (!response.ok || !body.report) {
    throw new Error(body.error || "Could not load market insights");
  }
  return body.report;
}

export function IntelligenceDashboard() {
  const [profile, setProfile] = useState<CareerProfileView | null>(null);
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [savingSegment, setSavingSegment] = useState<CareerSegment | null>(
    null,
  );

  const refreshReport = useCallback(async () => {
    try {
      const response = await fetch("/api/intelligence");
      setReport(await readReport(response));
      setReportError(null);
    } catch (err) {
      setReportError(
        err instanceof Error ? err.message : "Could not load market insights",
      );
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Profile first. The first visit materializes the career file once,
      // and the report then reads that row instead of deriving it again.
      const response = await fetch("/api/career-profile");
      const body = (await response.json().catch(() => ({}))) as {
        profile?: CareerProfileView;
        error?: string;
      };
      if (!response.ok || !body.profile) {
        throw new Error(body.error || "Could not load your career file");
      }
      setProfile(body.profile);
      try {
        const reportResponse = await fetch("/api/intelligence");
        setReport(await readReport(reportResponse));
        setReportError(null);
      } catch (err) {
        setReport(null);
        setReportError(
          err instanceof Error ? err.message : "Could not load market insights",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load your career file",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const syncFromResume = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/career-profile/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = (await response.json().catch(() => ({}))) as {
        profile?: CareerProfileView;
        error?: string;
      };
      if (!response.ok || !body.profile) {
        throw new Error(body.error || "Could not sync from your resume");
      }
      setProfile(body.profile);
      await refreshReport();
      toast.success("Career file updated from your resume");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not sync from your resume",
      );
    } finally {
      setSyncing(false);
    }
  };

  const setSegment = async (segment: CareerSegment) => {
    if (!profile || profile.segment === segment) return;
    setSavingSegment(segment);
    try {
      const response = await fetch("/api/career-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segment }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        profile?: CareerProfileView;
        error?: string;
      };
      if (!response.ok || !body.profile) {
        throw new Error(body.error || "Could not update your path");
      }
      setProfile(body.profile);
      await refreshReport();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update your path",
      );
    } finally {
      setSavingSegment(null);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
        <PageHeader
          eyebrow="Dashboard"
          title="Intelligence"
          description="Your career score and the next move for your target roles."
        />
        <PageSkeleton rows={4} />
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
        <PageHeader
          eyebrow="Dashboard"
          title="Intelligence"
          description="Your career file could not be loaded."
        />
        <PageError
          message={error || "Your career file could not be loaded."}
          onRetry={() => void load()}
        />
      </main>
    );
  }

  const emptyFile =
    profile.skills.length === 0 &&
    profile.academics.length === 0 &&
    profile.experience.length === 0;
  const payPeriod: CareerPayPeriod = profile.compensation.stipend
    ? "monthly"
    : "annual";
  const roleReadiness = new Map(
    profile.intelligence.roles.map((role) => [role.id, role]),
  );

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-4 pt-8 pb-16 md:px-6 md:pt-10 md:pb-10">
      <PageHeader
        eyebrow="Dashboard"
        title="Intelligence"
        description="Your career score and the next move for your target roles."
        action={
          <Button
            variant="outline"
            onClick={() => void syncFromResume()}
            disabled={syncing}
          >
            {syncing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            Sync from resume
          </Button>
        }
      />

      {report ? (
        <IntelligenceInsights
          report={report}
          atsScore={null}
          verifiedSkills={verifiedSkillNames(profile.skills).map((name) => ({
            name,
          }))}
        />
      ) : (
        <PageError
          message={reportError || "Market insights could not be loaded."}
          onRetry={() => void refreshReport()}
        />
      )}

      <div
        data-slot="intelligence-secondary"
        className="space-y-6 border-border border-t pt-8"
      >
        <section id="path" className="scroll-mt-24 space-y-3">
          <h2 className="font-medium text-muted-foreground text-sm">
            Career file
          </h2>
          <div className="flex flex-wrap gap-2">
            {SEGMENTS.map((segment) => {
              const selected = profile.segment === segment.id;
              return (
                <Button
                  key={segment.id}
                  variant={selected ? "secondary" : "outline"}
                  aria-pressed={selected}
                  disabled={savingSegment !== null}
                  onClick={() => void setSegment(segment.id)}
                >
                  {savingSegment === segment.id ? (
                    <Loader2 className="animate-spin" />
                  ) : null}
                  {segment.label}
                </Button>
              );
            })}
          </div>
          <p className="font-medium text-muted-foreground text-sm">
            {profile.segment == null
              ? "Choose the path that fits you right now."
              : profile.fieldSources.segment === "inferred"
                ? "Inferred from your resume. Change it if this is wrong."
                : "You set this path. Resume sync will keep it."}{" "}
            {[formatPlace(profile), formatYears(profile.yearsOfExperience)]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </section>

        <section className="grid overflow-hidden rounded-lg border border-border sm:grid-cols-2 sm:divide-x sm:divide-border">
          <PayFigure
            label={payPeriod === "monthly" ? "Current stipend" : "Current CTC"}
            amount={displayPay(profile.compensation.current, payPeriod)}
            hint={salaryHint(profile, payPeriod)}
            period={payPeriod}
          />
          <PayFigure
            label={
              payPeriod === "monthly" ? "Expected stipend" : "Expected CTC"
            }
            amount={null}
            band={expectedBand(profile.compensation.expected, payPeriod)}
            hint={
              payPeriod === "monthly"
                ? "Monthly band, saved as annual too"
                : "Annual band, INR"
            }
            period={payPeriod}
            className="border-border border-t sm:border-t-0"
          />
        </section>

        <PayEditor
          key={`${profile.updatedAt}-${payPeriod}`}
          profile={profile}
          period={payPeriod}
          onSaved={(next) => {
            setProfile(next);
            void refreshReport();
          }}
        />

        {emptyFile ? (
          <PageEmpty
            title="This file is still empty"
            description="Upload a resume and sync, or keep going and the other career tools will fill it in."
            action={
              <Button variant="outline" render={<Link href="/onboarding" />}>
                Upload a resume
              </Button>
            }
          />
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-lg border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-medium text-sm">
                <Target className="h-4 w-4 text-muted-foreground" />
                Target roles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.targetRoles.length === 0 ? (
                <p className="font-medium text-muted-foreground text-sm">
                  No target role yet. A saved resume target or headline will
                  land here after a sync.
                </p>
              ) : (
                profile.targetRoles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border/60 px-4 py-3"
                  >
                    <div>
                      <p className="font-bold">{role.title}</p>
                      <p className="mt-1 font-medium text-muted-foreground text-xs uppercase tracking-widest">
                        {readinessLabel(roleReadiness.get(role.id)?.readiness)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {role.isPrimary ? (
                        <Badge variant="outline">Primary</Badge>
                      ) : null}
                      <Badge variant="outline">
                        {SENIORITY_LABEL[role.seniority] ?? "Level open"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-lg border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-medium text-sm">
                <Radar className="h-4 w-4 text-muted-foreground" />
                Skills on file
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.skills.length === 0 ? (
                <p className="font-medium text-muted-foreground text-sm">
                  No skills yet. Sync from a resume to import them with a level
                  and where they showed up.
                </p>
              ) : (
                <ul className="max-h-96 space-y-3 overflow-auto pr-1">
                  {profile.skills.map((skill) => (
                    <li key={skill.id} className="space-y-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-semibold text-sm">
                          {skill.name}
                        </span>
                        <span className="font-medium text-muted-foreground text-xs">
                          {LEVEL_LABEL[skill.level]}
                          {skill.evidence.some(
                            (item) => item.kind === "verified",
                          )
                            ? ` · ${VERIFIED_SKILL_LABEL}`
                            : ""}
                        </span>
                      </div>
                      {LEVEL_WIDTH[skill.level] > 0 ? (
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${LEVEL_WIDTH[skill.level]}%` }}
                          />
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RecordList
            icon={GraduationCap}
            title="Academics"
            empty="No academics yet."
            rows={profile.academics.map((item) => ({
              id: item.id,
              title: item.institution,
              meta: [item.studyType, item.area, item.score]
                .filter(Boolean)
                .join(" · "),
              detail: formatRange(item.startDate, item.endDate, item.isCurrent),
            }))}
          />
          <RecordList
            icon={Briefcase}
            title="Experience"
            empty="No experience yet."
            rows={profile.experience.map((item) => ({
              id: item.id,
              title: item.title,
              meta: item.company,
              detail: formatRange(item.startDate, item.endDate, item.isCurrent),
            }))}
          />
        </div>
      </div>
    </main>
  );
}

function PayFigure({
  label,
  amount,
  band,
  hint,
  period,
  className,
}: {
  label: string;
  amount: number | null;
  band?: string | null;
  hint: string | null;
  period: CareerPayPeriod;
  className?: string;
}) {
  return (
    <div className={cn("px-6 py-5", className)}>
      <p className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
        {label}
      </p>
      <p className="mt-2 font-heading font-semibold text-xl tabular-nums tracking-tight">
        {band ?? formatPay(amount, period)}
      </p>
      {hint ? (
        <p className="mt-1 font-medium text-muted-foreground text-sm">{hint}</p>
      ) : null}
    </div>
  );
}

function PayEditor({
  profile,
  period,
  onSaved,
}: {
  profile: CareerProfileView;
  period: CareerPayPeriod;
  onSaved: (profile: CareerProfileView) => void;
}) {
  const [current, setCurrent] = useState(
    figureForPeriod(profile.compensation.current, period),
  );
  const [min, setMin] = useState(
    expectedForPeriod(profile.compensation.expected, period, "min"),
  );
  const [max, setMax] = useState(
    expectedForPeriod(profile.compensation.expected, period, "max"),
  );
  const [notice, setNotice] = useState(
    profile.compensation.noticePeriodDays == null
      ? ""
      : String(profile.compensation.noticePeriodDays),
  );
  const [relocate, setRelocate] = useState(profile.openToRelocate);
  const [saving, setSaving] = useState(false);
  const monthly = period === "monthly";
  const professional = profile.segment === "professional";

  const save = async () => {
    const currentAmount = parseMoney(current);
    const minAmount = parseMoney(min);
    const maxAmount = parseMoney(max);
    if (
      currentAmount === "invalid" ||
      minAmount === "invalid" ||
      maxAmount === "invalid"
    ) {
      toast.error("Enter whole rupees, or leave a field blank");
      return;
    }
    if (minAmount != null && maxAmount != null && minAmount > maxAmount) {
      toast.error("Expected minimum cannot exceed the maximum");
      return;
    }

    const body: Record<string, unknown> = {
      currentPayPeriod: period,
      currentPayInr: currentAmount,
      expectedPayPeriod: period,
      expectedMinInr: minAmount,
      expectedMaxInr: maxAmount,
    };

    if (professional) {
      const noticeDays =
        notice.trim() === "" ? null : Number.parseInt(notice, 10);
      if (
        noticeDays != null &&
        (!Number.isInteger(noticeDays) || noticeDays < 0 || noticeDays > 365)
      ) {
        toast.error("Notice period is a whole number of days, up to 365");
        return;
      }
      body.noticePeriodDays = noticeDays;
      body.openToRelocate = relocate;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/career-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        profile?: CareerProfileView;
        error?: string;
      };
      if (!response.ok || !payload.profile) {
        throw new Error(payload.error || "Could not save pay");
      }
      onSaved(payload.profile);
      toast.success("Career file updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save pay");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card id="pay" className="scroll-mt-24 rounded-lg border-border">
      <CardHeader>
        <CardTitle className="font-medium text-sm">Pay</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium text-muted-foreground text-sm">
          {monthly
            ? "Students and current interns enter a monthly stipend. We also store the annual equivalent."
            : "Enter annual CTC. Expected pay is a minimum and maximum."}
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <MoneyField
            id="career-current-pay"
            label={monthly ? "Current stipend / month" : "Current CTC / year"}
            value={current}
            onChange={setCurrent}
            hint={monthly ? annualEquivalent(current) : null}
          />
          <MoneyField
            id="career-expected-min"
            label={monthly ? "Expected min / month" : "Expected min / year"}
            value={min}
            onChange={setMin}
            hint={monthly ? annualEquivalent(min) : null}
          />
          <MoneyField
            id="career-expected-max"
            label={monthly ? "Expected max / month" : "Expected max / year"}
            value={max}
            onChange={setMax}
            hint={monthly ? annualEquivalent(max) : null}
          />
        </div>
        {professional ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5" htmlFor="career-notice-days">
              <span className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
                Notice period (days)
              </span>
              <Input
                id="career-notice-days"
                inputMode="numeric"
                value={notice}
                placeholder="Optional"
                onChange={(event) => setNotice(event.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 pt-6 font-medium text-sm">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={relocate}
                onChange={(event) => setRelocate(event.target.checked)}
              />
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Open to relocate
            </label>
          </div>
        ) : null}
        <Button variant="outline" onClick={() => void save()} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : null}
          Save pay
        </Button>
      </CardContent>
    </Card>
  );
}

function MoneyField({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint: string | null;
}) {
  return (
    <label className="space-y-1.5" htmlFor={id}>
      <span className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
        {label}
      </span>
      <Input
        id={id}
        inputMode="numeric"
        value={value}
        placeholder="Not set"
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? (
        <span className="block font-medium text-muted-foreground text-xs">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function RecordList({
  icon: Icon,
  title,
  empty,
  rows,
}: {
  icon: typeof Briefcase;
  title: string;
  empty: string;
  rows: { id: string; title: string; meta: string; detail: string | null }[];
}) {
  return (
    <Card className="rounded-lg border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-medium text-sm">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 ? (
          <p className="font-medium text-muted-foreground text-sm">{empty}</p>
        ) : (
          rows.map((row) => (
            <div key={row.id}>
              <p className="font-bold">{row.title}</p>
              {row.meta ? (
                <p className="font-medium text-muted-foreground text-sm">
                  {row.meta}
                </p>
              ) : null}
              {row.detail ? (
                <p className="font-medium text-muted-foreground text-xs">
                  {row.detail}
                </p>
              ) : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function formatPay(amount: number | null, period: CareerPayPeriod): string {
  if (amount == null) return "Not set";
  if (period === "monthly") {
    return `₹${amount.toLocaleString("en-IN")}/mo`;
  }
  return formatAnnualInr(amount);
}

function formatAnnualInr(amount: number | null): string {
  if (amount == null) return "Not set";
  if (amount >= 10_000_000) {
    const crore = amount / 10_000_000;
    const text = crore % 1 === 0 ? crore.toFixed(0) : crore.toFixed(1);
    return `₹${text} Cr`;
  }
  if (amount >= 100_000) {
    const lakh = amount / 100_000;
    const text = lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1);
    return `₹${text} LPA`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatPlace(profile: CareerProfileView): string | null {
  const country =
    profile.location.countryCode === "IN"
      ? "India"
      : profile.location.countryCode;
  const parts = [
    profile.location.city,
    profile.location.region,
    country,
  ].filter((part): part is string => Boolean(part));
  if (parts.length === 0) return null;
  if (parts.length === 1 && parts[0] === "India" && !profile.location.city) {
    return null;
  }
  return parts.join(", ");
}

function formatYears(years: number | null): string | null {
  if (years == null) return null;
  if (years === 1) return "1 year";
  return `${years} years`;
}

function formatRange(
  start: string | null,
  end: string | null,
  current: boolean,
): string | null {
  if (!start && !end && !current) return null;
  const endLabel = current ? "Present" : end;
  if (start && endLabel) return `${start} – ${endLabel}`;
  if (start) return start;
  if (endLabel) return endLabel;
  return null;
}

function salaryHint(
  profile: CareerProfileView,
  period: CareerPayPeriod,
): string | null {
  const unit = period === "monthly" ? "monthly INR" : "annual INR";
  if (profile.compensation.current.annualInr == null) return unit;
  if (profile.fieldSources.currentSalaryInr === "self_reported") {
    return `You set this · ${unit}`;
  }
  if (profile.fieldSources.currentSalaryInr === "legacy_profile") {
    return `From your saved profile · ${unit}`;
  }
  return unit;
}

function displayPay(
  figure: CareerPayFigure,
  period: CareerPayPeriod,
): number | null {
  if (figure.period === period) return figure.amountInr;
  if (figure.annualInr == null) return null;
  return period === "monthly"
    ? Math.round(figure.annualInr / 12)
    : figure.annualInr;
}

function expectedBand(
  expected: CareerExpectedPay,
  period: CareerPayPeriod,
): string | null {
  const min = displayExpected(expected, period, "min");
  const max = displayExpected(expected, period, "max");
  if (min == null && max == null) return "Not set";
  if (min != null && max != null) {
    return `${formatPay(min, period)} – ${formatPay(max, period)}`;
  }
  return formatPay(min ?? max, period);
}

function displayExpected(
  expected: CareerExpectedPay,
  period: CareerPayPeriod,
  edge: "min" | "max",
): number | null {
  const entered = edge === "min" ? expected.minInr : expected.maxInr;
  const annual = edge === "min" ? expected.minAnnualInr : expected.maxAnnualInr;
  if (expected.period === period) return entered;
  if (annual == null) return null;
  return period === "monthly" ? Math.round(annual / 12) : annual;
}

function figureForPeriod(
  figure: CareerPayFigure,
  period: CareerPayPeriod,
): string {
  const amount = displayPay(figure, period);
  return amount == null ? "" : String(amount);
}

function expectedForPeriod(
  expected: CareerExpectedPay,
  period: CareerPayPeriod,
  edge: "min" | "max",
): string {
  const amount = displayExpected(expected, period, edge);
  return amount == null ? "" : String(amount);
}

function parseMoney(value: string): number | null | "invalid" {
  const trimmed = value.trim().replace(/,/g, "");
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return "invalid";
  const amount = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(amount) || amount > 100_000_000) return "invalid";
  return amount;
}

function annualEquivalent(value: string): string | null {
  const amount = parseMoney(value);
  if (amount == null || amount === "invalid") return null;
  return `${formatAnnualInr(amount * 12)} a year`;
}

function readinessLabel(readiness: number | null | undefined): string {
  if (readiness == null) return "No matching analysis jobs";
  return `${readiness}% ready`;
}
