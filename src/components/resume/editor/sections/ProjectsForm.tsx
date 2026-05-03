"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Loader2, Plus, Sparkles, Trash2, X } from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SortableItem from "@/components/resume/editor/SortableItem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ResumeProjectItem } from "@/types/resume";

export default function ProjectsForm() {
  const dispatch = useDispatch<AppDispatch>();
  const projects = useSelector((s: RootState) => s.resume.data.projects || []);
  const resumeId = useSelector((s: RootState) => s.resume.resumeId);
  const [newKeywords, setNewKeywords] = useState<Record<string, string>>({});
  const [enhancingKey, setEnhancingKey] = useState<string | null>(null);

  const addItem = () => {
    const item: ResumeProjectItem = {
      id: nanoid(),
      name: "",
      description: "",
      highlights: [],
      url: "",
      githubUrl: "",
      startDate: "",
      endDate: null,
      keywords: [],
    };
    dispatch(resumeActions.addProjectItem(item));
  };

  const update = (id: string, field: string, value: unknown) => {
    dispatch(resumeActions.updateProjectItem({ id, data: { [field]: value } }));
  };

  const addHighlight = (itemId: string) => {
    const item = projects.find((p) => p.id === itemId);
    if (item) {
      update(itemId, "highlights", [...item.highlights, ""]);
    }
  };

  const updateHighlight = (itemId: string, index: number, value: string) => {
    const item = projects.find((p) => p.id === itemId);
    if (item) {
      const h = [...item.highlights];
      h[index] = value;
      update(itemId, "highlights", h);
    }
  };

  const removeHighlight = (itemId: string, index: number) => {
    const item = projects.find((p) => p.id === itemId);
    if (item) {
      update(
        itemId,
        "highlights",
        item.highlights.filter((_, i) => i !== index),
      );
    }
  };

  const addKeyword = (projectId: string) => {
    const kw = (newKeywords[projectId] ?? "").trim();
    if (!kw) return;
    const proj = projects.find((p) => p.id === projectId);
    if (proj && !proj.keywords.includes(kw)) {
      update(projectId, "keywords", [...proj.keywords, kw]);
      setNewKeywords((prev) => ({ ...prev, [projectId]: "" }));
    }
  };

  const removeKeyword = (projectId: string, keyword: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (proj) {
      update(
        projectId,
        "keywords",
        proj.keywords.filter((k) => k !== keyword),
      );
    }
  };

  const enhanceHighlight = async (
    itemId: string,
    index: number,
    bullet: string,
    projectName: string,
  ) => {
    if (!resumeId || !bullet.trim()) return;
    const key = `${itemId}-${index}`;
    setEnhancingKey(key);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/ai/enhance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bullet,
          context: { position: projectName, company: "Personal Project" },
        }),
      });
      if (res.ok) {
        const { enhanced } = await res.json();
        updateHighlight(itemId, index, enhanced);
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setEnhancingKey(null);
    }
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const from = projects.findIndex((p) => p.id === active.id);
        const to = projects.findIndex((p) => p.id === over.id);
        if (from !== -1 && to !== -1) {
          dispatch(resumeActions.reorderProjectItems({ from, to }));
        }
      }
    },
    [projects, dispatch],
  );

  return (
    <div className="space-y-5">
      {projects.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-medium mb-4">
            No projects added yet
          </p>
          <Button variant="outline" onClick={addItem} className="gap-2">
            <Plus className="h-4 w-4" /> Add Project
          </Button>
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={projects.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {projects.map((item, idx) => (
            <SortableItem key={item.id} id={item.id}>
              <Card className="border-border">
                <CardContent className="p-5 pl-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-sm">
                      Project {idx + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        dispatch(resumeActions.removeProjectItem(item.id))
                      }
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Name + URLs */}
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Project Name *
                    </Label>
                    <Input
                      value={item.name}
                      onChange={(e) => update(item.id, "name", e.target.value)}
                      placeholder="AI Resume Builder"
                      className="h-11"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Live URL
                      </Label>
                      <Input
                        value={item.url}
                        onChange={(e) => update(item.id, "url", e.target.value)}
                        placeholder="https://project.com"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        GitHub URL
                      </Label>
                      <Input
                        value={item.githubUrl}
                        onChange={(e) =>
                          update(item.id, "githubUrl", e.target.value)
                        }
                        placeholder="https://github.com/user/repo"
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Start Date
                      </Label>
                      <Input
                        value={item.startDate}
                        onChange={(e) =>
                          update(item.id, "startDate", e.target.value)
                        }
                        placeholder="2024-01"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        End Date
                      </Label>
                      <Input
                        value={item.endDate ?? ""}
                        onChange={(e) =>
                          update(item.id, "endDate", e.target.value || null)
                        }
                        placeholder="Ongoing"
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Description
                    </Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) =>
                        update(item.id, "description", e.target.value)
                      }
                      placeholder="Brief overview of the project and your role..."
                      className="min-h-[60px] resize-y text-sm"
                      rows={2}
                    />
                  </div>

                  {/* Tech Stack Keywords */}
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Tech Stack
                    </Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {item.keywords.map((kw) => (
                        <Badge
                          key={kw}
                          variant="secondary"
                          className="gap-1 pr-1 font-medium"
                        >
                          {kw}
                          <button
                            type="button"
                            onClick={() => removeKeyword(item.id, kw)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newKeywords[item.id] ?? ""}
                        onChange={(e) =>
                          setNewKeywords((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addKeyword(item.id);
                          }
                        }}
                        placeholder="React, TypeScript..."
                        className="h-9 text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addKeyword(item.id)}
                        className="h-9 px-3"
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Key Highlights
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addHighlight(item.id)}
                        className="h-7 text-xs gap-1"
                      >
                        <Plus className="h-3 w-3" /> Add
                      </Button>
                    </div>
                    {item.highlights.map((highlight, hIdx) => {
                      const isEnhancing = enhancingKey === `${item.id}-${hIdx}`;
                      return (
                        <div
                          key={`${item.id}-h-${hIdx}`}
                          className="flex items-start gap-2"
                        >
                          <span className="text-muted-foreground text-xs w-4 shrink-0 mt-2.5">
                            •
                          </span>
                          <Textarea
                            value={highlight}
                            onChange={(e) =>
                              updateHighlight(item.id, hIdx, e.target.value)
                            }
                            placeholder="Describe a key feature or achievement..."
                            className="min-h-[40px] resize-y text-sm"
                            rows={1}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              enhanceHighlight(
                                item.id,
                                hIdx,
                                highlight,
                                item.name,
                              )
                            }
                            disabled={isEnhancing || !highlight.trim()}
                            className="h-8 w-8 p-0 shrink-0 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                            title="Enhance with AI"
                          >
                            {isEnhancing ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHighlight(item.id, hIdx)}
                            className="h-8 w-8 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>

      {projects.length > 0 && (
        <Button
          variant="outline"
          onClick={addItem}
          className="w-full gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" /> Add Another Project
        </Button>
      )}
    </div>
  );
}
