import type { RoleMarket } from "@/lib/career/market";
import type { NextStep } from "@/lib/career/next-steps";
import type { CareerIntelligence, CareerSegment } from "@/types/career-profile";

export type ScoreSignal = {
  id: "segment" | "target" | "skill" | "pay";
  label: string;
  present: boolean;
  points: number;
};

export type ScoreBreakdown = {
  careerScore: number | null;
  readiness: number | null;
  completeness: number;
  weights: { readiness: number; completeness: number };
  signals: ScoreSignal[];
  basis: CareerIntelligence["basis"];
  analysisId: string | null;
};

export type IntelligenceReport = {
  segment: CareerSegment | null;
  score: ScoreBreakdown;
  market: {
    basis: "target_roles" | "all_jobs" | "none";
    roles: RoleMarket[];
  };
  nextSteps: NextStep[];
  coachEnabled: boolean;
};
