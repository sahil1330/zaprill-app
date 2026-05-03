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
import { publicationItemSchema } from "@/lib/validations/resume";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ResumePublicationItem } from "@/types/resume";

const publicationsFormSchema = z.object({
  publications: z.array(publicationItemSchema),
});

type PublicationsFormValues = z.input<typeof publicationsFormSchema>;

export default function PublicationsForm({
  serverErrors,
}: {
  serverErrors?: any;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const publications = useSelector(
    (s: RootState) => s.resume.data.publications || [],
  );

  const {
    register,
    control,
    formState: { errors },
    watch,
    setError,
    reset,
    getValues,
  } = useForm<PublicationsFormValues>({
    resolver: zodResolver(publicationsFormSchema),
    defaultValues: { publications },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "publications",
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
      if (value?.publications) {
        dispatch(
          resumeActions.setPublications(
            value.publications as ResumePublicationItem[],
          ),
        );
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  // Update form if Redux changes externally (e.g., AI enhancements)
  useEffect(() => {
    const currentRHF = getValues("publications");
    if (JSON.stringify(currentRHF) !== JSON.stringify(publications)) {
      reset({ publications });
    }
  }, [publications, reset, getValues]);

  const addItem = () => {
    append({
      id: nanoid(),
      name: "",
      publisher: "",
      releaseDate: "",
      url: "",
      summary: "",
    });
  };

  return (
    <div className="space-y-5">
      {fields.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-medium mb-4">
            No publications added yet
          </p>
          <Button variant="outline" onClick={addItem} className="gap-2">
            <Plus className="h-4 w-4" /> Add Publication
          </Button>
        </div>
      )}

      {fields.map((field, idx) => (
        <Card key={field.id} className="border-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-sm">
                Publication {idx + 1}
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
                  Title *
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...register(`publications.${idx}.name`)}
                    placeholder="Research Paper Title"
                    className="h-11"
                  />
                  <FieldError
                    errors={[(errors.publications?.[idx] as any)?.name]}
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Publisher
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...register(`publications.${idx}.publisher`)}
                    placeholder="IEEE, ACM, etc."
                    className="h-11"
                  />
                  <FieldError
                    errors={[(errors.publications?.[idx] as any)?.publisher]}
                  />
                </FieldContent>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Release Date
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...register(`publications.${idx}.releaseDate`)}
                    placeholder="2024-01"
                    className="h-11"
                  />
                  <FieldError
                    errors={[(errors.publications?.[idx] as any)?.releaseDate]}
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  URL
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...register(`publications.${idx}.url`)}
                    placeholder="https://doi.org/..."
                    className="h-11"
                  />
                  <FieldError
                    errors={[(errors.publications?.[idx] as any)?.url]}
                  />
                </FieldContent>
              </Field>
            </div>

            <Field>
              <FieldLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Summary
              </FieldLabel>
              <FieldContent>
                <Textarea
                  {...register(`publications.${idx}.summary`)}
                  placeholder="Brief description of the publication..."
                  className="min-h-[80px] resize-y"
                  rows={3}
                />
                <FieldError
                  errors={[(errors.publications?.[idx] as any)?.summary]}
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
          <Plus className="h-4 w-4" /> Add Another Publication
        </Button>
      )}
    </div>
  );
}
