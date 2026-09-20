"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart } from "ai";
import {
  ArrowUp,
  ChevronDown,
  Loader2,
  PenLine,
  Square,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Streamdown } from "streamdown";
import { StickToBottom } from "use-stick-to-bottom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ResumeArchitectUIMessage } from "@/lib/agents/resume-architect";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { ResumeArchitectSnapshot } from "@/services/resume/architect.service";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";

const TOOL_LABELS: Record<string, string> = {
  getResume: "Reading resume",
  updateProfile: "Updating profile",
  upsertEntry: "Updating section",
  removeEntry: "Removing entry",
  setDesign: "Updating design",
};

function isSnapshot(value: unknown): value is ResumeArchitectSnapshot {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.version === "number" &&
    typeof record.data === "object" &&
    record.data !== null &&
    typeof record.metadata === "object" &&
    record.metadata !== null
  );
}

function userInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "You";
  const parts = source.split(/[\s@]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "Y") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function AgentMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_1px_0_rgba(255,255,255,0.25)_inset]",
        className,
      )}
      aria-hidden
    >
      <PenLine className="size-3.5" strokeWidth={2.25} />
    </div>
  );
}

function ReasoningBlock({
  text,
  streaming,
}: {
  text: string;
  streaming?: boolean;
}) {
  const [open, setOpen] = useState(streaming);
  useEffect(() => {
    if (streaming) setOpen(true);
  }, [streaming]);

  if (!text && !streaming) return null;

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 font-medium text-[11px] text-muted-foreground uppercase tracking-wide"
      >
        <Loader2 className={cn("size-3", streaming && "animate-spin")} />
        Thinking
        <ChevronDown
          className={cn(
            "size-3 transition-transform",
            open ? "rotate-0" : "-rotate-90",
          )}
        />
      </button>
      {open && text ? (
        <pre className="mt-1.5 max-h-32 overflow-y-auto whitespace-pre-wrap border-border/70 border-l pl-2.5 text-[11px] text-muted-foreground leading-relaxed">
          {text}
        </pre>
      ) : null}
    </div>
  );
}

