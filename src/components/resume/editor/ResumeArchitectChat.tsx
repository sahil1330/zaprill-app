"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart } from "ai";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Loader2,
  Minus,
  PenLine,
  Square,
} from "lucide-react";
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Streamdown } from "streamdown";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ResumeArchitectUIMessage } from "@/lib/agents/resume-architect";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { ResumeArchitectSnapshot } from "@/services/resume/architect.service";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";

const TOOL_PENDING: Record<string, string> = {
  getResume: "Reading resume",
  updateProfile: "Updating profile",
  upsertEntry: "Updating section",
  removeEntry: "Removing entry",
  setDesign: "Updating design",
  applyRecommendedLayout: "Applying layout",
  lookupGuidance: "Checking field rules",
  web_search: "Looking up a source",
};

const TOOL_DONE: Record<string, string> = {
  getResume: "Read resume",
  updateProfile: "Updated profile",
  upsertEntry: "Updated section",
  removeEntry: "Removed entry",
  setDesign: "Updated design",
  applyRecommendedLayout: "Applied layout",
  lookupGuidance: "Checked field rules",
  web_search: "Looked up a source",
};

const FRAME_KEY = "zaprill.resume-architect.frame";
const MARGIN = 16;
const MIN_W = 320;
const MIN_H = 280;
const MAX_W = 640;
const MAX_H = 760;
const DEFAULT_W = 380;
const DEFAULT_H = 480;

type Frame = { x: number; y: number; w: number; h: number };
type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

function limits(vw: number, vh: number) {
  const maxW = Math.max(240, Math.min(MAX_W, vw - MARGIN * 2));
  const maxH = Math.max(220, Math.min(MAX_H, vh - MARGIN * 2));
  return {
    minW: Math.min(MIN_W, maxW),
    minH: Math.min(MIN_H, maxH),
    maxW,
    maxH,
  };
}

function defaultFrame(vw: number, vh: number): Frame {
  const { maxW, maxH } = limits(vw, vh);
  const w = Math.min(DEFAULT_W, maxW);
  const h = Math.min(DEFAULT_H, maxH);
  return {
    w,
    h,
    x: Math.max(MARGIN, vw - w - MARGIN),
    y: Math.max(MARGIN, vh - h - MARGIN),
  };
}

function clampFrame(frame: Frame, vw: number, vh: number): Frame {
  const { minW, minH, maxW, maxH } = limits(vw, vh);
  const w = Math.min(maxW, Math.max(minW, frame.w));
  const h = Math.min(maxH, Math.max(minH, frame.h));
  const x = Math.min(
    Math.max(MARGIN, frame.x),
    Math.max(MARGIN, vw - w - MARGIN),
  );
  const y = Math.min(
    Math.max(MARGIN, frame.y),
    Math.max(MARGIN, vh - h - MARGIN),
  );
  return { x, y, w, h };
}

function readFrame(): { frame: Frame; minimized: boolean } | null {
  try {
    const raw = JSON.parse(window.localStorage.getItem(FRAME_KEY) ?? "");
    if (!raw || typeof raw !== "object") return null;
    const x = Number(raw.x);
    const y = Number(raw.y);
    const w = Number(raw.w);
    const h = Number(raw.h);
    if (![x, y, w, h].every(Number.isFinite)) return null;
    return {
      frame: { x, y, w, h },
      minimized: raw.minimized !== false,
    };
  } catch {
    return null;
  }
}

const RESIZE_HANDLES: Array<{
  edge: ResizeEdge;
  label: string;
  className: string;
}> = [
  {
    edge: "n",
    label: "Resize from the top",
    className: "inset-x-3 top-0 h-1.5 cursor-ns-resize",
  },
  {
    edge: "s",
    label: "Resize from the bottom",
    className: "inset-x-3 bottom-0 h-1.5 cursor-ns-resize",
  },
  {
    edge: "e",
    label: "Resize from the right",
    className: "inset-y-3 right-0 w-1.5 cursor-ew-resize",
  },
  {
    edge: "w",
    label: "Resize from the left",
    className: "inset-y-3 left-0 w-1.5 cursor-ew-resize",
  },
  {
    edge: "nw",
    label: "Resize from the top left",
    className: "top-0 left-0 size-3 cursor-nwse-resize",
  },
  {
    edge: "ne",
    label: "Resize from the top right",
    className: "top-0 right-0 size-3 cursor-nesw-resize",
  },
  {
    edge: "sw",
    label: "Resize from the bottom left",
    className: "bottom-0 left-0 size-3 cursor-nesw-resize",
  },
  {
    edge: "se",
    label: "Resize from the bottom right",
    className: "right-0 bottom-0 size-3 cursor-nwse-resize",
  },
];

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
        "flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-foreground",
        className,
      )}
      aria-hidden
    >
      <PenLine className="size-3.5" strokeWidth={2.25} />
    </div>
  );
}

