"use client";

import { useEffect, useState, useCallback } from "react";
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
  ChevronDown,
} from "lucide-react";

type TabId = "jobs" | "gaps" | "roadmap";

const TABS: { id: TabId; label: string; icon: typeof Briefcase }[] = [
  { id: "jobs", label: "Job Matches", icon: Briefcase },
  { id: "gaps", label: "Skill Gaps", icon: TrendingUp },
  { id: "roadmap", label: "Learning Roadmap", icon: Map },
];

function StatCard({
  value,
  label,
  color,
}: {
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div
      className="glass-card-static"
      style={{ padding: "16px 20px", textAlign: "center" }}
    >
      <div
        style={{
          fontSize: "28px",
          fontWeight: 800,
          color,
          letterSpacing: "-0.03em",
          marginBottom: 4,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
        {label}
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  const router = useRouter();
  const [step, setStep] = useState<AnalysisStep>("parsing");
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("jobs");
  const [sortBy, setSortBy] = useState<"match" | "recent">("match");
  const [filterRemote, setFilterRemote] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const runAnalysis = useCallback(async (parsedResume: ParsedResume) => {
    try {
      // Step 2: Search jobs
      setStep("searching");
      const jobRes = await fetch("/api/search-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: parsedResume.skills,
          jobTitles: parsedResume.inferredJobTitles,
        }),
      });
      if (!jobRes.ok) {
        const err = await jobRes.json();
        if (err.error === "API_SUBSCRIPTION_REQUIRED") {
          throw new Error(
            "JSearch API Subscription Required: Please go to https://rapidapi.com/letscrape-6bRBa3QG1q/api/jsearch and subscribe to the Free Basic tier.",
          );
        }
        throw new Error(err.error ?? "Failed to search jobs");
      }
      const { jobs: rawJobs } = await jobRes.json();

      // Step 3: Analyze gaps
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
    runAnalysis(parsed);
  }, [router, runAnalysis]);

  const displayedJobs = jobs
    .filter((j) => !filterRemote || j.isRemote)
    .sort((a, b) => {
      if (sortBy === "recent") {
        const da = a.postedAt ? new Date(a.postedAt).getTime() : 0;
        const db = b.postedAt ? new Date(b.postedAt).getTime() : 0;
        return db - da;
      }
      return b.matchPercentage - a.matchPercentage;
    });

  const summary = getAnalysisSummary(jobs);
  const isDone = step === "done";
  const isError = step === "error";
  const isLoading = !isDone && !isError;

  return (
    <div
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}
    >
      {/* Nav */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(5,8,17,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            height: 60,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <button
            className="btn-ghost"
            id="back-to-home-btn"
            onClick={() => router.push("/")}
            style={{ padding: "7px 12px", fontSize: "13px" }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div
            style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "var(--gradient-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={14} color="#fff" />
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: "15px",
                color: "var(--text-primary)",
              }}
            >
              {resume?.name ? `${resume.name}'s Analysis` : "Career Analysis"}
            </span>
          </div>
          {isDone && (
            <span
              style={{
                fontSize: "12px",
                color: "#10b981",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div className="glow-dot" style={{ width: 6, height: 6 }} />
              Analysis complete
            </span>
          )}
        </div>
      </nav>

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "32px 24px",
          width: "100%",
          flex: 1,
        }}
      >
        {/* Loading / Progress state */}
        {isLoading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "320px 1fr",
              gap: 32,
              alignItems: "start",
            }}
          >
            {/* Progress sidebar */}
            <div
              className="glass-card-static"
              style={{ padding: "28px", position: "sticky", top: 80 }}
            >
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: 24,
                  color: "var(--text-primary)",
                }}
              >
                Analyzing your career...
              </h2>
              <ProgressTimeline currentStep={step} />
              {resume && (
                <div
                  style={{
                    marginTop: 28,
                    paddingTop: 20,
                    borderTop: "1px solid var(--border-subtle)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      marginBottom: 8,
                    }}
                  >
                    Resume detected
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: 6,
                    }}
                  >
                    {resume.name}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      marginBottom: 12,
                    }}
                  >
                    {resume.skills.length} skills · {resume.experience.length}{" "}
                    roles
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {resume.skills.slice(0, 8).map((s) => (
                      <SkillBadge
                        key={s}
                        skill={s}
                        category={categorizeSkill(s)}
                        size="sm"
                      />
                    ))}
                    {resume.skills.length > 8 && (
                      <span
                        style={{ fontSize: "11px", color: "var(--text-muted)" }}
                      >
                        +{resume.skills.length - 8}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Skeleton cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                {step === "searching"
                  ? "🔍 Searching real job listings across the web..."
                  : step === "analyzing"
                    ? "🧠 AI is computing your skill gaps and building roadmap..."
                    : "⚡️ Parsing your resume..."}
              </p>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="glass-card-static"
                  style={{ padding: 20, height: 140 }}
                >
                  <div
                    className="skeleton"
                    style={{ height: 16, width: "60%", marginBottom: 10 }}
                  />
                  <div
                    className="skeleton"
                    style={{ height: 12, width: "40%", marginBottom: 20 }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    {[...Array(4)].map((_, j) => (
                      <div
                        key={j}
                        className="skeleton"
                        style={{ height: 22, width: 64, borderRadius: 999 }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div
            style={{ maxWidth: 480, margin: "80px auto", textAlign: "center" }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <AlertCircle size={28} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: 10 }}>
              Analysis Failed
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
              {error}
            </p>
            <button
              className="btn-primary"
              id="retry-btn"
              onClick={() => router.push("/")}
            >
              <RefreshCw size={15} /> Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {isDone && resume && (
          <div className="animate-fade-in">
            {/* Profile header */}
            <div
              className="glass-card-static"
              style={{ padding: "24px", marginBottom: 28 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "var(--gradient-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <User size={22} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <h1
                    style={{
                      fontSize: "22px",
                      fontWeight: 800,
                      marginBottom: 4,
                    }}
                  >
                    {resume.name}
                  </h1>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      marginBottom: 10,
                    }}
                  >
                    {resume.email} · Target:{" "}
                    {resume.inferredJobTitles.slice(0, 2).join(", ")}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {resume.skills.slice(0, 12).map((s) => (
                      <SkillBadge
                        key={s}
                        skill={s}
                        category={categorizeSkill(s)}
                        size="sm"
                      />
                    ))}
                    {resume.skills.length > 12 && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--text-muted)",
                          alignSelf: "center",
                        }}
                      >
                        +{resume.skills.length - 12} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16,
                marginBottom: 28,
              }}
            >
              <StatCard
                value={`${summary.topMatch}%`}
                label="Best match"
                color="#10b981"
              />
              <StatCard
                value={`${summary.avg}%`}
                label="Avg match"
                color="#6366f1"
              />
              <StatCard
                value={summary.strongMatches}
                label="Strong fits (70%+)"
                color="#06b6d4"
              />
              <StatCard
                value={summary.total}
                label="Jobs found"
                color="#f59e0b"
              />
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: 4,
                marginBottom: 24,
                background: "rgba(255,255,255,0.03)",
                borderRadius: 12,
                padding: 4,
                border: "1px solid var(--border-subtle)",
              }}
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      borderRadius: 9,
                      border: "none",
                      background: isActive
                        ? "var(--bg-card-hover)"
                        : "transparent",
                      color: isActive
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                      fontWeight: isActive ? 600 : 400,
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                      boxShadow: isActive
                        ? "0 2px 8px rgba(0,0,0,0.2)"
                        : "none",
                      borderLeft: isActive
                        ? "1px solid var(--border-accent)"
                        : "none",
                    }}
                  >
                    <Icon size={14} />
                    {tab.label}
                    {tab.id === "jobs" && (
                      <span
                        style={{
                          padding: "2px 7px",
                          borderRadius: 999,
                          fontSize: "11px",
                          background: isActive
                            ? "rgba(99,102,241,0.2)"
                            : "rgba(255,255,255,0.06)",
                          color: isActive ? "#a5b4fc" : "var(--text-muted)",
                        }}
                      >
                        {jobs.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            {activeTab === "jobs" && (
              <div>
                {/* Filters */}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginBottom: 20,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    className={filterRemote ? "btn-primary" : "btn-ghost"}
                    id="filter-remote-btn"
                    onClick={() => setFilterRemote(!filterRemote)}
                    style={{ fontSize: "13px", padding: "7px 14px" }}
                  >
                    <Filter size={13} /> Remote only
                  </button>

                  <div style={{ position: "relative", marginLeft: "auto" }}>
                    <button
                      className="btn-ghost"
                      id="sort-jobs-btn"
                      onClick={() => setShowSortMenu(!showSortMenu)}
                      style={{ fontSize: "13px", padding: "7px 14px" }}
                    >
                      Sort: {sortBy === "match" ? "Best Match" : "Most Recent"}
                      <ChevronDown size={13} />
                    </button>
                    {showSortMenu && (
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "110%",
                          zIndex: 20,
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: 10,
                          padding: "6px",
                          minWidth: 160,
                          boxShadow: "var(--shadow-card)",
                        }}
                      >
                        {(["match", "recent"] as const).map((opt) => (
                          <button
                            key={opt}
                            id={`sort-${opt}-btn`}
                            onClick={() => {
                              setSortBy(opt);
                              setShowSortMenu(false);
                            }}
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "9px 12px",
                              background:
                                sortBy === opt
                                  ? "rgba(99,102,241,0.1)"
                                  : "transparent",
                              color:
                                sortBy === opt
                                  ? "#a5b4fc"
                                  : "var(--text-secondary)",
                              borderRadius: 7,
                              border: "none",
                              cursor: "pointer",
                              fontSize: "13px",
                              textAlign: "left",
                            }}
                          >
                            {opt === "match"
                              ? "🎯 Best Match"
                              : "🕐 Most Recent"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(360px, 1fr))",
                    gap: 16,
                  }}
                >
                  {displayedJobs.map((job, idx) => (
                    <JobCard key={job.id} job={job} rank={idx} />
                  ))}
                </div>

                {displayedJobs.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "60px 24px",
                      color: "var(--text-muted)",
                    }}
                  >
                    No jobs match your current filters. Try removing the remote
                    filter.
                  </div>
                )}
              </div>
            )}

            {activeTab === "gaps" && (
              <div className="animate-fade-in">
                <div style={{ marginBottom: 16 }}>
                  <h2
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    Skill Gap Analysis
                  </h2>
                  <p
                    style={{ color: "var(--text-secondary)", fontSize: "14px" }}
                  >
                    Based on {jobs.length} job listings matching your profile
                  </p>
                </div>
                <SkillGapPanel
                  resume={resume}
                  skillGaps={skillGaps}
                  totalJobs={jobs.length}
                />
              </div>
            )}

            {activeTab === "roadmap" && (
              <div className="animate-fade-in">
                <div style={{ marginBottom: 20 }}>
                  <h2
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    Your Learning Roadmap
                  </h2>
                  <p
                    style={{ color: "var(--text-secondary)", fontSize: "14px" }}
                  >
                    AI-curated resources to close your skill gaps,
                    priority-ordered for maximum impact
                  </p>
                </div>
                {roadmap.length > 0 ? (
                  <LearningRoadmap roadmap={roadmap} />
                ) : (
                  <div style={{ textAlign: "center", padding: "60px 24px" }}>
                    <p style={{ color: "var(--text-secondary)" }}>
                      🎉 Great news — you already have the skills for most roles
                      in your area!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
