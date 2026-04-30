"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Search,
  Shield,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import type { RootState } from "@/store/store";

interface AtsSuggestion {
  section: string;
  issue: string;
  fix: string;
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
  const resumeId = useSelector((s: RootState) => s.resume.resumeId);
  const resumeData = useSelector((s: RootState) => s.resume.data);

  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AtsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 60) return "Needs Work";
    return "Poor";
  };

  return (
    <div className="space-y-6">
      {/* Job Description Input */}
      <div className="space-y-2">
        <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
          Job Description (optional)
        </Label>
        <Textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste a job description to check keyword matches and compatibility..."
          className="min-h-[120px] resize-y text-sm"
          rows={5}
        />
        <p className="text-xs text-muted-foreground">
          Leave empty for general ATS best-practice scoring
        </p>
      </div>

      <Button
        onClick={analyze}
        disabled={isAnalyzing || !resumeId}
        className="w-full gap-2"
      >
        {isAnalyzing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        {isAnalyzing ? "Analyzing..." : "Analyze ATS Score"}
      </Button>

      {error && (
        <div className="text-sm text-red-500 text-center py-2">{error}</div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-5 animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
          {/* Overall Score */}
          <Card className="border-border overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-bold text-sm">ATS Score</span>
                </div>
                <span
                  className={`text-3xl font-black ${getScoreColor(result.score)}`}
                >
                  {result.score}
                </span>
              </div>
              <Progress value={result.score} className="h-3 mb-2" />
              <p
                className={`text-sm font-medium ${getScoreColor(result.score)}`}
              >
                {getScoreLabel(result.score)}
              </p>
            </CardContent>
          </Card>

          {/* Section Scores */}
          {Object.keys(result.sectionScores).length > 0 && (
            <Card className="border-border">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold text-sm">Section Scores</h3>
                {Object.entries(result.sectionScores).map(
                  ([section, score]) => (
                    <div key={section} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize text-muted-foreground">
                          {section}
                        </span>
                        <span className={`font-bold ${getScoreColor(score)}`}>
                          {score}
                        </span>
                      </div>
                      <Progress value={score} className="h-1.5" />
                    </div>
                  ),
                )}
              </CardContent>
            </Card>
          )}

          {/* Keyword Matches */}
          {result.keywordMatches.length > 0 && (
            <Card className="border-border">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <h3 className="font-bold text-sm">Keywords Found</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.keywordMatches.map((kw) => (
                    <Badge
                      key={kw}
                      variant="secondary"
                      className="text-xs font-medium bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    >
                      {kw}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Missing Keywords */}
          {result.missingKeywords.length > 0 && (
            <Card className="border-border">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <h3 className="font-bold text-sm">Missing Keywords</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((kw) => (
                    <Badge
                      key={kw}
                      variant="secondary"
                      className="text-xs font-medium bg-red-500/10 text-red-600 border-red-500/20"
                    >
                      {kw}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <Card className="border-border">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h3 className="font-bold text-sm">Suggestions</h3>
                </div>
                <div className="space-y-3">
                  {result.suggestions.map((s, i) => (
                    <div
                      key={`suggestion-${s.section}-${i}`}
                      className="p-3 rounded-lg bg-muted/50 space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase font-bold"
                        >
                          {s.section}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{s.issue}</p>
                      <p className="text-sm font-medium">→ {s.fix}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
