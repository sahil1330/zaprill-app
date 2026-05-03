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
      } else {
        setError("Analysis failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
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
                ...resumeData.basics,
                summary: action.value,
              }),
            );
            applied = true;
          } else if (sanitizedData) {
            dispatch(
              resumeActions.setBasics({
                ...resumeData.basics,
                ...sanitizedData,
              }),
            );
            applied = true;
          }
          break;

        case "update_summary": {
          const summaryContent =
            action.content || action.value || sanitizedData?.summary;
          if (summaryContent) {
            dispatch(
              resumeActions.setBasics({
                ...resumeData.basics,
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
            const skillItem = resumeData.skills.find((s) => s.id === targetId);
            if (skillItem) {
              const newKeywords = Array.from(
                new Set([...skillItem.keywords, ...keywordsToAdd]),
              );
              dispatch(
                resumeActions.updateSkillItem({
                  id: targetId,
                  data: { keywords: newKeywords },
                }),
              );
              applied = true;
            } else {
              toast.error("Could not find the skill category to update.");
            }
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
            const workItem = resumeData.work.find((w) => w.id === action.id);
            if (workItem) {
              const newHighlights = [
                ...workItem.highlights,
                action.content || action.value,
              ];
              dispatch(
                resumeActions.updateWorkItem({
                  id: action.id,
                  data: { highlights: newHighlights },
                }),
              );
              applied = true;
            }
          }
          break;

        case "add_project_highlight":
          if (action.id && (action.content || action.value)) {
            const projectItem = resumeData.projects.find(
              (p) => p.id === action.id,
            );
            if (projectItem) {
              const newHighlights = [
                ...projectItem.highlights,
                action.content || action.value,
              ];
              dispatch(
                resumeActions.updateProjectItem({
                  id: action.id,
                  data: { highlights: newHighlights },
                }),
              );
              applied = true;
            }
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
    if (score >= 90) return "text-emerald-500";
    if (score >= 75) return "text-sky-500";
    if (score >= 60) return "text-amber-500";
    return "text-rose-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-emerald-500/10";
    if (score >= 75) return "bg-sky-500/10";
    if (score >= 60) return "bg-amber-500/10";
    return "bg-rose-500/10";
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
        <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground/70">
          Target Job Description
        </Label>
        <Textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here for a tailored ATS analysis..."
          className="min-h-[100px] resize-none text-sm bg-muted/20 border-border/50 focus:border-primary/50 transition-all rounded-xl"
        />
      </div>

      <Button
        onClick={analyze}
        disabled={isAnalyzing || !resumeId}
        className="w-full h-12 gap-2 text-sm font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all rounded-xl"
      >
        {isAnalyzing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        {isAnalyzing ? "Analyzing Resume Data..." : "Run ATS Intelligence Scan"}
      </Button>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-sm text-rose-500 text-center animate-in fade-in zoom-in-95">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Overall Score & Perfect Resume CTA */}
          <Card className="border-border/50 overflow-hidden bg-gradient-to-br from-background to-muted/30 rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                      ATS Intelligence
                    </span>
                  </div>
                  <h3 className="text-xl font-black tracking-tight">
                    {getScoreLabel(result.score)}
                  </h3>
                </div>
                <div className="relative flex items-center justify-center">
                  <svg className="h-20 w-20 transform -rotate-90">
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
                    className={`absolute text-xl font-black ${getScoreColor(result.score)}`}
                  >
                    {result.score}
                  </span>
                </div>
              </div>

              {totalFixes > 0 && !allApplied && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3 animate-in fade-in zoom-in-95 delay-300">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        One-Click Optimization
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Apply all {totalFixes - appliedCountLabel} remaining
                        fixes to reach peak compatibility.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleApplyAll}
                    className="w-full h-10 gap-2 font-bold text-xs uppercase tracking-wider rounded-lg"
                  >
                    <Wand2 className="h-3 w-3" />
                    Fix All Issues Now
                  </Button>
                </div>
              )}

              {allApplied && (
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3 animate-in fade-in zoom-in-95">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-sm font-bold text-emerald-600">
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
                className={`p-3 rounded-xl border border-border/40 ${getScoreBg(score)} space-y-1`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {section}
                  </span>
                  <span
                    className={`text-xs font-black ${getScoreColor(score)}`}
                  >
                    {score}%
                  </span>
                </div>
                <div className="h-1 w-full bg-muted/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getScoreColor(score).replace("text-", "bg-")} transition-all duration-1000`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Keywords */}
          {(result.keywordMatches.length > 0 ||
            result.missingKeywords.length > 0) && (
            <Card className="border-border/50 rounded-2xl">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-sky-500/10 flex items-center justify-center">
                    <Search className="h-3 w-3 text-sky-500" />
                  </div>
                  <h3 className="font-bold text-sm tracking-tight">
                    Keyword Analysis
                  </h3>
                </div>

                <div className="space-y-4">
                  {result.keywordMatches.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3" /> Found
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.keywordMatches.map((kw) => (
                          <Badge
                            key={kw}
                            variant="secondary"
                            className="text-[10px] bg-emerald-500/5 text-emerald-600 border-emerald-500/10 hover:bg-emerald-500/10 transition-colors"
                          >
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.missingKeywords.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 flex items-center gap-1.5">
                        <XCircle className="h-3 w-3" /> Missing
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.missingKeywords.map((kw) => (
                          <Badge
                            key={kw}
                            variant="secondary"
                            className="text-[10px] bg-rose-500/5 text-rose-600 border-rose-500/10 hover:bg-rose-500/10 transition-colors"
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
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h3 className="font-bold text-sm">Strategic Improvements</h3>
              </div>
              <div className="space-y-3">
                {result.suggestions.map((s, i) => {
                  const isApplied = appliedFixes.has(i);
                  return (
                    <div
                      key={`suggestion-${i}`}
                      className={`group p-4 rounded-2xl border transition-all duration-300 ${
                        isApplied
                          ? "bg-emerald-500/5 border-emerald-500/20 opacity-80"
                          : "bg-muted/30 border-border/50 hover:border-primary/30 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-[9px] uppercase font-bold tracking-widest h-5 ${isApplied ? "border-emerald-500/20 text-emerald-600" : ""}`}
                            >
                              {s.section}
                            </Badge>
                            {isApplied && (
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                                <CheckCircle2 className="h-3 w-3" /> Applied
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold leading-snug">
                            {s.issue}
                          </p>
                          <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                            <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
                              <Zap className="h-3 w-3 text-primary" /> Proposed
                              Fix:
                            </p>
                            <p className="text-sm italic text-foreground/90 font-medium">
                              "{s.fix}"
                            </p>
                          </div>
                        </div>

                        {s.action && !isApplied && (
                          <Button
                            size="sm"
                            className="h-9 w-9 p-0 shrink-0 rounded-full shadow-sm"
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
