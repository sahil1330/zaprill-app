"use client";

import { Mic, Square, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CoachMicButton({
  listening,
  disabled,
  disabledReason,
  describedBy,
  onPress,
}: {
  listening: boolean;
  disabled: boolean;
  disabledReason?: string;
  describedBy?: string;
  onPress: () => void;
}) {
  const label = listening ? "Stop voice input" : "Start voice input";
  return (
    <span title={disabledReason} data-slot="tutor-mic" className="inline-flex">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={disabledReason ? `${label}. ${disabledReason}` : label}
        aria-pressed={listening}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={onPress}
      >
        {listening ? <Square /> : <Mic />}
      </Button>
    </span>
  );
}

export function CoachSpeakerButton({
  disabled,
  disabledReason,
  onSpeak,
  onStop,
}: {
  disabled: boolean;
  disabledReason?: string;
  onSpeak: () => void | Promise<void>;
  onStop: () => void;
}) {
  const [speaking, setSpeaking] = useState(false);
  const label = speaking ? "Stop speaking" : "Play the tutor reply";
  return (
    <span
      title={disabledReason}
      data-slot="tutor-speaker"
      className="inline-flex"
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={disabledReason ? `${label}. ${disabledReason}` : label}
        aria-pressed={speaking}
        disabled={disabled}
        onClick={() => {
          if (speaking) {
            onStop();
            setSpeaking(false);
            return;
          }
          setSpeaking(true);
          void Promise.resolve(onSpeak()).finally(() => setSpeaking(false));
        }}
      >
        {speaking ? <VolumeX /> : <Volume2 />}
      </Button>
    </span>
  );
}
