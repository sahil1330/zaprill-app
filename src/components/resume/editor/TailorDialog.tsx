"use client";

import { ArrowRight, CheckCircle2, Loader2, Search, Wand2 } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { TailoredPayload } from "@/store/resumeSlice";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";

export default function TailorDialog() {
  const dispatch = useDispatch<AppDispatch>();
  const resumeId = useSelector((s: RootState) => s.resume.resumeId);
  const data = useSelector((s: RootState) => s.resume.data);

  const [open, setOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [tailoredData, setTailoredData] = useState<TailoredPayload | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectSummary, setSelectSummary] = useState(true);
  const [selectedWork, setSelectedWork] = useState<Record<string, boolean>>({});
  const [selectedProjects, setSelectedProjects] = useState<
    Record<string, boolean>
  >({});
  const [selectedSkills, setSelectedSkills] = useState<Record<string, boolean>>(
    {},
  );

  const handleGenerate = async () => {
    if (!resumeId || !jobDescription.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch(`/api/resumes/${resumeId}/ai/tailor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          data,
        }),
      });

      if (res.ok) {
        const result: TailoredPayload = await res.json();
        setTailoredData(result);

        // Pre-select all
        if (result.work) {
          const wMap: Record<string, boolean> = {};
          result.work.forEach((w) => (wMap[w.id] = true));
          setSelectedWork(wMap);
        }
        if (result.projects) {
          const pMap: Record<string, boolean> = {};
          result.projects.forEach((p) => (pMap[p.id] = true));
          setSelectedProjects(pMap);
        }
        if (result.skills) {
          const sMap: Record<string, boolean> = {};
          result.skills.forEach((s) => (sMap[s.id] = true));
          setSelectedSkills(sMap);
        }
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Generation failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = async () => {
    if (!tailoredData) return;

    const payload: TailoredPayload = {};

    if (selectSummary && tailoredData.summary) {
      payload.summary = tailoredData.summary;
    }

    if (tailoredData.work) {
      payload.work = tailoredData.work.filter((w) => selectedWork[w.id]);
    }

    if (tailoredData.projects) {
      payload.projects = tailoredData.projects.filter(
        (p) => selectedProjects[p.id],
      );
    }

    if (tailoredData.skills) {
      payload.skills = tailoredData.skills.filter((s) => selectedSkills[s.id]);
    }

    dispatch(resumeActions.applyTailoredData(payload));

    // Reset and close
    setOpen(false);
    setTimeout(() => {
      setTailoredData(null);
      setJobDescription("");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2 shrink-0">
            <Wand2 className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Tailor to Job</span>
          </Button>
        }
      />
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Wand2 className="h-5 w-5 text-primary" />
            AI Job Tailoring
          </DialogTitle>
          <DialogDescription>
            {tailoredData
              ? "Review the AI proposals below. Select the changes you want to apply to your resume."
              : "Paste a job description. The AI will rewrite your summary and highlights to match."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {!tailoredData ? (
            <div className="px-6 pb-6 pt-2 flex-1 flex flex-col min-h-0 space-y-4">
              <div className="space-y-2 flex-1 flex flex-col min-h-0">
                <Label>Job Description</Label>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target job description here..."
                  className="flex-1 min-h-[200px] field-sizing-fixed overflow-y-auto resize-none text-sm [&::-webkit-scrollbar-track]:my-3"
                />
              </div>

              {error && <div className="text-sm text-red-500">{error}</div>}

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || jobDescription.trim().length < 10}
                className="w-full gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {isGenerating
                  ? "Analyzing & Rewriting..."
                  : "Generate Proposals"}
              </Button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-8">
                {/* Summary */}
                {tailoredData.summary && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-bold flex items-center gap-2">
                        Professional Summary
                      </Label>
                      <Switch
                        checked={selectSummary}
                        onCheckedChange={setSelectSummary}
                      />
                    </div>
                    <div
                      className={`p-4 rounded-lg border text-sm transition-colors ${
                        selectSummary
                          ? "bg-primary/5 border-primary/20"
                          : "bg-muted/50 border-border opacity-50"
                      }`}
                    >
                      {tailoredData.summary}
                    </div>
                  </div>
                )}

                {/* Work */}
                {tailoredData.work && tailoredData.work.length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-base font-bold flex items-center gap-2">
                      Work Experience
                    </Label>
                    {tailoredData.work.map((w) => {
                      const origWork = data.work.find((x) => x.id === w.id);
                      if (!origWork) return null;
                      const isSelected = selectedWork[w.id];

                      return (
                        <div
                          key={w.id}
                          className="space-y-3 border rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold">
                                {origWork.position}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {origWork.company}
                              </div>
                            </div>
                            <Switch
                              checked={isSelected}
                              onCheckedChange={(c) =>
                                setSelectedWork((prev) => ({
                                  ...prev,
                                  [w.id]: c,
                                }))
                              }
                            />
                          </div>
                          <div
                            className={`space-y-2 transition-colors ${
                              isSelected ? "" : "opacity-50"
                            }`}
                          >
                            {w.highlights.map((h, i) => (
                              <div key={i} className="flex gap-2 text-sm">
                                <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                                <span>{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Projects */}
                {tailoredData.projects && tailoredData.projects.length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-base font-bold flex items-center gap-2">
                      Projects
                    </Label>
                    {tailoredData.projects.map((p) => {
                      const origProj = data.projects.find((x) => x.id === p.id);
                      if (!origProj) return null;
                      const isSelected = selectedProjects[p.id];

                      return (
                        <div
                          key={p.id}
                          className="space-y-3 border rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="font-semibold">{origProj.name}</div>
                            <Switch
                              checked={isSelected}
                              onCheckedChange={(c) =>
                                setSelectedProjects((prev) => ({
                                  ...prev,
                                  [p.id]: c,
                                }))
                              }
                            />
                          </div>
                          <div
                            className={`space-y-2 transition-colors ${
                              isSelected ? "" : "opacity-50"
                            }`}
                          >
                            {p.highlights.map((h, i) => (
                              <div key={i} className="flex gap-2 text-sm">
                                <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                                <span>{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Skills */}
                {tailoredData.skills && tailoredData.skills.length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-base font-bold flex items-center gap-2">
                      Skills
                    </Label>
                    <div className="grid grid-cols-1 gap-3">
                      {tailoredData.skills.map((s) => {
                        const origSkill = data.skills.find(
                          (x) => x.id === s.id,
                        );
                        if (!origSkill) return null;
                        const isSelected = selectedSkills[s.id];

                        return (
                          <div
                            key={s.id}
                            className={`border rounded-lg p-3 flex items-center justify-between transition-colors ${
                              isSelected
                                ? "bg-primary/5 border-primary/20"
                                : "opacity-50"
                            }`}
                          >
                            <div className="flex-1 mr-4">
                              <div className="text-xs font-bold text-muted-foreground uppercase mb-1">
                                {origSkill.name}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {s.keywords.map((kw, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs font-normal"
                                  >
                                    {kw}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Switch
                              checked={isSelected}
                              onCheckedChange={(c) =>
                                setSelectedSkills((prev) => ({
                                  ...prev,
                                  [s.id]: c,
                                }))
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {tailoredData && (
          <DialogFooter className="px-6 py-4 border-t bg-muted/20">
            <Button variant="ghost" onClick={() => setTailoredData(null)}>
              Cancel
            </Button>
            <Button onClick={handleApply} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Apply Selected Changes
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
