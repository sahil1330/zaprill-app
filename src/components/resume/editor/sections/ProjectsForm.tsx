"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Sparkles, Trash2, X } from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import SortableItem from "@/components/resume/editor/SortableItem";
import { Badge } from "@/components/ui/badge";
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
import { projectItemSchema } from "@/lib/validations/resume";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ResumeProjectItem } from "@/types/resume";

const projectsFormSchema = z.object({
  projects: z.array(projectItemSchema),
});

type ProjectsFormValues = z.input<typeof projectsFormSchema>;

export default function ProjectsForm({ serverErrors }: { serverErrors?: any }) {
  const dispatch = useDispatch<AppDispatch>();
  const projects = useSelector((s: RootState) => s.resume.data.projects || []);
  const resumeId = useSelector((s: RootState) => s.resume.resumeId);
  const [newKeywords, setNewKeywords] = useState<Record<string, string>>({});
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
  } = useForm<ProjectsFormValues>({
    resolver: zodResolver(projectsFormSchema),
    defaultValues: { projects },
    mode: "onChange",
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "projects",
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
      if (value?.projects) {
        dispatch(
          resumeActions.setProjects(value.projects as ResumeProjectItem[]),
        );
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  // Update form if Redux changes externally (e.g., AI enhancements)
  useEffect(() => {
    const currentRHF = getValues("projects");
    if (JSON.stringify(currentRHF) !== JSON.stringify(projects)) {
      reset({ projects });
    }
  }, [projects, reset, getValues]);

  const addItem = () => {
    append({
      id: nanoid(),
      name: "",
      description: "",
      highlights: [],
      url: "",
      githubUrl: "",
      startDate: "",
      endDate: null,
      keywords: [],
    });
  };

  const addKeyword = (projIndex: number) => {
    const projectId = fields[projIndex].id;
    const kw = (newKeywords[projectId] ?? "").trim();
    if (!kw) return;
    const currentKeywords = watch(`projects.${projIndex}.keywords`) || [];
    if (!currentKeywords.includes(kw)) {
      setValue(`projects.${projIndex}.keywords`, [...currentKeywords, kw], {
        shouldValidate: true,
      });
      setNewKeywords((prev) => ({ ...prev, [projectId]: "" }));
    }
  };

  const removeKeyword = (projIndex: number, keyword: string) => {
    const currentKeywords = watch(`projects.${projIndex}.keywords`) || [];
    setValue(
      `projects.${projIndex}.keywords`,
      currentKeywords.filter((k) => k !== keyword),
      { shouldValidate: true },
    );
  };

  const enhanceHighlight = async (
    projIndex: number,
    hIdx: number,
    bullet: string,
    projectName: string,
  ) => {
    if (!resumeId || !bullet.trim()) return;
    const itemId = fields[projIndex].id;
    const key = `${itemId}-${hIdx}`;
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
        const currentHighlights = [
          ...(watch(`projects.${projIndex}.highlights`) || []),
        ];
        currentHighlights[hIdx] = enhanced;
        setValue(`projects.${projIndex}.highlights`, currentHighlights, {
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
            No projects added yet
          </p>
          <Button variant="outline" onClick={addItem} className="gap-2">
            <Plus className="h-4 w-4" /> Add Project
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
              <Card className="border-border">
                <CardContent className="p-5 pl-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-sm">
                      Project {idx + 1}
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

                  {/* Name + URLs */}
                  <Field>
                    <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Project Name *
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        {...register(`projects.${idx}.name`)}
                        placeholder="AI Resume Builder"
                        className="h-11"
                      />
                      <FieldError
                        errors={[(errors.projects?.[idx] as any)?.name]}
                      />
                    </FieldContent>
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Live URL
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          {...register(`projects.${idx}.url`)}
                          placeholder="https://project.com"
                          className="h-11"
                        />
                        <FieldError
                          errors={[(errors.projects?.[idx] as any)?.url]}
                        />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        GitHub URL
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          {...register(`projects.${idx}.githubUrl`)}
                          placeholder="https://github.com/user/repo"
                          className="h-11"
                        />
                        <FieldError
                          errors={[(errors.projects?.[idx] as any)?.githubUrl]}
                        />
                      </FieldContent>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Start Date
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          {...register(`projects.${idx}.startDate`)}
                          placeholder="2024-01"
                          className="h-11"
                        />
                        <FieldError
                          errors={[(errors.projects?.[idx] as any)?.startDate]}
                        />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        End Date
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          {...register(`projects.${idx}.endDate`)}
                          placeholder="Ongoing"
                          className="h-11"
                        />
                        <FieldError
                          errors={[(errors.projects?.[idx] as any)?.endDate]}
                        />
                      </FieldContent>
                    </Field>
                  </div>

                  {/* Description */}
                  <Field>
                    <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Description
                    </FieldLabel>
                    <FieldContent>
                      <Textarea
                        {...register(`projects.${idx}.description`)}
                        placeholder="Brief overview of the project and your role..."
                        className="min-h-[60px] resize-y text-sm"
                        rows={2}
                      />
                      <FieldError
                        errors={[(errors.projects?.[idx] as any)?.description]}
                      />
                    </FieldContent>
                  </Field>

                  {/* Tech Stack Keywords */}
                  <div className="space-y-2">
                    <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Tech Stack
                    </FieldLabel>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(watch(`projects.${idx}.keywords`) || []).map((kw) => (
                        <Badge
                          key={kw}
                          variant="secondary"
                          className="gap-1 pr-1 font-medium"
                        >
                          {kw}
                          <button
                            type="button"
                            onClick={() => removeKeyword(idx, kw)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newKeywords[field.id] ?? ""}
                        onChange={(e) =>
                          setNewKeywords((prev) => ({
                            ...prev,
                            [field.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addKeyword(idx);
                          }
                        }}
                        placeholder="React, TypeScript..."
                        className="h-9 text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addKeyword(idx)}
                        className="h-9 px-3"
                      >
                        Add
                      </Button>
                    </div>
                    <FieldError
                      errors={[(errors.projects?.[idx] as any)?.keywords]}
                    />
                  </div>

                  {/* Highlights */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Key Highlights
                      </FieldLabel>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const current =
                            watch(`projects.${idx}.highlights`) || [];
                          setValue(
                            `projects.${idx}.highlights`,
                            [...current, ""],
                            {
                              shouldValidate: true,
                            },
                          );
                        }}
                        className="h-7 text-xs gap-1"
                      >
                        <Plus className="h-3 w-3" /> Add
                      </Button>
                    </div>
                    {(watch(`projects.${idx}.highlights`) || []).map(
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
                                {...register(
                                  `projects.${idx}.highlights.${hIdx}`,
                                )}
                                placeholder="Describe a key feature or achievement..."
                                className="min-h-[40px] resize-y text-sm"
                                rows={1}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  enhanceHighlight(
                                    idx,
                                    hIdx,
                                    highlight,
                                    watch(`projects.${idx}.name`),
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
                                onClick={() => {
                                  const current =
                                    watch(`projects.${idx}.highlights`) || [];
                                  setValue(
                                    `projects.${idx}.highlights`,
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
                                (errors.projects?.[idx] as any)?.highlights?.[
                                  hIdx
                                ],
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
          <Plus className="h-4 w-4" /> Add Another Project
        </Button>
      )}
    </div>
  );
}
