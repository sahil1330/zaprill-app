"use client";

import {
  Briefcase,
  GraduationCap,
  Loader2,
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
import { CareerFileEditors } from "@/components/intelligence/career-file-editors";
import { verifiedSkillNames } from "@/components/intelligence/home-metrics";
import { IntelligenceInsights } from "@/components/intelligence/intelligence-insights";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  CareerProfileView,
  CareerSkillLevel,
} from "@/types/career-profile";
import { VERIFIED_SKILL_LABEL } from "@/types/career-profile";
import type { IntelligenceReport } from "@/types/intelligence";

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
        <CareerFileEditors
          profile={profile}
          onProfile={(next) => {
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

function readinessLabel(readiness: number | null | undefined): string {
  if (readiness == null) return "No matching analysis jobs";
  return `${readiness}% ready`;
}
