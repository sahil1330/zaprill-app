"use client";

import type { JSX } from "react";
import { useCallback, useEffect, useState } from "react";
import { PageError } from "@/components/app/page-state";
import { CareerFileEditors } from "@/components/intelligence/career-file-editors";
import { verifiedSkillNames } from "@/components/intelligence/home-metrics";
import { IntelligenceInsights } from "@/components/intelligence/intelligence-insights";
import { Skeleton } from "@/components/ui/skeleton";
import type { CareerProfileView } from "@/types/career-profile";
import type { IntelligenceReport } from "@/types/intelligence";

const BOARD_COLUMN = "mx-auto w-full max-w-[1100px] space-y-4";
const REGION = "rounded-lg border border-border bg-card p-4 shadow-none";
const PROFILE_ERROR = "Your career file could not be loaded.";
const REPORT_ERROR = "Market insights could not be loaded.";

type HomeBoardStatus = "loading" | "profile-error" | "report-error" | "ready";

export function HomeBoardSkeleton(): JSX.Element {
  return (
    <div
      data-slot="home-board-skeleton"
      aria-hidden="true"
      className={BOARD_COLUMN}
    >
      <div data-slot="skeleton-hero" className={`${REGION} space-y-3`}>
        <Skeleton className="h-12 w-24" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-11 w-40" />
      </div>
      <div data-slot="skeleton-metrics" className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div data-slot="skeleton-gaps" className={REGION}>
        <Skeleton className="h-8 w-full" />
      </div>
      <div data-slot="skeleton-next" className={REGION}>
        <Skeleton className="h-8 w-full" />
      </div>
      <div data-slot="skeleton-verified" className={REGION}>
        <Skeleton className="h-8 w-full" />
      </div>
      <div data-slot="skeleton-strip" className={REGION}>
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function HomeBoardView({
  status,
  onRetryProfile,
  onRetryReport,
  atsScore,
  report,
  profile,
  onProfile,
}: {
  status: HomeBoardStatus;
  onRetryProfile: () => void;
  onRetryReport: () => void;
  atsScore: number | null;
  report: IntelligenceReport | null;
  profile: CareerProfileView | null;
  onProfile: (profile: CareerProfileView) => void;
}): JSX.Element {
  if (status === "loading") {
    return <HomeBoardSkeleton />;
  }

  if (status === "profile-error") {
    return <PageError message={PROFILE_ERROR} onRetry={onRetryProfile} />;
  }

  if (status === "report-error") {
    return (
      <div className={BOARD_COLUMN}>
        <PageError message={REPORT_ERROR} onRetry={onRetryReport} />
        {profile ? (
          <CareerFileEditors profile={profile} onProfile={onProfile} />
        ) : null}
      </div>
    );
  }

  if (!report || !profile) {
    return <HomeBoardSkeleton />;
  }

  return (
    <div data-slot="home-board" className={BOARD_COLUMN}>
      <IntelligenceInsights
        report={report}
        atsScore={atsScore}
        verifiedSkills={verifiedSkillNames(profile.skills).map((name) => ({
          name,
        }))}
      />
      <CareerFileEditors profile={profile} onProfile={onProfile} />
    </div>
  );
}

export function HomeBoard({
  atsScore,
}: {
  atsScore: number | null;
}): JSX.Element {
  const [status, setStatus] = useState<HomeBoardStatus>("loading");
  const [profile, setProfile] = useState<CareerProfileView | null>(null);
  const [report, setReport] = useState<IntelligenceReport | null>(null);

  const loadReport = useCallback(async () => {
    try {
      const response = await fetch("/api/intelligence");
      const body = (await response.json().catch(() => ({}))) as {
        report?: IntelligenceReport;
      };
      if (!response.ok || !body.report) {
        throw new Error(REPORT_ERROR);
      }
      setReport(body.report);
      setStatus("ready");
    } catch (error) {
      console.error(error);
      setReport(null);
      setStatus("report-error");
    }
  }, []);

  const loadProfile = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/career-profile");
      const body = (await response.json().catch(() => ({}))) as {
        profile?: CareerProfileView;
      };
      if (!response.ok || !body.profile) {
        throw new Error(PROFILE_ERROR);
      }
      setProfile(body.profile);
      await loadReport();
    } catch (error) {
      console.error(error);
      setProfile(null);
      setReport(null);
      setStatus("profile-error");
    }
  }, [loadReport]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const onProfile = useCallback(
    (next: CareerProfileView) => {
      setProfile(next);
      void loadReport();
    },
    [loadReport],
  );

  return (
    <HomeBoardView
      status={status}
      onRetryProfile={() => void loadProfile()}
      onRetryReport={() => void loadReport()}
      atsScore={atsScore}
      report={report}
      profile={profile}
      onProfile={onProfile}
    />
  );
}
