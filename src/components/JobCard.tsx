"use client";

import {
  Building2,
  Clock,
  DollarSign,
  ExternalLink,
  MapPin,
  Wifi,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trackJobApplied, trackJobCardImpression } from "@/lib/analytics";
import type { JobMatch } from "@/types";
import MatchRing from "./MatchRing";
import SkillBadge from "./SkillBadge";

interface JobCardProps {
  job: JobMatch;
  rank: number;
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  if (days < 60) return "1 month ago";
  return `${Math.floor(days / 30)} months ago`;
}

export default function JobCard({ job, rank }: JobCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const impressionFired = useRef(false);

  const postedText = timeAgo(job.postedAt);
  const showMatched = job.matchedSkills.slice(0, 5);
  const showMissing = job.missingSkills.slice(0, 4);

  // ── Impression tracking via Intersection Observer ──────────────────────────
  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !impressionFired.current) {
            impressionFired.current = true;
            trackJobCardImpression({
              job_id: job.id,
              job_title: job.title,
              company_name: job.company,
              match_score: job.matchPercentage,
              is_remote: Boolean(job.isRemote),
              job_rank: rank,
            });
            observer.disconnect();
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [job.id, job.title, job.company, job.matchPercentage, job.isRemote, rank]);

  return (
    <Card
      ref={cardRef}
      className="animate-slide-up hover:shadow-md transition-all hover:border-primary/30 bg-card rounded-xl overflow-hidden border border-border/60"
      style={{
        animationDelay: `${rank * 50}ms`,
        animationFillMode: "both",
      }}
      id={`job-card-${job.id}`}
    >
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row lg:items-center">
          {/* Main Info Section */}
          <div className="flex-1 p-6 lg:p-8 flex items-start gap-5">
            {/* Rank - Subtle */}
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
                <div className="flex items-center gap-1.5 text-foreground">
                  <Building2 className="h-3.5 w-3.5 opacity-70" />
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 opacity-70" />
                  <span className="truncate max-w-[150px]">{job.location}</span>
                </div>
                {job.salary && (
                  <div className="flex items-center gap-1.5 text-foreground font-bold">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>{job.salary}</span>
                  </div>
                )}
                {postedText && (
                  <div className="flex items-center gap-1.5 opacity-80">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{postedText}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Skills Section - Hidden on very small screens, shown as middle block on desktop */}
          <div className="flex-1 px-6 lg:px-4 py-2 lg:py-0 border-t lg:border-t-0 lg:border-x border-border/40">
            <div className="space-y-3 lg:space-y-2 py-4">
              {showMatched.length > 0 && (
                <div className="flex gap-1.5 flex-wrap items-center">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest w-16">
                    Matched
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {showMatched.map((s) => (
                      <SkillBadge
                        key={s}
                        skill={s}
                        variant="matched"
                        size="sm"
                      />
                    ))}
                    {job.matchedSkills.length > 5 && (
                      <span className="text-[10px] text-muted-foreground font-bold">
                        +{job.matchedSkills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              {showMissing.length > 0 && (
                <div className="flex gap-1.5 flex-wrap items-center">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest w-16">
                    Missing
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {showMissing.map((s) => (
                      <SkillBadge
                        key={s}
                        skill={s}
                        variant="missing"
                        size="sm"
                      />
                    ))}
                    {job.missingSkills.length > 4 && (
                      <span className="text-[10px] text-muted-foreground font-bold">
                        +{job.missingSkills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action/Match Section */}
          <div className="p-6 lg:p-8 flex items-center justify-between lg:justify-end gap-8 bg-muted/20 lg:bg-transparent border-t lg:border-t-0 border-border/40">
            <div className="flex items-center gap-4 lg:flex-row-reverse">
              <MatchRing
                percentage={job.matchPercentage}
                size={52}
                strokeWidth={5}
              />
              <div className="text-right flex flex-col items-end lg:items-start shrink-0">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
                  Match Score
                </span>
                <span className="text-lg font-black text-foreground leading-none">
                  {job.matchPercentage}%
                </span>
              </div>
            </div>

            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className={
                buttonVariants({ variant: "default", size: "lg" }) +
                " font-bold px-8 shadow-sm hover:shadow-md transition-all active:scale-95"
              }
              id={`apply-btn-${job.id}`}
              onClick={() =>
                trackJobApplied({
                  job_id: job.id,
                  job_title: job.title,
                  company_name: job.company,
                  match_score: job.matchPercentage,
                  is_remote: Boolean(job.isRemote),
                  job_rank: rank,
                })
              }
            >
              Apply
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
