"use client";

import { Check, Lock, Palette, Type } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
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
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";

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

export default function SettingsForm() {
  const dispatch = useDispatch<AppDispatch>();
  const templateSlug = useSelector((s: RootState) => s.resume.templateSlug);
  const metadata = useSelector((s: RootState) => s.resume.metadata);
  const { theme, typography, page, sectionVisibility } = metadata;

  const setTemplate = (slug: string) => {
    dispatch(resumeActions.setTemplateSluq(slug));
  };

  const setThemeColor = (key: string, value: string) => {
    dispatch(
      resumeActions.setMetadata({
        theme: { ...theme, [key]: value },
      }),
    );
  };

  const setFont = (family: string) => {
    dispatch(
      resumeActions.setMetadata({
        typography: {
          ...typography,
          font: { ...typography.font, family },
        },
      }),
    );
  };

  const setFontSize = (size: number) => {
    dispatch(
      resumeActions.setMetadata({
        typography: {
          ...typography,
          font: { ...typography.font, size },
        },
      }),
    );
  };

  const setLineHeight = (lineHeight: number) => {
    dispatch(
      resumeActions.setMetadata({
        typography: { ...typography, lineHeight },
      }),
    );
  };

  const setPageFormat = (format: "a4" | "letter") => {
    dispatch(
      resumeActions.setMetadata({
        page: { ...page, format },
      }),
    );
  };

  const setMargin = (margin: number) => {
    dispatch(
      resumeActions.setMetadata({
        page: { ...page, margin },
      }),
    );
  };

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

  return (
    <div className="space-y-8">
      {/* Template Selection */}
      <section>
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">
          Template
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEMPLATE_REGISTRY.map((tmpl) => (
            <button
              type="button"
              key={tmpl.slug}
              onClick={() => !tmpl.isPremium && setTemplate(tmpl.slug)}
              className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                templateSlug === tmpl.slug
                  ? "border-primary bg-primary/5"
                  : tmpl.isPremium
                    ? "border-border bg-muted/20 opacity-60 cursor-not-allowed"
                    : "border-border bg-card hover:border-muted-foreground/30 cursor-pointer"
              }`}
            >
              {templateSlug === tmpl.slug && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              {tmpl.isPremium && (
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
                {tmpl.isPremium && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-bold uppercase"
                  >
                    Pro
                  </Badge>
                )}
              </div>
            </button>
          ))}
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
                  value={theme[key as keyof typeof theme]}
                  onChange={(e) => setThemeColor(key, e.target.value)}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
                <Input
                  value={theme[key as keyof typeof theme]}
                  onChange={(e) => setThemeColor(key, e.target.value)}
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
                value={typography.font.family}
                onValueChange={(v) => {
                  if (v) setFont(v);
                }}
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
                  {typography.font.size}pt
                </span>
              </div>
              <Slider
                value={[typography.font.size]}
                min={9}
                max={14}
                step={0.5}
                onValueChange={(v) => setFontSize(Array.isArray(v) ? v[0] : v)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Line Height
                </Label>
                <span className="text-sm font-bold">
                  {typography.lineHeight}
                </span>
              </div>
              <Slider
                value={[typography.lineHeight]}
                min={1.2}
                max={2.0}
                step={0.05}
                onValueChange={(v) =>
                  setLineHeight(Array.isArray(v) ? v[0] : v)
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
                value={page.format}
                onValueChange={(v) => {
                  if (v) setPageFormat(v as "a4" | "letter");
                }}
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
                <span className="text-sm font-bold">{page.margin}mm</span>
              </div>
              <Slider
                value={[page.margin]}
                min={10}
                max={30}
                step={1}
                onValueChange={(v) => setMargin(Array.isArray(v) ? v[0] : v)}
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
                  checked={
                    sectionVisibility[key as keyof typeof sectionVisibility] ??
                    false
                  }
                  onCheckedChange={() =>
                    dispatch(resumeActions.toggleSectionVisibility(key))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
