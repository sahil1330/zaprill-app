"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useEffect } from "react";
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
import { awardItemSchema } from "@/lib/validations/resume";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ResumeAwardItem } from "@/types/resume";

const awardsFormSchema = z.object({
  awards: z.array(awardItemSchema),
});

type AwardsFormValues = z.input<typeof awardsFormSchema>;

export default function AwardsForm({ serverErrors }: { serverErrors?: any }) {
  const dispatch = useDispatch<AppDispatch>();
  const awards = useSelector((s: RootState) => s.resume.data.awards || []);

  const {
    register,
    control,
    formState: { errors },
    watch,
    setError,
    reset,
    getValues,
  } = useForm<AwardsFormValues>({
    resolver: zodResolver(awardsFormSchema),
    defaultValues: { awards },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "awards",
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
      if (value?.awards) {
        dispatch(resumeActions.setAwards(value.awards as ResumeAwardItem[]));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  // Update form if Redux changes externally (e.g., AI enhancements)
  useEffect(() => {
    const currentRHF = getValues("awards");
    if (JSON.stringify(currentRHF) !== JSON.stringify(awards)) {
      reset({ awards });
    }
  }, [awards, reset, getValues]);

  const addItem = () => {
    append({
      id: nanoid(),
      title: "",
      date: "",
      awarder: "",
      summary: "",
    });
  };

  return (
    <div className="space-y-5">
      {fields.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-medium mb-4">
            No awards added yet
          </p>
          <Button variant="outline" onClick={addItem} className="gap-2">
            <Plus className="h-4 w-4" /> Add Award
          </Button>
        </div>
      )}

      {fields.map((field, idx) => (
        <Card key={field.id} className="border-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-sm">
                Award {idx + 1}
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
                  Award Title *
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...register(`awards.${idx}.title`)}
                    placeholder="Employee of the Year"
                    className="h-11"
                  />
                  <FieldError errors={[(errors.awards?.[idx] as any)?.title]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Awarded By
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...register(`awards.${idx}.awarder`)}
                    placeholder="Company Name"
                    className="h-11"
                  />
                  <FieldError
                    errors={[(errors.awards?.[idx] as any)?.awarder]}
                  />
                </FieldContent>
              </Field>
            </div>

            <Field>
              <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Date
              </FieldLabel>
              <FieldContent>
                <Input
                  {...register(`awards.${idx}.date`)}
                  placeholder="2024-06"
                  className="h-11"
                />
                <FieldError errors={[(errors.awards?.[idx] as any)?.date]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Summary
              </FieldLabel>
              <FieldContent>
                <Textarea
                  {...register(`awards.${idx}.summary`)}
                  placeholder="Briefly describe the award..."
                  className="min-h-[80px] resize-y"
                  rows={3}
                />
                <FieldError errors={[(errors.awards?.[idx] as any)?.summary]} />
              </FieldContent>
            </Field>
          </CardContent>
        </Card>
      ))}

      {fields.length > 0 && (
        <Button
          variant="outline"
          onClick={addItem}
          className="w-full gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" /> Add Another Award
        </Button>
      )}
    </div>
  );
}
