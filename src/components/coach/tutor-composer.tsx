"use client";

import { Loader2 } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function TutorComposer({
  value,
  onChange,
  onSend,
  busy,
  disabledReason,
  micSlot,
  speakerSlot,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  busy: boolean;
  disabledReason?: string;
  /** Reserved for a later mic control. Unused by the dashboard for now. */
  micSlot?: ReactNode;
  /** Reserved for a later speaker control. Unused by the dashboard for now. */
  speakerSlot?: ReactNode;
}) {
  const blocked = busy || Boolean(disabledReason);
  const canSend = !blocked && value.trim().length > 0;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;
    onSend();
  }

  return (
    <form
      data-slot="tutor-composer"
      onSubmit={submit}
      className="flex flex-col gap-2"
    >
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Ask in English, Hindi, Hinglish, or another language you use."
        disabled={blocked}
        aria-label="Message the tutor"
        aria-describedby={disabledReason ? "tutor-composer-reason" : undefined}
      />
      <div className="flex items-center gap-2">
        {micSlot}
        <Button type="submit" disabled={!canSend}>
          {busy ? <Loader2 className="animate-spin" /> : null}
          Send
        </Button>
        {speakerSlot}
      </div>
      {disabledReason ? (
        <p id="tutor-composer-reason" className="text-muted-foreground text-sm">
          {disabledReason}
        </p>
      ) : null}
    </form>
  );
}
