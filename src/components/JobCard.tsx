"use client";

import { useEffect, useRef } from "react";
import {
  MapPin,
  Building2,
  ExternalLink,
  Wifi,
  Clock,
  DollarSign,
} from "lucide-react";
import type { JobMatch } from "@/types";
import MatchRing from "./MatchRing";
import SkillBadge from "./SkillBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { trackJobCardImpression, trackJobApplied } from "@/lib/analytics";

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
      { threshold: 0.5 }, // Fire when ≥50% of the card is visible
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [job.id, job.title, job.company, job.matchPercentage, job.isRemote, rank]);

  const getRankStyles = (idx: number) => {
    if (idx === 0) return "bg-foreground text-background font-bold";
    if (idx <= 2)
      return "bg-muted text-foreground font-bold border-border border";
    return "bg-background text-muted-foreground font-semibold border-border border";
  };

  return (
    <Card
      ref={cardRef}
      className="animate-slide-up flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all hover:border-foreground/40 bg-card rounded-2xl overflow-hidden"
      style={{
        animationDelay: `${rank * 60}ms`,
        animationFillMode: "both",
      }}
      id={`job-card-${job.id}`}
    >
      <CardContent className="p-7 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex gap-5 items-start mb-6">
          {/* Rank badge */}
          <div
            className={`shrink-0 w-10 h-10 rounded-md flex items-center justify-center text-sm ${getRankStyles(rank)}`}
          >
            #{rank + 1}
          </div>

          {/* Title + company */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-xl font-black text-foreground mb-2 leading-tight truncate">
              {job.title}
            </h3>
            <div className="flex items-center gap-3 text-muted-foreground text-sm flex-wrap">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="font-semibold text-foreground">
                {job.company}
              </span>
              <span className="opacity-50">·</span>
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="font-medium truncate max-w-[200px]">
                {job.location}
              </span>
              {job.isRemote && (
                <>
                  <span className="opacity-50">·</span>
                  <Badge
                    variant="outline"
                    className="px-2 py-0.5 text-xs h-6 leading-none bg-muted text-foreground gap-1.5 rounded-sm uppercase tracking-wider font-bold"
                  >
                    <Wifi className="h-3 w-3" /> Remote
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Match ring */}
          <MatchRing
            percentage={job.matchPercentage}
            size={60}
            strokeWidth={5}
          />
        </div>

        {/* Meta row */}
        <div className="flex gap-4 mb-8 flex-wrap text-sm font-semibold">
          {job.salary && (
            <span className="flex items-center gap-2 text-foreground bg-muted/50 px-3 flex-col rounded-md py-2 border border-border flex-1 min-w-[120px]">
              <span className="uppercase text-[11px] text-muted-foreground font-bold tracking-widest leading-none">
                Salary
              </span>
              <span className="flex items-center">
                <DollarSign className="h-3.5 w-3.5" />
                {job.salary}
              </span>
            </span>
          )}
          {job.employmentType && (
            <span className="flex items-center gap-2 text-foreground bg-muted/50 px-3 flex-col rounded-md py-2 border border-border flex-1 min-w-[120px]">
              <span className="uppercase text-[11px] text-muted-foreground font-bold tracking-widest leading-none">
                Type
              </span>
              <span className="capitalize">
                {job.employmentType.replace("_", " ").toLowerCase()}
              </span>
            </span>
          )}
          {postedText && (
            <span className="flex items-center gap-2 text-foreground bg-muted/50 px-3 flex-col rounded-md py-2 border border-border flex-1 min-w-[120px]">
              <span className="uppercase text-[11px] text-muted-foreground font-bold tracking-widest leading-none">
                Posted
              </span>
              <span className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                {postedText}
              </span>
            </span>
          )}
        </div>

        {/* Skills */}
        <div className="mb-8 flex-1 space-y-4">
          {showMatched.length > 0 && (
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-xs font-bold text-foreground uppercase tracking-widest w-20">
                Matched
              </span>
              {showMatched.map((s) => (
                <SkillBadge key={s} skill={s} variant="matched" size="md" />
              ))}
              {job.matchedSkills.length > 5 && (
                <span className="text-xs text-muted-foreground font-bold pl-1 border-l border-border ml-1">
                  +{job.matchedSkills.length - 5}
                </span>
              )}
            </div>
          )}
          {showMissing.length > 0 && (
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest w-20">
                Missing
              </span>
              {showMissing.map((s) => (
                <SkillBadge key={s} skill={s} variant="missing" size="md" />
              ))}
              {job.missingSkills.length > 4 && (
                <span className="text-xs text-muted-foreground font-bold pl-1 border-l border-border ml-1">
                  +{job.missingSkills.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Apply button */}
        <div className="mt-auto pt-5 border-t border-border">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className={
              buttonVariants({ variant: "default", size: "lg" }) +
              " w-full font-bold text-base gap-2"
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
            Apply for this position
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
