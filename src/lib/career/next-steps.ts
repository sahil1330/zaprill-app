import type { CareerSegment } from "@/types/career-profile";

export type NextStepAction = "resume" | "analyze" | "coach" | "profile" | "pay";

export type NextStep = {
  id: string;
  title: string;
  detail: string;
  href: string;
  action: NextStepAction;
};

export function recommendNextSteps(input: {
  segment: CareerSegment | null;
  skillCount: number;
  targetCount: number;
  hasPay: boolean;
  hasAnalysis: boolean;
  hasResume: boolean;
  coachEnabled: boolean;
  topGap: { skill: string; priority: "high" | "medium" | "low" } | null;
}): NextStep[] {
  const steps: NextStep[] = [];
  const push = (step: NextStep) => {
    if (steps.length >= 4) return;
    if (steps.some((item) => item.id === step.id)) return;
    steps.push(step);
  };

  if (input.skillCount === 0) {
    push({
      id: "resume",
      title: "Add your resume",
      detail:
        "Skills, experience, and target roles are read from the resume you sync.",
      href: input.hasResume ? "/resumes" : "/onboarding",
      action: "resume",
    });
  }

  if (input.targetCount === 0) {
    push({
      id: "target",
      title: "Name a target role",
      detail:
        "Save a target on your resume. Intelligence uses it the next time you sync.",
      href: "/resumes",
      action: "resume",
    });
  }

  if (!input.hasAnalysis) {
    push({
      id: "analyze",
      title: "Run an analysis",
      detail:
        "Market pay, readiness, and skill gaps use the jobs from your latest analysis.",
      href: "/analyze",
      action: "analyze",
    });
  }

  if (input.topGap) {
    push({
      id: "resume-gap",
      title: `Show ${input.topGap.skill} on your resume`,
      detail:
        "Roles in your analysis ask for this, and it is not on your career file.",
      href: "/resumes",
      action: "resume",
    });
    if (input.coachEnabled) {
      push({
        id: "coach",
        title: `Practice ${input.topGap.skill}`,
        detail: "Skill Coach opens a plan from this gap.",
        href: "/skill-coach",
        action: "coach",
      });
    }
  }

  if (!input.hasPay) {
    push({
      id: "pay",
      title: "Set expected pay",
      detail:
        "A minimum and maximum count toward your score and sit next to the market band.",
      href: "/intelligence#pay",
      action: "pay",
    });
  }

  if (input.segment == null) {
    push({
      id: "segment",
      title: "Choose your path",
      detail: "Student, fresher, or professional. You can change it later.",
      href: "/intelligence#path",
      action: "profile",
    });
  }

  return steps;
}
