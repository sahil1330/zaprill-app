"use client";

export interface ProgramRailPlan {
  id: string;
  displayName: string;
  priority: string;
  status: string;
  progress: { state: string };
}

export interface ProgramRailProgram {
  id: string;
  roleTitle: string;
  plans: ProgramRailPlan[];
}

export function ProgramRail({
  programs,
  planId,
  onSelectPlan,
}: {
  programs: ProgramRailProgram[];
  planId: string | null;
  onSelectPlan: (planId: string) => void;
}) {
  return (
    <div data-slot="program-rail" className="flex flex-col gap-3">
      {programs.map((program) => {
        const plans = program.plans.filter(
          (plan) => plan.status !== "archived",
        );
        return (
          <section
            key={program.id}
            className="rounded-lg bg-card px-3 py-3 shadow-md ring-1 ring-foreground/5"
          >
            <h2 className="px-1 font-heading font-medium text-sm">
              {program.roleTitle}
            </h2>
            <div className="mt-2 flex flex-col gap-1.5">
              {plans.map((plan) => {
                const selected = plan.id === planId;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSelectPlan(plan.id)}
                    className={`rounded-lg px-3 py-2 text-left text-sm ${
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-muted/70"
                    }`}
                  >
                    <span className="block font-medium">
                      {plan.displayName}
                    </span>
                    <span className="block text-xs opacity-80">
                      {plan.priority} ·{" "}
                      {plan.progress.state.replaceAll("_", " ")}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
