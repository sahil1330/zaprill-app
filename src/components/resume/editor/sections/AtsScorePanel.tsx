"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Search,
  Shield,
  Wand2,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";

interface AtsSuggestion {
  section: string;
  issue: string;
  fix: string;
  action?: {
    type: string;
    id?: string;
    value?: string;
    content?: string;
    keywords?: string[];
    highlights?: string[];
    data?: any;
  };
}

interface AtsResult {
  score: number;
  keywordMatches: string[];
  missingKeywords: string[];
  suggestions: AtsSuggestion[];
  sectionScores: Record<string, number>;
}

/**
 * AtsScorePanel — Analyzes resume ATS compatibility with an optional job description.
 */
export default function AtsScorePanel() {
  const dispatch = useDispatch<AppDispatch>();
  const resumeId = useSelector((s: RootState) => s.resume.resumeId);
  const resumeData = useSelector((s: RootState) => s.resume.data);

  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AtsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedFixes, setAppliedFixes] = useState<Set<number>>(new Set());

  const analyze = async () => {
    if (!resumeId) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/ai/ats-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription.trim() || undefined,
          data: resumeData,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        toast.success("ATS analysis complete");
      } else {
        setError("Analysis failed. Please try again.");
        toast.error("ATS analysis failed. Try again.");
      }
    } catch {
      setError("Network error. Please try again.");
      toast.error("ATS analysis failed. Check your connection.");
    } finally {
      setIsAnalyzing(false);
      setAppliedFixes(new Set());
    }
  };

  /**
   * sanitizeActionData - Ensures that all values in a data object are strings, numbers, or arrays of strings.
   * This prevents nested objects from being saved into the resume state, which causes React rendering errors.
   */
  const sanitizeActionData = (data: any) => {
    if (!data || typeof data !== "object") return data;
    const sanitized: Record<string, any> = {};

    Object.entries(data).forEach(([key, value]) => {
      // For basics.location, we want to keep it as an object if it's structured correctly
      if (
        key === "location" &&
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        sanitized[key] = value;
        return;
      }

      if (Array.isArray(value)) {
        sanitized[key] = value.map((v) =>
          typeof v === "object" && v !== null ? JSON.stringify(v) : v,
        );
      } else if (typeof value === "object" && value !== null) {
        // Only stringify if it's a nested object that we don't explicitly support as an object
        sanitized[key] = JSON.stringify(value);
      } else {
        sanitized[key] = value;
      }
    });
    return sanitized;
  };

  const handleApplyFix = (action: any, index: number) => {
    try {
      let applied = false;
      const sanitizedData = sanitizeActionData(action.data);

      switch (action.type) {
        case "update_basics":
        case "update_basics_item":
          if (typeof action.value === "string") {
            dispatch(
              resumeActions.setBasics({
                summary: action.value,
              }),
            );
            applied = true;
          } else if (sanitizedData) {
            dispatch(resumeActions.setBasics(sanitizedData));
            applied = true;
          }
          break;

        case "update_summary": {
          const summaryContent =
            action.content || action.value || sanitizedData?.summary;
          if (summaryContent) {
            dispatch(
              resumeActions.setBasics({
                summary: summaryContent,
              }),
            );
            applied = true;
          }
          break;
        }

        case "update_work":
        case "update_work_item":
          if (action.id && (action.content || sanitizedData)) {
            const updateData = sanitizedData || { summary: action.content };
            dispatch(
              resumeActions.updateWorkItem({
                id: action.id,
                data: updateData,
              }),
            );
            applied = true;
          } else {
            toast.error("Could not find the work experience item to update.");
          }
          break;

        case "update_work_highlights":
          if (action.id && (action.highlights || sanitizedData?.highlights)) {
            const highlights = action.highlights || sanitizedData.highlights;
            dispatch(
              resumeActions.updateWorkItem({
                id: action.id,
                data: { highlights },
              }),
            );
            applied = true;
          } else {
            toast.error("Could not find highlights for work item.");
          }
          break;

        case "update_project":
        case "update_project_item":
          if (action.id && (action.content || sanitizedData)) {
            const updateData = sanitizedData || { description: action.content };
            dispatch(
              resumeActions.updateProjectItem({
                id: action.id,
                data: updateData,
              }),
            );
            applied = true;
          } else {
            toast.error("Could not find the project item to update.");
          }
          break;

        case "update_project_highlights":
          if (action.id && (action.highlights || sanitizedData?.highlights)) {
            const highlights = action.highlights || sanitizedData.highlights;
            dispatch(
              resumeActions.updateProjectItem({
                id: action.id,
                data: { highlights },
              }),
            );
            applied = true;
          } else {
            toast.error("Could not find highlights for project item.");
          }
          break;

        case "update_education":
        case "update_education_item":
          if (action.id && sanitizedData) {
            dispatch(
              resumeActions.updateEducationItem({
                id: action.id,
                data: sanitizedData,
              }),
            );
            applied = true;
          } else {
            toast.error("Could not find the education item to update.");
          }
          break;

        case "add_skill_keywords": {
          const targetId = action.id;
          const keywordsToAdd = action.keywords || sanitizedData?.keywords;

          if (targetId && Array.isArray(keywordsToAdd)) {
            dispatch(
              resumeActions.addSkillKeywords({
                id: targetId,
                keywords: keywordsToAdd,
              }),
            );
            applied = true;
          } else {
            toast.error("Could not find the skill category to update.");
          }
          break;
        }

        case "update_skill":
        case "update_skill_item":
          if (action.id && sanitizedData) {
            dispatch(
              resumeActions.updateSkillItem({
                id: action.id,
                data: sanitizedData,
              }),
            );
            applied = true;
          }
          break;

        case "add_work_highlight":
          if (action.id && (action.content || action.value)) {
            dispatch(
              resumeActions.addWorkHighlight({
                id: action.id,
                highlight: action.content || action.value,
              }),
            );
            applied = true;
          }
          break;

        case "add_project_highlight":
          if (action.id && (action.content || action.value)) {
            dispatch(
              resumeActions.addProjectHighlight({
                id: action.id,
                highlight: action.content || action.value,
              }),
            );
            applied = true;
          }
          break;

        case "no_action_needed":
          applied = true; // Technically nothing to do, but we mark it as "applied" internally
          break;

        default:
          console.warn("Unknown fix type:", action.type);
          break;
      }

      if (applied) {
        setAppliedFixes((prev) => new Set(Array.from(prev).concat(index)));
        if (action.type !== "no_action_needed") {
          toast.success("Fix applied successfully!");
        }
      }
    } catch (error) {
      console.error("Error applying fix:", error);
      toast.error("Failed to apply fix. Please try manual update.");
    }
  };

  const handleApplyAll = () => {
    if (!result) return;

    let appliedCount = 0;
    result.suggestions.forEach((s, i) => {
      if (
        s.action &&
        s.action.type !== "no_action_needed" &&
        !appliedFixes.has(i)
      ) {
        handleApplyFix(s.action, i);
        appliedCount++;
      }
    });

    if (appliedCount > 0) {
      toast.success(`Successfully applied ${appliedCount} fixes!`);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-score-high-fg";
    if (score >= 75) return "text-score-mid-fg";
    if (score >= 60) return "text-score-low-fg";
    return "text-score-critical-fg";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-score-high/60";
    if (score >= 75) return "bg-score-mid/60";
    if (score >= 60) return "bg-score-low/60";
    return "bg-score-critical/60";
  };

  const getScoreBarBg = (score: number) => {
    if (score >= 90) return "bg-score-high-fg";
    if (score >= 75) return "bg-score-mid-fg";
    if (score >= 60) return "bg-score-low-fg";
    return "bg-score-critical-fg";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Elite / ATS Ready";
    if (score >= 80) return "Strong Profile";
    if (score >= 60) return "Needs Optimization";
    return "Critical Issues Found";
  };

  const suggestionsWithActions =
    result?.suggestions.filter(
      (s) => s.action && s.action.type !== "no_action_needed",
    ) || [];
  const appliedCountLabel = appliedFixes.size;
  const totalFixes = suggestionsWithActions.length;
  const allApplied = totalFixes > 0 && appliedCountLabel >= totalFixes;

  return (
    <div className="space-y-6">
      {/* Job Description Input */}
      <div className="space-y-2">
        <Label className="font-bold text-muted-foreground/70 text-xs uppercase tracking-widest">
          Target Job Description
        </Label>
        <Textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here for a tailored ATS analysis..."
          className="min-h-[100px] resize-none rounded-xl border-border/50 bg-muted/20 text-sm transition-all focus:border-primary/50"
        />
      </div>

      <Button
        onClick={analyze}
        disabled={isAnalyzing || !resumeId}
        className="h-12 w-full gap-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/10 transition-all hover:shadow-primary/20"
      >
        {isAnalyzing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        {isAnalyzing ? "Analyzing Resume Data..." : "Run ATS Intelligence Scan"}
      </Button>

      {error && (
        <div className="fade-in zoom-in-95 animate-in rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="fade-in slide-in-from-bottom-4 animate-in space-y-5 duration-500">
          {/* Overall Score & Perfect Resume CTA */}
          <Card className="overflow-hidden rounded-2xl border-border/50 bg-linear-to-br from-background to-muted/30 shadow-sm">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-bold text-muted-foreground text-xs uppercase tracking-widest">
                      ATS Intelligence
                    </span>
                  </div>
                  <h3 className="font-black text-xl tracking-tight">
                    {getScoreLabel(result.score)}
                  </h3>
                </div>
                <div className="relative flex items-center justify-center">
                  <svg className="-rotate-90 h-20 w-20 transform">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-muted/10"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 36}
                      strokeDashoffset={
                        2 * Math.PI * 36 * (1 - result.score / 100)
                      }
                      className={`${getScoreColor(result.score)} transition-all duration-1000 ease-out`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span
                    className={`absolute font-black text-xl ${getScoreColor(result.score)}`}
                  >
                    {result.score}
                  </span>
                </div>
              </div>

              {totalFixes > 0 && !allApplied && (
                <div className="fade-in zoom-in-95 animate-in space-y-3 rounded-xl border border-primary/10 bg-primary/5 p-4 delay-300">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">
                        One-Click Optimization
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Apply all {totalFixes - appliedCountLabel} remaining
                        fixes to reach peak compatibility.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleApplyAll}
                    className="h-10 w-full gap-2 rounded-lg font-bold text-xs uppercase tracking-wider"
                  >
                    <Wand2 className="h-3 w-3" />
                    Fix All Issues Now
                  </Button>
                </div>
              )}

              {allApplied && (
                <div className="fade-in zoom-in-95 flex animate-in items-center gap-3 rounded-xl border border-score-high/20 bg-score-high/50 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-score-high">
                    <CheckCircle2 className="h-4 w-4 text-score-high-fg" />
                  </div>
                  <p className="font-bold text-score-high-fg text-sm">
                    All fixes applied! Scan again to verify.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section Grid */}
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(result.sectionScores).map(([section, score]) => (
              <div
                key={section}
                className={`rounded-xl border border-border/40 p-3 ${getScoreBg(score)} space-y-1`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-muted-foreground text-xs uppercase tracking-widest">
                    {section}
                  </span>
                  <span
                    className={`font-black text-xs ${getScoreColor(score)}`}
                  >
                    {score}%
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted/20">
                  <div
                    className={`h-full ${getScoreBarBg(score)} transition-all duration-1000`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Keywords */}
          {(result.keywordMatches.length > 0 ||
            result.missingKeywords.length > 0) && (
            <Card className="rounded-2xl border-border/50">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
                    <Search className="h-3 w-3 text-primary" />
                  </div>
                  <h3 className="font-bold text-sm tracking-tight">
                    Keyword Analysis
                  </h3>
                </div>

                <div className="space-y-4">
                  {result.keywordMatches.length > 0 && (
                    <div className="space-y-2">
                      <p className="flex items-center gap-1.5 font-bold text-score-high-fg text-xs uppercase tracking-widest">
                        <CheckCircle2 className="h-3 w-3" /> Found
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.keywordMatches.map((kw) => (
                          <Badge
                            key={kw}
                            variant="secondary"
                            className="border-score-high/20 bg-score-high/60 text-score-high-fg text-xs transition-colors hover:bg-score-high"
                          >
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.missingKeywords.length > 0 && (
                    <div className="space-y-2">
                      <p className="flex items-center gap-1.5 font-bold text-score-critical-fg text-xs uppercase tracking-widest">
                        <XCircle className="h-3 w-3" /> Missing
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.missingKeywords.map((kw) => (
                          <Badge
                            key={kw}
                            variant="secondary"
                            className="border-score-critical/20 bg-score-critical/60 text-score-critical-fg text-xs transition-colors hover:bg-score-critical"
                          >
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggestions List */}
          {result.suggestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <AlertTriangle className="h-4 w-4 text-score-low-fg" />
                <h3 className="font-bold text-sm">Strategic Improvements</h3>
              </div>
              <div className="space-y-3">
                {result.suggestions.map((s, i) => {
                  const isApplied = appliedFixes.has(i);
                  return (
                    <div
                      key={`suggestion-${i}`}
                      className={`group rounded-2xl border p-4 transition-all duration-300 ${
                        isApplied
                          ? "border-score-high/20 bg-score-high/40 opacity-80"
                          : "border-border/50 bg-muted/30 hover:border-primary/30 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`h-5 font-bold text-xs uppercase tracking-widest ${isApplied ? "border-score-high/20 text-score-high-fg" : ""}`}
                            >
                              {s.section}
                            </Badge>
                            {isApplied && (
                              <span className="fade-in slide-in-from-left-2 flex animate-in items-center gap-1 font-bold text-score-high-fg text-xs">
                                <CheckCircle2 className="h-3 w-3" /> Applied
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-sm leading-snug">
                            {s.issue}
                          </p>
                          <div className="rounded-lg border border-border/30 bg-background/50 p-3">
                            <p className="mb-1 flex items-center gap-1 font-medium text-muted-foreground text-xs">
                              <Zap className="h-3 w-3 text-primary" /> Proposed
                              Fix:
                            </p>
                            <p className="font-medium text-foreground/90 text-sm italic">
                              "{s.fix}"
                            </p>
                          </div>
                        </div>

                        {s.action && !isApplied && (
                          <Button
                            size="sm"
                            className="h-9 w-9 shrink-0 rounded-full p-0 shadow-sm"
                            onClick={() =>
                              s.action && handleApplyFix(s.action, i)
                            }
                          >
                            <Wand2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
