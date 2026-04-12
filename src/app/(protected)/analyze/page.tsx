"use client";

import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  Suspense,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  ParsedResume,
  JobMatch,
  SkillGap,
  RoadmapItem,
  AnalysisStep,
} from "@/types";
import ProgressTimeline from "@/components/ProgressTimeline";
import JobCard from "@/components/JobCard";
import SkillGapPanel from "@/components/SkillGapPanel";
import LearningRoadmap from "@/components/LearningRoadmap";
import SkillBadge from "@/components/SkillBadge";
import { categorizeSkill } from "@/lib/skill-extractor";
import { getAnalysisSummary } from "@/lib/match-engine";
import {
  LocationCombobox,
  locationMatchesCity,
  INDIA_CITIES,
  extractCityFromLocation,
} from "@/components/LocationCombobox";
import {
  Zap,
  User,
  Briefcase,
  TrendingUp,
  Map,
  RefreshCw,
  AlertCircle,
  Filter,
  X,
  ChevronDown,
  Loader2,
  Plus,
  Trash2,
  Check,
  Info,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import {
  trackAnalysisStart,
  trackJobSearchComplete,
  trackGapAnalysisComplete,
  trackAnalysisComplete,
  trackAnalysisError,
  trackLocationSearch,
  trackFilterPanelOpen,
  trackFilterApplied,
  trackSortChanged,
  trackTabViewed,
  trackAnalysisSaved,
  trackJobListViewed,
} from "@/lib/analytics";

type TabId = "jobs" | "gaps" | "roadmap";

const TABS: { id: TabId; label: string; icon: typeof Briefcase }[] = [
  { id: "jobs", label: "Job Matches", icon: Briefcase },
  { id: "gaps", label: "Skill Gaps", icon: TrendingUp },
  { id: "roadmap", label: "Learning Roadmap", icon: Map },
];

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <Card className="text-center shadow-sm border-border bg-card">
      <CardContent className="pt-8 pb-6">
        <div className="text-5xl font-black tracking-tighter text-foreground mb-2">
          {value}
        </div>
        <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyzePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get("id");
  const [step, setStep] = useState<AnalysisStep>("parsing");
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
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
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLoc, setSearchLoc] = useState("");
  const [workType, setWorkType] = useState("any");
  const [empType, setEmpType] = useState("any");
  const [minMatch, setMinMatch] = useState([0]);
  const [requireSalary, setRequireSalary] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // Review State
  const [reviewSkills, setReviewSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState<number>(0);

  const { user } = useAuth();

  const runAnalysis = useCallback(
    async (parsedResume: ParsedResume, locationOverride?: string) => {
      const analysisStartTime = performance.now();
      try {
        setStep("searching");
        if (idFromUrl) {
          // if run analysis manually occurs while we had an id, strip id
          router.replace("/analyze");
        }
        setAnalysisId(null);
        if (locationOverride) setIsSearchingLocation(true);

        trackAnalysisStart({
          skill_count: reviewSkills.length,
          search_location: locationOverride || parsedResume.location,
          is_location_override: Boolean(locationOverride),
        });

        // Update the main resume state so that follow-up steps (saving, reporting) use the reviewed data
        const updatedResume: ParsedResume = {
          ...parsedResume,
          skills: reviewSkills,
          inferredJobTitles: selectedTitles,
          totalYearsOfExperience: experienceYears,
        };
        setResume(updatedResume);

        const jobSearchStart = performance.now();
        const jobRes = await fetch("/api/search-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skills: reviewSkills,
            jobTitles: selectedTitles,
            location: locationOverride || parsedResume.location,
            experienceYears: experienceYears,
          }),
        });
        if (!jobRes.ok) {
          const err = await jobRes.json();
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
          search_location: locationOverride || parsedResume.location,
          duration_ms: Math.round(performance.now() - jobSearchStart),
        });

        setStep("analyzing");
        const gapAnalysisStart = performance.now();
        const gapRes = await fetch("/api/analyze-gaps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeSkills: reviewSkills,
            jobs: rawJobs,
            inferredJobTitles: selectedTitles,
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
        } = await gapRes.json();

        trackGapAnalysisComplete({
          skill_gaps_count: gaps.length,
          roadmap_items_count: rm.length,
          duration_ms: Math.round(performance.now() - gapAnalysisStart),
        });

        setJobs(matchedJobs);
        setSkillGaps(gaps);
        setRoadmap(rm);
        setAdvice(aiAdvice || "");
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
          search_location: locationOverride || parsedResume.location,
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
    [idFromUrl, router, step, reviewSkills, selectedTitles, experienceYears],
  );

  const addSkill = () => {
    if (newSkill.trim() && !reviewSkills.includes(newSkill.trim())) {
      setReviewSkills([...reviewSkills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setReviewSkills(reviewSkills.filter((s) => s !== skill));
  };

  const toggleTitle = (title: string) => {
    if (selectedTitles.includes(title)) {
      setSelectedTitles(selectedTitles.filter((t) => t !== title));
    } else if (selectedTitles.length < 3) {
      setSelectedTitles([...selectedTitles, title]);
    }
  };

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
            setResume(analysis.resumeRaw);
            setJobs(analysis.jobs || []);
            setSkillGaps(analysis.skillGaps || []);
            setRoadmap(analysis.roadmap || []);
            setAdvice(analysis.advice || "");
            setAnalysisId(analysis.id);

            // Extract search location correctly back for filters
            if (analysis.searchLocation) {
              setSearchLoc(analysis.searchLocation);
            } else if (analysis.resumeLocation) {
              const cityName = extractCityFromLocation(analysis.resumeLocation);
              const matched = INDIA_CITIES.find(
                (c) =>
                  c.city.toLowerCase() === cityName.toLowerCase() ||
                  c.aliases.some((a) => a === cityName.toLowerCase()),
              );
              setSearchLoc(matched ? matched.city : cityName);
            }

            setStep("done");
          }
        })
        .finally(() => setIsFetchingHistory(false));
    }
  }, [idFromUrl, user, isFetchingHistory, resume]);

  useEffect(() => {
    if (idFromUrl || isFetchingHistory || initRef.current) return;

    const stored = sessionStorage.getItem("ai_job_god_resume");
    if (!stored) {
      router.replace("/");
      return;
    }
    const parsed: ParsedResume = JSON.parse(stored);

    // If resume is not yet set up, initialize it
    if (!resume) {
      initRef.current = true;
      setResume(parsed);
      if (parsed.location) {
        // Extract just the city name (e.g. "Mumbai" from "Mumbai, India")
        const cityName = extractCityFromLocation(parsed.location);
        // Check if this city is in our known city list (handles aliases)
        const matched = INDIA_CITIES.find(
          (c) =>
            c.city.toLowerCase() === cityName.toLowerCase() ||
            c.aliases.some((a) => a === cityName.toLowerCase()),
        );
        setSearchLoc(matched ? matched.city : cityName);
      }
      // Instead of starting analysis immediately, go to reviewing stage
      setReviewSkills(parsed.skills);
      setSelectedTitles(parsed.inferredJobTitles.slice(0, 3));
      setExperienceYears(parsed.totalYearsOfExperience || 0);
      setStep("reviewing");
    }
  }, [router, runAnalysis, idFromUrl, isFetchingHistory, resume]);

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
          searchTitle &&
          !j.title.toLowerCase().includes(searchTitle.toLowerCase())
        )
          return false;
        // Use smart city matching instead of full-string substring match
        if (searchLoc && !locationMatchesCity(j.location, searchLoc))
          return false;

        // 2. Work type (Remote/Onsite/Hybrid)
        if (workType !== "any") {
          const lowerLoc = j.location.toLowerCase();
          const lowerTitle = j.title.toLowerCase();
          const isHybrid =
            lowerLoc.includes("hybrid") || lowerTitle.includes("hybrid");

          if (workType === "remote" && !j.isRemote) return false;
          if (workType === "onsite" && j.isRemote) return false;
          if (workType === "hybrid" && !isHybrid) return false;
        }

        // 3. Employment type
        if (empType !== "any") {
          const lowerEmp = (j.employmentType || "").toLowerCase();
          if (empType === "fulltime" && !lowerEmp.includes("full"))
            return false;
          if (empType === "contract" && !lowerEmp.includes("contract"))
            return false;
          if (empType === "parttime" && !lowerEmp.includes("part"))
            return false;
        }

        // 4. Sliders and Switches
        if (j.matchPercentage < minMatch[0]) return false;
        if (requireSalary && !j.salary) return false;

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
  }, [
    jobs,
    searchTitle,
    searchLoc,
    workType,
    empType,
    minMatch,
    requireSalary,
    sortBy,
  ]);

  const summary = getAnalysisSummary(jobs);
  const isDone = step === "done";
  const isError = step === "error";
  const isLoading = !isDone && !isError;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-foreground selection:text-background font-sans">
      <Navbar
        showBack
        backHref="/"
        backLabel="Back"
        user={
          user
            ? { name: user.name, email: user.email, image: user.image }
            : null
        }
        pageTitle={
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg shrink-0 bg-foreground flex items-center justify-center">
              <Zap className="h-4 w-4 text-background" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-foreground truncate">
              {resume?.name ? `${resume.name}'s Setup` : "Career Setup"}
            </span>
            {analysisId && (
              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-muted/50 border border-border/50 animate-in fade-in zoom-in duration-300">
                <svg
                  className="w-3 h-3 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Saved
              </span>
            )}
          </div>
        }
        centreBadge={
          isDone ? (
            <span className="text-[11px] uppercase font-bold text-foreground flex items-center gap-2 tracking-widest border border-border px-3 py-1.5 rounded-md bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-foreground" />
              Complete
            </span>
          ) : undefined
        }
      />

      <div className="max-w-7xl mx-auto px-6 py-10 w-full flex-1">
        {/* Review Stage */}
        {step === "reviewing" && resume && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-black tracking-tight text-foreground mb-3">
                Finalize Your Profile
              </h2>
              <p className="text-lg text-muted-foreground font-semibold">
                We've parsed your resume. Review and customize the data before
                we search for jobs.
              </p>
            </div>

            <div className="space-y-8">
              {/* Quality Note */}
              <Card className="border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                      <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 dark:text-amber-300 mb-1">
                        Search Quality Tip
                      </h4>
                      <p className="text-sm text-amber-800/80 dark:text-amber-400/80 leading-relaxed font-medium">
                        For the best results, avoid selecting very diverse job
                        roles (e.g., "Web Developer" AND "Data Analyst"). The
                        analysis quality is highest when you focus on a specific
                        career path.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Experience Section */}
              <Card className="shadow-sm border-border overflow-hidden">
                <CardHeader className="pb-4 bg-muted/30 border-b border-border/50">
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Years of Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 pb-10 px-8">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                      Experience Level
                    </span>
                    <span className="text-3xl font-black text-foreground">
                      {experienceYears} Years
                    </span>
                  </div>
                  <Slider
                    value={[experienceYears]}
                    min={0}
                    max={20}
                    step={1}
                    onValueChange={(val) => setExperienceYears(val[0])}
                    className="py-4"
                  />
                  <p className="mt-4 text-xs text-muted-foreground font-semibold text-center italic">
                    Slide to adjust your total professional experience for
                    better job matching.
                  </p>
                </CardContent>
              </Card>

              {/* Job Titles Section */}
              <Card className="shadow-sm border-border overflow-hidden">
                <CardHeader className="pb-4 bg-muted/30 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-black flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Target Job Titles
                    </CardTitle>
                    <Badge
                      variant={
                        selectedTitles.length === 3 ? "default" : "secondary"
                      }
                      className="font-black"
                    >
                      {selectedTitles.length}/3 Selected
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {resume.inferredJobTitles.map((title) => {
                      const isSelected = selectedTitles.includes(title);
                      return (
                        <button
                          key={title}
                          onClick={() => toggleTitle(title)}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left group
                            ${
                              isSelected
                                ? "border-foreground bg-foreground text-background"
                                : "border-border bg-card hover:border-muted-foreground/30 text-foreground"
                            }
                          `}
                        >
                          <span className="font-bold tracking-tight">
                            {title}
                          </span>
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center border
                            ${
                              isSelected
                                ? "bg-background border-background"
                                : "bg-muted border-border group-hover:border-muted-foreground/30"
                            }
                          `}
                          >
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-foreground stroke-[3px]" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Skills Section */}
              <Card className="shadow-sm border-border overflow-hidden">
                <CardHeader className="pb-4 bg-muted/30 border-b border-border/50">
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Key Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="flex flex-wrap gap-2 mb-8">
                    {reviewSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="pl-3 pr-1 py-1.5 text-sm font-bold flex items-center gap-1 hover:bg-muted-foreground/10 transition-colors"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a missing skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addSkill()}
                      className="bg-muted/50 border-border font-bold h-12"
                    />
                    <Button
                      onClick={addSkill}
                      variant="default"
                      className="h-12 w-12 p-0 shrink-0"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="pt-4">
                <Button
                  onClick={() => runAnalysis(resume)}
                  disabled={selectedTitles.length === 0}
                  className="w-full h-16 text-xl font-black tracking-tight shadow-xl group"
                >
                  <Zap className="mr-3 h-6 w-6 fill-current group-hover:scale-110 transition-transform" />
                  Start Job Search Analysis
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading / Progress state */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 items-start">
            <Card className="sticky top-28 shadow-sm border-border rounded-xl">
              <CardHeader className="pb-5 border-b border-border">
                <CardTitle className="text-lg font-black tracking-tight">
                  Analysis Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ProgressTimeline currentStep={step} />
                {resume && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                      Target Profile
                    </p>
                    <p className="text-base font-black text-foreground mb-1">
                      {resume.name}
                    </p>
                    <p className="text-sm tracking-tight text-muted-foreground font-semibold mb-4">
                      {resume.skills.length} skills · {resume.experience.length}{" "}
                      roles
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.slice(0, 10).map((s) => (
                        <SkillBadge
                          key={s}
                          skill={s}
                          variant="neutral"
                          size="md"
                        />
                      ))}
                      {resume.skills.length > 10 && (
                        <span className="text-xs font-bold text-muted-foreground pt-1.5 pl-1.5">
                          +{resume.skills.length - 10}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6 pt-2">
              <p className="text-xl font-bold text-muted-foreground mb-2 animate-pulse">
                {step === "searching"
                  ? "Searching verified listings..."
                  : step === "analyzing"
                    ? "Computing skill gaps..."
                    : "Parsing uploaded document..."}
              </p>
              {[...Array(4)].map((_, i) => (
                <Card
                  key={i}
                  className="h-[180px] shadow-sm border-border bg-card/50 rounded-2xl"
                >
                  <CardContent className="pt-8">
                    <div className="h-5 bg-muted rounded w-2/5 mb-4 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-1/4 mb-7 animate-pulse" />
                    <div className="flex gap-3">
                      {[...Array(5)].map((_, j) => (
                        <div
                          key={j}
                          className="h-8 bg-muted rounded w-20 animate-pulse"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="max-w-xl mx-auto my-32 text-center border p-12 rounded-2xl bg-card shadow-sm">
            <div className="w-16 h-16 rounded-xl bg-muted/80 border border-border flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-foreground" />
            </div>
            <h2 className="text-3xl font-black mb-3 text-foreground tracking-tight">
              Analysis Paused
            </h2>
            <p className="text-base text-muted-foreground mb-8 font-semibold leading-relaxed">
              {error}
            </p>
            <Button
              onClick={() => router.push("/")}
              variant="default"
              size="lg"
              className="w-full text-base font-bold h-14"
            >
              <RefreshCw className="mr-2 h-5 w-5" /> Try Again
            </Button>
          </div>
        )}

        {/* Results */}
        {isDone && resume && (
          <div className="animate-fade-in">
            {/* Profile header */}
            <Card className="mb-8 shadow-sm border-border rounded-2xl">
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="w-20 h-20 rounded-xl bg-muted/80 border border-border flex items-center justify-center shrink-0">
                    <User className="h-10 w-10 text-foreground" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-3xl font-black text-foreground mb-2 tracking-tight">
                      {resume.name}
                    </h1>
                    <p className="text-base font-semibold text-muted-foreground mb-5 pb-5 border-b border-border/50">
                      {resume.email}{" "}
                      {resume.location && (
                        <>
                          <span className="opacity-50 mx-2">·</span>{" "}
                          {resume.location}
                        </>
                      )}{" "}
                      <span className="opacity-50 mx-2">·</span> Target:{" "}
                      {resume.inferredJobTitles.slice(0, 3).join(", ")}
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      {resume.skills.slice(0, 15).map((s) => (
                        <SkillBadge
                          key={s}
                          skill={s}
                          variant="neutral"
                          size="md"
                        />
                      ))}
                      {resume.skills.length > 15 && (
                        <span className="text-sm font-black text-muted-foreground ml-2">
                          +{resume.skills.length - 15}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
              <StatCard value={`${summary.topMatch}%`} label="Best match" />
              <StatCard value={`${summary.avg}%`} label="Avg match" />
              <StatCard value={summary.strongMatches} label="Strong fits" />
              <StatCard value={summary.total} label="Jobs found" />
            </div>

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
                    search_location: searchLoc || undefined,
                  });
                }
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted p-2 rounded-xl border border-border shadow-sm h-auto">
                {TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="rounded-lg py-2.5 text-sm font-bold tracking-wide data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md"
                  >
                    <tab.icon className="h-5 w-5 mr-2.5 hidden sm:inline" />
                    {tab.label}
                    {tab.id === "jobs" && (
                      <Badge
                        variant="secondary"
                        className="ml-2.5 px-2 py-0.5 text-xs font-black shadow-none border-border group-data-[state=active]:bg-foreground group-data-[state=active]:text-background"
                      >
                        {jobs.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent
                value="jobs"
                className="mt-0 focus-visible:outline-none"
              >
                <div className="mb-8 p-6 bg-card border border-border rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-black uppercase tracking-wider text-foreground">
                      Advanced Filters
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (!showFilters) trackFilterPanelOpen();
                        setShowFilters(!showFilters);
                      }}
                      className="font-bold text-sm"
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      {showFilters ? "Hide Filters" : "Show Filters"}
                    </Button>
                  </div>

                  {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in pt-2 border-t border-border/50">
                      {/* Text Filters */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Search Title
                          </label>
                          <Input
                            placeholder="e.g. Frontend Engineer"
                            value={searchTitle}
                            onChange={(e) => {
                              setSearchTitle(e.target.value);
                              if (e.target.value) {
                                trackFilterApplied({
                                  filter_type: "title",
                                  filter_value: e.target.value,
                                });
                              }
                            }}
                            className="bg-background border-border font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            City (India)
                          </label>
                          <LocationCombobox
                            value={searchLoc}
                            onChange={(city) => {
                              setSearchLoc(city);
                              // If the chosen city isn't in the existing results, trigger a new search
                              if (city && resume) {
                                const hasJobsInCity = jobs.some((j) =>
                                  locationMatchesCity(j.location, city),
                                );
                                if (!hasJobsInCity) {
                                  trackLocationSearch({
                                    city,
                                    triggered_by: "combobox_change",
                                  });
                                  runAnalysis(resume, city);
                                }
                              }
                              trackFilterApplied({
                                filter_type: "location",
                                filter_value: city,
                              });
                            }}
                            disabled={isSearchingLocation}
                          />
                          {searchLoc && (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full font-bold h-9"
                              disabled={isSearchingLocation}
                              onClick={() => {
                                if (resume) {
                                  trackLocationSearch({
                                    city: searchLoc,
                                    triggered_by: "search_button",
                                  });
                                  runAnalysis(resume, searchLoc);
                                }
                              }}
                            >
                              {isSearchingLocation ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                `Search jobs in ${searchLoc}`
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Dropdown Filters */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Workspace
                          </label>
                          <Select
                            value={workType}
                            onValueChange={(v) => {
                              setWorkType(v || "any");
                              trackFilterApplied({
                                filter_type: "work_type",
                                filter_value: v || "any",
                              });
                            }}
                          >
                            <SelectTrigger className="bg-background border-border font-bold">
                              <SelectValue placeholder="Any Workspace" />
                            </SelectTrigger>
                            <SelectContent className="font-bold">
                              <SelectItem value="any">Any Workspace</SelectItem>
                              <SelectItem value="remote">
                                Remote Only
                              </SelectItem>
                              <SelectItem value="onsite">
                                Onsite Only
                              </SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Employment Type
                          </label>
                          <Select
                            value={empType}
                            onValueChange={(v) => {
                              setEmpType(v || "any");
                              trackFilterApplied({
                                filter_type: "employment_type",
                                filter_value: v || "any",
                              });
                            }}
                          >
                            <SelectTrigger className="bg-background border-border font-bold">
                              <SelectValue placeholder="Any Type" />
                            </SelectTrigger>
                            <SelectContent className="font-bold">
                              <SelectItem value="any">Any Type</SelectItem>
                              <SelectItem value="fulltime">
                                Full-Time
                              </SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="parttime">
                                Part-Time
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Slider and Range Filters */}
                      <div className="space-y-6 pt-1">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              Min Match Score
                            </label>
                            <span className="text-sm font-black text-foreground">
                              {minMatch[0]}%
                            </span>
                          </div>
                          <Slider
                            defaultValue={[0]}
                            max={100}
                            step={5}
                            value={minMatch}
                            onValueChange={(v) => {
                              const valArr = v as number[];
                              setMinMatch(valArr);
                              trackFilterApplied({
                                filter_type: "min_match",
                                filter_value: valArr[0],
                              });
                            }}
                            className="my-4"
                          />
                        </div>
                        <div className="flex items-center justify-between bg-background p-3 rounded border border-border">
                          <label className="text-sm font-bold text-foreground">
                            Require Salary Details
                          </label>
                          <Switch
                            checked={requireSalary}
                            onCheckedChange={(v) => {
                              setRequireSalary(v);
                              trackFilterApplied({
                                filter_type: "require_salary",
                                filter_value: v,
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Active Filter Badges */}
                  {(searchTitle ||
                    searchLoc ||
                    workType !== "any" ||
                    empType !== "any" ||
                    minMatch[0] > 0 ||
                    requireSalary) &&
                    showFilters && (
                      <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-border/50 items-center">
                        <span className="text-xs font-bold text-muted-foreground mr-2">
                          Active:
                        </span>
                        {searchTitle && (
                          <Badge
                            variant="secondary"
                            className="font-bold flex gap-1 items-center px-2 py-1"
                          >
                            Title: &apos;{searchTitle}&apos;{" "}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => setSearchTitle("")}
                            />
                          </Badge>
                        )}
                        {searchLoc && (
                          <Badge
                            variant="secondary"
                            className="font-bold flex gap-1 items-center px-2 py-1"
                          >
                            Location: &apos;{searchLoc}&apos;{" "}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => setSearchLoc("")}
                            />
                          </Badge>
                        )}
                        {workType !== "any" && (
                          <Badge
                            variant="secondary"
                            className="font-bold flex gap-1 items-center px-2 py-1 capitalize"
                          >
                            {workType}{" "}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => setWorkType("any")}
                            />
                          </Badge>
                        )}
                        {empType !== "any" && (
                          <Badge
                            variant="secondary"
                            className="font-bold flex gap-1 items-center px-2 py-1 capitalize"
                          >
                            {empType.replace("time", "-time")}{" "}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => setEmpType("any")}
                            />
                          </Badge>
                        )}
                        {minMatch[0] > 0 && (
                          <Badge
                            variant="secondary"
                            className="font-bold flex gap-1 items-center px-2 py-1"
                          >
                            &gt;{minMatch[0]}% Match{" "}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => setMinMatch([0])}
                            />
                          </Badge>
                        )}
                        {requireSalary && (
                          <Badge
                            variant="secondary"
                            className="font-bold flex gap-1 items-center px-2 py-1"
                          >
                            Has Salary{" "}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => setRequireSalary(false)}
                            />
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs font-bold ml-auto"
                          onClick={() => {
                            setSearchTitle("");
                            setSearchLoc("");
                            setWorkType("any");
                            setEmpType("any");
                            setMinMatch([0]);
                            setRequireSalary(false);
                          }}
                        >
                          Clear All
                        </Button>
                      </div>
                    )}
                </div>

                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-foreground">
                    Showing {displayedJobs.length} Results
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={
                        buttonVariants({ variant: "outline", size: "sm" }) +
                        " h-9 text-xs font-bold"
                      }
                    >
                      Sort:{" "}
                      {sortBy === "match" ? "Highest Match" : "Most Recent"}
                      <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="text-sm font-bold w-48"
                    >
                      <DropdownMenuItem
                        onClick={() => {
                          setSortBy("match");
                          trackSortChanged({ sort_by: "match" });
                        }}
                        className="py-2"
                      >
                        🎯 Highest Match Ranking
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortBy("recent");
                          trackSortChanged({ sort_by: "recent" });
                        }}
                        className="py-2"
                      >
                        🕐 Most Recent Posts
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                  {displayedJobs.map((job, idx) => (
                    <JobCard key={job.id} job={job} rank={idx} />
                  ))}
                </div>

                {displayedJobs.length === 0 && (
                  <div className="text-center py-24 text-muted-foreground bg-muted/30 rounded-2xl border border-border shadow-sm">
                    <p className="text-lg font-black mb-2">No matches found</p>
                    <p className="text-sm font-medium">
                      Try loosening your filter criteria above.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6 font-bold"
                      onClick={() => {
                        setSearchTitle("");
                        setSearchLoc("");
                        setWorkType("any");
                        setEmpType("any");
                        setMinMatch([0]);
                        setRequireSalary(false);
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
                  <h2 className="text-2xl font-black mb-2 tracking-tight text-foreground">
                    Skill Gap Analysis
                  </h2>
                  <p className="text-base font-semibold text-muted-foreground pb-6 border-b border-border">
                    Aggregated across {jobs.length} verified listings
                  </p>
                </div>

                {advice && (
                  <div className="mb-8 p-6 bg-accent/10 rounded-xl border border-accent/20 text-accent-foreground shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-5 w-5 text-accent-foreground/80" />
                      <h3 className="text-lg font-black tracking-tight">
                        AI Career Advice
                      </h3>
                    </div>
                    <p className="text-sm font-medium leading-relaxed opacity-90">
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
                  <h2 className="text-2xl font-black mb-2 tracking-tight text-foreground">
                    Learning Roadmap
                  </h2>
                  <p className="text-base font-semibold text-muted-foreground pb-6 border-b border-border">
                    Sequential, impact-ordered resources to address your missing
                    skills
                  </p>
                </div>
                {roadmap.length > 0 ? (
                  <LearningRoadmap roadmap={roadmap} />
                ) : (
                  <div className="text-center py-20 text-foreground bg-accent/20 rounded-2xl border border-border shadow-sm">
                    <p className="text-lg font-black mb-2">
                      You are fully equipped.
                    </p>
                    <p className="text-sm font-bold text-muted-foreground">
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
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-2 mb-4" />
            <span className="text-muted-foreground font-medium">
              Preparing space...
            </span>
          </div>
        </div>
      }
    >
      <AnalyzePageContent />
    </Suspense>
  );
}
