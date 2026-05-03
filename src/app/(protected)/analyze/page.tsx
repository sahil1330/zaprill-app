"use client";

import {
  AlertCircle,
  Briefcase,
  Check,
  ChevronDown,
  Filter,
  Info,
  Loader2,
  Map,
  Plus,
  RefreshCw,
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
import JobCard from "@/components/JobCard";
import LearningRoadmap from "@/components/LearningRoadmap";
import {
  extractCityFromLocation,
  INDIA_CITIES,
  LocationCombobox,
  locationMatchesCity,
} from "@/components/LocationCombobox";
import LockedJobCard from "@/components/LockedJobCard";
import Navbar from "@/components/Navbar";
import ProgressTimeline from "@/components/ProgressTimeline";
import SkillBadge from "@/components/SkillBadge";
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
import { normalizeResumeData } from "@/lib/resume";
import { categorizeSkill } from "@/lib/skill-extractor";
import type {
  AnalysisStep,
  JobMatch,
  ParsedResume,
  RoadmapItem,
  SkillGap,
} from "@/types";

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

const JOB_MEMES = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKSjPQC1Id89MME/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/BmmfETghGOPrW/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/12vVAGu9q7Y9S/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lTfuxVpB3P0p3O/giphy.gif",
];

const JOB_MESSAGES = [
  "Calculating how many desk plants you'll need...",
  "Persuading the recruiter that 'Netflix' is a technical skill...",
  "Searching for your boss's replacement...",
  "Bribing the match engine with digital coffee...",
  "Applying to 100 jobs while you wait (just kidding)...",
  "Negotiating with the algorithms for a higher match score...",
];