function Markdown({
  children,
  streaming,
  className,
}: {
  children: string;
  streaming?: boolean;
  className?: string;
}) {
  return (
    <Streamdown
      className={className}
      isAnimating={Boolean(streaming)}
      mode={streaming ? "streaming" : "static"}
    >
      {children}
    </Streamdown>
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
  const startedAt = useRef<number | null>(streaming ? Date.now() : null);
  const wasStreaming = useRef(streaming);
  const [durationSec, setDurationSec] = useState<number | null>(null);

  useEffect(() => {
    if (streaming) {
      setOpen(true);
      if (startedAt.current == null) startedAt.current = Date.now();
      wasStreaming.current = true;
      return;
    }
    if (wasStreaming.current) {
      if (startedAt.current != null) {
        setDurationSec(
          Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)),
        );
      }
      setOpen(false);
    }
    wasStreaming.current = false;
  }, [streaming]);

  if (!text && !streaming) return null;

  const label = streaming
    ? "Thinking"
    : durationSec
      ? `Thought for ${durationSec}s`
      : "Thought";

  return (
    <div className="w-full min-w-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-1.5 font-medium text-[11px] text-muted-foreground tracking-wide"
      >
        {streaming ? (
          <Loader2 className="size-3 animate-spin" aria-hidden />
        ) : (
          <Check className="size-3" aria-hidden />
        )}
        {label}
        <ChevronDown
          className={cn(
            "size-3 transition-transform",
            open ? "rotate-0" : "-rotate-90",
          )}
        />
      </button>
      {open && text ? (
        <div className="mt-1.5 max-h-32 overflow-y-auto border-border/70 border-l pl-2.5 text-[11px] text-muted-foreground leading-relaxed [&_p:first-child]:mt-0 [&_p]:my-1">
          <Markdown streaming={streaming}>{text}</Markdown>
        </div>
      ) : null}
    </div>
  );
}

function ScrollToLatest() {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();
  if (isAtBottom) return null;

  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      className="-translate-x-1/2 absolute bottom-2 left-1/2 z-20 size-9 rounded-full border border-border bg-background shadow-[0_8px_24px_-8px_oklch(0.141_0.005_286_/_0.45)]"
      onClick={() => {
        void scrollToBottom();
      }}
      aria-label="Jump to latest message"
    >
      <ArrowDown className="size-4" />
    </Button>
  );
}

function StickOnSend({ active }: { active: boolean }) {
  const { scrollToBottom } = useStickToBottomContext();
  const wasActive = useRef(active);

  useEffect(() => {
    if (active && !wasActive.current) {
      void scrollToBottom();
    }
    wasActive.current = active;
  }, [active, scrollToBottom]);

  return null;
}

