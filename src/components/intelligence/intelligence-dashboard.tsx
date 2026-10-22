"use client";

import {
  Briefcase,
  GraduationCap,
  Loader2,
  Radar,
  RefreshCw,
  Target,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  CareerProfileView,
  CareerSegment,
  CareerSkillLevel,
} from "@/types/career-profile";

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

export function IntelligenceDashboard() {
  const [profile, setProfile] = useState<CareerProfileView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [savingSegment, setSavingSegment] = useState<CareerSegment | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/career-profile");
      const body = (await response.json().catch(() => ({}))) as {
        profile?: CareerProfileView;
        error?: string;
      };
      if (!response.ok || !body.profile) {
        throw new Error(body.error || "Could not load your career file");
      }
      setProfile(body.profile);
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
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="space-y-4 motion-reduce:animate-none">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
          <div className="h-12 w-72 animate-pulse rounded-lg bg-muted" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-36 animate-pulse rounded-2xl bg-muted" />
            <div className="h-36 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <PageHeader
          eyebrow="Career file"
          title="Intelligence"
          description="Your career file could not be loaded."
        />
        <Card className="rounded-2xl border-border/70">
          <CardContent className="space-y-4 py-8">
            <p className="font-medium text-muted-foreground">
              {error || "Your career file could not be loaded."}
            </p>
            <Button onClick={() => void load()} variant="outline">
              Try again
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const emptyFile =
    profile.skills.length === 0 &&
    profile.academics.length === 0 &&
    profile.experience.length === 0;
  const payLabels =
    profile.segment === "student"
      ? { current: "Annual stipend", expected: "Expected annual pay" }
      : { current: "Current CTC", expected: "Expected CTC" };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-6 py-10">
      <PageHeader
        eyebrow="Career file"
        title="Intelligence"
        description="The profile Resume Builder and Skill Coach share: who you are, what you can do, and what you want next."
        actions={
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

      <section className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {SEGMENTS.map((segment) => {
            const selected = profile.segment === segment.id;
            return (
              <Button
                key={segment.id}
                variant={selected ? "default" : "outline"}
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

      <section className="grid overflow-hidden rounded-2xl border border-border/70 bg-card sm:grid-cols-2 sm:divide-x sm:divide-border">
        <PayFigure
          label={payLabels.current}
          amount={profile.compensation.currentInr}
          hint={salaryHint(profile)}
        />
        <PayFigure
          label={payLabels.expected}
          amount={profile.compensation.expectedInr}
          hint="Annual, INR"
          className="border-border border-t sm:border-t-0"
        />
      </section>

      {emptyFile ? (
        <Card className="rounded-2xl border-border/70 border-dashed">
          <CardContent className="flex flex-col items-start gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-lg">This file is still empty</p>
              <p className="mt-1 max-w-xl font-medium text-muted-foreground text-sm">
                Upload a resume and sync, or keep going and the other career
                tools will fill it in.
              </p>
            </div>
            <Button render={<Link href="/onboarding" />}>
              Upload a resume
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-bold text-base">
              <Target className="h-4 w-4 text-primary" />
              Target roles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.targetRoles.length === 0 ? (
              <p className="font-medium text-muted-foreground text-sm">
                No target role yet. A saved resume target or headline will land
                here after a sync.
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
                      Readiness not scored
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {role.isPrimary ? <Badge>Primary</Badge> : null}
                    <Badge variant="outline">
                      {SENIORITY_LABEL[role.seniority] ?? "Level open"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-bold text-base">
              <Radar className="h-4 w-4 text-primary" />
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

      <div className="grid gap-4 lg:grid-cols-3">
        <LaterPanel icon={Radar} title="Career score">
          A single score will be calculated from this file once the scoring
          model is in place.
        </LaterPanel>
        <LaterPanel icon={Target} title="Skill gaps">
          Gaps will be the skills your target roles ask for that are not on file
          yet. The list above is what you have.
        </LaterPanel>
        <LaterPanel icon={Wallet} title="Role feed">
          Open roles matched to your targets will show up here from public ATS
          boards: Greenhouse, Lever, and Ashby.
        </LaterPanel>
      </div>
    </main>
  );
}

function PayFigure({
  label,
  amount,
  hint,
  className,
}: {
  label: string;
  amount: number | null;
  hint: string | null;
  className?: string;
}) {
  return (
    <div className={cn("px-6 py-5", className)}>
      <p className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
        {label}
      </p>
      <p className="mt-2 font-black font-heading text-3xl tabular-nums tracking-tight">
        {formatAnnualInr(amount)}
      </p>
      {hint ? (
        <p className="mt-1 font-medium text-muted-foreground text-sm">{hint}</p>
      ) : null}
    </div>
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
    <Card className="rounded-2xl border-border/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-bold text-base">
          <Icon className="h-4 w-4 text-primary" />
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

function LaterPanel({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Radar;
  title: string;
  children: string;
}) {
  return (
    <section className="rounded-2xl border border-border border-dashed bg-muted/20 p-5">
      <div className="mb-2 flex items-center gap-2 font-bold text-muted-foreground text-xs uppercase tracking-widest">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      <p className="font-medium text-foreground/80 text-sm leading-relaxed">
        {children}
      </p>
    </section>
  );
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

function salaryHint(profile: CareerProfileView): string | null {
  if (profile.compensation.currentInr == null) return "Annual, INR";
  if (profile.fieldSources.currentSalaryInr === "self_reported") {
    return "You set this · annual INR";
  }
  if (profile.fieldSources.currentSalaryInr === "legacy_profile") {
    return "From your saved profile · annual INR";
  }
  return "Annual, INR";
}
