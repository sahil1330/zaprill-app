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
import { skillItemSchema } from "@/lib/validations/resume";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ResumeSkillItem } from "@/types/resume";

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
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-medium mb-4">
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
                <CardContent className="p-5 pl-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1 mr-4">
                      <Field>
                        <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                          Group Name *
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            {...register(`skills.${idx}.name`)}
                            placeholder="Frontend Development"
                            className="h-11"
                          />
                          <FieldError
                            errors={[(errors.skills?.[idx] as any)?.name]}
                          />
                        </FieldContent>
                      </Field>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(idx)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Keywords */}
                  <div className="space-y-2">
                    <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Skills / Keywords
                    </FieldLabel>
                    <div className="flex flex-wrap gap-2 mb-2">
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