function MemeLoader({ step }: { step: AnalysisStep }) {
  const [memeIdx] = useState(() =>
    Math.floor(Math.random() * JOB_MEMES.length),
  );
  const [msgIdx] = useState(() =>
    Math.floor(Math.random() * JOB_MESSAGES.length),
  );

  return (
    <div className="max-w-2xl mx-auto py-20 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-foreground/10 shadow-2xl mb-12 group">
        <img
          src={JOB_MEMES[memeIdx]}
          alt="Job Meme"
          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <Loader2 className="h-6 w-6 text-white animate-spin" />
          <span className="text-white font-black tracking-widest text-sm uppercase">
            {step === "searching"
              ? "Scanning Universe..."
              : "Analyzing Data..."}
          </span>
        </div>
      </div>

      <h3 className="text-3xl font-black text-foreground mb-4 tracking-tight">
        {JOB_MESSAGES[msgIdx]}
      </h3>
      <p className="text-lg text-muted-foreground font-semibold max-w-md mx-auto leading-relaxed">
        Our AI is working hard behind the scenes to find your perfect job match.
        Sit tight, this won't take long!
      </p>

      <div className="mt-12 flex gap-4">
        <div
          className={`h-1.5 w-16 rounded-full ${step === "searching" ? "bg-foreground animate-pulse" : "bg-muted"}`}
        />
        <div
          className={`h-1.5 w-16 rounded-full ${step === "analyzing" ? "bg-foreground animate-pulse" : "bg-muted"}`}
        />
      </div>
    </div>
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
  const [reviewTitles, setReviewTitles] = useState<string[]>([]);
  const [newTitleValue, setNewTitleValue] = useState("");
  const [editingTitleIndex, setEditingTitleIndex] = useState<number | null>(
    null,
  );
  const [editingTitleValue, setEditingTitleValue] = useState("");
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
          isPro: isUserPro,
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

  const addTitle = () => {
    const val = newTitleValue.trim();
    if (val && !reviewTitles.includes(val)) {
      setReviewTitles([...reviewTitles, val]);
      if (selectedTitles.length < 3) {
        setSelectedTitles([...selectedTitles, val]);
      }
      setNewTitleValue("");
    }
  };

  const removeTitle = (title: string) => {
    setReviewTitles(reviewTitles.filter((t) => t !== title));
    setSelectedTitles(selectedTitles.filter((t) => t !== title));
  };

  const startEditingTitle = (index: number, text: string) => {
    setEditingTitleIndex(index);
    setEditingTitleValue(text);
  };

  const saveEditedTitle = (index: number) => {
    const newVal = editingTitleValue.trim();
    if (!newVal) {
      setEditingTitleIndex(null);
      return;
    }
    const oldVal = reviewTitles[index];
    const newReviewTitles = [...reviewTitles];
    newReviewTitles[index] = newVal;
    setReviewTitles(newReviewTitles);

    if (selectedTitles.includes(oldVal)) {
      setSelectedTitles(selectedTitles.map((t) => (t === oldVal ? newVal : t)));
    }
    setEditingTitleIndex(null);
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
            const normalized = normalizeResumeData(analysis.resumeRaw);
            const pr: ParsedResume = {
              name: normalized.basics?.name || "",
              email: normalized.basics?.email || "",
              location: normalized.basics?.location?.city || "",
              skills: normalized.skills?.flatMap((s) => s.keywords || []) || [],
              experience:
                normalized.work?.map((w) => ({
                  role: w.position || "",
                  company: w.company || "",
                  duration: `${w.startDate || ""} - ${w.endDate || ""}`,
                  description: w.summary || "",
                  skillsUsed: [],
                })) || [],
              education:
                normalized.education?.map((e) => ({
                  degree: e.studyType || "",
                  institution: e.institution || "",
                  year: e.endDate
                    ? parseInt(e.endDate) || undefined
                    : undefined,
                })) || [],
              inferredJobTitles: analysis.resumeRaw?.inferredJobTitles || [],
              totalYearsOfExperience:
                analysis.resumeRaw?.totalYearsOfExperience || 0,
              projects: [],
              socialProfiles: [],
            };
            setResume(pr);
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
    const rawParsed = JSON.parse(stored);
    const parsed = normalizeResumeData(rawParsed);

    // If resume is not yet set up, initialize it
    if (!resume) {
      initRef.current = true;
      const pr: ParsedResume = {
        name: parsed.basics?.name || "",
        email: parsed.basics?.email || "",
        location: parsed.basics?.location?.city || "",
        skills: parsed.skills?.flatMap((s) => s.keywords || []) || [],
        experience:
          parsed.work?.map((w) => ({
            role: w.position || "",
            company: w.company || "",
            duration: `${w.startDate || ""} - ${w.endDate || ""}`,
            description: w.summary || "",
            skillsUsed: [],
          })) || [],
        education:
          parsed.education?.map((e) => ({
            degree: e.studyType || "",
            institution: e.institution || "",
            year: e.endDate ? parseInt(e.endDate) || undefined : undefined,
          })) || [],
        inferredJobTitles: rawParsed.inferredJobTitles || [],
        totalYearsOfExperience: rawParsed.totalYearsOfExperience || 0,
        projects: [],
        socialProfiles: [],
      };
      setResume(pr);
      if (pr.location) {
        // Extract just the city name (e.g. "Mumbai" from "Mumbai, India")
        const cityName = extractCityFromLocation(pr.location);
        // Check if this city is in our known city list (handles aliases)
        const matched = INDIA_CITIES.find(
          (c) =>
            c.city.toLowerCase() === cityName.toLowerCase() ||
            c.aliases.some((a) => a === cityName.toLowerCase()),
        );
        setSearchLoc(matched ? matched.city : cityName);
      }
      // Instead of starting analysis immediately, go to reviewing stage
      setReviewSkills(pr.skills || []);
      setReviewTitles(pr.inferredJobTitles || []);
      setSelectedTitles(pr.inferredJobTitles?.slice(0, 3) || []);
      setExperienceYears(pr.totalYearsOfExperience || 0);
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
            <div className="w-9 h-9 rounded-lg shrink-0 bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-foreground truncate">
              {resume?.name ? `${resume.name}'s Setup` : "Career Setup"}
            </span>
            {analysisId && (
              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-muted/50 border border-border/50 animate-in fade-in zoom-in duration-300">
                <svg
                  className="w-3 h-3 text-primary"
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
              <div className="w-2 h-2 rounded-full bg-primary" />
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
              <Card className="border-accent/30 bg-accent/5 dark:bg-accent/10 dark:border-accent/20 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 dark:bg-accent/20 flex items-center justify-center shrink-0">
                      <Info className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">
                        Search Quality Tip
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium">
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
                    onValueChange={(val) =>
                      setExperienceYears(
                        Array.isArray(val) ? (val[0] ?? experienceYears) : val,
                      )
                    }
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {reviewTitles.map((title, idx) => {
                      const isSelected = selectedTitles.includes(title);
                      const isEditing = editingTitleIndex === idx;

                      if (isEditing) {
                        return (
                          <div
                            key={"edit-" + idx}
                            className="flex items-center gap-2"
                          >
                            <Input
                              value={editingTitleValue}
                              onChange={(e) =>
                                setEditingTitleValue(e.target.value)
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" && saveEditedTitle(idx)
                              }
                              autoFocus
                              className="h-12 font-bold"
                            />
                            <Button
                              size="sm"
                              onClick={() => saveEditedTitle(idx)}
                              className="h-12"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      }

                      return (
                        <div key={title} className="relative group/item">
                          <button
                            onClick={() => toggleTitle(title)}
                            className={`flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all duration-200 text-left group
                              ${
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-card hover:border-muted-foreground/30 text-foreground"
                              }
                            `}
                          >
                            <span className="font-bold tracking-tight pr-10 truncate">
                              {title}
                            </span>
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0
                                ${
                                  isSelected
                                    ? "bg-primary-foreground border-primary-foreground"
                                    : "bg-muted border-border group-hover:border-muted-foreground/30"
                                }
                              `}
                            >
                              {isSelected && (
                                <Check className="h-3.5 w-3.5 text-primary stroke-[3px]" />
                              )}
                            </div>
                          </button>
                          {/* Floating Actions */}
                          <div className="absolute right-12 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditingTitle(idx, title);
                              }}
                              className={`p-1.5 rounded-md hover:bg-muted transition-colors ${isSelected ? "text-background hover:bg-background/20" : "text-muted-foreground hover:text-foreground"}`}
                              title="Edit"
                            >
                              <TrendingUp className="h-3.5 w-3.5 rotate-90" />{" "}
                              {/* Reusing existing icon or using a dash */}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTitle(title);
                              }}
                              className={`p-1.5 rounded-md hover:bg-destructive hover:text-white transition-colors ${isSelected ? "text-background" : "text-muted-foreground"}`}
                              title="Remove"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 p-3 bg-muted/30 rounded-xl border border-dashed border-border">
                    <Input
                      placeholder="Add custom job title (e.g. Lead Dev)..."
                      value={newTitleValue}
                      onChange={(e) => setNewTitleValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTitle()}
                      className="bg-background border-border font-bold h-12"
                    />
                    <Button
                      onClick={addTitle}
                      variant="outline"
                      className="h-12 px-6 font-bold"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
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

        {/* Loading / Progress state - ONLY for initial parsing */}
        {step === "parsing" && (
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
                Parsing uploaded document...
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

        {/* Meme Loading State - for searching and analyzing */}
        {(step === "searching" || step === "analyzing") && (
          <MemeLoader step={step} />
        )}

        {/* Error state */}
        {isError && (
          <div className="max-w-xl mx-auto my-32 text-center border p-12 rounded-2xl bg-card shadow-sm">
            <div className="w-16 h-16 rounded-xl bg-muted/80 border border-border flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-foreground" />
            </div>
            <h2 className="text-3xl font-black mb-3 text-foreground tracking-tight">
              {error === "LIMIT_REACHED"
                ? "Monthly Limit Reached"
                : "Analysis Paused"}
            </h2>
            <p className="text-base text-muted-foreground mb-8 font-semibold leading-relaxed">
              {error === "LIMIT_REACHED"
                ? "You have reached your limit of 2 free job searches for this month. Upgrade to Pro to get unlimited job searches and unlock all features."
                : error}
            </p>
            {error === "LIMIT_REACHED" ? (
              <Button
                onClick={() => router.push("/billing")}
                variant="default"
                size="lg"
                className="w-full text-base font-bold h-14"
              >
                <Zap className="mr-2 h-5 w-5 fill-current" /> Upgrade to Pro
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/")}
                variant="default"
                size="lg"
                className="w-full text-base font-bold h-14"
              >
                <RefreshCw className="mr-2 h-5 w-5" /> Try Again
              </Button>
            )}
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
              <TabsList className="flex w-full mb-8 bg-muted p-1 rounded-full border border-border shadow-sm h-12">
                {TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex-1 rounded-full h-full text-sm font-bold tracking-wide data-active:bg-background data-active:text-foreground data-active:shadow-md transition-all"
                  >
                    <tab.icon className="h-5 w-5 mr-2.5 hidden sm:inline" />
                    {tab.label}
                    {tab.id === "jobs" && (
                      <Badge
                        variant="secondary"
                        className="ml-2.5 px-2 py-0.5 text-xs font-black shadow-none border-border group-data-active:bg-primary group-data-active:text-primary-foreground"
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
                              const valArr = Array.isArray(v) ? v : [v];
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

                <div className="flex flex-col gap-4 pb-20">
                  {displayedJobs.map((job, idx) =>
                    !isPro && job.matchPercentage >= 50 ? (
                      <LockedJobCard key={job.id} job={job} rank={idx} />
                    ) : (
                      <JobCard key={job.id} job={job} rank={idx} />
                    ),
                  )}
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
                        Career Advice
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