function MessageParts({
  message,
  isLastMessage,
  isStreaming,
  userName,
  userImage,
  userEmail,
}: {
  message: ResumeArchitectUIMessage;
  isLastMessage: boolean;
  isStreaming: boolean;
  userName?: string | null;
  userImage?: string | null;
  userEmail?: string | null;
}) {
  const isUser = message.role === "user";
  const lastPart = message.parts.at(-1);
  const reasoningParts = message.parts.filter(
    (part) => part.type === "reasoning",
  );
  const reasoningText = reasoningParts.map((part) => part.text).join("\n\n");
  const isReasoningStreaming =
    isLastMessage && isStreaming && lastPart?.type === "reasoning";
  const isTextStreaming =
    isLastMessage && isStreaming && lastPart?.type === "text";

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
        {!isUser && (reasoningText || isReasoningStreaming) ? (
          <ReasoningBlock
            text={reasoningText}
            streaming={isReasoningStreaming}
          />
        ) : null}
        {message.parts.map((part, index) => {
          if (part.type === "reasoning") return null;

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
            const streamingThisPart =
              isTextStreaming && index === message.parts.length - 1;
            return (
              <div
                key={`${message.id}-text-${index}`}
                className="max-w-full overflow-hidden text-foreground text-sm leading-relaxed [&_p:first-child]:mt-0 [&_p]:my-1.5 [&_pre]:max-w-full [&_pre]:overflow-x-auto"
              >
                <Markdown streaming={streamingThisPart}>{part.text}</Markdown>
              </div>
            );
          }

          if (isToolUIPart(part)) {
            const toolName = part.type.replace("tool-", "");
            const pending =
              part.state === "input-streaming" ||
              part.state === "input-available";
            const failed = part.state === "output-error";
            const done = part.state === "output-available";
            const label = pending
              ? (TOOL_PENDING[toolName] ?? toolName)
              : done
                ? (TOOL_DONE[toolName] ?? toolName)
                : failed
                  ? `Could not complete: ${TOOL_PENDING[toolName] ?? toolName}`
                  : (TOOL_PENDING[toolName] ?? toolName);
            return (
              <div
                key={`${message.id}-tool-${index}`}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2 py-0.5 font-medium text-[11px] text-muted-foreground"
              >
                {pending ? (
                  <Loader2 className="size-3 animate-spin" aria-hidden />
                ) : done ? (
                  <Check className="size-3" aria-hidden />
                ) : null}
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
}: {
  resumeId: string;
  initialMessages: ResumeArchitectUIMessage[];
  onFlushPendingSave?: () => Promise<unknown>;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const currentVersion = useSelector((s: RootState) => s.resume.version);
  const { data: session } = useSession();
  const user = session?.user;
  const [minimized, setMinimized] = useState(true);
  const [frame, setFrame] = useState<Frame>({
    x: MARGIN,
    y: MARGIN,
    w: DEFAULT_W,
    h: DEFAULT_H,
  });
  const [hydrated, setHydrated] = useState(false);
  const [compact, setCompact] = useState(false);
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
  const isStreaming = status === "streaming";

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
    setMinimized(false);
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
    const stored = readFrame();
    const next = stored
      ? clampFrame(stored.frame, window.innerWidth, window.innerHeight)
      : defaultFrame(window.innerWidth, window.innerHeight);
    setFrame(next);
    setMinimized(stored ? stored.minimized : true);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      FRAME_KEY,
      JSON.stringify({ ...frame, minimized }),
    );
  }, [hydrated, frame, minimized]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const apply = () => setCompact(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const onResize = () => {
      setFrame((current) =>
        clampFrame(current, window.innerWidth, window.innerHeight),
      );
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (minimized) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) setMinimized(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [minimized, busy]);

  const resizeBy = useCallback(
    (edge: ResizeEdge, dx: number, dy: number, start: Frame) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const east = edge === "e" || edge === "ne" || edge === "se";
      const west = edge === "w" || edge === "nw" || edge === "sw";
      const north = edge === "n" || edge === "ne" || edge === "nw";
      const south = edge === "s" || edge === "se" || edge === "sw";
      const { minW, minH, maxW, maxH } = limits(vw, vh);
      let w = start.w;
      let h = start.h;
      if (east) w = start.w + dx;
      if (west) w = start.w - dx;
      if (south) h = start.h + dy;
      if (north) h = start.h - dy;
      w = Math.min(maxW, Math.max(minW, w));
      h = Math.min(maxH, Math.max(minH, h));
      const x = west ? start.x + start.w - w : start.x;
      const y = north ? start.y + start.h - h : start.y;
      setFrame(clampFrame({ x, y, w, h }, vw, vh));
    },
    [],
  );

  const startResize = (edge: ResizeEdge, event: ReactPointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const start = frame;
    const onMove = (moveEvent: PointerEvent) => {
      resizeBy(
        edge,
        moveEvent.clientX - startX,
        moveEvent.clientY - startY,
        start,
      );
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (compact) return;
    if ((event.target as HTMLElement).closest("button")) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const start = frame;
    const onMove = (moveEvent: PointerEvent) => {
      setFrame(
        clampFrame(
          {
            ...start,
            x: start.x + moveEvent.clientX - startX,
            y: start.y + moveEvent.clientY - startY,
          },
          window.innerWidth,
          window.innerHeight,
        ),
      );
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  if (minimized) {
    return (
      <button
        type="button"
        className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm shadow-sm hover:bg-muted"
        onClick={() => setMinimized(false)}
        aria-expanded={false}
        aria-label="Open Resume Architect"
      >
        <PenLine className="size-4" />
        Architect
      </button>
    );
  }

  const sheetHeight = Math.min(
    frame.h,
    Math.round(
      typeof window === "undefined" ? DEFAULT_H : window.innerHeight * 0.72,
    ),
  );

  return (
    <section
      aria-label="Resume Architect"
      className="fixed z-40 flex flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm"
      style={
        compact
          ? { left: 12, right: 12, bottom: 12, height: sheetHeight }
          : { left: frame.x, top: frame.y, width: frame.w, height: frame.h }
      }
    >
      {(compact
        ? RESIZE_HANDLES.filter((handle) => handle.edge === "n")
        : RESIZE_HANDLES
      ).map((handle) => (
        <button
          key={handle.edge}
          type="button"
          aria-label={handle.label}
          className={cn(
            "absolute z-10 bg-transparent p-0 hover:bg-border",
            handle.className,
          )}
          onPointerDown={(event) => startResize(handle.edge, event)}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 32 : 16;
            const dx =
              event.key === "ArrowRight"
                ? step
                : event.key === "ArrowLeft"
                  ? -step
                  : 0;
            const dy =
              event.key === "ArrowDown"
                ? step
                : event.key === "ArrowUp"
                  ? -step
                  : 0;
            if (dx === 0 && dy === 0) return;
            event.preventDefault();
            resizeBy(handle.edge, dx, dy, frame);
          }}
        />
      ))}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          className={cn(
            "flex items-center justify-between gap-3 border-border border-b px-3 py-2.5",
            compact ? "cursor-default" : "cursor-grab active:cursor-grabbing",
          )}
          onPointerDown={startDrag}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <AgentMark />
            <div className="min-w-0">
              <p className="font-heading font-semibold text-sm tracking-tight">
                Resume Architect
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Edits the resume on the page
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            onClick={() => setMinimized(true)}
            onPointerDown={(event) => event.stopPropagation()}
            aria-label="Minimize architect"
          >
            <Minus className="size-4" />
          </Button>
        </div>

        <StickToBottom
          className="relative min-h-0 w-full min-w-0 flex-1 overflow-hidden"
          resize="smooth"
          initial="smooth"
        >
          <StickToBottom.Content
            className="flex w-full min-w-0 max-w-full flex-col gap-4 px-3 py-3"
            scrollClassName="overflow-x-hidden overflow-y-auto overscroll-contain"
          >
            {messages.length === 0 ? (
              <p className="px-1 py-6 text-center text-muted-foreground text-sm">
                Describe the role you want, or say what to change. The preview
                updates as the architect writes.
              </p>
            ) : (
              messages.map((message, index) => (
                <MessageParts
                  key={message.id}
                  message={message}
                  isLastMessage={index === messages.length - 1}
                  isStreaming={isStreaming}
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
          <StickOnSend active={busy} />
          <ScrollToLatest />
        </StickToBottom>

        <form
          className="flex items-end gap-2 border-border border-t px-2.5 py-2"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <label className="sr-only" htmlFor="resume-architect-input">
            Message Resume Architect
          </label>
          <textarea
            id="resume-architect-input"
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void submit();
              }
            }}
            placeholder="Tell the architect what to add or change"
            disabled={busy && input.length === 0}
            className="max-h-28 min-h-10 flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          {busy ? (
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="size-9 shrink-0"
              onClick={() => stop()}
              aria-label="Stop generating"
            >
              <Square className="size-3.5 fill-current" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              className="size-9 shrink-0"
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <ArrowUp className="size-4" />
            </Button>
          )}
        </form>
      </div>
    </section>
  );
}

export default function ResumeArchitectChat({
  resumeId,
  onFlushPendingSave,
}: {
  resumeId: string;
  onFlushPendingSave?: () => Promise<unknown>;
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
    return (
      <button
        type="button"
        disabled
        className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm shadow-sm"
        aria-label="Resume Architect"
      >
        <PenLine className="size-4" />
        Architect
      </button>
    );
  }

  return (
    <ArchitectSession
      resumeId={resumeId}
      initialMessages={history}
      onFlushPendingSave={onFlushPendingSave}
    />
  );
}
