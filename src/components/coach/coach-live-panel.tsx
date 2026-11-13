"use client";

import { Loader2 } from "lucide-react";
import type { LivePhase } from "@/components/coach/live-phase";
import { Button } from "@/components/ui/button";

const COPY: Record<LivePhase, string> = {
  idle: "Live is off.",
  connecting: "Connecting",
  listening: "Listening",
  speaking: "Speaking",
  tool: "Running a tool",
  error: "Live stopped.",
};

export function CoachLivePanel({
  phase,
  error,
  onLeave,
}: {
  phase: LivePhase;
  error: string | null;
  onLeave: () => void;
}) {
  return (
    <div data-slot="coach-live-panel" className="flex flex-1 flex-col gap-3">
      <p className="text-foreground text-sm">
        {phase === "connecting" || phase === "tool" ? (
          <Loader2 className="mr-2 inline size-3 animate-spin" aria-hidden />
        ) : null}
        {error ?? COPY[phase]}
      </p>
      <Button type="button" variant="secondary" onClick={onLeave}>
        Leave Live
      </Button>
    </div>
  );
}
