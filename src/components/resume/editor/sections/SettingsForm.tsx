"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Lock, Palette, Type } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import type { z } from "zod";
import SortableItem from "@/components/resume/editor/SortableItem";
import { TEMPLATE_REGISTRY } from "@/components/resume/templates/registry";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { resumeMetadataSchema } from "@/lib/validations/resume";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { DEFAULT_RESUME_METADATA } from "@/types/resume";

const FONT_OPTIONS = [
  "Inter",
  "Roboto",
  "Lato",
  "Open Sans",
  "Merriweather",
  "Playfair Display",
  "Source Sans 3",
  "Nunito",
];

const PAGE_FORMATS = [
  { value: "a4", label: "A4 (210 × 297mm)" },
  { value: "letter", label: "US Letter (8.5 × 11in)" },
];

const SECTION_LABELS: Record<string, string> = {
  summary: "Summary",
  work: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
  volunteer: "Volunteer",
  awards: "Awards",
  publications: "Publications",
  references: "References",
};

type SettingsFormValues = z.input<typeof resumeMetadataSchema>;

export default function SettingsForm({ serverErrors }: { serverErrors?: any }) {
  const dispatch = useDispatch<AppDispatch>();
  const templateSlug = useSelector((s: RootState) => s.resume.templateSlug);
  const metadata = useSelector((s: RootState) => s.resume.metadata);

  const [isPro, setIsPro] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    setError,
    reset,
    getValues,
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(resumeMetadataSchema),
    defaultValues: metadata || DEFAULT_RESUME_METADATA,
    mode: "onChange",
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

  const getWatch = watch as any;
  const setVal = setValue as any;
  const watchedMetadata = watch();

  // Watch for changes and update Redux
  useEffect(() => {
    const subscription = watch((value: any) => {
      if (value) {
        dispatch(resumeActions.setMetadata(value as any));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  // Update form if Redux changes externally (e.g., AI enhancements)
  useEffect(() => {
    const currentRHF = getValues();
    if (JSON.stringify(currentRHF) !== JSON.stringify(metadata)) {
      reset(metadata || DEFAULT_RESUME_METADATA);
    }
  }, [metadata, reset, getValues]);

  useEffect(() => {
    fetch("/api/billing/subscription")
      .then((r) => r.json())
      .then((data) => {
        setIsPro(!!data.subscription);
      })
      .catch(() => setIsPro(false));
  }, []);

  const orderableSections = (watchedMetadata.sectionOrder || []).filter(
    (key: string) => key in SECTION_LABELS,
  );

  const handleSectionDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const currentOrder = [...(watchedMetadata.sectionOrder || [])];
        const from = currentOrder.indexOf(active.id as string);
        const to = currentOrder.indexOf(over.id as string);
        if (from !== -1 && to !== -1) {
          const [removed] = currentOrder.splice(from, 1);
          currentOrder.splice(to, 0, removed);
          setVal("sectionOrder", currentOrder, { shouldValidate: true });
        }
      }
    },
    [watchedMetadata.sectionOrder, setValue],
  );

  const setTemplate = (slug: string) => {
    dispatch(resumeActions.setTemplateSlug(slug));
  };

  return (
    <div className="space-y-8">
      {/* Template Selection */}
      <section>
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">
          Template
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEMPLATE_REGISTRY.map((tmpl) => {
            const locked = tmpl.isPremium && !isPro;
            return (
              <button
                type="button"
                key={tmpl.slug}
                onClick={() => !locked && setTemplate(tmpl.slug)}
                className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  templateSlug === tmpl.slug
                    ? "border-primary bg-primary/5"
                    : locked
                      ? "border-border bg-muted/20 opacity-60 cursor-not-allowed"
                      : "border-border bg-card hover:border-muted-foreground/30 cursor-pointer"
                }`}
              >
                {templateSlug === tmpl.slug && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                {locked && (
                  <div className="absolute top-3 right-3">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <h4 className="font-bold text-sm">{tmpl.name}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {tmpl.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold uppercase"
                  >
                    {tmpl.layout}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold uppercase"
                  >
                    ATS {tmpl.atsScore}%
                  </Badge>
                  {locked && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-bold uppercase"
                    >
                      Pro
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Colors */}
      <section>
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <Palette className="h-4 w-4" /> Colors
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "primary", label: "Primary" },
            { key: "accent", label: "Accent" },
            { key: "text", label: "Text" },
            { key: "background", label: "Background" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                {label}
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={
                    (getWatch(`theme.${key as any}` as any) as string) ||
                    "#000000"
                  }
                  onChange={(e) =>
                    setVal(`theme.${key as any}` as any, e.target.value, {
                      shouldValidate: true,
                    })
                  }
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
                <Input
                  {...register(`theme.${key as any}` as any)}
                  className="h-10 text-xs font-mono"
                  maxLength={7}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section>
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <Type className="h-4 w-4" /> Typography
        </h3>
        <Card className="border-border">
          <CardContent className="p-5 space-y-5">
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Font Family
              </Label>
              <Select
                value={getWatch("typography.font.family" as any)}
                onValueChange={(v) =>
                  setVal("typography.font.family" as any, v, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font} value={font}>
                      <span style={{ fontFamily: font }}>{font}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Font Size
                </Label>
                <span className="text-sm font-bold">
                  {getWatch("typography.font.size" as any)}pt
                </span>
              </div>
              <Slider
                value={[getWatch("typography.font.size" as any) || 11]}
                min={9}
                max={14}
                step={0.5}
                onValueChange={(v: any) =>
                  setVal("typography.font.size" as any, v[0], {
                    shouldValidate: true,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Line Height
                </Label>
                <span className="text-sm font-bold">
                  {getWatch("typography.lineHeight" as any)}
                </span>
              </div>
              <Slider
                value={[getWatch("typography.lineHeight" as any) || 1.5]}
                min={1.2}
                max={2.0}
                step={0.05}
                onValueChange={(v: any) =>
                  setVal("typography.lineHeight" as any, v[0], {
                    shouldValidate: true,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Page Settings */}
      <section>
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">
          Page Layout
        </h3>
        <Card className="border-border">
          <CardContent className="p-5 space-y-5">
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Page Format
              </Label>
              <Select
                value={getWatch("page.format")}
                onValueChange={(v) =>
                  setVal("page.format", v as any, { shouldValidate: true })
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_FORMATS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Margin
                </Label>
                <span className="text-sm font-bold">
                  {getWatch("page.margin")}mm
                </span>
              </div>
              <Slider
                value={[getWatch("page.margin") || 20]}
                min={10}
                max={30}
                step={1}
                onValueChange={(v: any) =>
                  setVal("page.margin", v[0], { shouldValidate: true })
                }
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section Visibility */}
      <section>
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">
          Section Visibility
        </h3>
        <Card className="border-border">
          <CardContent className="p-4 space-y-1">
            {Object.entries(SECTION_LABELS).map(([key, label]) => (
              <div
                key={key}
                className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm font-medium">{label}</span>
                <Switch
                  checked={getWatch(`sectionVisibility.${key as any}`) ?? false}
                  onCheckedChange={(checked) =>
                    setVal(`sectionVisibility.${key as any}` as any, checked, {
                      shouldValidate: true,
                    })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Section Order */}
      <section>
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">
          Section Order
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Drag sections to reorder them on your resume
        </p>
        <Card className="border-border">
          <CardContent className="p-2">
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleSectionDragEnd}
            >
              <SortableContext
                items={orderableSections}
                strategy={verticalListSortingStrategy}
              >
                {orderableSections.map((key: string) => (
                  <SortableItem key={key} id={key}>
                    <div className="flex items-center gap-2 py-2.5 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm font-medium pl-6">
                        {SECTION_LABELS[key] || key}
                      </span>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
