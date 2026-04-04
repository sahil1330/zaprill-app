"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { LocationCombobox, locationMatchesCity, INDIA_CITIES, extractCityFromLocation } from "@/components/LocationCombobox";
import {
  Zap,
  ArrowLeft,
  User,
  Briefcase,
  TrendingUp,
  Map,
  RefreshCw,
  AlertCircle,
  Filter,
  X,
  ChevronDown,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession, signOut } from "@/lib/auth-client";

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

type TabId = "jobs" | "gaps" | "roadmap";

const TABS: { id: TabId; label: string; icon: typeof Briefcase }[] = [
  { id: "jobs", label: "Job Matches", icon: Briefcase },
  { id: "gaps", label: "Skill Gaps", icon: TrendingUp },
  { id: "roadmap", label: "Learning Roadmap", icon: Map },
];

function StatCard({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
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

export default function AnalyzePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState<AnalysisStep>("parsing");
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  
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

  const runAnalysis = useCallback(async (parsedResume: ParsedResume, locationOverride?: string) => {
    try {
      setStep("searching");
      setAnalysisId(null);
      if (locationOverride) setIsSearchingLocation(true);

      const jobRes = await fetch("/api/search-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: parsedResume.skills,
          jobTitles: parsedResume.inferredJobTitles,
          location: locationOverride || parsedResume.location,
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

      setStep("analyzing");
      const gapRes = await fetch("/api/analyze-gaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeSkills: parsedResume.skills,
          jobs: rawJobs,
          inferredJobTitles: parsedResume.inferredJobTitles,
        }),
      });
      if (!gapRes.ok) {
        const err = await gapRes.json();
        throw new Error(err.error ?? "Failed to analyze gaps");
      }
      const { matchedJobs, skillGaps: gaps, roadmap: rm } = await gapRes.json();

      setJobs(matchedJobs);
      setSkillGaps(gaps);
      setRoadmap(rm);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setStep("error");
    } finally {
      setIsSearchingLocation(false);
    }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("ai_job_god_resume");
    if (!stored) {
      router.replace("/");
      return;
    }
    const parsed: ParsedResume = JSON.parse(stored);
    setResume(parsed);
    if (parsed.location) {
      // Extract just the city name (e.g. "Mumbai" from "Mumbai, India")
      const cityName = extractCityFromLocation(parsed.location);
      // Check if this city is in our known city list (handles aliases)
      const matched = INDIA_CITIES.find(
        (c) =>
          c.city.toLowerCase() === cityName.toLowerCase() ||
          c.aliases.some((a) => a === cityName.toLowerCase())
      );
      setSearchLoc(matched ? matched.city : cityName);
    }
    runAnalysis(parsed);
  }, [router, runAnalysis]);

  useEffect(() => {
    if (step === "done" && session?.user && !analysisId && resume) {
      const saveAnalysis = async () => {
        try {
          const res = await fetch("/api/save-analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resume,
              jobs,
              skillGaps,
              roadmap,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setAnalysisId(data.analysisId);
          }
        } catch (e) {
          console.error("Failed to save analysis", e);
        }
      };
      saveAnalysis();
    }
  }, [step, session, analysisId, resume, jobs, skillGaps, roadmap]);

  const displayedJobs = useMemo(() => {
    return jobs.filter((j) => {
      // 1. Text searches
      if (searchTitle && !j.title.toLowerCase().includes(searchTitle.toLowerCase())) return false;
      // Use smart city matching instead of full-string substring match
      if (searchLoc && !locationMatchesCity(j.location, searchLoc)) return false;

      // 2. Work type (Remote/Onsite/Hybrid)
      if (workType !== "any") {
        const lowerLoc = j.location.toLowerCase();
        const lowerTitle = j.title.toLowerCase();
        const isHybrid = lowerLoc.includes("hybrid") || lowerTitle.includes("hybrid");
        
        if (workType === "remote" && !j.isRemote) return false;
        if (workType === "onsite" && j.isRemote) return false;
        if (workType === "hybrid" && !isHybrid) return false;
      }

      // 3. Employment type
      if (empType !== "any") {
        const lowerEmp = (j.employmentType || "").toLowerCase();
        if (empType === "fulltime" && !lowerEmp.includes("full")) return false;
        if (empType === "contract" && !lowerEmp.includes("contract")) return false;
        if (empType === "parttime" && !lowerEmp.includes("part")) return false;
      }

      // 4. Sliders and Switches
      if (j.matchPercentage < minMatch[0]) return false;
      if (requireSalary && !j.salary) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "recent") {
        const da = a.postedAt ? new Date(a.postedAt).getTime() : 0;
        const db = b.postedAt ? new Date(b.postedAt).getTime() : 0;
        return db - da;
      }
      return b.matchPercentage - a.matchPercentage;
    });
  }, [jobs, searchTitle, searchLoc, workType, empType, minMatch, requireSalary, sortBy]);

  const summary = getAnalysisSummary(jobs);
  const isDone = step === "done";
  const isError = step === "error";
  const isLoading = !isDone && !isError;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-foreground selection:text-background font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border px-6">
        <div className="max-w-6xl mx-auto h-20 flex items-center gap-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="text-sm font-bold">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-3 flex-1 border-l border-border pl-6">
            <div className="w-10 h-10 rounded-lg shrink-0 bg-foreground flex items-center justify-center">
              <Zap className="h-5 w-5 text-background" />
            </div>
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-lg tracking-tight text-foreground">
                {resume?.name ? `${resume.name}'s Setup` : "Career Setup"}
              </span>
              {analysisId && (
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-muted/50 border border-border/50 animate-in fade-in zoom-in duration-300">
                  <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  Saved
                </span>
              )}
            </div>
          </div>
          {isDone && (
            <span className="text-[11px] uppercase font-bold text-foreground hidden sm:flex items-center gap-2 tracking-widest border border-border px-3 py-1.5 rounded-md bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-foreground" />
              Complete
            </span>
          )}
          
          <div className="flex items-center gap-4">
            {session && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}
                className="font-bold text-xs"
              >
                Log out
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10 w-full flex-1">
        {/* Loading / Progress state */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 items-start">
            <Card className="sticky top-28 shadow-sm border-border rounded-xl">
              <CardHeader className="pb-5 border-b border-border">
                <CardTitle className="text-lg font-black tracking-tight">Analysis Progress</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ProgressTimeline currentStep={step} />
                {resume && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Target Profile</p>
                    <p className="text-base font-black text-foreground mb-1">{resume.name}</p>
                    <p className="text-sm tracking-tight text-muted-foreground font-semibold mb-4">
                      {resume.skills.length} skills · {resume.experience.length} roles
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
                <Card key={i} className="h-[180px] shadow-sm border-border bg-card/50 rounded-2xl">
                  <CardContent className="pt-8">
                    <div className="h-5 bg-muted rounded w-2/5 mb-4 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-1/4 mb-7 animate-pulse" />
                    <div className="flex gap-3">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="h-8 bg-muted rounded w-20 animate-pulse" />
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
            <h2 className="text-3xl font-black mb-3 text-foreground tracking-tight">Analysis Paused</h2>
            <p className="text-base text-muted-foreground mb-8 font-semibold leading-relaxed">{error}</p>
            <Button onClick={() => router.push("/")} variant="default" size="lg" className="w-full text-base font-bold h-14">
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
                      {resume.email} {resume.location && <><span className="opacity-50 mx-2">·</span> {resume.location}</>} <span className="opacity-50 mx-2">·</span> Target:{" "}
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
              <StatCard
                value={`${summary.topMatch}%`}
                label="Best match"
              />
              <StatCard
                value={`${summary.avg}%`}
                label="Avg match"
              />
              <StatCard
                value={summary.strongMatches}
                label="Strong fits"
              />
              <StatCard
                value={summary.total}
                label="Jobs found"
              />
            </div>

            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabId)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted p-2 rounded-xl border border-border shadow-sm h-auto">
                {TABS.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="rounded-lg py-2.5 text-sm font-bold tracking-wide data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md">
                    <tab.icon className="h-5 w-5 mr-2.5 hidden sm:inline" />
                    {tab.label}
                    {tab.id === "jobs" && (
                      <Badge variant="secondary" className="ml-2.5 px-2 py-0.5 text-xs font-black shadow-none border-border group-data-[state=active]:bg-foreground group-data-[state=active]:text-background">
                        {jobs.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="jobs" className="mt-0 focus-visible:outline-none">
                <div className="mb-8 p-6 bg-card border border-border rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-black uppercase tracking-wider text-foreground">Advanced Filters</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowFilters(!showFilters)}
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
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Search Title</label>
                          <Input 
                            placeholder="e.g. Frontend Engineer" 
                            value={searchTitle} 
                            onChange={(e) => setSearchTitle(e.target.value)} 
                            className="bg-background border-border font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">City (India)</label>
                          <LocationCombobox
                            value={searchLoc}
                            onChange={(city) => {
                              setSearchLoc(city);
                              // If the chosen city isn't in the existing results, trigger a new search
                              if (city && resume) {
                                const hasJobsInCity = jobs.some((j) => locationMatchesCity(j.location, city));
                                if (!hasJobsInCity) {
                                  runAnalysis(resume, city);
                                }
                              }
                            }}
                            disabled={isSearchingLocation}
                          />
                          {searchLoc && (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full font-bold h-9"
                              disabled={isSearchingLocation}
                              onClick={() => resume && runAnalysis(resume, searchLoc)}
                            >
                              {isSearchingLocation ? <RefreshCw className="h-4 w-4 animate-spin" /> : `Search jobs in ${searchLoc}`}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Dropdown Filters */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Workspace</label>
                          <Select value={workType} onValueChange={(v) => setWorkType(v || "any")}>
                            <SelectTrigger className="bg-background border-border font-bold">
                              <SelectValue placeholder="Any Workspace" />
                            </SelectTrigger>
                            <SelectContent className="font-bold">
                              <SelectItem value="any">Any Workspace</SelectItem>
                              <SelectItem value="remote">Remote Only</SelectItem>
                              <SelectItem value="onsite">Onsite Only</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Employment Type</label>
                          <Select value={empType} onValueChange={(v) => setEmpType(v || "any")}>
                            <SelectTrigger className="bg-background border-border font-bold">
                              <SelectValue placeholder="Any Type" />
                            </SelectTrigger>
                            <SelectContent className="font-bold">
                              <SelectItem value="any">Any Type</SelectItem>
                              <SelectItem value="fulltime">Full-Time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="parttime">Part-Time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Slider and Range Filters */}
                      <div className="space-y-6 pt-1">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Min Match Score</label>
                            <span className="text-sm font-black text-foreground">{minMatch[0]}%</span>
                          </div>
                          <Slider 
                            defaultValue={[0]} 
                            max={100} 
                            step={5} 
                            value={minMatch} 
                            onValueChange={(v) => setMinMatch(v as number[])} 
                            className="my-4"
                          />
                        </div>
                        <div className="flex items-center justify-between bg-background p-3 rounded border border-border">
                          <label className="text-sm font-bold text-foreground">Require Salary Details</label>
                          <Switch checked={requireSalary} onCheckedChange={setRequireSalary} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Active Filter Badges */}
                  {(searchTitle || searchLoc || workType !== "any" || empType !== "any" || minMatch[0] > 0 || requireSalary) && showFilters && (
                    <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-border/50 items-center">
                      <span className="text-xs font-bold text-muted-foreground mr-2">Active:</span>
                      {searchTitle && <Badge variant="secondary" className="font-bold flex gap-1 items-center px-2 py-1">Title: &apos;{searchTitle}&apos; <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTitle("")}/></Badge>}
                      {searchLoc && <Badge variant="secondary" className="font-bold flex gap-1 items-center px-2 py-1">Location: &apos;{searchLoc}&apos; <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchLoc("")}/></Badge>}
                      {workType !== "any" && <Badge variant="secondary" className="font-bold flex gap-1 items-center px-2 py-1 capitalize">{workType} <X className="h-3 w-3 cursor-pointer" onClick={() => setWorkType("any")}/></Badge>}
                      {empType !== "any" && <Badge variant="secondary" className="font-bold flex gap-1 items-center px-2 py-1 capitalize">{empType.replace("time", "-time")} <X className="h-3 w-3 cursor-pointer" onClick={() => setEmpType("any")}/></Badge>}
                      {minMatch[0] > 0 && <Badge variant="secondary" className="font-bold flex gap-1 items-center px-2 py-1">&gt;{minMatch[0]}% Match <X className="h-3 w-3 cursor-pointer" onClick={() => setMinMatch([0])}/></Badge>}
                      {requireSalary && <Badge variant="secondary" className="font-bold flex gap-1 items-center px-2 py-1">Has Salary <X className="h-3 w-3 cursor-pointer" onClick={() => setRequireSalary(false)}/></Badge>}
                      <Button variant="ghost" size="sm" className="h-6 text-xs font-bold ml-auto" onClick={() => {
                        setSearchTitle(""); setSearchLoc(""); setWorkType("any"); setEmpType("any"); setMinMatch([0]); setRequireSalary(false);
                      }}>Clear All</Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-foreground">Showing {displayedJobs.length} Results</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "sm" }) + " h-9 text-xs font-bold"}>
                      Sort: {sortBy === "match" ? "Highest Match" : "Most Recent"}
                      <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="text-sm font-bold w-48">
                      <DropdownMenuItem onClick={() => setSortBy("match")} className="py-2">
                        🎯 Highest Match Ranking
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("recent")} className="py-2">
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
                    <p className="text-sm font-medium">Try loosening your filter criteria above.</p>
                    <Button variant="outline" className="mt-6 font-bold" onClick={() => {
                        setSearchTitle(""); setSearchLoc(""); setWorkType("any"); setEmpType("any"); setMinMatch([0]); setRequireSalary(false);
                    }}>Reset All Filters</Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="gaps" className="mt-0 animate-fade-in focus-visible:outline-none">
                <div className="mb-8">
                  <h2 className="text-2xl font-black mb-2 tracking-tight text-foreground">Skill Gap Analysis</h2>
                  <p className="text-base font-semibold text-muted-foreground pb-6 border-b border-border">
                    Aggregated across {jobs.length} verified listings
                  </p>
                </div>
                <SkillGapPanel
                  resume={resume}
                  skillGaps={skillGaps}
                  totalJobs={jobs.length}
                />
              </TabsContent>

              <TabsContent value="roadmap" className="mt-0 animate-fade-in focus-visible:outline-none">
                <div className="mb-8">
                  <h2 className="text-2xl font-black mb-2 tracking-tight text-foreground">Learning Roadmap</h2>
                  <p className="text-base font-semibold text-muted-foreground pb-6 border-b border-border">
                    Sequential, impact-ordered resources to address your missing skills
                  </p>
                </div>
                {roadmap.length > 0 ? (
                  <LearningRoadmap roadmap={roadmap} />
                ) : (
                  <div className="text-center py-20 text-foreground bg-accent/20 rounded-2xl border border-border shadow-sm">
                    <p className="text-lg font-black mb-2">You are fully equipped.</p>
                    <p className="text-sm font-bold text-muted-foreground">You currently have all required skills for standard job listings in this demographic.</p>
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
