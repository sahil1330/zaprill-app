"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
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
import { volunteerItemSchema } from "@/lib/validations/resume";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ResumeVolunteerItem } from "@/types/resume";

const volunteerFormSchema = z.object({
  volunteer: z.array(volunteerItemSchema),
});

type VolunteerFormValues = z.input<typeof volunteerFormSchema>;

export default function VolunteerForm({
  serverErrors,
}: {
  serverErrors?: any;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const volunteer = useSelector(
    (s: RootState) => s.resume.data.volunteer || [],
  );
  const resumeId = useSelector((s: RootState) => s.resume.resumeId);
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
  } = useForm<VolunteerFormValues>({
    resolver: zodResolver(volunteerFormSchema),
    defaultValues: { volunteer },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "volunteer",
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
      if (value?.volunteer) {
        dispatch(
          resumeActions.setVolunteer(value.volunteer as ResumeVolunteerItem[]),
        );
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  // Update form if Redux changes externally (e.g., AI enhancements)
  useEffect(() => {
    const currentRHF = getValues("volunteer");
    if (JSON.stringify(currentRHF) !== JSON.stringify(volunteer)) {
      reset({ volunteer });
    }
  }, [volunteer, reset, getValues]);

  const addItem = () => {
    append({
      id: nanoid(),
      organization: "",
      position: "",
      url: "",
      startDate: "",
      endDate: null,
      summary: "",
      highlights: [],
    });
  };

  const enhanceHighlight = async (
    fieldIndex: number,
    hIdx: number,
    bullet: string,
    context: { position: string; organization: string },
  ) => {
    if (!resumeId || !bullet.trim()) return;
    const itemId = fields[fieldIndex].id;
    const key = `${itemId}-${hIdx}`;
    setEnhancingKey(key);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/ai/enhance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bullet,
          context: {
            position: context.position,
            company: context.organization,
          },
        }),
      });
      if (res.ok) {
        const { enhanced } = await res.json();
        const currentHighlights = [
          ...(watch(`volunteer.${fieldIndex}.highlights`) || []),
        ];
        currentHighlights[hIdx] = enhanced;
        setValue(`volunteer.${fieldIndex}.highlights`, currentHighlights, {
          shouldValidate: true,
        });
      }
    } catch {
      // Silently fail
    } finally {
      setEnhancingKey(null);
    }
  };

  return (
    <div className="space-y-5">
      {fields.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-medium mb-4">
            No volunteer experience added yet
          </p>
          <Button variant="outline" onClick={addItem} className="gap-2">
            <Plus className="h-4 w-4" /> Add Volunteer Experience
          </Button>
        </div>
      )}

      {fields.map((field, idx) => (
        <Card key={field.id} className="border-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-sm">
                Volunteer {idx + 1}
              </span>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => remove(idx)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Organization *
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...register(`volunteer.${idx}.organization`)}
                    placeholder="Red Cross"
                    className="h-11"
                  />
                  <FieldError
                    errors={[(errors.volunteer?.[idx] as any)?.organization]}
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Position
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...register(`volunteer.${idx}.position`)}
                    placeholder="Volunteer Coordinator"
                    className="h-11"
                  />
                  <FieldError
                    errors={[(errors.volunteer?.[idx] as any)?.position]}
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
                    {...register(`volunteer.${idx}.startDate`)}
                    placeholder="2023-01"
                    className="h-11"
                  />
                  <FieldError
                    errors={[(errors.volunteer?.[idx] as any)?.startDate]}
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  End Date
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...register(`volunteer.${idx}.endDate`)}
                    placeholder="Present"
                    className="h-11"
                  />
                  <FieldError
                    errors={[(errors.volunteer?.[idx] as any)?.endDate]}
                  />
                </FieldContent>
              </Field>
            </div>

            <Field>
              <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Website URL
              </FieldLabel>
              <FieldContent>
                <Input
                  {...register(`volunteer.${idx}.url`)}
                  placeholder="https://..."
                  className="h-11"
                />
                <FieldError errors={[(errors.volunteer?.[idx] as any)?.url]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Summary
              </FieldLabel>
              <FieldContent>
                <Textarea
                  {...register(`volunteer.${idx}.summary`)}
                  placeholder="Briefly describe your volunteer work..."
                  className="min-h-[80px] resize-y"
                  rows={3}
                />
                <FieldError
                  errors={[(errors.volunteer?.[idx] as any)?.summary]}
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
                  type="button"
                  onClick={() => {
                    const current = watch(`volunteer.${idx}.highlights`) || [];
                    setValue(`volunteer.${idx}.highlights`, [...current, ""], {
                      shouldValidate: true,
                    });
                  }}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
              {(watch(`volunteer.${idx}.highlights`) || []).map(
                (highlight, hIdx) => {
                  const isEnhancing = enhancingKey === `${field.id}-${hIdx}`;
                  return (
                    <div key={hIdx} className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground text-xs w-4 shrink-0 mt-2.5">
                          •
                        </span>
                        <Textarea
                          {...register(`volunteer.${idx}.highlights.${hIdx}`)}
                          placeholder="Describe your achievement..."
                          className="min-h-[40px] resize-y text-sm"
                          rows={1}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() =>
                            enhanceHighlight(idx, hIdx, highlight, {
                              position:
                                watch(`volunteer.${idx}.position`) || "",
                              organization:
                                watch(`volunteer.${idx}.organization`) || "",
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
                          type="button"
                          onClick={() => {
                            const current =
                              watch(`volunteer.${idx}.highlights`) || [];
                            setValue(
                              `volunteer.${idx}.highlights`,
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
                          (errors.volunteer?.[idx] as any)?.highlights?.[hIdx],
                        ]}
                      />
                    </div>
                  );
                },
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {fields.length > 0 && (
        <Button
          variant="outline"
          onClick={addItem}
          className="w-full gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" /> Add Another Volunteer Experience
        </Button>
      )}
    </div>
  );
}
