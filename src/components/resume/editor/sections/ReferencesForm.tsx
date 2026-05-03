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
import { referenceItemSchema } from "@/lib/validations/resume";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ResumeReferenceItem } from "@/types/resume";

const referencesFormSchema = z.object({
  references: z.array(referenceItemSchema),
});

type ReferencesFormValues = z.input<typeof referencesFormSchema>;

export default function ReferencesForm({
  serverErrors,
}: {
  serverErrors?: any;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const references = useSelector(
    (s: RootState) => s.resume.data.references || [],
  );

  const {
    register,
    control,
    formState: { errors },
    watch,
    setError,
    reset,
    getValues,
  } = useForm<ReferencesFormValues>({
    resolver: zodResolver(referencesFormSchema),
    defaultValues: { references },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "references",
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
      if (value?.references) {
        dispatch(
          resumeActions.setReferences(
            value.references as ResumeReferenceItem[],
          ),
        );
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  // Update form if Redux changes externally (e.g., AI enhancements)
  useEffect(() => {
    const currentRHF = getValues("references");
    if (JSON.stringify(currentRHF) !== JSON.stringify(references)) {
      reset({ references });
    }
  }, [references, reset, getValues]);

  const addItem = () => {
    append({
      id: nanoid(),
      name: "",
      reference: "",
    });
  };

  return (
    <div className="space-y-5">
      {fields.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-medium mb-4">
            No references added yet
          </p>
          <Button variant="outline" onClick={addItem} className="gap-2">
            <Plus className="h-4 w-4" /> Add Reference
          </Button>
        </div>
      )}

      {fields.map((field, idx) => (
        <Card key={field.id} className="border-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-sm">
                Reference {idx + 1}
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

            <Field>
              <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Name *
              </FieldLabel>
              <FieldContent>
                <Input
                  {...register(`references.${idx}.name`)}
                  placeholder="Jane Smith, Engineering Manager"
                  className="h-11"
                />
                <FieldError
                  errors={[(errors.references?.[idx] as any)?.name]}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Reference Text
              </FieldLabel>
              <FieldContent>
                <Textarea
                  {...register(`references.${idx}.reference`)}
                  placeholder="Reference description or 'Available upon request'"
                  className="min-h-[80px] resize-y"
                  rows={3}
                />
                <FieldError
                  errors={[(errors.references?.[idx] as any)?.reference]}
                />
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
          <Plus className="h-4 w-4" /> Add Another Reference
        </Button>
      )}
    </div>
  );
}
