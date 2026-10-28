import type { UIMessage } from "ai";
import { TutorMessageParts } from "@/components/coach/tutor-parts";

export function TutorThread({
  messages,
  streamingMessageId,
}: {
  messages: UIMessage[];
  streamingMessageId?: string | null;
}) {
  return (
    <div
      data-slot="tutor-thread"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      className="flex flex-col gap-3"
    >
      {messages.length === 0 ? (
        <p className="text-muted-foreground text-sm">The tutor replies here.</p>
      ) : (
        <ol className="flex list-none flex-col gap-3 p-0">
          {messages.map((message) => (
            <li key={message.id}>
              <span className="sr-only">
                {message.role === "user" ? "You" : "Tutor"}
              </span>
              <TutorMessageParts
                message={message}
                isLastMessage={message.id === streamingMessageId}
                isStreaming={message.id === streamingMessageId}
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
