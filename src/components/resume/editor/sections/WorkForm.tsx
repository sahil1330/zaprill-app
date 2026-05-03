"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SortableItem from "@/components/resume/editor/SortableItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ResumeWorkItem } from "@/types/resume";

/**
 * WorkForm — Work experience section with add/remove/edit items.
 * Includes AI-powered "Enhance" button for each highlight bullet.
 */
export default function WorkForm() {
  const dispatch = useDispatch<AppDispatch>();
  const work = useSelector((s: RootState) => s.resume.data.work || []);
  const resumeId = useSelector((s: RootState) => s.resume.resumeId);

  // Track which highlight is currently being enhanced: "itemId-hIdx"
  const [enhancingKey, setEnhancingKey] = useState<string | null>(null);

  const addItem = () => {
    const newItem: ResumeWorkItem = {
      id: nanoid(),
      company: "",
      position: "",
      website: "",
      startDate: "",
      endDate: null,
      summary: "",
      highlights: [],
      location: "",
    };
    dispatch(resumeActions.addWorkItem(newItem));
  };

  const updateItem = (
    id: string,
    field: string,
    value: string | string[] | null,
  ) => {
    dispatch(resumeActions.updateWorkItem({ id, data: { [field]: value } }));
  };

  const removeItem = (id: string) => {
    dispatch(resumeActions.removeWorkItem(id));
  };

  const addHighlight = (itemId: string) => {
    const item = work.find((w) => w.id === itemId);
    if (item) {
      updateItem(itemId, "highlights", [...item.highlights, ""]);
    }
  };

  const updateHighlight = (itemId: string, index: number, value: string) => {
    const item = work.find((w) => w.id === itemId);
    if (item) {
      const newHighlights = [...item.highlights];
      newHighlights[index] = value;
      updateItem(itemId, "highlights", newHighlights);
    }
  };

  const removeHighlight = (itemId: string, index: number) => {
    const item = work.find((w) => w.id === itemId);
    if (item) {
      const newHighlights = item.highlights.filter((_, i) => i !== index);
      updateItem(itemId, "highlights", newHighlights);
    }
  };

  const enhanceHighlight = async (
    itemId: string,
    index: number,
    bullet: string,
    context: { position: string; company: string },
  ) => {
    if (!resumeId || !bullet.trim()) return;
    const key = `${itemId}-${index}`;
    setEnhancingKey(key);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/ai/enhance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullet, context }),
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
        const from = work.findIndex((w) => w.id === active.id);
        const to = work.findIndex((w) => w.id === over.id);
        if (from !== -1 && to !== -1) {
          dispatch(resumeActions.reorderWorkItems({ from, to }));
        }
      }
    },
    [work, dispatch],
  );

  return (
    <div className="space-y-5">
      {work.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-medium mb-4">
            No work experience added yet
          </p>
          <Button variant="outline" onClick={addItem} className="gap-2">
            <Plus className="h-4 w-4" /> Add Experience
          </Button>
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={work.map((w) => w.id)}
          strategy={verticalListSortingStrategy}
        >
          {work.map((item, idx) => (
            <SortableItem key={item.id} id={item.id}>
              <Card className="border-border overflow-hidden">
                <CardContent className="p-5 pl-10 space-y-4">
                  {/* Header with delete */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-sm">
                      Position {idx + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Position + Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Job Title *
                      </Label>
                      <Input
                        value={item.position}
                        onChange={(e) =>
                          updateItem(item.id, "position", e.target.value)
                        }
                        placeholder="Senior Software Engineer"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Company *
                      </Label>
                      <Input
                        value={item.company}
                        onChange={(e) =>
                          updateItem(item.id, "company", e.target.value)
                        }
                        placeholder="Google"
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Location + Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Location
                      </Label>
                      <Input
                        value={item.location}
                        onChange={(e) =>
                          updateItem(item.id, "location", e.target.value)
                        }
                        placeholder="Bangalore, India"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Start Date
                      </Label>
                      <Input
                        value={item.startDate}
                        onChange={(e) =>
                          updateItem(item.id, "startDate", e.target.value)
                        }
                        placeholder="2022-01"
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
                          updateItem(item.id, "endDate", e.target.value || null)
                        }
                        placeholder="Present"
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Key Achievements
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
                        <div key={hIdx} className="flex items-start gap-2">
                          <span className="text-muted-foreground text-xs w-4 shrink-0 mt-2.5">
                            •
                          </span>
                          <Textarea
                            value={highlight}
                            onChange={(e) =>
                              updateHighlight(item.id, hIdx, e.target.value)
                            }
                            placeholder="Describe your achievement with metrics..."
                            className="min-h-[40px] resize-y text-sm"
                            rows={1}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              enhanceHighlight(item.id, hIdx, highlight, {
                                position: item.position,
                                company: item.company,
                              })
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

      {work.length > 0 && (
        <Button
          variant="outline"
          onClick={addItem}
          className="w-full gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" /> Add Another Position
        </Button>
      )}
    </div>
  );
}
