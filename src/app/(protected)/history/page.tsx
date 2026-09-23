"use client";

import {
  ChevronRight,
  Loader2,
  MousePointer2,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import SalaryIntelligenceCard, {
  type SalaryIntelligence,
} from "@/components/career/SalaryIntelligenceCard";
import LearningRoadmap from "@/components/LearningRoadmap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import type { RoadmapItem } from "@/types";

interface CareerInsightsData {
  lastAnalysis: {
    id: string;
    createdAt: string;
    resumeSkills: string[];
    inferredJobTitles: string[];
    roadmap: any;
    advice: string;
    topMatchScore: number;
    totalJobsFound: number;
  } | null;
  recentVisits: {
    id: string;
    title: string;
    company: string;
    location: string | null;
    url: string | null;
    matchPercentage: number | null;
    createdAt: string;
  }[];
  salaryIntelligence: SalaryIntelligence | null;
}

export default function CareerInsightsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [data, setData] = useState<CareerInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/");
      return;
    }

    if (session?.user) {
      fetch("/api/career-insights")
        .then((res) => res.json())
        .then((json) => {
          setData(json);
        })
        .finally(() => setIsLoading(false));
    }
  }, [session, isPending, router]);

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="font-bold text-lg tracking-tight">
          Loading insights...
        </span>
      </div>
    );
  }

  const { lastAnalysis, recentVisits, salaryIntelligence } = data || {
    lastAnalysis: null,
    recentVisits: [],
    salaryIntelligence: null,
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-6">
      <PageHeader
        title="Career Insights"
        description="Your salary position, skill gaps, and growth roadmap."
      />

      {!lastAnalysis && recentVisits.length === 0 ? (
        <div className="rounded-3xl border-2 border-border/60 border-dashed bg-card/50 py-24 text-center backdrop-blur-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
            <Target className="h-10 w-10 text-primary" />
          </div>
          <h2 className="mb-3 font-black text-3xl tracking-tight">
            Ready to boost your career?
          </h2>
          <p className="mx-auto mb-8 max-w-md font-semibold text-lg text-muted-foreground">
            Upload your resume and search for jobs to unlock your personalized
            roadmap and track your applications.
          </p>
          <Button
            size="lg"
            onClick={() => router.push("/")}
            className="px-8 font-bold"
          >
            Get Started Now
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ── Left Column: Analysis Stats & Roadmap ── */}
          <div className="space-y-8 lg:col-span-8">
            {/* Learning Roadmap */}
            {lastAnalysis && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-black text-2xl tracking-tight">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Growth Roadmap
                  </h3>
                </div>
                <div className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-sm">
                  <LearningRoadmap
                    roadmap={lastAnalysis.roadmap as RoadmapItem[]}
                    advice={lastAnalysis.advice}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Salary Intelligence, Skill Gaps & Activity ── */}
          <div className="space-y-8 lg:col-span-4">
            {/* Salary Intelligence Card */}
            {salaryIntelligence && lastAnalysis && (
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 font-black text-2xl tracking-tight">
                  <Zap className="h-6 w-6 text-violet-500" />
                  Salary Intelligence
                </h3>
                <SalaryIntelligenceCard
                  data={salaryIntelligence}
                  onSalaryUpdate={(newSalary) => {
                    setData((prev) =>
                      prev?.salaryIntelligence
                        ? {
                            ...prev,
                            salaryIntelligence: {
                              ...prev.salaryIntelligence,
                              currentSalary: newSalary,
                              gap:
                                newSalary != null
                                  ? prev.salaryIntelligence.marketAverage -
                                    newSalary
                                  : null,
                              potentialGap:
                                newSalary != null
                                  ? prev.salaryIntelligence.potential -
                                    newSalary
                                  : null,
                            },
                          }
                        : prev,
                    );
                  }}
                />
              </div>
            )}

            {/* No salary data nudge */}
            {!salaryIntelligence && lastAnalysis && (
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 font-black text-2xl tracking-tight">
                  <Zap className="h-6 w-6 text-violet-500" />
                  Salary Intelligence
                </h3>
                <div className="rounded-2xl border border-border/60 border-dashed bg-muted/30 px-5 py-8 text-center">
                  <p className="mb-1 font-black text-sm">
                    Not enough salary data
                  </p>
                  <p className="font-medium text-muted-foreground text-xs leading-relaxed">
                    Run a new analysis targeting roles with published salaries
                    to unlock market insights.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4 font-bold text-xs"
                    onClick={() => router.push("/")}
                  >
                    New Analysis
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Critical Skill Gaps */}
            {lastAnalysis && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-black text-2xl tracking-tight">
                    <Sparkles className="h-6 w-6 text-amber-500" />
                    Priority Gaps
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-amber-200 bg-amber-50 font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
                  >
                    Top{" "}
                    {Math.min(
                      5,
                      (lastAnalysis.roadmap as RoadmapItem[]).length,
                    )}{" "}
                    Improvements
                  </Badge>
                </div>

                <div className="space-y-3">
                  {(lastAnalysis.roadmap as RoadmapItem[])
                    .slice(0, 5)
                    .map((gap, idx) => (
                      <div
                        key={gap.skill}
                        className="group relative rounded-2xl border border-border/40 bg-card p-4 shadow-sm transition-all hover:border-primary/20"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-muted font-black text-muted-foreground text-xs">
                              0{idx + 1}
                            </div>
                            <div>
                              <h4 className="font-black text-foreground text-sm tracking-tight">
                                {gap.skill}
                              </h4>
                              <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
                                {gap.category}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="hidden flex-col items-end sm:flex">
                              <div className="flex h-1 w-12 gap-1 overflow-hidden rounded-full bg-muted">
                                <div
                                  className={`h-full rounded-full ${
                                    gap.priority === "high"
                                      ? "w-full bg-primary"
                                      : gap.priority === "medium"
                                        ? "w-2/3 bg-primary/60"
                                        : "w-1/3 bg-primary/30"
                                  }`}
                                />
                              </div>
                              <span className="mt-1 font-black text-[9px] text-muted-foreground uppercase tracking-tighter">
                                Market Demand
                              </span>
                            </div>
                            <Badge
                              className={`rounded-lg border-none px-2 py-0.5 font-black text-[10px] uppercase tracking-wider ${
                                gap.priority === "high"
                                  ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                  : gap.priority === "medium"
                                    ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                                    : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                              }
                            `}
                            >
                              {gap.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Subtle Skills Inventory */}
                <div className="pt-2">
                  <p className="mb-3 px-1 font-black text-[10px] text-muted-foreground uppercase tracking-widest">
                    Validated Inventory ({lastAnalysis.resumeSkills.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5 opacity-60 transition-opacity hover:opacity-100">
                    {lastAnalysis.resumeSkills.slice(0, 10).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-border/50 bg-secondary px-2 py-1 font-bold text-[10px] text-secondary-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                    {lastAnalysis.resumeSkills.length > 10 && (
                      <span className="px-2 py-1 font-bold text-[10px] text-muted-foreground">
                        +{lastAnalysis.resumeSkills.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Job Tracking CTA */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-black text-2xl tracking-tight">
                <MousePointer2 className="h-6 w-6 text-blue-500" />
                Job Tracking
              </h3>
              <Card className="group overflow-hidden border-primary/10 bg-linear-to-br from-primary/5 to-primary/10 shadow-sm transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary transition-transform group-hover:scale-110">
                    <Target className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h4 className="mb-2 font-black text-lg">
                    Track Applications
                  </h4>
                  <p className="mb-6 font-medium text-muted-foreground text-sm leading-relaxed">
                    Monitor all your applied jobs and saved bookmarks in one
                    central dashboard.
                  </p>
                  <Button
                    onClick={() => router.push("/jobs")}
                    className="w-full gap-2 rounded-xl font-black shadow-sm"
                  >
                    View My Jobs
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
