"use client";

import { useState } from "react";
import type { SkillGap, ParsedResume } from "@/types";
import SkillBadge from "./SkillBadge";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SkillGapPanelProps {
  resume: ParsedResume;
  skillGaps: SkillGap[];
  totalJobs: number;
}

function PriorityDot({ priority }: { priority: SkillGap["priority"] }) {
  const colorMap = {
    high: "bg-foreground",
    medium: "bg-muted-foreground",
    low: "bg-border",
  };
  return (
    <span
      className={`w-2 h-2 rounded shrink-0 inline-block ${colorMap[priority]}`}
    />
  );
}

export default function SkillGapPanel({
  resume,
  skillGaps,
  totalJobs,
}: SkillGapPanelProps) {
  const [showAllMissing, setShowAllMissing] = useState(false);
  const [showAllHave, setShowAllHave] = useState(false);

  const highPriority = skillGaps.filter((g) => g.priority === "high");
  const mediumPriority = skillGaps.filter((g) => g.priority === "medium");
  const lowPriority = skillGaps.filter((g) => g.priority === "low");

  const LIMIT = 12;
  const displayedGaps = showAllMissing ? skillGaps : skillGaps.slice(0, LIMIT);
  const displayedHave = showAllHave
    ? resume.skills
    : resume.skills.slice(0, LIMIT);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* LEFT: Skills You Have */}
      <Card className="rounded-xl overflow-hidden shadow-sm border-border">
        <CardContent className="p-6 flex flex-col h-full bg-card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="w-8 h-8 rounded shrink-0 bg-muted/50 flex items-center justify-center border border-border">
              <CheckCircle2 className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Skills You Have
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {resume.skills.length} skills detected
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4 flex-1 content-start">
            {displayedHave.map((skill) => (
              <SkillBadge
                key={skill}
                skill={skill}
                variant="matched"
                size="sm"
              />
            ))}
          </div>

          {resume.skills.length > LIMIT && (
            <Button
              variant="outline"
              size="sm"
              id="toggle-have-skills-btn"
              onClick={() => setShowAllHave(!showAllHave)}
              className="text-xs h-8 w-full mt-auto font-medium"
            >
              {showAllHave ? (
                <>
                  <ChevronUp className="mr-1.5 h-3.5 w-3.5" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1.5 h-3.5 w-3.5" /> +
                  {resume.skills.length - LIMIT} more
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* RIGHT: Skills You're Missing */}
      <Card className="rounded-xl overflow-hidden shadow-sm border-border">
        <CardContent className="p-6 flex flex-col h-full bg-card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="w-8 h-8 rounded shrink-0 bg-muted/50 flex items-center justify-center border border-border">
              <AlertCircle className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Skills to Learn
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {skillGaps.length} gaps across {totalJobs} jobs
              </p>
            </div>
          </div>

          {/* Priority breakdown */}
          <div className="flex-1 space-y-5">
            {highPriority.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <PriorityDot priority="high" /> High priority
                </p>
                <div className="flex flex-wrap gap-2">
                  {displayedGaps
                    .filter((g) => g.priority === "high")
                    .map((g) => (
                      <span
                        key={g.skill}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border border-foreground bg-foreground text-background"
                      >
                        {g.skill}
                        <span className="opacity-70 text-[10px] pl-1 font-medium border-l border-background/20">
                          {g.frequency}
                        </span>
                      </span>
                    ))}
                </div>
              </div>
            )}

            {mediumPriority.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <PriorityDot priority="medium" /> Medium priority
                </p>
                <div className="flex flex-wrap gap-2">
                  {displayedGaps
                    .filter((g) => g.priority === "medium")
                    .map((g) => (
                      <span
                        key={g.skill}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border border-border bg-muted text-foreground"
                      >
                        {g.skill}
                        <span className="opacity-60 text-[10px] pl-1 font-medium border-l border-border">
                          {g.frequency}
                        </span>
                      </span>
                    ))}
                </div>
              </div>
            )}

            {lowPriority.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <PriorityDot priority="low" /> Nice to have
                </p>
                <div className="flex flex-wrap gap-2">
                  {displayedGaps
                    .filter((g) => g.priority === "low")
                    .map((g) => (
                      <span
                        key={g.skill}
                        className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-semibold border border-transparent bg-muted/50 text-muted-foreground"
                      >
                        {g.skill}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          {highPriority.length > 0 && (
            <div className="flex items-start gap-2.5 mt-6 p-3 bg-muted rounded border border-border text-xs text-foreground font-medium">
              <TrendingUp className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
              <span className="leading-relaxed">
                Focus on high-priority skills first — these appear most
                frequently across all sampled job listings for your target
                roles.
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
