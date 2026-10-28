"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Loader2 } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { formatCoachError } from "@/components/coach/format-coach-error";
import { TutorComposer } from "@/components/coach/tutor-composer";
import { TutorThread } from "@/components/coach/tutor-thread";
import {
  CoachMicButton,
  CoachSpeakerButton,
} from "@/components/coach/voice/coach-speech-controls";
import {
  micReasonForSpeechMode,
  useCoachSpeech,
} from "@/components/coach/voice/use-coach-speech";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { textFromUIMessage } from "@/services/coach/tutor-messages";

function assistantText(messages: UIMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role === "assistant") return textFromUIMessage(message);
  }
  return "";
}

function ScrollAffordance() {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();
  if (isAtBottom) return null;
  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      className="-translate-x-1/2 absolute bottom-2 left-1/2 z-10"
      onClick={() => void scrollToBottom()}
    >
      Latest
    </Button>
  );
}

export function TutorChatSession({
  planId,
  coachEnabled,
  liveEnabled,
  liveSlot,
}: {
  planId: string;
  coachEnabled: boolean;
  liveEnabled: boolean;
  liveSlot?: ReactNode;
}) {
  const [channel, setChannel] = useState<"chat" | "live">("chat");
  const [draft, setDraft] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const spokenId = useRef<string | null>(null);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/coach/plans/${planId}/ai/chat`,
      }),
    [planId],
  );
  const {
    messages,
    sendMessage,
    status,
    error,
    regenerate,
    stop,
    setMessages,
  } = useChat({
    id: `coach-${planId}`,
    transport,
  });
  const busy = status === "submitted" || status === "streaming";
  const speech = useCoachSpeech({
    onTranscript: (transcript) => {
      const text = transcript.trim();
      if (!text || busy || channel !== "chat") return;
      void sendMessage({ text });
    },
  });

  const speechRef = useRef(speech);
  speechRef.current = speech;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`/api/coach/plans/${planId}/ai/chat`);
        const body = (await response.json()) as {
          messages?: UIMessage[];
          error?: string;
        };
        if (!response.ok) {
          if (!cancelled) setLoadError(formatCoachError(body).message);
          return;
        }
        if (!cancelled && Array.isArray(body.messages))
          setMessages(body.messages);
      } catch {
        if (!cancelled) setLoadError("Could not load this tutor thread.");
      }
    })();
    return () => {
      cancelled = true;
      speechRef.current.stopSpeak();
      speechRef.current.stopListen();
    };
  }, [planId, setMessages]);

  useEffect(() => {
    if (status !== "ready" || channel !== "chat") return;
    const last = [...messages]
      .reverse()
      .find((message) => message.role === "assistant");
    if (!last || spokenId.current === last.id) return;
    const text = textFromUIMessage(last);
    if (!text) return;
    spokenId.current = last.id;
    speech.speak(text);
  }, [status, messages, channel, speech]);

  const lastAssistant = assistantText(messages);
  const micReason = micReasonForSpeechMode(speech.mode);
  const streamError = error
    ? formatCoachError({ error: error.message }).message
    : null;
  const streamingId =
    status === "streaming"
      ? [...messages].reverse().find((message) => message.role === "assistant")
          ?.id
      : null;

  if (channel === "live" && liveEnabled && liveSlot) {
    return (
      <Card className="flex min-h-[28rem] flex-col">
        <CardContent className="flex flex-1 flex-col gap-3">
          {liveSlot}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex min-h-[28rem] flex-col">
      <CardContent className="flex flex-1 flex-col gap-3">
        {liveEnabled && liveSlot ? (
          <fieldset
            aria-label="Tutor channel"
            className="flex gap-2 border-0 p-0"
          >
            <Button
              type="button"
              variant={channel === "chat" ? "default" : "secondary"}
              aria-pressed={channel === "chat"}
              data-slot="tutor-channel-chat"
              onClick={() => setChannel("chat")}
            >
              Chat
            </Button>
            <Button
              type="button"
              variant="secondary"
              aria-pressed={false}
              data-slot="tutor-channel-live"
              onClick={() => {
                speech.stopSpeak();
                speech.stopListen();
                setChannel("live");
              }}
            >
              Live
            </Button>
          </fieldset>
        ) : null}
        <StickToBottom
          className="relative min-h-0 flex-1 overflow-y-auto"
          resize="smooth"
        >
          <StickToBottom.Content>
            <TutorThread messages={messages} streamingMessageId={streamingId} />
          </StickToBottom.Content>
          <ScrollAffordance />
        </StickToBottom>
        {loadError || streamError ? (
          <div className="flex items-center gap-2">
            <p role="alert" className="text-destructive text-sm">
              {streamError ?? loadError}
            </p>
            {streamError ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => void regenerate()}
              >
                Retry
              </Button>
            ) : null}
          </div>
        ) : null}
        <TutorComposer
          value={draft}
          onChange={setDraft}
          onSend={() => {
            const text = draft.trim();
            if (!text || busy || !coachEnabled) return;
            setDraft("");
            void sendMessage({ text });
          }}
          busy={busy}
          showStop={busy}
          onStop={() => stop()}
          disabledReason={
            !coachEnabled ? "Coaching is paused right now." : undefined
          }
          notice={speech.notice ?? micReason}
          micSlot={
            <CoachMicButton
              listening={speech.listening}
              disabled={speech.mode === "text-only" || busy}
              disabledReason={micReason ?? undefined}
              onPress={() => {
                if (speech.listening) speech.stopListen();
                else void speech.startListen();
              }}
            />
          }
          speakerSlot={
            <CoachSpeakerButton
              disabled={
                speech.mode === "text-only" || lastAssistant.trim().length === 0
              }
              disabledReason={
                lastAssistant.trim() ? undefined : "No tutor reply to play yet."
              }
              onSpeak={() => speech.speak(lastAssistant)}
              onStop={speech.stopSpeak}
            />
          }
        />
        {busy ? <Loader2 className="sr-only animate-spin" /> : null}
      </CardContent>
    </Card>
  );
}
