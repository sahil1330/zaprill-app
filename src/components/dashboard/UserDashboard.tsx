"use client";

import {
  ArrowRight,
  Briefcase,
  ChevronRight,
  IndianRupee,
  Loader2,
  Shield,
  Star,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { SalaryIntelligence } from "@/components/career/SalaryIntelligenceCard";
import JobCard from "@/components/JobCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { JobMatch, ResumeData } from "@/types";

function formatInr(amount: number): string {
  if (amount >= 100_000) {
    const lakh = amount / 100_000;
    return `${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)}L`;
  }
  return amount.toLocaleString("en-IN");
}

interface UserDashboardProps {
  profile: any;
  session: any;
}

export default function UserDashboard({
  profile,
  session,
}: UserDashboardProps) {
  const router = useRouter();
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
  const [salaryIntelligence, setSalaryIntelligence] =
    useState<SalaryIntelligence | null>(null);

  const handleStartNewAnalysis = useCallback(() => {
    if (profile?.resumeRaw) {
      sessionStorage.setItem(
        "ai_job_god_resume",
        JSON.stringify(profile.resumeRaw),
      );
    }
    router.push("/analyze");
  }, [profile, router]);

  useEffect(() => {
    fetch("/api/analysis-history")
      .then((res) => res.json())
      .then((data) => {
        if (data.history && data.history.length > 0) {
          setLatestAnalysis(data.history[0]);
        }
      })
      .catch((err) => console.error("Failed to load history", err))
      .finally(() => setIsLoadingAnalysis(false));

    fetch("/api/career-insights")
      .then((res) => res.json())
      .then((data) => {
        if (data.salaryIntelligence) {
          setSalaryIntelligence(data.salaryIntelligence);
        }
      })
      .catch(() => {});
  }, []);

  const resumeData = profile?.resumeData || profile?.resumeRaw;
  const lastAtsScore = profile?.lastAtsScore || 0;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-score-high-fg";
    if (score >= 75) return "text-score-mid-fg";
    if (score >= 60) return "text-score-low-fg";
    return "text-score-critical-fg";
  };

  return (
    <div className="fade-in mx-auto w-full max-w-6xl animate-in space-y-8 px-6 py-6 duration-700">
      {/* Welcome Header */}
      <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-bold text-primary text-xs uppercase tracking-[0.2em]">
            <Zap className="h-3 w-3 fill-current" />
            Personal Dashboard
          </div>
          <h1 className="font-black font-heading text-4xl tracking-tighter md:text-5xl">
            Welcome back, {session.user.name.split(" ")[0]}
          </h1>
          <p className="font-medium text-lg text-muted-foreground">
            Your career navigation engine is ready.
          </p>
        </div>
        <Button
          onClick={handleStartNewAnalysis}
          className="group h-12 rounded-xl px-8 font-bold text-base shadow-primary/20 shadow-xl"
        >
          Analytical Search
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </header>

      {/* Metrics Row - Moved to Top */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Summary Card */}
        <Card className="flex flex-col justify-between overflow-hidden rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0 bg-muted/30 pb-4">
            <CardTitle className="flex items-center gap-2 font-bold text-muted-foreground text-xs uppercase tracking-widest">
              <Target className="h-3.5 w-3.5" />
              Career Profile
            </CardTitle>
            <Link href="/profile">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 font-bold text-xs uppercase tracking-widest"
              >
                Edit
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <span className="font-black text-primary text-xl">
                  {session.user.name.charAt(0)}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-bold text-lg">
                  {resumeData?.basics?.name || session.user.name}
                </h3>
                <p className="truncate font-medium text-muted-foreground text-sm">
                  {resumeData?.basics?.label || "Professional"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                  Experience
                </p>
                <p className="font-black text-sm">
                  {resumeData?.totalYearsOfExperience || 0} Years
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                  Location
                </p>
                <p className="truncate font-black text-sm">
                  {resumeData?.basics?.location?.city || "Remote"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ATS Score Card */}
        <Card className="flex flex-col justify-between overflow-hidden rounded-2xl border-border/50 bg-linear-to-br from-background to-muted/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 font-bold text-muted-foreground text-xs uppercase tracking-widest">
              <Shield className="h-3.5 w-3.5" />
              ATS Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0">
                <div
                  className={`font-black text-4xl ${getScoreColor(lastAtsScore)}`}
                >
                  {lastAtsScore || 0}%
                </div>
                <p className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                  ATS Compatibility
                </p>
              </div>
              <div
                className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-muted"
                role="img"
                aria-label={`ATS score: ${lastAtsScore || 0}%`}
              >
                <svg
                  className="-rotate-90 h-full w-full transform"
                  aria-hidden="true"
                >
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-muted/10"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 20}
                    strokeDashoffset={
                      2 * Math.PI * 20 * (1 - (lastAtsScore || 0) / 100)
                    }
                    className={`${getScoreColor(lastAtsScore)} transition-all duration-1000`}
                    strokeLinecap="round"
                  />
                </svg>
                <Star
                  className={`absolute h-4 w-4 fill-current ${getScoreColor(lastAtsScore)} opacity-20`}
                  aria-hidden="true"
                />
              </div>
            </div>
            <Progress value={lastAtsScore} className="h-1.5" />
            <Link href="/resumes" className="block">
              <Button
                variant="secondary"
                className="h-9 w-full gap-2 rounded-lg font-bold text-xs uppercase tracking-widest"
              >
                <Zap className="h-3 w-3" />
                Boost Score
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Salary Intelligence Card */}
        <Card className="flex flex-col justify-between overflow-hidden rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 font-bold text-muted-foreground text-xs uppercase tracking-widest">
              <TrendingUp className="h-3.5 w-3.5" />
              Salary Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {salaryIntelligence ? (
              <>
                <div className="space-y-2.5">
                  {salaryIntelligence.currentSalary && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-muted-foreground text-xs">
                        Current
                      </span>
                      <span className="font-bold text-sm">
                        {formatInr(salaryIntelligence.currentSalary)} / yr
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground text-xs">
                      Market avg
                    </span>
                    <span className="font-bold text-sm">
                      {formatInr(salaryIntelligence.marketAverage)} / yr
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-border/40 border-t pt-2">
                    <span className="font-medium text-muted-foreground text-xs">
                      Your potential
                    </span>
                    <span className="font-black text-sm">
                      {formatInr(salaryIntelligence.potential)} / yr
                    </span>
                  </div>
                  {salaryIntelligence.gap != null &&
                    salaryIntelligence.gap > 0 && (
                      <div className="rounded-lg bg-violet-50 px-3 py-2 dark:bg-violet-900/20">
                        <p className="font-black text-violet-700 text-xs dark:text-violet-400">
                          +{formatInr(salaryIntelligence.gap)} gap identified
                        </p>
                      </div>
                    )}
                </div>
                <Link href="/history" className="block">
                  <Button
                    variant="outline"
                    className="h-9 w-full rounded-lg font-bold text-xs uppercase tracking-widest"
                  >
                    Full Breakdown
                  </Button>
                </Link>
              </>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-accent/20 bg-accent/10 p-3">
                    <div className="font-black text-xl">
                      {latestAnalysis?.jobs?.length || 0}
                    </div>
                    <div className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                      Jobs matched
                    </div>
                  </div>
                  <div className="rounded-xl border border-score-high/10 bg-score-high/50 p-3">
                    <div className="font-black text-score-high-fg text-xl">
                      {latestAnalysis?.skillGaps?.length || 0}
                    </div>
                    <div className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                      Skill Gaps
                    </div>
                  </div>
                </div>
                <Link href="/history" className="block">
                  <Button
                    variant="outline"
                    className="h-9 w-full rounded-lg font-bold text-xs uppercase tracking-widest"
                  >
                    <IndianRupee className="mr-1.5 h-3.5 w-3.5" />
                    Set Salary for Insights
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Width Recommended Jobs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <h2 className="flex items-center gap-3 font-black font-heading text-2xl tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </span>
              Recommended for You
            </h2>
            <p className="font-medium text-muted-foreground text-sm">
              Top opportunities based on your skill profile.
            </p>
          </div>
          {latestAnalysis && (
            <Link
              href={`/analyze?id=${latestAnalysis.id}`}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 font-bold text-primary text-xs uppercase tracking-widest transition-colors hover:bg-primary/5"
            >
              See all {latestAnalysis.jobs?.length || 0} matches
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {isLoadingAnalysis ? (
          <div className="flex h-96 animate-pulse flex-col items-center justify-center gap-4 rounded-3xl border-2 border-border/50 border-dashed bg-muted/20 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin" />
            <p className="font-bold text-xs uppercase tracking-[0.2em]">
              Synthesizing recommendations...
            </p>
          </div>
        ) : latestAnalysis &&
          latestAnalysis.jobs &&
          latestAnalysis.jobs.length > 0 ? (
          <div className="flex flex-col gap-6">
            <div className="grid w-full gap-4">
              {latestAnalysis.jobs
                .slice(0, 5)
                .map((job: JobMatch, idx: number) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    rank={idx}
                    analysisId={latestAnalysis.id}
                  />
                ))}
            </div>
            {latestAnalysis.jobs.length > 5 && (
              <Link
                href={`/analyze?id=${latestAnalysis.id}`}
                className="group block"
              >
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-border/60 border-dashed py-6 text-muted-foreground transition-all duration-300 hover:border-primary/30 hover:bg-muted/30">
                  <p className="font-black text-lg transition-colors group-hover:text-primary">
                    Explore {latestAnalysis.jobs.length - 5} more tailored roles
                  </p>
                  <p className="font-bold text-xs uppercase tracking-widest opacity-60">
                    Discover hidden gems in your match pool
                  </p>
                </div>
              </Link>
            )}
          </div>
        ) : (
          <div className="flex h-96 flex-col items-center justify-center rounded-3xl border-2 border-border/50 border-dashed bg-muted/20 p-12 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5">
              <Briefcase className="h-10 w-10 text-primary opacity-30" />
            </div>
            <h3 className="mb-3 font-black text-2xl">No matches detected</h3>
            <p className="mb-10 max-w-md font-medium text-base text-muted-foreground leading-relaxed">
              We need to decode your professional profile before we can suggest
              elite opportunities. Start your first analysis to begin.
            </p>
            <Button
              size="lg"
              onClick={handleStartNewAnalysis}
              className="h-14 rounded-xl px-10 font-bold text-base shadow-primary/10 shadow-xl"
            >
              Activate Job Match Engine
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
