"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RESUME_LIMITS } from "@/lib/resume/sanitize";
import { skillItemSchema } from "@/lib/validations/resume";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ResumeSkillItem } from "@/types/resume";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const SKILL_CATEGORIES = [
  { label: "Technical", value: "technical" },
  { label: "Soft Skills", value: "soft" },
  { label: "Domain Knowledge", value: "domain" },
  { label: "Tools", value: "tool" },
];

const skillsFormSchema = z.object({
  skills: z.array(skillItemSchema),
});

type SkillsFormValues = z.input<typeof skillsFormSchema>;

export default function SkillsForm({ serverErrors }: { serverErrors?: any }) {
  const dispatch = useDispatch<AppDispatch>();
  const skills = useSelector((s: RootState) => s.resume.data.skills || []);
  const [newKeywords, setNewKeywords] = useState<Record<string, string>>({});

  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
    setError,
    reset,
    getValues,
  } = useForm<SkillsFormValues>({
    resolver: zodResolver(skillsFormSchema),
    defaultValues: { skills: skills as any },
    mode: "onChange",
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "skills",
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
      if (value?.skills) {
        dispatch(resumeActions.setSkills(value.skills as any));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  // Update form if Redux changes externally (e.g., AI enhancements)
  useEffect(() => {
    const currentRHF = getValues("skills");
    if (JSON.stringify(currentRHF) !== JSON.stringify(skills)) {
      reset({ skills: skills as any });
    }
  }, [skills, reset, getValues]);

  const addGroup = () => {
    append({
      id: nanoid(),
      name: "",
      level: "",
      keywords: [],
      category: "technical",
    });
  };

  const addKeyword = (idx: number) => {
    const groupId = fields[idx].id;
    const kw = (newKeywords[groupId] ?? "").trim();
    if (!kw) return;
    if (kw.length > RESUME_LIMITS.keyword) {
      setError(`skills.${idx}.keywords` as any, {
        type: "max",
        message: `Each skill must be ${RESUME_LIMITS.keyword} characters or fewer`,
      });
      return;
    }
    const currentKeywords = watch(`skills.${idx}.keywords`) || [];
    if (!currentKeywords.includes(kw)) {
      setValue(`skills.${idx}.keywords`, [...currentKeywords, kw], {
        shouldValidate: true,
      });
      setNewKeywords((prev) => ({ ...prev, [groupId]: "" }));
    }
  };

  const removeKeyword = (idx: number, keyword: string) => {
    const currentKeywords = watch(`skills.${idx}.keywords`) || [];
    setValue(
      `skills.${idx}.keywords`,
      currentKeywords.filter((k) => k !== keyword),
      { shouldValidate: true },
    );
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const from = fields.findIndex((f) => f.id === active.id);
        const to = fields.findIndex((f) => f.id === over.id);
        move(from, to);
      }
    },
    [fields, move],
  );

  return (
    <div className="space-y-5">
      {fields.length === 0 && (
        <div className="rounded-xl border-2 border-border border-dashed py-12 text-center">
          <p className="mb-4 font-medium text-muted-foreground">
            No skill groups added yet
          </p>
          <Button variant="outline" onClick={addGroup} className="gap-2">
            <Plus className="h-4 w-4" /> Add Skill Group
          </Button>
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={fields.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {fields.map((field, idx) => (
            <SortableItem key={field.id} id={field.id}>
              <Card className="border-border">
                <CardContent className="space-y-4 p-5 pl-10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
                      <Field>
                        <FieldLabel className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
                          Group Name *
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            {...register(`skills.${idx}.name`)}
                            placeholder="Frontend Development"
                            className="h-10"
                          />
                          <FieldError
                            errors={[(errors.skills?.[idx] as any)?.name]}
                          />
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
                          Category
                        </FieldLabel>
                        <FieldContent>
                          <Select
                            value={watch(`skills.${idx}.category`)}
                            onValueChange={(val) =>
                              setValue(`skills.${idx}.category`, val || "", {
                                shouldValidate: true,
                              })
                            }
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {SKILL_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                              {/* Handle legacy or custom categories */}
                              {watch(`skills.${idx}.category`) &&
                                !SKILL_CATEGORIES.some(
                                  (c) =>
                                    c.value === watch(`skills.${idx}.category`),
                                ) && (
                                  <SelectItem
                                    value={watch(`skills.${idx}.category`)}
                                  >
                                    {watch(`skills.${idx}.category`)}
                                  </SelectItem>
                                )}
                            </SelectContent>
                          </Select>
                          <FieldError
                            errors={[(errors.skills?.[idx] as any)?.category]}
                          />
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
                          Proficiency
                        </FieldLabel>
                        <FieldContent>
                          <Select
                            value={watch(`skills.${idx}.level`) || "none"}
                            onValueChange={(val) =>
                              setValue(
                                `skills.${idx}.level`,
                                !val || val === "none" ? "" : val,
                                {
                                  shouldValidate: true,
                                },
                              )
                            }
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select Level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {SKILL_LEVELS.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldError
                            errors={[(errors.skills?.[idx] as any)?.level]}
                          />
                        </FieldContent>
                      </Field>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(idx)}
                      className="mt-7 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Keywords */}
                  <div className="space-y-2">
                    <FieldLabel className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
                      Skills / Keywords
                    </FieldLabel>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {(watch(`skills.${idx}.keywords`) || []).map((kw) => (
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
                        placeholder="Type a skill and press Enter"
                        maxLength={RESUME_LIMITS.keyword}
                        className="h-9 text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => addKeyword(idx)}
                        className="h-9 px-3"
                      >
                        Add
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Press Enter to add. Max {RESUME_LIMITS.keyword} characters
                      per skill.
                    </p>
                    <FieldError
                      errors={[(errors.skills?.[idx] as any)?.keywords]}
                    />
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
          onClick={addGroup}
          className="w-full gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" /> Add Another Skill Group
        </Button>
      )}
    </div>
  );
}
