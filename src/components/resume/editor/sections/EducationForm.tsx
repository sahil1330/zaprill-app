"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useEffect } from "react";
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
import { educationItemSchema } from "@/lib/validations/resume";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ResumeEducationItem } from "@/types/resume";

const educationFormSchema = z.object({
  education: z.array(educationItemSchema),
});

type EducationFormValues = z.input<typeof educationFormSchema>;

export default function EducationForm({
  serverErrors,
}: {
  serverErrors?: any;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const education = useSelector(
    (s: RootState) => s.resume.data.education || [],
  );

  const {
    register,
    control,
    formState: { errors },
    watch,
    setError,
    setValue,
    reset,
    getValues,
  } = useForm<EducationFormValues>({
    resolver: zodResolver(educationFormSchema),
    defaultValues: { education },
    mode: "onChange",
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "education",
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
      if (value?.education) {
        dispatch(
          resumeActions.setEducation(value.education as ResumeEducationItem[]),
        );
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  // Update form if Redux changes externally (e.g., AI enhancements)
  useEffect(() => {
    const currentRHF = getValues("education");
    if (JSON.stringify(currentRHF) !== JSON.stringify(education)) {
      reset({ education });
    }
  }, [education, reset, getValues]);

  const addItem = () => {
    append({
      id: nanoid(),
      institution: "",
      url: "",
      area: "",
      studyType: "",
      startDate: "",
      endDate: null,
      score: "",
      courses: [],
    });
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = fields.findIndex((f) => f.id === active.id);
        const newIndex = fields.findIndex((f) => f.id === over.id);
        move(oldIndex, newIndex);
      }
    },
    [fields, move],
  );

  return (
    <div className="space-y-5">
      {fields.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-medium mb-4">
            No education added yet
          </p>
          <Button variant="outline" onClick={addItem} className="gap-2">
            <Plus className="h-4 w-4" /> Add Education
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
                      Education {idx + 1}
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

                  {/* Institution + URL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Institution *
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          {...register(`education.${idx}.institution`)}
                          placeholder="MIT"
                          className="h-11"
                        />
                        <FieldError
                          errors={[
                            (errors.education?.[idx] as any)?.institution,
                          ]}
                        />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Website (URL)
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          {...register(`education.${idx}.url`)}
                          placeholder="https://mit.edu"
                          className="h-11"
                        />
                        <FieldError
                          errors={[(errors.education?.[idx] as any)?.url]}
                        />
                      </FieldContent>
                    </Field>
                  </div>

                  {/* Degree + Field */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Degree
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          {...register(`education.${idx}.studyType`)}
                          placeholder="B.S."
                          className="h-11"
                        />
                        <FieldError
                          errors={[(errors.education?.[idx] as any)?.studyType]}
                        />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Field of Study
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          {...register(`education.${idx}.area`)}
                          placeholder="Computer Science"
                          className="h-11"
                        />
                        <FieldError
                          errors={[(errors.education?.[idx] as any)?.area]}
                        />
                      </FieldContent>
                    </Field>
                  </div>

                  {/* Start + End + Score */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field>
                      <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Start
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          {...register(`education.${idx}.startDate`)}
                          placeholder="2018"
                          className="h-11"
                        />
                        <FieldError
                          errors={[(errors.education?.[idx] as any)?.startDate]}
                        />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        End
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          {...register(`education.${idx}.endDate`)}
                          placeholder="2022"
                          className="h-11"
                        />
                        <FieldError
                          errors={[(errors.education?.[idx] as any)?.endDate]}
                        />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        GPA / Score
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          {...register(`education.${idx}.score`)}
                          placeholder="4.0"
                          className="h-11"
                        />
                        <FieldError
                          errors={[(errors.education?.[idx] as any)?.score]}
                        />
                      </FieldContent>
                    </Field>
                  </div>

                  {/* Courses */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Relevant Courses
                      </FieldLabel>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const current =
                            watch(`education.${idx}.courses`) || [];
                          setValue(
                            `education.${idx}.courses`,
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
                    {(watch(`education.${idx}.courses`) || []).map(
                      (_, cIdx) => (
                        <div key={cIdx} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Input
                              {...register(`education.${idx}.courses.${cIdx}`)}
                              placeholder="Data Structures"
                              className="h-9 text-sm"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const current =
                                  watch(`education.${idx}.courses`) || [];
                                setValue(
                                  `education.${idx}.courses`,
                                  current.filter((_, i) => i !== cIdx),
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
                              (errors.education?.[idx] as any)?.courses?.[cIdx],
                            ]}
                          />
                        </div>
                      ),
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
          <Plus className="h-4 w-4" /> Add Another Education
        </Button>
      )}
    </div>
  );
}
