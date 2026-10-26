import { cn } from "@/lib/utils";

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

export function TutorThread({ messages }: { messages: TutorMessage[] }) {
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
          {messages.map((message, index) => (
            <li
              key={`${message.role}-${index}`}
              data-role={message.role}
              className={cn(
                "max-w-[85%] whitespace-pre-wrap break-words rounded-lg px-3 py-2 text-sm leading-relaxed",
                message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "mr-auto bg-muted text-foreground",
              )}
            >
              <span className="sr-only">
                {message.role === "user" ? "You" : "Tutor"}
              </span>
              {message.content}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
