import {
  Briefcase,
  Check,
  ChevronDown,
  IndianRupee,
  Info,
  Lock,
  Plus,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { JobTitleAutocomplete } from "@/components/JobTitleAutocomplete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { ResumeData } from "@/types/resume";
import type { ReviewState } from "./types";

interface ProfileReviewProps {
  resume: ResumeData;
  reviewState: ReviewState;
  setReviewState: Dispatch<SetStateAction<ReviewState>>;
  runAnalysis: (resume: ResumeData) => void;
}

export function ProfileReview({
  resume,
  reviewState,
  setReviewState,
  runAnalysis,
}: ProfileReviewProps) {
  const {
    reviewSkills,
    newSkill,
    selectedTitles,
    reviewTitles,
    newTitleValue,
    editingTitleIndex,
    editingTitleValue,
    experienceYears,
    currentSalary,
  } = reviewState;

  const [salaryExpanded, setSalaryExpanded] = useState(
    currentSalary != null && currentSalary > 0,
  );
  const [salaryInput, setSalaryInput] = useState(
    currentSalary ? String(currentSalary) : "",
  );

  const handleSubmit = () => {
    const parsed = parseInt(salaryInput.replace(/[^0-9]/g, ""), 10) || null;
    // Persist salary fire-and-forget so it's available on Career Insights
    if (parsed && parsed !== currentSalary) {
      fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentSalary: parsed }),
      }).catch(() => {});
    }
    setReviewState((prev) => ({ ...prev, currentSalary: parsed }));
    runAnalysis(resume);
  };

  const addSkill = () => {
    if (newSkill.trim() && !reviewSkills.includes(newSkill.trim())) {
      setReviewState((prev) => ({
        ...prev,
        reviewSkills: [...prev.reviewSkills, prev.newSkill.trim()],
        newSkill: "",
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setReviewState((prev) => ({
      ...prev,
      reviewSkills: prev.reviewSkills.filter((s) => s !== skill),
    }));
  };

  const toggleTitle = (title: string) => {
    setReviewState((prev) => {
      if (prev.selectedTitles.includes(title)) {
        return {
          ...prev,
          selectedTitles: prev.selectedTitles.filter((t) => t !== title),
        };
      } else if (prev.selectedTitles.length < 3) {
        return {
          ...prev,
          selectedTitles: [...prev.selectedTitles, title],
        };
      }
      return prev;
    });
  };

  const removeTitle = (title: string) => {
    setReviewState((prev) => ({
      ...prev,
      reviewTitles: prev.reviewTitles.filter((t) => t !== title),
      selectedTitles: prev.selectedTitles.filter((t) => t !== title),
    }));
  };

  const startEditingTitle = (index: number, text: string) => {
    setReviewState((prev) => ({
      ...prev,
      editingTitleIndex: index,
      editingTitleValue: text,
    }));
  };

  const saveEditedTitle = (index: number) => {
    setReviewState((prev) => {
      const newVal = prev.editingTitleValue.trim();
      if (!newVal) {
        return { ...prev, editingTitleIndex: null };
      }
      const oldVal = prev.reviewTitles[index];
      const newReviewTitles = [...prev.reviewTitles];
      newReviewTitles[index] = newVal;

      let newSelectedTitles = prev.selectedTitles;
      if (prev.selectedTitles.includes(oldVal)) {
        newSelectedTitles = prev.selectedTitles.map((t) =>
          t === oldVal ? newVal : t,
        );
      }

      return {
        ...prev,
        reviewTitles: newReviewTitles,
        selectedTitles: newSelectedTitles,
        editingTitleIndex: null,
      };
    });
  };

  return (
    <div className="fade-in slide-in-from-bottom-4 mx-auto max-w-3xl animate-in duration-700">
      <div className="mb-10 text-center">
        <h2 className="mb-3 font-black text-4xl text-foreground tracking-tight">
          Finalize Your Profile
        </h2>
        <p className="font-semibold text-lg text-muted-foreground">
          We've parsed your resume. Review and customize the data before we
          search for jobs.
        </p>
      </div>

      <div className="space-y-8">
        {/* Quality Note */}
        <Card className="overflow-hidden border-accent/30 bg-accent/5 dark:border-accent/20 dark:bg-accent/10">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 dark:bg-accent/20">
                <Info className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h4 className="mb-1 font-bold text-foreground">
                  Search Quality Tip
                </h4>
                <p className="font-medium text-muted-foreground text-sm leading-relaxed">
                  For the best results, avoid selecting very diverse job roles
                  (e.g., "Web Developer" AND "Data Analyst"). The analysis
                  quality is highest when you focus on a specific career path.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experience Section */}
        <Card className="overflow-hidden border-border shadow-sm">
          <CardHeader className="border-border/50 border-b bg-muted/30 pb-4">
            <CardTitle className="flex items-center gap-2 font-black text-xl">
              <TrendingUp className="h-5 w-5" />
              Years of Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pt-8 pb-10">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-bold text-muted-foreground text-sm uppercase tracking-widest">
                Experience Level
              </span>
              <span className="font-black text-3xl text-foreground">
                {experienceYears} Years
              </span>
            </div>
            <Slider
              value={[experienceYears]}
              min={0}
              max={20}
              step={1}
              onValueChange={(val) =>
                setReviewState((prev) => ({
                  ...prev,
                  experienceYears: Array.isArray(val)
                    ? (val[0] ?? prev.experienceYears)
                    : val,
                }))
              }
              className="py-4"
            />
            <p className="mt-4 text-center font-semibold text-muted-foreground text-xs italic">
              Slide to adjust your total professional experience for better job
              matching.
            </p>
          </CardContent>
        </Card>

        {/* Job Titles Section */}
        <Card className="overflow-hidden border-border shadow-sm">
          <CardHeader className="border-border/50 border-b bg-muted/30 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-black text-xl">
                <Briefcase className="h-5 w-5" />
                Target Job Titles
              </CardTitle>
              <Badge
                variant={selectedTitles.length === 3 ? "default" : "secondary"}
                className="font-black"
              >
                {selectedTitles.length}/3 Selected
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {reviewTitles.map((title, idx) => {
                const isSelected = selectedTitles.includes(title);
                const isEditing = editingTitleIndex === idx;

                if (isEditing) {
                  const reactKey = `edit-${idx}`;
                  return (
                    <div key={reactKey} className="flex items-center gap-2">
                      <Input
                        value={editingTitleValue}
                        onChange={(e) =>
                          setReviewState((prev) => ({
                            ...prev,
                            editingTitleValue: e.target.value,
                          }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && saveEditedTitle(idx)
                        }
                        autoFocus
                        className="h-12 font-bold"
                      />
                      <Button
                        type="button"
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
                  <div key={title} className="group/item relative">
                    <button
                      type="button"
                      onClick={() => toggleTitle(title)}
                      className={`group flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:border-muted-foreground/30"
                      }
                      `}
                    >
                      <span className="truncate pr-10 font-bold tracking-tight">
                        {title}
                      </span>
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-primary-foreground bg-primary-foreground"
                            : "border-border bg-muted group-hover:border-muted-foreground/30"
                        }
                        `}
                      >
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 stroke-[3px] text-primary" />
                        )}
                      </div>
                    </button>
                    {/* Floating Actions */}
                    <div className="-translate-y-1/2 absolute top-1/2 right-12 flex gap-1 opacity-0 transition-opacity group-hover/item:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingTitle(idx, title);
                        }}
                        className={`rounded-md p-1.5 transition-colors hover:bg-muted ${
                          isSelected
                            ? "text-background hover:bg-background/20"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Edit"
                      >
                        <TrendingUp className="h-3.5 w-3.5 rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTitle(title);
                        }}
                        className={`rounded-md p-1.5 transition-colors hover:bg-destructive hover:text-white ${
                          isSelected
                            ? "text-background"
                            : "text-muted-foreground"
                        }`}
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <JobTitleAutocomplete
              value={newTitleValue}
              onChange={(val) =>
                setReviewState((prev) => ({ ...prev, newTitleValue: val }))
              }
              onAdd={(title) => {
                const val = title.trim();
                setReviewState((prev) => {
                  if (val && !prev.reviewTitles.includes(val)) {
                    return {
                      ...prev,
                      reviewTitles: [...prev.reviewTitles, val],
                      selectedTitles:
                        prev.selectedTitles.length < 3
                          ? [...prev.selectedTitles, val]
                          : prev.selectedTitles,
                      newTitleValue: "",
                    };
                  }
                  return prev;
                });
              }}
              placeholder="Add custom job title (e.g. Lead Dev)..."
            />
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card className="overflow-hidden border-border shadow-sm">
          <CardHeader className="border-border/50 border-b bg-muted/30 pb-4">
            <CardTitle className="flex items-center gap-2 font-black text-xl">
              <Zap className="h-5 w-5" />
              Key Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="mb-8 flex flex-wrap gap-2">
              {reviewSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="flex items-center gap-1 py-1.5 pr-1 pl-3 font-bold text-sm transition-colors hover:bg-muted-foreground/10"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="flex h-5 w-5 items-center justify-center rounded-md transition-colors hover:bg-foreground hover:text-background"
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
                onChange={(e) =>
                  setReviewState((prev) => ({
                    ...prev,
                    newSkill: e.target.value,
                  }))
                }
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                className="h-12 border-border bg-muted/50 font-bold"
              />
              <Button
                type="button"
                onClick={addSkill}
                variant="default"
                className="h-12 w-12 shrink-0 p-0"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Salary — Optional */}
        <Card className="overflow-hidden border-border shadow-sm">
          <button
            type="button"
            onClick={() => setSalaryExpanded((v) => !v)}
            className="flex w-full items-center justify-between border-border/50 border-b bg-muted/30 px-6 py-4 text-left transition-colors hover:bg-muted/50"
          >
            <CardTitle className="flex items-center gap-2 font-black text-xl">
              <IndianRupee className="h-5 w-5" />
              Current Annual Salary
              <Badge
                variant="outline"
                className="ml-1 border-muted-foreground/30 font-bold text-[10px] text-muted-foreground uppercase tracking-wider"
              >
                Optional
              </Badge>
            </CardTitle>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${salaryExpanded ? "rotate-180" : ""}`}
            />
          </button>

          {salaryExpanded && (
            <CardContent className="space-y-4 p-6">
              <div className="relative">
                <IndianRupee className="-translate-y-1/2 absolute top-1/2 left-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 1200000"
                  value={salaryInput}
                  onChange={(e) =>
                    setSalaryInput(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  className="h-12 pl-9 font-bold text-base"
                  autoFocus
                />
              </div>
              <p className="flex items-start gap-2 font-medium text-muted-foreground text-xs leading-relaxed">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Stays on your account only. Used to compute your market salary
                gap on Career Insights — never shared with employers or job
                listings.
              </p>
            </CardContent>
          )}
        </Card>

        <div className="pt-4">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={selectedTitles.length === 0}
            className="group h-16 w-full font-black text-xl tracking-tight shadow-xl"
          >
            <Zap className="mr-3 h-6 w-6 fill-current transition-transform group-hover:scale-110" />
            Start Job Search Analysis
          </Button>
        </div>
      </div>
    </div>
  );
}
