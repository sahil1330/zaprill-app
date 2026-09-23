"use client";

import { Loader2, Zap } from "lucide-react";
import SkillBadge from "@/components/SkillBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalysisStep } from "@/types";
import type { ResumeData } from "@/types/resume";

interface ParsingProgressProps {
  step: AnalysisStep;
  resume: ResumeData | null;
}

export function ParsingProgress({ step, resume }: ParsingProgressProps) {
  const skills = resume?.skills.flatMap((s) => s.keywords) || [];

  return (
    <div className="fade-in mx-auto w-full max-w-5xl animate-in space-y-6 duration-700">
      {/* Top Status Banner */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm md:flex-row">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <Zap className="-top-2 -right-2 absolute h-5 w-5 fill-current text-primary" />
        </div>
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h2 className="font-black text-2xl text-foreground tracking-tight">
            {step === "parsing"
              ? "Decoding your Professional DNA..."
              : "Finalizing Profile..."}
          </h2>
          <p className="font-medium text-muted-foreground">
            Our AI is extractingskills, experience, and impact metrics to build
            your search engine.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Extraction Summary */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="overflow-hidden rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="flex items-center gap-2 font-bold text-muted-foreground text-xs uppercase tracking-widest">
                Live Extraction
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {resume ? (
                <div className="space-y-6">
                  <div>
                    <p className="mb-1 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
                      Candidate
                    </p>
                    <p className="truncate font-black text-lg">
                      {resume.basics.name}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
                        Skills
                      </p>
                      <p className="font-black text-base text-primary">
                        {skills.length}
                      </p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
                        Roles
                      </p>
                      <p className="font-black text-base text-primary">
                        {resume.work.length}
                      </p>
                    </div>
                  </div>
                  <div className="border-border border-t pt-4">
                    <p className="mb-3 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
                      Detected Keywords
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.slice(0, 15).map((s) => (
                        <SkillBadge
                          key={s}
                          skill={s}
                          variant="neutral"
                          size="sm"
                        />
                      ))}
                      {skills.length > 15 && (
                        <span className="rounded bg-muted/50 px-2 py-1 font-black text-[10px] text-muted-foreground">
                          +{skills.length - 15}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                  <div className="space-y-3 pt-4">
                    <Skeleton className="h-3 w-24" />
                    <div className="flex flex-wrap gap-1.5">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-6 w-16 rounded-md" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-2 rounded-2xl border border-border/50 bg-muted/20 p-6 text-center">
            <p className="font-bold text-muted-foreground text-xs uppercase tracking-widest">
              Processing Time
            </p>
            <p className="font-medium text-sm italic opacity-70">
              Usually takes 10-15 seconds...
            </p>
          </div>
        </div>

        {/* Right Column: Simulated Feed */}
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-muted-foreground text-sm uppercase tracking-widest">
              Parsing Stream
            </h3>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="font-black text-[10px] uppercase tracking-widest">
                Active
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="overflow-hidden rounded-2xl border-border/50 bg-card/50 opacity-60 shadow-sm grayscale-[0.5]"
              >
                <CardContent className="flex items-center gap-6 p-6">
                  <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-2/5" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
