"use client";

import type { AnalysisStep } from "@/types";
import { CheckCircle, Loader, Circle } from "lucide-react";

interface Step {
  key: AnalysisStep;
  label: string;
  description: string;
}

const STEPS: Step[] = [
  {
    key: "parsing",
    label: "Parsing Resume",
    description: "Gemini AI extracts your skills & experience",
  },
  {
    key: "reviewing",
    label: "Reviewing Data",
    description: "Customize your search profile & titles",
  },
  {
    key: "searching",
    label: "Searching Jobs",
    description: "Scanning thousands of real job listings",
  },
  {
    key: "analyzing",
    label: "Analyzing Gaps",
    description: "Computing match scores & building roadmap",
  },
  {
    key: "done",
    label: "Done!",
    description: "Your personalized career report is ready",
  },
];

const STEP_ORDER: AnalysisStep[] = [
  "idle",
  "uploading",
  "parsing",
  "reviewing",
  "searching",
  "analyzing",
  "done",
];

function stepIndex(step: AnalysisStep): number {
  return STEP_ORDER.indexOf(step);
}

interface ProgressTimelineProps {
  currentStep: AnalysisStep;
}

export default function ProgressTimeline({
  currentStep,
}: ProgressTimelineProps) {
  const currentIdx = stepIndex(currentStep);

  return (
    <div className="flex flex-col">
      {STEPS.map((step, idx) => {
        const stepIdx = stepIndex(step.key);
        const isCompleted = currentIdx > stepIdx;
        const isActive = currentIdx === stepIdx;

        return (
          <div key={step.key} className="flex flex-col">
            <div className="flex items-center gap-3.5">
              {/* Icon */}
              <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border transition-all duration-400 ease-in-out
                  ${
                    isCompleted
                      ? "bg-foreground border-foreground text-background"
                      : isActive
                        ? "bg-muted border-foreground/30 text-foreground"
                        : "bg-background border-border text-muted-foreground"
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4" />
                ) : isActive ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>

              {/* Label */}
              <div>
                <p
                  className={`text-sm mb-0.5 transition-colors duration-300
                    ${
                      isCompleted
                        ? "text-foreground font-semibold"
                        : isActive
                          ? "text-foreground font-bold"
                          : "text-muted-foreground font-medium"
                    }
                  `}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground leading-snug">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div
                className={`w-[1px] h-7 ml-[15px] my-1 transition-colors duration-500 ease-in-out
                  ${
                    isCompleted
                      ? "bg-foreground"
                      : "bg-border"
                  }
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
