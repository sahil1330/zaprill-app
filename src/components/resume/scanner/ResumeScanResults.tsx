"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Search,
  Shield,
  TrendingUp,
  Wand2,
  Wrench,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AtsSuggestion {
  section: string;
  issue: string;
  fix: string;
  action?: {
    type: string;
    id?: string;
    content?: string;
    keywords?: string[];
    highlights?: string[];
    data?: Record<string, unknown>;
  };
}

interface AtsResult {
  score: number;
  keywordMatches: string[];
  missingKeywords: string[];
  suggestions: AtsSuggestion[];
  sectionScores: Record<string, number>;
}

type Category = "compatibility" | "warnings" | "suggestions" | "optimizations";

interface CategorizedSuggestion {
  suggestion: AtsSuggestion;
  category: Category;
}

const CATEGORY_CONFIG: Record<
  Category,
  {
    title: string;
    subtitle: string;
    icon: typeof Shield;
    color: string;
    bgClass: string;
    borderClass: string;
  }
> = {
  compatibility: {
    title: "ATS Compatibility",
    subtitle: "Keyword matching & parsing readiness",
    icon: Shield,
    color: "text-emerald-500",
    bgClass: "bg-emerald-500/5",
    borderClass: "border-emerald-500/10",
  },
  warnings: {
    title: "Warnings",
    subtitle: "Impact & action verb improvements",
    icon: AlertTriangle,
    color: "text-amber-500",
    bgClass: "bg-amber-500/5",
    borderClass: "border-amber-500/10",
  },
  suggestions: {
    title: "Suggestions",
    subtitle: "Formatting & readability enhancements",
    icon: Lightbulb,
    color: "text-sky-500",
    bgClass: "bg-sky-500/5",
    borderClass: "border-sky-500/10",
  },
  optimizations: {
    title: "Optimizations",
    subtitle: "Content strategy & positioning",
    icon: TrendingUp,
    color: "text-primary",
    bgClass: "bg-primary/5",
    borderClass: "border-primary/10",
  },
};

function categorizeSuggestion(s: AtsSuggestion): Category {
  const section = s.section.toLowerCase();
  const issue = s.issue.toLowerCase();

  if (
    section === "skills" ||
    issue.includes("keyword") ||
    issue.includes("missing") ||
    issue.includes("skill")
  ) {
    return "compatibility";
  }

  if (
    issue.includes("action verb") ||
    issue.includes("impact") ||
    issue.includes("metric") ||
    issue.includes("quantif") ||
    issue.includes("achievement") ||
    issue.includes("result")
  ) {
    return "warnings";
  }

  if (
    section === "formatting" ||
    issue.includes("format") ||
    issue.includes("readability") ||
    issue.includes("date") ||
    issue.includes("gpa") ||
    issue.includes("score") ||
    issue.includes("bullet") ||
    issue.includes("layout") ||
    issue.includes("spacing")
  ) {
    return "suggestions";
  }

  if (
    section === "summary" ||
    issue.includes("content") ||
    issue.includes("strateg") ||
    issue.includes("positioning") ||
    issue.includes("description") ||
    issue.includes("professional")
  ) {
    return "optimizations";
  }

  if (section === "experience" || section === "work") {
    return "warnings";
  }

  return "optimizations";
}

function getScoreColor(score: number) {
  if (score >= 90) return "text-emerald-500";
  if (score >= 75) return "text-sky-500";
  if (score >= 60) return "text-amber-500";
  return "text-rose-500";
}

function getScoreLabel(score: number) {
  if (score >= 90) return "Elite / ATS Ready";
  if (score >= 80) return "Strong Profile";
  if (score >= 60) return "Needs Optimization";
  return "Critical Issues Found";
}

function getScoreBg(score: number) {
  if (score >= 90) return "bg-emerald-500/10";
  if (score >= 75) return "bg-sky-500/10";
  if (score >= 60) return "bg-amber-500/10";
  return "bg-rose-500/10";
}

interface ResumeScanResultsProps {
  result: AtsResult;
  resumeId: string;
  resumeData: unknown;
}

