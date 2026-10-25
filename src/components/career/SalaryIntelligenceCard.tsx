"use client";

import {
  BarChart2,
  CheckCircle2,
  IndianRupee,
  Loader2,
  Minus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SalaryBlocker {
  skill: string;
  priority: "high" | "medium" | "low";
  category: string;
  why: string;
  salaryImpact: number;
}

export interface SalaryIntelligence {
  marketAverage: number;
  potential: number;
  currentSalary: number | null;
  gap: number | null;
  potentialGap: number | null;
  jobsWithSalaryData: number;
  totalJobsAnalyzed: number;
  blockers: SalaryBlocker[];
  userSkills: string[];
  inferredRole: string | null;
  location: string | null;
  analysisDate: string;
}

interface Props {
  data: SalaryIntelligence;
  onSalaryUpdate: (newSalary: number | null) => void;
}

function formatInr(amount: number): string {
  if (amount >= 10_000_000) {
    return `₹${(amount / 10_000_000).toFixed(1)}Cr`;
  }
  if (amount >= 100_000) {
    const lakh = amount / 100_000;
    return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatInrLong(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function SalaryIntelligenceCard({
  data,
  onSalaryUpdate,
}: Props) {
  const [editing, setEditing] = useState(!data.currentSalary);
  const [inputValue, setInputValue] = useState(
    data.currentSalary ? String(data.currentSalary) : "",
  );
  const [saving, setSaving] = useState(false);

  const hasCurrentSalary = data.currentSalary != null && data.currentSalary > 0;

  const handleSave = async () => {
    const parsed = parseInt(inputValue.replace(/[^0-9]/g, ""), 10);
    if (!parsed || parsed <= 0) {
      toast.error("Please enter a valid annual salary in INR.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentSalary: parsed }),
      });
      if (!res.ok) throw new Error("Failed to save");
      onSalaryUpdate(parsed);
      setEditing(false);
      toast.success("Current salary saved.");
    } catch {
      toast.error("Could not save salary. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const gap = hasCurrentSalary
    ? data.marketAverage - data.currentSalary!
    : null;
  const potentialGap = hasCurrentSalary
    ? data.potential - data.currentSalary!
    : null;

  const rows = [
    {
      label: "Current salary",
      value: hasCurrentSalary ? formatInrLong(data.currentSalary!) : null,
      muted: true,
    },
    {
      label: "Market average",
      value: formatInrLong(data.marketAverage),
      muted: false,
    },
    {
      label: "Your potential",
      value: formatInrLong(data.potential),
      bold: true,
    },
  ];

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm">
      <CardHeader className="border-border/30 border-b bg-muted/30 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mb-0.5 font-black text-[10px] text-muted-foreground uppercase tracking-widest">
              System Output
            </p>
            <CardTitle className="font-black text-xl leading-tight">
              {data.inferredRole ?? "Your Role"}
            </CardTitle>
            {data.location && (
              <p className="mt-0.5 font-semibold text-muted-foreground text-sm">
                Based in {data.location}
              </p>
            )}
          </div>
          <div className="flex h-8 items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 dark:border-green-800 dark:bg-green-900/20">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            <span className="font-black text-[10px] text-green-700 uppercase tracking-wider dark:text-green-400">
              Live
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-0 p-0">
        {/* ── Salary rows ── */}
        <div className="divide-y divide-border/30">
          {/* Current salary row with inline edit */}
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="font-semibold text-muted-foreground text-sm">
              Current salary
            </span>
            {editing ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <IndianRupee className="-translate-y-1/2 absolute top-1/2 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 1200000"
                    value={inputValue}
                    onChange={(e) =>
                      setInputValue(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    className="h-8 w-36 pl-7 font-bold text-sm"
                    autoFocus
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="h-8 px-3 font-bold text-xs"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="group flex items-center gap-1.5 transition-opacity hover:opacity-70"
                title="Click to update"
              >
                <span className="font-semibold text-foreground text-sm">
                  {hasCurrentSalary ? formatInrLong(data.currentSalary!) : "—"}
                </span>
                {hasCurrentSalary && (
                  <span className="font-bold text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    edit
                  </span>
                )}
                {!hasCurrentSalary && (
                  <span className="rounded border border-primary/40 border-dashed px-1.5 py-0.5 font-bold text-[10px] text-primary">
                    Set salary
                  </span>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="font-semibold text-muted-foreground text-sm">
              Market average
            </span>
            <span className="font-semibold text-foreground text-sm">
              {formatInrLong(data.marketAverage)}
            </span>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="font-semibold text-muted-foreground text-sm">
              Your potential
            </span>
            <span className="font-black text-foreground text-sm">
              {formatInrLong(data.potential)}
            </span>
          </div>
        </div>

        {/* ── Gap identified ── */}
        {gap !== null && gap !== 0 && (
          <div className="border-border/30 border-t bg-muted/20 px-5 py-3.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm">Gap identified</span>
              <span
                className={cn(
                  "font-black text-sm",
                  gap > 0
                    ? "text-primary"
                    : "text-green-600 dark:text-green-400",
                )}
              >
                {gap > 0 ? "+" : ""}
                {formatInr(gap)} / yr
              </span>
            </div>
            {potentialGap !== null && potentialGap > gap && (
              <p className="mt-1 font-semibold text-muted-foreground text-xs">
                Up to {formatInr(potentialGap)} / yr with skill upgrades
              </p>
            )}
          </div>
        )}

        {/* ── Skill check ── */}
        {(data.blockers.length > 0 || data.userSkills.length > 0) && (
          <div className="border-border/30 border-t px-5 py-4">
            <p className="mb-3 flex items-center gap-1.5 font-black text-[10px] text-muted-foreground uppercase tracking-widest">
              <BarChart2 className="h-3.5 w-3.5" />
              Skill Check
            </p>

            <div className="space-y-2.5">
              {/* Strong skills (sample from user's skills) */}
              {data.userSkills.slice(0, 2).map((skill) => (
                <div key={skill} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <div>
                    <p className="font-black text-sm leading-tight">{skill}</p>
                    <p className="font-semibold text-muted-foreground text-xs">
                      Strong
                    </p>
                  </div>
                </div>
              ))}

              {/* Blockers */}
              {data.blockers.map((blocker) => (
                <div key={blocker.skill} className="flex items-start gap-3">
                  <Minus className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-sm leading-tight">
                        {blocker.skill}
                      </p>
                      <Badge
                        className="rounded border-none px-1.5 py-0 font-black text-[9px] uppercase tracking-wider"
                        style={{
                          background:
                            blocker.priority === "high"
                              ? "oklch(0.97 0.02 30)"
                              : "oklch(0.97 0.02 60)",
                          color:
                            blocker.priority === "high"
                              ? "oklch(0.5 0.2 30)"
                              : "oklch(0.5 0.2 60)",
                        }}
                      >
                        {blocker.priority}
                      </Badge>
                    </div>
                    <p className="font-semibold text-muted-foreground text-xs leading-snug">
                      {blocker.why}
                      {blocker.salaryImpact > 0 && (
                        <>
                          {" "}
                          Blocking{" "}
                          <span className="font-black text-foreground">
                            {formatInr(blocker.salaryImpact)}+
                          </span>{" "}
                          in salary.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="border-border/30 border-t px-5 py-3">
          <p className="font-semibold text-[10px] text-muted-foreground">
            Based on {data.jobsWithSalaryData} of {data.totalJobsAnalyzed}{" "}
            matched jobs with salary data
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