function MessageParts({
  message,
  userName,
  userImage,
  userEmail,
}: {
  message: ResumeArchitectUIMessage;
  userName?: string | null;
  userImage?: string | null;
  userEmail?: string | null;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "grid w-full min-w-0 max-w-full items-start gap-2",
        isUser
          ? "grid-cols-[minmax(0,1fr)_auto]"
          : "grid-cols-[auto_minmax(0,1fr)]",
      )}
    >
      {isUser ? null : (
        <AgentMark className="mt-0.5 size-7 shrink-0 rounded-md" />
      )}
      <div
        className={cn(
          "min-w-0 max-w-full space-y-1.5 overflow-hidden",
          isUser && "flex flex-col items-end",
        )}
      >
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            if (isUser) {
              return (
                <div
                  key={`${message.id}-text-${index}`}
                  className="max-w-full whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-left text-primary-foreground text-sm leading-relaxed"
                >
                  {part.text}
                </div>
              );
            }
            return (
              <div
                key={`${message.id}-text-${index}`}
                className="max-w-full overflow-hidden text-foreground text-sm leading-relaxed [&_p:first-child]:mt-0 [&_p]:my-1.5 [&_pre]:max-w-full [&_pre]:overflow-x-auto"
              >
                <Streamdown>{part.text}</Streamdown>
              </div>
            );
          }

          if (part.type === "reasoning") {
            return (
              <ReasoningBlock
                key={`${message.id}-reason-${index}`}
                text={part.text}
                streaming={part.state === "streaming"}
              />
            );
          }

          if (isToolUIPart(part)) {
            const toolName = part.type.replace("tool-", "");
            const label = TOOL_LABELS[toolName] ?? toolName;
            const pending =
              part.state === "input-streaming" ||
              part.state === "input-available";
            const failed = part.state === "output-error";
            return (
              <div
                key={`${message.id}-tool-${index}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2 py-0.5 font-medium text-[11px] text-muted-foreground"
              >
                {pending ? <Loader2 className="size-3 animate-spin" /> : null}
                {failed ? "Could not complete: " : null}
                {label}
              </div>
            );
          }

          return null;
        })}
      </div>
      {isUser ? (
        <Avatar size="sm" className="mt-0.5 shrink-0">
          {userImage ? <AvatarImage src={userImage} alt="" /> : null}
          <AvatarFallback>{userInitials(userName, userEmail)}</AvatarFallback>
        </Avatar>
      ) : null}
    </div>
  );
}

function ArchitectSession({
  resumeId,
  initialMessages,
  onFlushPendingSave,
  startOpen,
}: {
  resumeId: string;
  initialMessages: ResumeArchitectUIMessage[];
  onFlushPendingSave?: () => Promise<void>;
  startOpen: boolean;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const currentVersion = useSelector((s: RootState) => s.resume.version);
  const { data: session } = useSession();
  const user = session?.user;
  const [open, setOpen] = useState(startOpen);
  const [input, setInput] = useState("");
  const appliedVersions = useRef(new Set<number>());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/resumes/${resumeId}/ai/chat`,
      }),
    [resumeId],
  );

  const { messages, sendMessage, status, error, regenerate, stop } =
    useChat<ResumeArchitectUIMessage>({
      id: resumeId,
      messages: initialMessages,
      transport,
    });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    for (const message of messages) {
      if (message.role !== "assistant") continue;
      for (const part of message.parts) {
        if (!isToolUIPart(part) || part.state !== "output-available") continue;
        if (!isSnapshot(part.output)) continue;
        if (part.output.version < currentVersion) continue;
        if (appliedVersions.current.has(part.output.version)) continue;
        appliedVersions.current.add(part.output.version);
        dispatch(
          resumeActions.applyAgentSnapshot({
            data: part.output.data,
            metadata: part.output.metadata,
            templateSlug: part.output.templateSlug,
            title: part.output.title,
            targetRole: part.output.targetRole,
            version: part.output.version,
          }),
        );
      }
    }
  }, [messages, currentVersion, dispatch]);

  const submit = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;
    setOpen(true);
    setInput("");
    try {
      await onFlushPendingSave?.();
    } catch {
      // Autosave may reject on validation; still send the chat turn.
    }
    await sendMessage({ text });
  }, [input, busy, onFlushPendingSave, sendMessage]);

  useEffect(() => {
    void input;
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 120)}px`;
  }, [input]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-4 sm:px-6">
      <div
        className={cn(
          "pointer-events-auto relative isolate flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-background/95 shadow-[0_-18px_48px_-20px_oklch(0.141_0.005_286_/_0.38)] backdrop-blur-md",
          "before:absolute before:inset-x-8 before:top-0 before:z-10 before:h-0.5 before:rounded-full before:bg-primary before:content-['']",
        )}
      >
        {open ? (
          <div className="flex max-h-[min(56vh,32rem)] min-h-0 flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-border/80 border-b px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <AgentMark />
                <div className="min-w-0">
                  <p className="font-heading font-semibold text-sm tracking-tight">
                    Resume Architect
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    Edits land on the page as you talk
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground"
                onClick={() => setOpen(false)}
                aria-label="Close architect"
                disabled={busy}
              >
                <X className="size-4" />
              </Button>
            </div>

            <StickToBottom
              className="relative h-[min(42vh,24rem)] min-h-0 w-full min-w-0 overflow-hidden"
              resize="smooth"
              initial="smooth"
            >
              <StickToBottom.Content
                className="flex w-full min-w-0 max-w-full flex-col gap-4 px-3 py-3"
                scrollClassName="overflow-x-hidden overscroll-contain"
              >
                {messages.length === 0 ? (
                  <p className="px-1 py-6 text-center text-muted-foreground text-sm">
                    Describe the role you want, or say what to change. The
                    preview updates as the architect writes.
                  </p>
                ) : (
                  messages.map((message) => (
                    <MessageParts
                      key={message.id}
                      message={message}
                      userName={user?.name}
                      userImage={user?.image}
                      userEmail={user?.email}
                    />
                  ))
                )}
                {status === "submitted" ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <AgentMark className="size-6" />
                    Drafting
                  </div>
                ) : null}
                {error ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-destructive text-xs">
                    <span>The architect hit an error.</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7"
                      onClick={() => regenerate()}
                    >
                      Retry
                    </Button>
                  </div>
                ) : null}
              </StickToBottom.Content>
            </StickToBottom>
          </div>
        ) : null}

        <form
          className="flex items-end gap-2 border-border/70 border-t px-2.5 py-2"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          {!open ? <AgentMark className="mb-0.5" /> : null}
          <label className="sr-only" htmlFor="resume-architect-input">
            Message Resume Architect
          </label>
          <textarea
            id="resume-architect-input"
            ref={textareaRef}
            rows={1}
            value={input}
            onFocus={() => setOpen(true)}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void submit();
              }
            }}
            placeholder="Tell the architect what to add or change"
            disabled={busy && input.length === 0}
            className="max-h-28 min-h-10 flex-1 resize-none rounded-xl bg-muted/40 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          {busy ? (
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="mb-0.5 size-9 shrink-0 rounded-full"
              onClick={() => stop()}
              aria-label="Stop generating"
            >
              <Square className="size-3.5 fill-current" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              className="mb-0.5 size-9 shrink-0 rounded-full"
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <ArrowUp className="size-4" />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}

export default function ResumeArchitectChat({
  resumeId,
  onFlushPendingSave,
}: {
  resumeId: string;
  onFlushPendingSave?: () => Promise<void>;
}) {
  const [history, setHistory] = useState<ResumeArchitectUIMessage[] | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/resumes/${resumeId}/ai/chat`)
      .then(async (res) => {
        if (!res.ok) return { messages: [] };
        return res.json() as Promise<{ messages?: ResumeArchitectUIMessage[] }>;
      })
      .then((payload) => {
        if (cancelled) return;
        setHistory(Array.isArray(payload.messages) ? payload.messages : []);
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      });
    return () => {
      cancelled = true;
    };
  }, [resumeId]);

  if (history === null) {
    return null;
  }

  return (
    <ArchitectSession
      resumeId={resumeId}
      initialMessages={history}
      onFlushPendingSave={onFlushPendingSave}
      startOpen={history.length > 0}
    />
  );
}
