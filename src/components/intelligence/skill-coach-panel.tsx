"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { IntelligenceReport } from "@/types/intelligence";

export function SkillCoachPanel() {
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/intelligence")
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as {
          report?: IntelligenceReport;
          error?: string;
        };
        if (cancelled) return;
        if (!response.ok || !body.report) {
          throw new Error(body.error || "Could not load Skill Coach");
        }
        setReport(body.report);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load Skill Coach",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="font-medium text-muted-foreground">{error}</p>;
  }
  if (!report) {
    return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
  }
  if (!report.coachEnabled) {
    return (
      <div className="space-y-3">
        <p className="font-medium text-muted-foreground">
          Skill Coach is switched off. The Intelligence page still lists the
          gaps and sends you to Resume Builder.
        </p>
        <Button variant="outline" render={<Link href="/intelligence" />}>
          Back to Intelligence
        </Button>
      </div>
    );
  }

  const gaps = report.market.roles.flatMap((role) =>
    role.skills
      .filter((skill) => !skill.onProfile)
      .map((skill) => ({ ...skill, role: role.title })),
  );

  return (
    <div className="space-y-4">
      <p className="max-w-2xl font-medium text-muted-foreground">
        Plans are the gaps between your career file and the roles in your latest
        analysis. The tutor, graded practice, and mock interviews ship with
        Skill Coach. This page is the handoff.
      </p>
      {gaps.length === 0 ? (
        <p className="font-medium">
          No missing skills in the current analysis.
        </p>
      ) : (
        <ul className="space-y-2">
          {gaps.map((gap) => (
            <li
              key={`${gap.role}-${gap.name}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-4 py-3"
            >
              <span className="font-bold">{gap.name}</span>
              <span className="font-medium text-muted-foreground text-sm">
                {gap.role} · {gap.priority}
              </span>
            </li>
          ))}
        </ul>
      )}
      <Button variant="outline" render={<Link href="/intelligence" />}>
        Back to Intelligence
      </Button>
    </div>
  );
}
