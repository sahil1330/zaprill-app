"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import SortableItem from "@/components/resume/editor/SortableItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { workItemSchema } from "@/lib/validations/resume";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ResumeWorkItem } from "@/types/resume";

const workFormSchema = z.object({
  work: z.array(workItemSchema),
});

type WorkFormValues = z.input<typeof workFormSchema>;

/**
 * WorkForm — Work experience section with add/remove/edit items.
 * Includes AI-powered "Enhance" button for each highlight bullet.
 */
export default function WorkForm({ serverErrors }: { serverErrors?: any }) {
  const dispatch = useDispatch<AppDispatch>();
  const work = useSelector((s: RootState) => s.resume.data.work || []);
  const resumeId = useSelector((s: RootState) => s.resume.resumeId);

  // Track which highlight is currently being enhanced: "itemId-hIdx"
  const [enhancingKey, setEnhancingKey] = useState<string | null>(null);

  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
    setError,
    reset,
    getValues,
  } = useForm<WorkFormValues>({
    resolver: zodResolver(workFormSchema),
    defaultValues: { work },
    mode: "onChange",
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "work",
  });

  // Handle server-side errors
  useEffect(() => {
    if (!serverErrors) return;

    Object.entries(serverErrors).forEach(([path, messages]) => {
      if (Array.isArray(messages) && messages.length > 0) {
        setError(path as any, {
          type: "server",
          message: messages[0] as string,
        });
      }
    });
  }, [serverErrors, setError]);

  // Watch for changes and update Redux
  useEffect(() => {
    const subscription = watch((value) => {
      if (value?.work) {
        dispatch(resumeActions.setWork(value.work as ResumeWorkItem[]));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  // Update form if Redux changes externally (e.g., AI enhancements)
  useEffect(() => {
    const currentRHF = getValues("work");
    if (JSON.stringify(currentRHF) !== JSON.stringify(work)) {
      reset({ work });
    }
  }, [work, reset, getValues]);

  const addItem = () => {
    append({
      id: nanoid(),
      company: "",
      position: "",
      website: "",
      startDate: "",
      endDate: null,
      summary: "",
      highlights: [],
      location: "",
    });
  };

  const enhanceHighlight = async (
    fieldIndex: number,
    hIdx: number,
    bullet: string,
    context: { position: string; company: string },
  ) => {
    if (!resumeId || !bullet.trim()) return;
    const itemId = fields[fieldIndex].id;
    const key = `${itemId}-${hIdx}`;
    setEnhancingKey(key);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/ai/enhance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullet, context }),
      });
      if (res.ok) {
        const { enhanced } = await res.json();
        const currentHighlights = [
          ...(watch(`work.${fieldIndex}.highlights`) || []),
        ];
        currentHighlights[hIdx] = enhanced;
        setValue(`work.${fieldIndex}.highlights`, currentHighlights, {
          shouldValidate: true,
        });
      }
    } catch {
      // Silently fail
    } finally {
      setEnhancingKey(null);
    }
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const from = fields.findIndex((f) => f.id === active.id);
        const to = fields.findIndex((f) => f.id === over.id);
        if (from !== -1 && to !== -1) {
          move(from, to);
        }
      }
    },
    [fields, move],
  );

  return (
    <div className="space-y-5">
      {fields.length === 0 && (
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
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          {fields.map((field, idx) => (
            <SortableItem key={field.id} id={field.id}>
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
                      onClick={() => remove(idx)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Position + Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Job Title *
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          {...register(`work.${idx}.position`)}
                          placeholder="Senior Software Engineer"
                          className="h-11"
                        />
                        <FieldError
                          errors={[(errors.work?.[idx] as any)?.position]}
                        />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Company *
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          {...register(`work.${idx}.company`)}
                          placeholder="Google"
                          className="h-11"
                        />
                        <FieldError
                          errors={[(errors.work?.[idx] as any)?.company]}
                        />
                      </FieldContent>
                    </Field>
                  </div>

                  {/* Website + Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Company Website
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          {...register(`work.${idx}.website`)}
                          placeholder="https://google.com"
                          className="h-11"
                        />
                        <FieldError
                          errors={[(errors.work?.[idx] as any)?.website]}
                        />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Location
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          {...register(`work.${idx}.location`)}
                          placeholder="Bangalore, India"
                          className="h-11"
                        />
                        <FieldError
                          errors={[(errors.work?.[idx] as any)?.location]}
                        />
                      </FieldContent>
                    </Field>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Start Date
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          {...register(`work.${idx}.startDate`)}
                          placeholder="2022-01"
                          className="h-11"
                        />
                        <FieldError
                          errors={[(errors.work?.[idx] as any)?.startDate]}
                        />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        End Date
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          {...register(`work.${idx}.endDate`)}
                          placeholder="Present"
                          className="h-11"
                        />
                        <FieldError
                          errors={[(errors.work?.[idx] as any)?.endDate]}
                        />
                      </FieldContent>
                    </Field>
                  </div>

                  {/* Summary */}
                  <Field>
                    <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Summary
                    </FieldLabel>
                    <FieldContent>
                      <Textarea
                        {...register(`work.${idx}.summary`)}
                        placeholder="Brief overview of your role..."
                        className="min-h-[80px]"
                      />
                      <FieldError
                        errors={[(errors.work?.[idx] as any)?.summary]}
                      />
                    </FieldContent>
                  </Field>

                  {/* Highlights */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Key Achievements
                      </FieldLabel>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const current = watch(`work.${idx}.highlights`) || [];
                          setValue(`work.${idx}.highlights`, [...current, ""], {
                            shouldValidate: true,
                          });
                        }}
                        className="h-7 text-xs gap-1"
                      >
                        <Plus className="h-3 w-3" /> Add
                      </Button>
                    </div>
                    {(watch(`work.${idx}.highlights`) || []).map(
                      (highlight, hIdx) => {
                        const isEnhancing =
                          enhancingKey === `${field.id}-${hIdx}`;
                        return (
                          <div key={hIdx} className="space-y-1">
                            <div className="flex items-start gap-2">
                              <span className="text-muted-foreground text-xs w-4 shrink-0 mt-2.5">
                                •
                              </span>
                              <Textarea
                                {...register(`work.${idx}.highlights.${hIdx}`)}
                                placeholder="Describe your achievement with metrics..."
                                className="min-h-[40px] resize-y text-sm"
                                rows={1}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  enhanceHighlight(idx, hIdx, highlight, {
                                    position: watch(`work.${idx}.position`),
                                    company: watch(`work.${idx}.company`),
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
                                onClick={() => {
                                  const current =
                                    watch(`work.${idx}.highlights`) || [];
                                  setValue(
                                    `work.${idx}.highlights`,
                                    current.filter((_, i) => i !== hIdx),
                                    { shouldValidate: true },
                                  );
                                }}
                                className="h-8 w-8 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <FieldError
                              errors={[
                                (errors.work?.[idx] as any)?.highlights?.[hIdx],
                              ]}
                            />
                          </div>
                        );
                      },
                    )}
                  </div>
                </CardContent>
              </Card>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>

      {fields.length > 0 && (
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
