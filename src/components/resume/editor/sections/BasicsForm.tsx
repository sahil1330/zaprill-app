"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import type { z } from "zod";
import RichTextEditor from "@/components/resume/editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { basicsSchema } from "@/lib/validations/resume";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";

type BasicsFormValues = z.input<typeof basicsSchema>;

/**
 * BasicsForm — Contact information and professional summary.
 */
export default function BasicsForm({ serverErrors }: { serverErrors?: any }) {
  const dispatch = useDispatch<AppDispatch>();
  const basics = useSelector((s: RootState) => s.resume.data.basics);
  const resumeId = useSelector((s: RootState) => s.resume.resumeId);
  const resumeData = useSelector((s: RootState) => s.resume.data);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    control,
    formState: { errors },
    setValue,
    watch,
    setError,
    reset,
    getValues,
  } = useForm<BasicsFormValues>({
    resolver: zodResolver(basicsSchema),
    defaultValues: basics,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "profiles",
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
      if (value) {
        dispatch(resumeActions.setBasics(value as any));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  // Update form if Redux changes externally (e.g., AI enhancements)
  useEffect(() => {
    const currentRHF = getValues();
    if (JSON.stringify(currentRHF) !== JSON.stringify(basics)) {
      reset(basics);
    }
  }, [basics, reset, getValues]);

  const addProfile = () => {
    append({
      network: "",
      username: "",
      url: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Name + Label */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field>
          <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
            Full Name *
          </FieldLabel>
          <FieldContent>
            <Input
              {...register("name")}
              placeholder="John Doe"
              className="h-11 font-medium"
            />
            <FieldError errors={[errors.name]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
            Professional Title
          </FieldLabel>
          <FieldContent>
            <Input
              {...register("label")}
              placeholder="Senior Software Engineer"
              className="h-11"
            />
            <FieldError errors={[errors.label]} />
          </FieldContent>
        </Field>
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field>
          <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
            Email
          </FieldLabel>
          <FieldContent>
            <Input
              type="email"
              {...register("email")}
              placeholder="john@example.com"
              className="h-11"
            />
            <FieldError errors={[errors.email]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
            Phone
          </FieldLabel>
          <FieldContent>
            <Input
              {...register("phone")}
              placeholder="+91 98765 43210"
              className="h-11"
            />
            <FieldError errors={[errors.phone]} />
          </FieldContent>
        </Field>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field>
          <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
            City
          </FieldLabel>
          <FieldContent>
            <Input
              {...register("location.city")}
              placeholder="Mumbai"
              className="h-11"
            />
            <FieldError errors={[errors.location?.city]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
            State / Region
          </FieldLabel>
          <FieldContent>
            <Input
              {...register("location.region")}
              placeholder="Maharashtra"
              className="h-11"
            />
            <FieldError errors={[errors.location?.region]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
            Country
          </FieldLabel>
          <FieldContent>
            <Input
              {...register("location.countryCode")}
              placeholder="IN"
              className="h-11"
            />
            <FieldError errors={[errors.location?.countryCode]} />
          </FieldContent>
        </Field>
      </div>

      {/* Website */}
      <Field>
        <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
          Personal Website
        </FieldLabel>
        <FieldContent>
          <Input
            {...register("url")}
            placeholder="https://johndoe.dev"
            className="h-11"
          />
          <FieldError errors={[errors.url]} />
        </FieldContent>
      </Field>

      {/* Summary */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
            Professional Summary
          </FieldLabel>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            disabled={isGenerating || !resumeId}
            onClick={async () => {
              if (!resumeId) return;
              setIsGenerating(true);
              try {
                const res = await fetch(`/api/resumes/${resumeId}/ai/summary`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ data: resumeData }),
                });
                if (res.ok) {
                  const { summary } = await res.json();
                  setValue("summary", summary, { shouldValidate: true });
                }
              } catch {
                // Silently fail
              } finally {
                setIsGenerating(false);
              }
            }}
            className="h-7 text-xs gap-1.5 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
          >
            {isGenerating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            {isGenerating ? "Generating..." : "Generate with AI"}
          </Button>
        </div>
        <RichTextEditor
          value={watch("summary") || ""}
          onChange={(html) =>
            setValue("summary", html, { shouldValidate: true })
          }
          placeholder="A brief overview of your professional background, key achievements, and career objectives..."
        />
        <FieldError errors={[errors.summary]} />
        <p className="text-xs text-muted-foreground">
          {(watch("summary") || "").length}/5000 characters
        </p>
      </div>

      {/* Social Profiles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Social Profiles
          </h3>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={addProfile}
            className="h-8 gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Profile
          </Button>
        </div>

        {fields.length === 0 && (
          <p className="text-xs text-muted-foreground italic">
            No social profiles added yet.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4">
          {fields.map((field, idx) => (
            <Card key={field.id} className="border-border">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    Profile {idx + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => remove(idx)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                      Network
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        {...register(`profiles.${idx}.network`)}
                        placeholder="LinkedIn, GitHub..."
                        className="h-9 text-sm"
                      />
                      <FieldError
                        errors={[(errors.profiles?.[idx] as any)?.network]}
                      />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                      Username
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        {...register(`profiles.${idx}.username`)}
                        placeholder="johndoe"
                        className="h-9 text-sm"
                      />
                      <FieldError
                        errors={[(errors.profiles?.[idx] as any)?.username]}
                      />
                    </FieldContent>
                  </Field>
                </div>
                <Field>
                  <FieldLabel className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                    URL
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...register(`profiles.${idx}.url`)}
                      placeholder="https://linkedin.com/in/johndoe"
                      className="h-9 text-sm"
                    />
                    <FieldError
                      errors={[(errors.profiles?.[idx] as any)?.url]}
                    />
                  </FieldContent>
                </Field>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
