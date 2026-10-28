"use client";

import { isToolUIPart, type UIMessage } from "ai";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { type ComponentType, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type AssistantMarkdownProps = {
  children: string;
  isAnimating?: boolean;
  mode?: "static" | "streaming";
};

function loadStreamdown(): Promise<ComponentType<AssistantMarkdownProps>> {
  return import("streamdown").then(
    (mod) => mod.Streamdown as ComponentType<AssistantMarkdownProps>,
  );
}

function AssistantMarkdown({
  text,
  streaming,
}: {
  text: string;
  streaming: boolean;
}) {
  const [Renderer, setRenderer] =
    useState<ComponentType<AssistantMarkdownProps> | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadStreamdown().then((component) => {
      if (!cancelled) setRenderer(() => component);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!Renderer) {
    return <p className="whitespace-pre-wrap">{text}</p>;
  }

  return (
    <Renderer isAnimating={streaming} mode={streaming ? "streaming" : "static"}>
      {text}
    </Renderer>
  );
}

export const COACH_TOOL_LABELS: Record<
  string,
  { pending: string; done: string }
> = {
  getLearningContext: {
    pending: "Reading your plan",
    done: "Read your plan",
  },
  listCuratedResources: {
    pending: "Looking up resources",
    done: "Listed resources",
  },
  getProgress: {
    pending: "Checking progress",
    done: "Checked progress",
  },
  setModuleStatus: {
    pending: "Updating the module",
    done: "Updated the module",
  },
};

function toolLabel(name: string, state: "pending" | "done" | "error"): string {
  const known = COACH_TOOL_LABELS[name];
  if (state === "done") return known?.done ?? name;
  if (state === "error") return `Could not complete: ${known?.pending ?? name}`;
  return known?.pending ?? name;
}

export function TutorMessageParts({
  message,
  isLastMessage,
  isStreaming,
}: {
  message: UIMessage;
  isLastMessage: boolean;
  isStreaming: boolean;
}) {
  const isUser = message.role === "user";
  const lastPart = message.parts.at(-1);
  const reasoning = message.parts
    .filter((part) => part.type === "reasoning" && "text" in part)
    .map((part) => ("text" in part ? part.text : ""))
    .join("\n\n");
  const reasoningStreaming =
    isLastMessage && isStreaming && lastPart?.type === "reasoning";

  return (
    <div
      data-role={message.role}
      className={cn(
        "max-w-[85%] break-words text-sm leading-relaxed",
        isUser
          ? "ml-auto whitespace-pre-wrap rounded-lg bg-primary px-3 py-2 text-primary-foreground"
          : "mr-auto text-foreground",
      )}
    >
      {!isUser && (reasoning || reasoningStreaming) ? (
        <ReasoningBlock text={reasoning} streaming={reasoningStreaming} />
      ) : null}
      {message.parts.map((part, index) => {
        if (part.type === "reasoning") return null;
        if (part.type === "text" && "text" in part) {
          if (isUser) {
            return <span key={`${message.id}-text-${index}`}>{part.text}</span>;
          }
          const streamingThis =
            isLastMessage &&
            isStreaming &&
            lastPart?.type === "text" &&
            index === message.parts.length - 1;
          return (
            <div
              key={`${message.id}-text-${index}`}
              className="rounded-lg bg-muted px-3 py-2 [&_p:first-child]:mt-0 [&_p]:my-1.5"
            >
              <AssistantMarkdown text={part.text} streaming={streamingThis} />
            </div>
          );
        }
        if (!isToolUIPart(part)) return null;
        const name = part.type.replace(/^tool-/, "");
        const pending =
          part.state === "input-streaming" || part.state === "input-available";
        const failed = part.state === "output-error";
        const state = pending ? "pending" : failed ? "error" : "done";
        return (
          <div
            key={`${message.id}-tool-${index}`}
            data-slot="tutor-tool"
            data-tool={name}
            data-state={state}
            className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2 py-0.5 font-medium text-[11px] text-muted-foreground"
          >
            {pending ? (
              <Loader2 className="size-3 animate-spin" aria-hidden />
            ) : state === "done" ? (
              <Check className="size-3" aria-hidden />
            ) : null}
            {toolLabel(name, state)}
          </div>
        );
      })}
    </div>
  );
}

function ReasoningBlock({
  text,
  streaming,
}: {
  text: string;
  streaming: boolean;
}) {
  const [open, setOpen] = useState(streaming);
  const wasStreaming = useRef(streaming);

  useEffect(() => {
    if (streaming) {
      setOpen(true);
      wasStreaming.current = true;
      return;
    }
    if (wasStreaming.current) setOpen(false);
    wasStreaming.current = false;
  }, [streaming]);

  if (!text && !streaming) return null;
  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-1.5 font-medium text-[11px] text-muted-foreground"
      >
        {streaming ? (
          <Loader2 className="size-3 animate-spin" aria-hidden />
        ) : (
          <Check className="size-3" aria-hidden />
        )}
        {streaming ? "Thinking" : "Thought"}
        <ChevronDown
          className={cn("size-3", open ? "rotate-0" : "-rotate-90")}
        />
      </button>
      {text ? (
        <p
          hidden={!open}
          className="mt-1 border-border border-l pl-2 text-[11px] text-muted-foreground"
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}