export default function ResumeScanResults({
  result,
  resumeId,
  resumeData,
}: ResumeScanResultsProps) {
  const router = useRouter();

  const categorized = result.suggestions.reduce<CategorizedSuggestion[]>(
    (acc, s) => {
      acc.push({ suggestion: s, category: categorizeSuggestion(s) });
      return acc;
    },
    [],
  );

  const grouped = categorized.reduce<Record<Category, CategorizedSuggestion[]>>(
    (acc, item) => {
      acc[item.category].push(item);
      return acc;
    },
    {
      compatibility: [],
      warnings: [],
      suggestions: [],
      optimizations: [],
    },
  );

  const handleJobSearch = () => {
    sessionStorage.setItem("ai_job_god_resume", JSON.stringify(resumeData));
    router.push("/analyze");
  };

  const handleFixResume = () => {
    router.push(`/resumes/${resumeId}`);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
      {/* Hero Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden rounded-2xl border-border/50 bg-linear-to-br from-background to-muted/30 shadow-sm">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-8 md:flex-row">
              {/* Score Ring */}
              <div className="relative flex shrink-0 items-center justify-center">
                <svg
                  className="-rotate-90 h-28 w-28"
                  viewBox="0 0 112 112"
                  role="img"
                >
                  <title>{`ATS Score: ${result.score} out of 100`}</title>
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-muted/10"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={
                      2 * Math.PI * 50 * (1 - result.score / 100)
                    }
                    className={`${getScoreColor(result.score)} transition-all duration-1000 ease-out`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className={`font-black text-3xl ${getScoreColor(result.score)}`}
                  >
                    {result.score}
                  </span>
                  <span className="mt-0.5 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
                    ATS Score
                  </span>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="mb-2 flex items-center justify-center gap-2 md:justify-start">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-bold text-muted-foreground text-xs uppercase tracking-widest">
                    Scan Complete
                  </span>
                </div>
                <h2 className="mb-2 font-black text-2xl tracking-tight">
                  {getScoreLabel(result.score)}
                </h2>
                <p className="font-medium text-muted-foreground text-sm">
                  Your resume scored {result.score}/100 on ATS compatibility.
                  {result.score < 80
                    ? " Review the suggestions below to improve."
                    : " Great work — minor optimizations below."}
                </p>

                {/* Section mini-scores */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(result.sectionScores).map(([s, score]) => (
                    <Badge
                      key={s}
                      variant="secondary"
                      className={`font-bold text-[10px] ${getScoreBg(score)}`}
                    >
                      {s} {score}%
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Keywords Section */}
      {(result.keywordMatches.length > 0 ||
        result.missingKeywords.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="rounded-2xl border-border/50">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-sky-500" />
                <div>
                  <h3 className="font-bold text-base">Keyword Analysis</h3>
                  <p className="font-medium text-muted-foreground text-xs">
                    Keywords detected and missing from your resume
                  </p>
                </div>
              </div>

              {result.keywordMatches.length > 0 && (
                <div className="space-y-2">
                  <p className="flex items-center gap-1.5 font-bold text-[10px] text-emerald-500 uppercase tracking-widest">
                    <CheckCircle2 className="h-3 w-3" /> Matched Keywords
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywordMatches.map((kw) => (
                      <Badge
                        key={kw}
                        variant="secondary"
                        className="border-emerald-500/10 bg-emerald-500/5 text-[10px] text-emerald-600"
                      >
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {result.missingKeywords.length > 0 && (
                <div className="space-y-2">
                  <p className="flex items-center gap-1.5 font-bold text-[10px] text-rose-500 uppercase tracking-widest">
                    <XCircle className="h-3 w-3" /> Missing Keywords
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.map((kw) => (
                      <Badge
                        key={kw}
                        variant="secondary"
                        className="border-rose-500/10 bg-rose-500/5 text-[10px] text-rose-600"
                      >
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Categorized Suggestions */}
      {(Object.keys(CATEGORY_CONFIG) as Category[]).map((category, catIdx) => {
        const items = grouped[category];
        const config = CATEGORY_CONFIG[category];
        const Icon = config.icon;

        if (items.length === 0) return null;

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 + catIdx * 0.1 }}
          >
            <Card
              className={`rounded-2xl border ${config.borderClass} ${config.bgClass}`}
            >
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-lg ${config.bgClass} border ${config.borderClass} flex items-center justify-center`}
                  >
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{config.title}</h3>
                    <p className="font-medium text-muted-foreground text-xs">
                      {config.subtitle} &mdash; {items.length}{" "}
                      {items.length === 1 ? "issue" : "issues"} found
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={`${category}-${item.suggestion.section}-${item.suggestion.issue.slice(0, 30)}`}
                      className="rounded-xl border border-border/30 bg-background/60 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-2">
                          <Badge
                            variant="outline"
                            className="h-5 font-bold text-[9px] uppercase tracking-widest"
                          >
                            {item.suggestion.section}
                          </Badge>
                          <p className="font-semibold text-sm">
                            {item.suggestion.issue}
                          </p>
                          <div className="rounded-lg border border-border/20 bg-muted/30 p-3">
                            <p className="mb-1 flex items-center gap-1 font-medium text-muted-foreground text-xs">
                              <Wand2 className="h-3 w-3 text-primary" /> Fix:
                            </p>
                            <p className="font-medium text-sm italic">
                              &ldquo;{item.suggestion.fix}&rdquo;
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="space-y-4"
      >
        <Card className="rounded-2xl border-border/50 bg-linear-to-r from-background to-muted/20">
          <CardContent className="p-6">
            <h3 className="mb-1 font-bold text-base">What&apos;s next?</h3>
            <p className="mb-6 font-medium text-muted-foreground text-sm">
              Choose how you&apos;d like to proceed with your freshly scanned
              resume.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={handleJobSearch}
                className="h-14 flex-1 gap-2 rounded-xl font-bold text-base shadow-lg shadow-primary/10 transition-all hover:shadow-primary/20"
              >
                <Search className="h-5 w-5" />
                Continue to Job Search
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleFixResume}
                variant="outline"
                className="h-14 flex-1 gap-2 rounded-xl border-2 font-bold text-base transition-all hover:border-primary/30 hover:bg-primary/5"
              >
                <Wrench className="h-5 w-5" />
                Fix in Resume Architect
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <p className="mt-4 text-center font-medium text-muted-foreground text-xs">
              Your resume has been saved. You can also access it anytime from
              your{" "}
              <button
                type="button"
                onClick={() => router.push("/resumes")}
                className="font-bold underline transition-colors hover:text-foreground"
              >
                Resume Dashboard
              </button>
              .
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
