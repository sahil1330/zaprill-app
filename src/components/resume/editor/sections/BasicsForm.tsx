"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import RichTextEditor from "@/components/resume/editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";

/**
 * BasicsForm — Contact information and professional summary.
 */
export default function BasicsForm() {
  const dispatch = useDispatch<AppDispatch>();
  const basics = useSelector((s: RootState) => s.resume.data.basics);
  const resumeId = useSelector((s: RootState) => s.resume.resumeId);
  const resumeData = useSelector((s: RootState) => s.resume.data);
  const [isGenerating, setIsGenerating] = useState(false);

  const update = (field: string, value: string) => {
    dispatch(resumeActions.setBasics({ [field]: value }));
  };

  const updateLocation = (field: string, value: string) => {
    dispatch(
      resumeActions.setBasics({
        location: { ...basics.location, [field]: value },
      }),
    );
  };

  return (
    <div className="space-y-6">
      {/* Name + Label */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="basics-name"
            className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
          >
            Full Name *
          </Label>
          <Input
            id="basics-name"
            value={basics.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="John Doe"
            className="h-11 font-medium"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="basics-label"
            className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
          >
            Professional Title
          </Label>
          <Input
            id="basics-label"
            value={basics.label}
            onChange={(e) => update("label", e.target.value)}
            placeholder="Senior Software Engineer"
            className="h-11"
          />
        </div>
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="basics-email"
            className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
          >
            Email
          </Label>
          <Input
            id="basics-email"
            type="email"
            value={basics.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="john@example.com"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="basics-phone"
            className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
          >
            Phone
          </Label>
          <Input
            id="basics-phone"
            value={basics.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+91 98765 43210"
            className="h-11"
          />
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="basics-city"
            className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
          >
            City
          </Label>
          <Input
            id="basics-city"
            value={basics.location.city}
            onChange={(e) => updateLocation("city", e.target.value)}
            placeholder="Mumbai"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="basics-region"
            className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
          >
            State / Region
          </Label>
          <Input
            id="basics-region"
            value={basics.location.region}
            onChange={(e) => updateLocation("region", e.target.value)}
            placeholder="Maharashtra"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="basics-country"
            className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
          >
            Country
          </Label>
          <Input
            id="basics-country"
            value={basics.location.countryCode}
            onChange={(e) => updateLocation("countryCode", e.target.value)}
            placeholder="IN"
            className="h-11"
          />
        </div>
      </div>

      {/* Website */}
      <div className="space-y-2">
        <Label
          htmlFor="basics-url"
          className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
        >
          Personal Website
        </Label>
        <Input
          id="basics-url"
          value={basics.url}
          onChange={(e) => update("url", e.target.value)}
          placeholder="https://johndoe.dev"
          className="h-11"
        />
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="basics-summary"
            className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
          >
            Professional Summary
          </Label>
          <Button
            variant="ghost"
            size="sm"
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
                  dispatch(resumeActions.setBasics({ summary }));
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
          value={basics.summary}
          onChange={(html) => update("summary", html)}
          placeholder="A brief overview of your professional background, key achievements, and career objectives..."
        />
        <p className="text-xs text-muted-foreground">
          {basics.summary.length}/5000 characters
        </p>
      </div>
    </div>
  );
}
