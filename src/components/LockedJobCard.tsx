"use client";

import { Building2, Lock, MapPin, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { JobMatch } from "@/types";
import MatchRing from "./MatchRing";

interface LockedJobCardProps {
  job: JobMatch;
  rank: number;
}

export default function LockedJobCard({ job, rank }: LockedJobCardProps) {
  const router = useRouter();

  return (
    <Card
      className="relative overflow-hidden border border-border/60 bg-card rounded-xl"
      style={{
        animationDelay: `${rank * 50}ms`,
        animationFillMode: "both",
      }}
      id={`job-card-locked-${job.id}`}
    >
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row lg:items-center">
          {/* ── Readable Header: title + company (NOT blurred) ── */}
          <div className="flex-1 p-6 lg:p-8 flex items-start gap-5">
            <div className="hidden sm:flex shrink-0 w-8 h-8 rounded-lg items-center justify-center text-xs font-black bg-muted text-muted-foreground border border-border/50">
              {rank + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h3 className="text-xl font-black text-foreground tracking-tight truncate leading-tight">
                  {job.title}
                </h3>
                {job.isRemote && (
                  <Badge
                    variant="secondary"
                    className="h-5 px-1.5 text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border-none"
                  >
                    Remote
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-x-4 gap-y-2 text-muted-foreground text-sm flex-wrap font-semibold">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 opacity-70" />
                  <span className="truncate max-w-[150px]">{job.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Blurred skills section ── */}
          <div
            className="flex-1 px-6 lg:px-4 py-4 border-t lg:border-t-0 lg:border-x border-border/40 select-none"
            aria-hidden="true"
          >
            <div
              className="space-y-3 py-1 blur-sm pointer-events-none opacity-60"
              style={{ userSelect: "none" }}
            >
              <div className="flex gap-1.5 flex-wrap items-center">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest w-16">
                  Matched
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["React", "TypeScript", "Node.js"].map((s) => (
                    <span
                      key={s}
                      className="inline-flex px-2 py-0.5 text-xs font-bold rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap items-center">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest w-16">
                  Missing
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["AWS", "Docker"].map((s) => (
                    <span
                      key={s}
                      className="inline-flex px-2 py-0.5 text-xs font-bold rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Lock CTA section ── */}
          <div className="p-6 lg:p-8 flex items-center justify-between lg:justify-end gap-6 bg-muted/20 lg:bg-transparent border-t lg:border-t-0 border-border/40">
            <div className="flex items-center gap-4 lg:flex-row-reverse">
              <MatchRing
                percentage={job.matchPercentage}
                size={52}
                strokeWidth={5}
              />
            </div>

            <Button
              variant="default"
              size="lg"
              className="font-bold px-5 shadow-sm bg-primary/90 hover:bg-primary gap-2"
              onClick={() => router.push("/billing")}
            >
              <Lock className="h-4 w-4" />
              Unlock
            </Button>
          </div>
        </div>
      </CardContent>

      {/* ── Subtle lock badge top-right ── */}
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full shadow-sm">
        <Sparkles className="h-3 w-3" />
        Pro
      </div>
    </Card>
  );
}
