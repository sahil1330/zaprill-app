"use client";

import {
  AlertCircle,
  ArrowUpDown,
  Briefcase,
  Check,
  ChevronDown,
  Clock,
  Filter,
  Info,
  Loader2,
  Map as MapIcon,
  Plus,
  RefreshCw,
  Target,
  Trash2,
  TrendingUp,
  User,
  X,
  Zap,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnalysisError } from "@/components/analyze/analysis-error";
import { JobFilters } from "@/components/analyze/job-filters";
import { MemeLoader } from "@/components/analyze/meme-loader";
import { AnalyzeNeedsResume } from "@/components/analyze/needs-resume";
import { ParsingProgress } from "@/components/analyze/parsing-progress";
import { ProfileReview } from "@/components/analyze/profile-review";
import { ResultsHeader } from "@/components/analyze/results-header";
import type { FilterState, ReviewState } from "@/components/analyze/types";
import { PageHeader } from "@/components/app/page-header";
import JobCard from "@/components/JobCard";
import { JobTitleAutocomplete } from "@/components/JobTitleAutocomplete";
import LearningRoadmap from "@/components/LearningRoadmap";
import {
  extractCityFromLocation,
  INDIA_CITIES,
  LocationCombobox,
  locationMatchesCity,
} from "@/components/LocationCombobox";
import LockedJobCard from "@/components/LockedJobCard";
import { AnalyzeSkeleton } from "@/components/loading/PageLoaders";
import SkillGapPanel from "@/components/SkillGapPanel";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAuth from "@/hooks/useAuth";
import {
  trackAnalysisComplete,
  trackAnalysisError,
  trackAnalysisSaved,
  trackAnalysisStart,
  trackFilterApplied,
  trackFilterPanelOpen,
  trackGapAnalysisComplete,
  trackJobListViewed,
  trackJobSearchComplete,
  trackLocationSearch,
  trackSortChanged,
  trackTabViewed,
} from "@/lib/analytics";
import { getAnalysisSummary } from "@/lib/match-engine";
import { flattenResumeSkills, normalizeResumeData } from "@/lib/resume";
import { categorizeSkill } from "@/lib/skill-extractor";
import type { AnalysisStep, JobMatch, RoadmapItem, SkillGap } from "@/types";
import type { ResumeData } from "@/types/resume";

type TabId = "jobs" | "gaps" | "roadmap";

const TABS: { id: TabId; label: string; icon: typeof Briefcase }[] = [
  { id: "jobs", label: "Job Matches", icon: Briefcase },
  { id: "gaps", label: "Skill Gaps", icon: TrendingUp },
  { id: "roadmap", label: "Learning Roadmap", icon: MapIcon },
];

function AnalyzePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get("id");
  const [step, setStep] = useState<AnalysisStep>("parsing");
  const [error, setError] = useState<string | null>(null);

  const [resume, setResume] = useState<ResumeData | null>(null);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [advice, setAdvice] = useState<string>("");
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const initRef = useRef(false);
  const savingRef = useRef(false);

  const [activeTab, setActiveTab] = useState<TabId>("jobs");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"match" | "recent">("match");

  // Filtering State
  const [filterState, setFilterState] = useState<FilterState>({
    searchTitle: "",
    searchLoc: "",
    workType: "any",
    empType: "any",
    minMatch: [0],
    requireSalary: false,
  });
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // Review State
  const [reviewState, setReviewState] = useState<ReviewState>({
    reviewSkills: [],
    newSkill: "",
    selectedTitles: [],
    reviewTitles: [],
    newTitleValue: "",
    editingTitleIndex: null,
    editingTitleValue: "",
    experienceYears: 0,
    currentSalary: null,
  });

  const { user } = useAuth();

  const runAnalysis = useCallback(
    async (currentResume: ResumeData, locationOverride?: string) => {
      const analysisStartTime = performance.now();
      try {
        setStep("searching");
        if (idFromUrl) {
          // if run analysis manually occurs while we had an id, strip id
          router.replace("/analyze");
        }
        setAnalysisId(null);
        if (locationOverride) setIsSearchingLocation(true);

        const searchLocation =
          locationOverride || currentResume.basics.location.city;

        trackAnalysisStart({
          skill_count: reviewState.reviewSkills.length,
          search_location: searchLocation,
          is_location_override: Boolean(locationOverride),
        });

        // Update the main resume state so that follow-up steps (saving, reporting) use the reviewed data
        const updatedResume: ResumeData = {
          ...currentResume,
          skills: [
            {
              id: "reviewed-skills",
              name: "Skills",
              keywords: reviewState.reviewSkills,
              level: "Intermediate",
              category: "technical",
            },
          ],
          inferredJobTitles: reviewState.selectedTitles,
          totalYearsOfExperience: reviewState.experienceYears,
        };
        setResume(updatedResume);

        const jobSearchStart = performance.now();
        const jobRes = await fetch("/api/search-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skills: reviewState.reviewSkills,
            jobTitles: reviewState.selectedTitles,
            location: searchLocation,
            experienceYears: reviewState.experienceYears,
          }),
        });
        if (!jobRes.ok) {
          const err = await jobRes.json();
          if (err.error === "LIMIT_REACHED") {
            throw new Error("LIMIT_REACHED");
          }
          if (err.error === "API_SUBSCRIPTION_REQUIRED") {
            throw new Error(
              "JSearch API Subscription Required: Please go to https://rapidapi.com/letscrape-6bRBa3QG1q/api/jsearch and subscribe to the Free Basic tier.",
            );
          }
          if (err.error === "ADZUNA_NOT_CONFIGURED") {
            throw new Error(
              "Job search not configured: Get free Adzuna API credentials at https://developer.adzuna.com/ and add them to .env.local",
            );
          }
          if (err.error === "RATE_LIMIT") {
            throw new Error(
              "JSearch API rate limit reached. Please wait a moment and try again.",
            );
          }
          throw new Error(err.error ?? "Failed to search jobs");
        }
        const { jobs: rawJobs } = await jobRes.json();

        trackJobSearchComplete({
          job_count: rawJobs.length,
          search_location: searchLocation,
          duration_ms: Math.round(performance.now() - jobSearchStart),
        });

        setStep("analyzing");
        const gapAnalysisStart = performance.now();
        const gapRes = await fetch("/api/analyze-gaps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeSkills: reviewState.reviewSkills,
            jobs: rawJobs,
            inferredJobTitles: reviewState.selectedTitles,
          }),
        });
        if (!gapRes.ok) {
          const err = await gapRes.json();
          throw new Error(err.error ?? "Failed to analyze gaps");
        }
        const {
          matchedJobs,
          skillGaps: gaps,
          roadmap: rm,
          advice: aiAdvice,
          isPro: isUserPro,
          usedCache,
          analysisId: cachedId,
        } = await gapRes.json();
        setIsPro(!!isUserPro);

        trackGapAnalysisComplete({
          skill_gaps_count: gaps.length,
          roadmap_items_count: rm.length,
          duration_ms: Math.round(performance.now() - gapAnalysisStart),
        });

        setJobs(matchedJobs);
        setSkillGaps(gaps);
        setRoadmap(rm);
        setAdvice(aiAdvice || "");
        if (usedCache && cachedId) {
          setAnalysisId(cachedId);
        }
        setStep("done");

        const topMatch = matchedJobs.length
          ? Math.max(...matchedJobs.map((j: JobMatch) => j.matchPercentage))
          : 0;
        const avgMatch = matchedJobs.length
          ? Math.round(
              matchedJobs.reduce(
                (s: number, j: JobMatch) => s + j.matchPercentage,
                0,
              ) / matchedJobs.length,
            )
          : 0;
        trackAnalysisComplete({
          job_count: matchedJobs.length,
          top_match_score: topMatch,
          avg_match_score: avgMatch,
          skill_gaps_count: gaps.length,
          roadmap_items_count: rm.length,
          analysis_duration_ms: Math.round(
            performance.now() - analysisStartTime,
          ),
          search_location: searchLocation,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Analysis failed";
        trackAnalysisError({ error_message: message, step });
        setError(message);
        setStep("error");
      } finally {
        setIsSearchingLocation(false);
      }
    },
    [idFromUrl, router, step, reviewState],
  );

  // Handle loading via URL ID
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  useEffect(() => {
    if (idFromUrl && user && !isFetchingHistory && !resume) {
      setIsFetchingHistory(true);
      fetch(`/api/analysis-history/${idFromUrl}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.analysis) {
            const analysis = data.analysis;
            const normalized = normalizeResumeData(analysis.resumeRaw);
            // Ensure inferred fields are carried over from the raw data
            const rd: ResumeData = {
              ...normalized,
              inferredJobTitles:
                analysis.resumeRaw?.inferredJobTitles ||
                normalized.inferredJobTitles ||
                [],
              totalYearsOfExperience:
                analysis.resumeRaw?.totalYearsOfExperience ??
                normalized.totalYearsOfExperience ??
                0,
            };
            setResume(rd);
            setJobs(analysis.jobs || []);
            setSkillGaps(analysis.skillGaps || []);
            setRoadmap(analysis.roadmap || []);
            setAdvice(analysis.advice || "");
            setAnalysisId(analysis.id);
            setIsPro(!!data.isPro);

            // Extract search location correctly back for filters
            if (analysis.searchLocation) {
              setFilterState((prev) => ({
                ...prev,
                searchLoc: analysis.searchLocation,
              }));
            } else if (rd.basics.location.city) {
              const cityName = extractCityFromLocation(rd.basics.location.city);
              const matched = INDIA_CITIES.find(
                (c) =>
                  c.city.toLowerCase() === cityName.toLowerCase() ||
                  c.aliases.some((a) => a === cityName.toLowerCase()),
              );
              setFilterState((prev) => ({
                ...prev,
                searchLoc: matched ? matched.city : cityName,
              }));
            }

            setStep("done");
          }
        })
        .finally(() => setIsFetchingHistory(false));
    }
  }, [idFromUrl, user, isFetchingHistory, resume]);

  const hydrateResume = useCallback((rawParsed: unknown) => {
    const parsed = normalizeResumeData(rawParsed);
    const extra =
      rawParsed && typeof rawParsed === "object"
        ? (rawParsed as ResumeData)
        : parsed;
    const rd: ResumeData = {
      ...parsed,
      inferredJobTitles:
        extra.inferredJobTitles || parsed.inferredJobTitles || [],
      totalYearsOfExperience:
        extra.totalYearsOfExperience ?? parsed.totalYearsOfExperience ?? 0,
    };
    setResume(rd);

    const location = rd.basics.location.city;
    if (location) {
      const cityName = extractCityFromLocation(location);
      const matched = INDIA_CITIES.find(
        (c) =>
          c.city.toLowerCase() === cityName.toLowerCase() ||
          c.aliases.some((a) => a === cityName.toLowerCase()),
      );
      setFilterState((prev) => ({
        ...prev,
        searchLoc: matched ? matched.city : cityName,
      }));
    }
    setReviewState((prev) => ({
      ...prev,
      reviewSkills: flattenResumeSkills(rd),
      reviewTitles: rd.inferredJobTitles || [],
      selectedTitles: rd.inferredJobTitles?.slice(0, 3) || [],
      experienceYears: rd.totalYearsOfExperience || 0,
      currentSalary: null,
    }));
    setStep("reviewing");

    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        const salary = data?.profile?.currentSalary;
        if (salary) {
          setReviewState((prev) => ({ ...prev, currentSalary: salary }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (idFromUrl || isFetchingHistory || initRef.current || resume) return;

    const stored = sessionStorage.getItem("ai_job_god_resume");
    if (stored) {
      initRef.current = true;
      try {
        hydrateResume(JSON.parse(stored));
      } catch {
        sessionStorage.removeItem("ai_job_god_resume");
        setStep("needs_resume");
      }
      return;
    }

    // No local draft — try the saved primary resume instead of bouncing home.
    initRef.current = true;
    let cancelled = false;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const raw = data?.profile?.resumeRaw || data?.profile?.resumeData;
        const status = data?.profile?.onboardingStatus;
        if (raw && flattenResumeSkills(normalizeResumeData(raw)).length > 0) {
          sessionStorage.setItem("ai_job_god_resume", JSON.stringify(raw));
          hydrateResume(raw);
          return;
        }
        if (status && status !== "completed") {
          router.replace("/onboarding");
          return;
        }
        setStep("needs_resume");
      })
      .catch(() => {
        if (!cancelled) setStep("needs_resume");
      });

    return () => {
      cancelled = true;
    };
  }, [router, idFromUrl, isFetchingHistory, resume, hydrateResume]);

  useEffect(() => {
    // Only save automatically if we aren't already looking at a history loaded run
    // AND if idFromUrl matches analysisId (meaning we already set it) we shouldn't save again
    if (
      step === "done" &&
      user &&
      !analysisId &&
      resume &&
      !idFromUrl &&
      !savingRef.current
    ) {
      const saveAnalysis = async () => {
        savingRef.current = true;
        try {
          const res = await fetch("/api/save-analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resume,
              jobs,
              skillGaps,
              roadmap,
              advice,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setAnalysisId(data.analysisId);
            trackAnalysisSaved({
              analysis_id: data.analysisId,
              job_count: jobs.length,
              top_match_score: jobs.length
                ? Math.max(...jobs.map((j) => j.matchPercentage))
                : 0,
            });
            // Replace url so a refresh doesn't duplicate
            router.replace(`/analyze?id=${data.analysisId}`);
          }
        } catch (e) {
          console.error("Failed to save analysis", e);
          savingRef.current = false;
        }
      };
      saveAnalysis();
    }
  }, [
    step,
    user,
    analysisId,
    resume,
    jobs,
    skillGaps,
    roadmap,
    advice,
    router,
    idFromUrl,
  ]);

  const displayedJobs = useMemo(() => {
    return jobs
      .filter((j) => {
        // 1. Text searches
        if (
          filterState.searchTitle &&
          !j.title.toLowerCase().includes(filterState.searchTitle.toLowerCase())
        )
          return false;
        // Use smart city matching instead of full-string substring match
        if (
          filterState.searchLoc &&
          !locationMatchesCity(j.location, filterState.searchLoc)
        )
          return false;

        // 2. Work type (Remote/Onsite/Hybrid)
        if (filterState.workType !== "any") {
          const lowerLoc = j.location.toLowerCase();
          const lowerTitle = j.title.toLowerCase();
          const isHybrid =
            lowerLoc.includes("hybrid") || lowerTitle.includes("hybrid");

          if (filterState.workType === "remote" && !j.isRemote) return false;
          if (filterState.workType === "onsite" && j.isRemote) return false;
          if (filterState.workType === "hybrid" && !isHybrid) return false;
        }

        // 3. Employment type
        if (filterState.empType !== "any") {
          const lowerEmp = (j.employmentType || "").toLowerCase();
          if (filterState.empType === "fulltime" && !lowerEmp.includes("full"))
            return false;
          if (
            filterState.empType === "contract" &&
            !lowerEmp.includes("contract")
          )
            return false;
          if (filterState.empType === "parttime" && !lowerEmp.includes("part"))
            return false;
        }

        // 4. Sliders and Switches
        if (j.matchPercentage < filterState.minMatch[0]) return false;
        if (filterState.requireSalary && !j.salary) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "recent") {
          const da = a.postedAt ? new Date(a.postedAt).getTime() : 0;
          const db = b.postedAt ? new Date(b.postedAt).getTime() : 0;
          return db - da;
        }
        return b.matchPercentage - a.matchPercentage;
      });
  }, [jobs, filterState, sortBy]);

  const summary = getAnalysisSummary(jobs);
  const isDone = step === "done";
  const isError = step === "error";

  return (
    <div className="bg-background font-sans text-foreground selection:bg-foreground selection:text-background">
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {(step === "reviewing" ||
          isDone ||
          isError ||
          step === "needs_resume") && (
          <PageHeader
            title="Analyze"
            description="Match your resume to jobs, identify skill gaps, and build a learning roadmap."
            actions={
              isDone ? (
                <span className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 font-bold text-[11px] uppercase tracking-widest">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  Complete
                </span>
              ) : undefined
            }
          />
        )}

        {/* Review Stage */}
        {step === "reviewing" && resume && (
          <ProfileReview
            resume={resume}
            reviewState={reviewState}
            setReviewState={setReviewState}
            runAnalysis={runAnalysis}
          />
        )}

        {/* Loading / Progress state - ONLY for initial parsing */}
        {step === "parsing" && <ParsingProgress step={step} resume={resume} />}

        {/* Meme Loading State - for searching and analyzing */}
        {(step === "searching" || step === "analyzing") && (
          <MemeLoader step={step} />
        )}

        {/* Error state */}
        {isError && <AnalysisError error={error} />}

        {step === "needs_resume" && <AnalyzeNeedsResume />}

        {/* Results */}
        {isDone && resume && (
          <div className="animate-fade-in">
            {/* Profile header and Stats */}
            <ResultsHeader resume={resume} summary={summary} />

            <Tabs
              value={activeTab}
              onValueChange={(val) => {
                setActiveTab(val as TabId);
                trackTabViewed({ tab_id: val as TabId });
                // Track job list view when jobs tab first becomes active
                if (val === "jobs") {
                  trackJobListViewed({
                    job_count: jobs.length,
                    filtered_count: displayedJobs.length,
                    search_location: filterState.searchLoc || undefined,
                  });
                }
              }}
              className="w-full"
            >
              <TabsList className="mb-8 flex h-12 w-full rounded-full border border-border bg-muted p-1 shadow-sm">
                {TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="h-full flex-1 rounded-full font-bold text-sm tracking-wide transition-all data-active:bg-background data-active:text-foreground data-active:shadow-md"
                  >
                    <tab.icon className="mr-2.5 hidden h-5 w-5 sm:inline" />
                    {tab.label}
                    {tab.id === "jobs" && (
                      <Badge
                        variant="secondary"
                        className="ml-2.5 border-border px-2 py-0.5 font-black text-xs shadow-none group-data-active:bg-primary group-data-active:text-primary-foreground"
                      >
                        {jobs.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="jobs" className="mt-0 outline-none">
                <JobFilters
                  filterState={filterState}
                  setFilterState={setFilterState}
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  isSearchingLocation={isSearchingLocation}
                  resume={resume}
                  jobs={jobs}
                  runAnalysis={runAnalysis}
                />

                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-black text-foreground text-lg">
                    Showing {displayedJobs.length} Results
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={
                        buttonVariants({ variant: "outline", size: "sm" }) +
                        "h-9 font-bold text-xs"
                      }
                    >
                      Sort:{" "}
                      {sortBy === "match" ? "Highest Match" : "Most Recent"}
                      <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 font-bold text-sm"
                    >
                      <DropdownMenuItem
                        onClick={() => {
                          setSortBy("match");
                          trackSortChanged({ sort_by: "match" });
                        }}
                        className="py-2"
                      >
                        <Target className="mr-2 h-4 w-4 text-muted-foreground" />
                        Highest Match Ranking
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortBy("recent");
                          trackSortChanged({ sort_by: "recent" });
                        }}
                        className="py-2"
                      >
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        Most Recent Posts
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-col gap-4 pb-20">
                  {displayedJobs.map((job, idx) =>
                    !isPro && job.matchPercentage >= 50 ? (
                      <LockedJobCard key={job.id} job={job} rank={idx} />
                    ) : (
                      <JobCard
                        key={job.id}
                        job={job}
                        rank={idx}
                        analysisId={analysisId || undefined}
                      />
                    ),
                  )}
                </div>

                {displayedJobs.length === 0 && (
                  <div className="rounded-2xl border border-border bg-muted/30 py-24 text-center text-muted-foreground shadow-sm">
                    <p className="mb-2 font-black text-lg">No matches found</p>
                    <p className="font-medium text-sm">
                      Try loosening your filter criteria above.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6 font-bold"
                      onClick={() => {
                        setFilterState({
                          searchTitle: "",
                          searchLoc: "",
                          workType: "any",
                          empType: "any",
                          minMatch: [0],
                          requireSalary: false,
                        });
                      }}
                    >
                      Reset All Filters
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="gaps"
                className="mt-0 animate-fade-in focus-visible:outline-none"
              >
                <div className="mb-8">
                  <h2 className="mb-2 font-black text-2xl text-foreground tracking-tight">
                    Skill Gap Analysis
                  </h2>
                  <p className="border-border border-b pb-6 font-semibold text-base text-muted-foreground">
                    Aggregated across {jobs.length} verified listings
                  </p>
                </div>

                {advice && (
                  <div className="mb-8 rounded-xl border border-accent/20 bg-accent/10 p-6 text-accent-foreground shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-accent-foreground/80" />
                      <h3 className="font-black text-lg tracking-tight">
                        Career Advice
                      </h3>
                    </div>
                    <p className="font-medium text-sm leading-relaxed opacity-90">
                      {advice}
                    </p>
                  </div>
                )}

                <SkillGapPanel
                  resume={resume}
                  skillGaps={skillGaps}
                  totalJobs={jobs.length}
                />
              </TabsContent>

              <TabsContent
                value="roadmap"
                className="mt-0 animate-fade-in focus-visible:outline-none"
              >
                <div className="mb-8">
                  <h2 className="mb-2 font-black text-2xl text-foreground tracking-tight">
                    Learning Roadmap
                  </h2>
                  <p className="border-border border-b pb-6 font-semibold text-base text-muted-foreground">
                    Sequential, impact-ordered resources to address your missing
                    skills
                  </p>
                </div>
                {roadmap.length > 0 ? (
                  <LearningRoadmap roadmap={roadmap} />
                ) : (
                  <div className="rounded-2xl border border-border bg-accent/20 py-20 text-center text-foreground shadow-sm">
                    <p className="mb-2 font-black text-lg">
                      You are fully equipped.
                    </p>
                    <p className="font-bold text-muted-foreground text-sm">
                      You currently have all required skills for standard job
                      listings in this demographic.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background px-6 py-8">
          <AnalyzeSkeleton />
        </div>
      }
    >
      <AnalyzePageContent />
    </Suspense>
  );
}
