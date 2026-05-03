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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { languageItemSchema } from "@/lib/validations/resume";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ResumeLanguageItem } from "@/types/resume";

const FLUENCY_LEVELS = [
  "Native",
  "Fluent",
  "Advanced",
  "Intermediate",
  "Beginner",
];

const languagesFormSchema = z.object({
  languages: z.array(languageItemSchema),
});

type LanguagesFormValues = z.input<typeof languagesFormSchema>;

export default function LanguagesForm({
  serverErrors,
}: {
  serverErrors?: any;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const languages = useSelector(
    (s: RootState) => s.resume.data.languages || [],
  );

  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
    setError,
    reset,
    getValues,
  } = useForm<LanguagesFormValues>({
    resolver: zodResolver(languagesFormSchema),
    defaultValues: { languages: languages as any },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "languages",
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
      if (value?.languages) {
        dispatch(resumeActions.setLanguages(value.languages as any));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  // Update form if Redux changes externally (e.g., AI enhancements)
  useEffect(() => {
    const currentRHF = getValues("languages");
    if (JSON.stringify(currentRHF) !== JSON.stringify(languages)) {
      reset({ languages: languages as any });
    }
  }, [languages, reset, getValues]);

  const addItem = () => {
    append({
      id: nanoid(),
      language: "",
      fluency: "Fluent",
    });
  };

  return (
    <div className="space-y-5">
      {fields.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-medium mb-4">
            No languages added yet
          </p>
          <Button variant="outline" onClick={addItem} className="gap-2">
            <Plus className="h-4 w-4" /> Add Language
          </Button>
        </div>
      )}

      {fields.map((field, idx) => (
        <Card key={field.id} className="border-border">
          <CardContent className="p-4">
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Field>
                  <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Language {idx + 1}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...register(`languages.${idx}.language`)}
                      placeholder="English"
                      className="h-11"
                    />
                    <FieldError
                      errors={[(errors.languages?.[idx] as any)?.language]}
                    />
                  </FieldContent>
                </Field>
              </div>
              <div className="w-40 space-y-2">
                <Field>
                  <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Fluency
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      value={watch(`languages.${idx}.fluency`)}
                      onValueChange={(v) => {
                        if (v)
                          setValue(`languages.${idx}.fluency`, v, {
                            shouldValidate: true,
                          });
                      }}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {FLUENCY_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError
                      errors={[(errors.languages?.[idx] as any)?.fluency]}
                    />
                  </FieldContent>
                </Field>
              </div>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => remove(idx)}
                className="h-11 w-11 p-0 text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
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
          <Plus className="h-4 w-4" /> Add Another Language
        </Button>
      )}
    </div>
  );
}
