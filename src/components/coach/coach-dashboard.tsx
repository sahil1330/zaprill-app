"use client";

import {
  GraduationCap,
  Loader2,
  PanelLeft,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { PageHeader } from "@/components/app/page-header";
import {
  PageEmpty,
  PageError,
  PageSkeleton,
} from "@/components/app/page-state";
import { formatCoachError } from "@/components/coach/format-coach-error";
import { MockPanel } from "@/components/coach/mock-panel";
import { PracticePanel } from "@/components/coach/practice-panel";
import { ProgramRail } from "@/components/coach/program-rail";
import { TutorComposer } from "@/components/coach/tutor-composer";
import {
  type TutorMessage,
  TutorThread,
} from "@/components/coach/tutor-thread";
import {
  CoachMicButton,
  CoachSpeakerButton,
} from "@/components/coach/voice/coach-speech-controls";
import {
  micReasonForSpeechMode,
  useCoachSpeech,
} from "@/components/coach/voice/use-coach-speech";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { LearningResource } from "@/types";

export type CoachMode = "tutor" | "practice" | "mock";

const COACH_MODES: Array<{ id: CoachMode; label: string }> = [
  { id: "tutor", label: "Tutor" },
  { id: "practice", label: "Practice" },
  { id: "mock", label: "Mock" },
];

interface Allowance {
  tier: "free" | "pro" | "max";
  activePrograms: number;
  tutorTurnsPerDay: number;
  tutorTurnsUsed: number;
  gradedPracticePerWeek: number;
  gradedPracticeUsed: number;
  mockInterviewsPerMonth: number;
  mockInterviewsUsed: number;
  monthlySpendCeilingInr: number;
  spendPaise: number;
}

interface PlanView {
  id: string;
  skillKey: string;
  displayName: string;
  priority: string;
  category: string;
  status: string;
  outline: {
    why: string;
    estimatedTime: string;
    modules: Array<{
      key: string;
      title: string;
      objective: string;
      resources: LearningResource[];
    }>;
  };
  progress: {
    state: string;
    masteryScore: number | null;
    tasksAttempted: number;
    tasksPassed: number;
  };
}

interface ProgramView {
  id: string;
  roleTitle: string;
  status: string;
  advice: string | null;
  plans: PlanView[];
}

interface ProgramsResponse {
  allowance?: Allowance;
  coachEnabled?: boolean;
  programs?: ProgramView[];
  notices?: string[];
  error?: string;
  detail?: string;
  capability?: string;
  upgradeTo?: string | null;
}

interface Question {
  id: string;
  prompt: string;
}

export interface CoachWorkspaceProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  programs: ProgramView[];
  allowance: Allowance | null;
  coachEnabled: boolean;
  notices: string[];
  planId: string | null;
  onSelectPlan: (planId: string) => void;
  mode: CoachMode;
  onModeChange: (mode: CoachMode) => void;
  railOpen: boolean;
  onRailOpenChange: (open: boolean) => void;
  onRefresh: () => void;
  refreshing: boolean;
  tutor: ReactNode;
  practice: ReactNode;
  mock: ReactNode;
}

function shownCoachError(body: unknown): string {
  const formatted = formatCoachError(body);
  if (formatted.detail) {
    console.error("[coach]", formatted.detail);
  }
  return formatted.message;
}

function shownCaughtError(caught: unknown, fallback: string): string {
  if (caught instanceof Error && caught.message.trim()) {
    return shownCoachError({ error: caught.message });
  }
  return fallback;
}

function AllowanceStrip({ allowance }: { allowance: Allowance }) {
  const items = [
    { label: "Plan", value: allowance.tier },
    {
      label: "Tutor today",
      value: `${allowance.tutorTurnsUsed}/${allowance.tutorTurnsPerDay}`,
    },
    {
      label: "Tests this week",
      value: `${allowance.gradedPracticeUsed}/${allowance.gradedPracticePerWeek}`,
    },
    {
      label: "Mocks this month",
      value: `${allowance.mockInterviewsUsed}/${allowance.mockInterviewsPerMonth}`,
    },
  ];

  return (
    <p
      data-slot="coach-allowance"
      className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs"
    >
      {items.map((item) => (
        <span key={item.label}>
          {item.label}{" "}
          <span className="text-foreground capitalize">{item.value}</span>
        </span>
      ))}
    </p>
  );
}

function CoachModeSwitch({
  mode,
  onChange,
}: {
  mode: CoachMode;
  onChange: (mode: CoachMode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Coach workspace"
      data-slot="coach-mode-switch"
      className="inline-flex rounded-md bg-muted p-0.5"
    >
      {COACH_MODES.map((item) => {
        const selected = mode === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`coach-mode-${item.id}`}
            data-mode={item.id}
            aria-selected={selected}
            aria-controls={`coach-panel-${item.id}`}
            onClick={() => onChange(item.id)}
            className={cn(
              "rounded-md px-3 py-1.5 font-medium text-sm transition-colors",
              selected
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function PlanOutline({ plan }: { plan: PlanView }) {
  if (plan.outline.modules.length === 0) return null;

  return (
    <details
      data-slot="plan-outline"
      className="rounded-lg border border-border bg-card px-4 py-3 text-sm"
    >
      <summary className="cursor-pointer font-medium">Outline</summary>
      <div className="mt-3 space-y-3">
        {plan.outline.modules.map((module) => (
          <div key={module.key} className="rounded-lg bg-muted px-3 py-3">
            <p className="font-medium">{module.title}</p>
            {module.objective ? (
              <p className="mt-1 text-muted-foreground text-sm">
                {module.objective}
              </p>
            ) : null}
            {module.resources.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm">
                {module.resources.map((resource) => (
                  <li key={`${resource.name}-${resource.url ?? ""}`}>
                    {resource.url ? (
                      <a
                        href={resource.url}
                        className="text-primary underline-offset-4 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {resource.name}
                      </a>
                    ) : (
                      resource.name
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </details>
  );
}

function CoachFrame({
  allowance,
  onRefresh,
  refreshing,
  children,
}: {
  allowance: Allowance | null;
  onRefresh: () => void;
  refreshing: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8">
      <div className="flex flex-col gap-2">
        <PageHeader
          className="mb-0"
          eyebrow="Skill Coach"
          title="Close the technical gaps"
          description="Programs come from your target roles and the latest job analysis. The tutor answers in the language you write. A passing test is recorded on your career profile."
          actions={
            <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
              {refreshing ? (
                <Loader2 className="animate-spin" />
              ) : (
                <RefreshCw />
              )}
              Refresh
            </Button>
          }
        />
        {allowance ? <AllowanceStrip allowance={allowance} /> : null}
      </div>
      {children}
    </div>
  );
}

function CoachNotices({
  coachEnabled,
  notices,
  showPaused,
}: {
  coachEnabled: boolean;
  notices: string[];
  showPaused: boolean;
}) {
  return (
    <>
      {showPaused && !coachEnabled ? (
        <p className="rounded-lg bg-muted px-4 py-3 text-muted-foreground text-sm">
          Skill Coach model calls are switched off. Saved programs stay
          readable. Tutor, tests, and mocks wait until coaching is turned on.
        </p>
      ) : null}
      {notices.map((notice) => (
        <p
          key={notice}
          className="rounded-lg bg-muted px-4 py-3 text-muted-foreground text-sm"
        >
          {notice}{" "}
          <Link
            href="/intelligence"
            prefetch={false}
            className="text-primary underline-offset-4 hover:underline"
          >
            Intelligence
          </Link>
          {" · "}
          <Link
            href="/analyze"
            prefetch={false}
            className="text-primary underline-offset-4 hover:underline"
          >
            Analyze
          </Link>
          {" · "}
          <Link
            href="/billing"
            prefetch={false}
            className="text-primary underline-offset-4 hover:underline"
          >
            Billing
          </Link>
        </p>
      ))}
    </>
  );
}

export function CoachWorkspace({
  loading,
  error,
  onRetry,
  programs,
  allowance,
  coachEnabled,
  notices,
  planId,
  onSelectPlan,
  mode,
  onModeChange,
  railOpen,
  onRailOpenChange,
  onRefresh,
  refreshing,
  tutor,
  practice,
  mock,
}: CoachWorkspaceProps) {
  const initialLoad = loading && programs.length === 0;
  const failedEmpty = !loading && error !== null && programs.length === 0;
  const empty = !loading && error === null && programs.length === 0;
  const selected = programs
    .flatMap((program) =>
      program.plans.map((plan) => ({ plan, roleTitle: program.roleTitle })),
    )
    .find((item) => item.plan.id === planId);

  function selectPlan(nextPlanId: string) {
    onSelectPlan(nextPlanId);
    onRailOpenChange(false);
  }

  if (initialLoad) {
    return (
      <CoachFrame
        allowance={allowance}
        onRefresh={onRefresh}
        refreshing={refreshing}
      >
        <PageSkeleton rows={5} />
      </CoachFrame>
    );
  }

  if (failedEmpty) {
    return (
      <CoachFrame
        allowance={allowance}
        onRefresh={onRefresh}
        refreshing={refreshing}
      >
        <PageError message={error} onRetry={onRetry} />
      </CoachFrame>
    );
  }

  if (empty) {
    return (
      <CoachFrame
        allowance={allowance}
        onRefresh={onRefresh}
        refreshing={refreshing}
      >
        <CoachNotices
          coachEnabled={coachEnabled}
          notices={notices}
          showPaused
        />
        <PageEmpty
          title="No active program"
          description="Add a target role and run an analysis. Free accounts keep one active program. Saved plans stay available when a limit is hit."
          action={
            <Link
              href="/intelligence"
              prefetch={false}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Intelligence
            </Link>
          }
        />
      </CoachFrame>
    );
  }

  const panel =
    mode === "tutor" ? tutor : mode === "practice" ? practice : mock;

  return (
    <CoachFrame
      allowance={allowance}
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      <CoachNotices coachEnabled={coachEnabled} notices={notices} showPaused />
      {error ? <PageError message={error} onRetry={onRetry} /> : null}
      <div
        data-slot="coach-workspace"
        className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]"
      >
        <aside
          data-slot="program-rail-desktop"
          className="hidden lg:sticky lg:top-20 lg:block lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto"
        >
          <ProgramRail
            programs={programs}
            planId={planId}
            onSelectPlan={onSelectPlan}
          />
        </aside>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div data-slot="coach-rail-trigger" className="lg:hidden">
              <Sheet open={railOpen} onOpenChange={onRailOpenChange}>
                <SheetTrigger render={<Button variant="outline" size="sm" />}>
                  <PanelLeft />
                  Programs
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[280px] data-[side=left]:w-[280px] sm:max-w-[280px] data-[side=left]:sm:max-w-[280px]"
                >
                  <SheetHeader>
                    <SheetTitle>Programs</SheetTitle>
                  </SheetHeader>
                  <div className="overflow-y-auto px-4 pb-6">
                    <ProgramRail
                      programs={programs}
                      planId={planId}
                      onSelectPlan={selectPlan}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <CoachModeSwitch mode={mode} onChange={onModeChange} />
          </div>
          {selected ? (
            <>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="flex items-center gap-2 font-heading font-semibold text-lg">
                    <GraduationCap className="size-5 text-muted-foreground" />
                    {selected.plan.displayName}
                  </h2>
                  <Badge variant="outline">{selected.roleTitle}</Badge>
                  {selected.plan.progress.state === "demonstrated" ? (
                    <Badge>
                      <ShieldCheck />
                      Demonstrated
                    </Badge>
                  ) : null}
                </div>
                <p className="text-muted-foreground text-sm">
                  {selected.plan.outline.why ||
                    "Outline will fill in as you start a lesson."}
                </p>
                {selected.plan.outline.estimatedTime ? (
                  <p className="text-muted-foreground text-xs">
                    {selected.plan.outline.estimatedTime}
                  </p>
                ) : null}
              </div>
              <div
                role="tabpanel"
                id={`coach-panel-${mode}`}
                aria-labelledby={`coach-mode-${mode}`}
                data-slot="coach-panel"
                data-mode={mode}
              >
                {panel}
              </div>
              <PlanOutline plan={selected.plan} />
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              Select a skill from the program list.
            </p>
          )}
        </div>
      </div>
    </CoachFrame>
  );
}

export function CoachDashboard() {
  const [programs, setPrograms] = useState<ProgramView[]>([]);
  const [allowance, setAllowance] = useState<Allowance | null>(null);
  const [coachEnabled, setCoachEnabled] = useState(false);
  const [notices, setNotices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [mode, setMode] = useState<CoachMode>("tutor");
  const [railOpen, setRailOpen] = useState(false);
  const [message, setMessage] = useState("");
  const speech = useCoachSpeech({
    onTranscript: (transcript) => {
      setMessage((current) => {
        const existing = current.trim();
        return existing ? `${existing} ${transcript}` : transcript;
      });
    },
  });
  const [tutorMessages, setTutorMessages] = useState<TutorMessage[]>([]);
  const [tutorError, setTutorError] = useState<string | null>(null);
  const planIdRef = useRef(planId);
  planIdRef.current = planId;
  const [busy, setBusy] = useState<string | null>(null);
  const [task, setTask] = useState<{ taskId: string; prompt: string } | null>(
    null,
  );
  const [answer, setAnswer] = useState("");
  const [grade, setGrade] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [mockSessionId, setMockSessionId] = useState<string | null>(null);
  const [mockAnswers, setMockAnswers] = useState<Record<string, string>>({});
  const [mockFeedback, setMockFeedback] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/coach/programs");
      const body = (await response.json()) as ProgramsResponse;
      if (!response.ok) {
        setError(
          body.error ? shownCoachError(body) : "Could not load Skill Coach",
        );
        return;
      }
      setPrograms(body.programs ?? []);
      setAllowance(body.allowance ?? null);
      setCoachEnabled(body.coachEnabled === true);
      setNotices(body.notices ?? []);
      setPlanId((current) => {
        if (
          current &&
          body.programs?.some((program) =>
            program.plans.some((plan) => plan.id === current),
          )
        ) {
          return current;
        }
        return (
          body.programs?.[0]?.plans.find((plan) => plan.status === "active")
            ?.id ?? null
        );
      });
    } catch {
      setError("Could not load Skill Coach");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = programs
    .flatMap((program) =>
      program.plans.map((plan) => ({ plan, roleTitle: program.roleTitle })),
    )
    .find((item) => item.plan.id === planId);
  const lastAssistantText =
    [...tutorMessages].reverse().find((entry) => entry.role === "assistant")
      ?.content ?? "";
  const micReason = micReasonForSpeechMode(speech.mode);
  const speechNotice = speech.notice ?? micReason;

  async function postJson(url: string, payload: unknown) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
      detail?: string;
      capability?: string;
      upgradeTo?: string | null;
      reply?: string;
      taskId?: string;
      prompt?: string;
      score?: number;
      passed?: boolean;
      feedback?: string;
      verified?: boolean;
      sessionId?: string;
      questions?: Question[];
    };
    if (!response.ok) {
      throw new Error(shownCoachError(body));
    }
    return body;
  }

  async function sendTutor() {
    if (!selected || !message.trim() || busy !== null || !coachEnabled) return;
    const text = message.trim();
    const planIdAtSend = selected.plan.id;
    setBusy("tutor");
    setTutorError(null);
    try {
      const body = await postJson(`/api/coach/plans/${planIdAtSend}/sessions`, {
        message: text,
      });
      if (planIdRef.current === planIdAtSend) {
        setTutorMessages((current) => [
          ...current,
          { role: "user", content: text },
          { role: "assistant", content: body.reply ?? "" },
        ]);
        setMessage("");
      }
      await load();
    } catch (caught) {
      if (planIdRef.current !== planIdAtSend) return;
      setTutorError(
        shownCaughtError(caught, "Something went wrong. Try again."),
      );
    } finally {
      setBusy(null);
    }
  }

  async function startTest() {
    if (!selected) return;
    setBusy("test");
    setGrade(null);
    try {
      const body = await postJson(
        `/api/coach/plans/${selected.plan.id}/practice`,
        { action: "start" },
      );
      if (body.taskId && body.prompt) {
        setTask({ taskId: body.taskId, prompt: body.prompt });
      }
    } catch (caught) {
      setGrade(shownCaughtError(caught, "Could not start the test"));
    } finally {
      setBusy(null);
    }
  }

  async function submitTest() {
    if (!selected || !task || !answer.trim()) return;
    setBusy("grade");
    try {
      const body = await postJson(
        `/api/coach/plans/${selected.plan.id}/practice`,
        { action: "grade", taskId: task.taskId, answer },
      );
      const verified = body.verified ? " Verified on your career profile." : "";
      setGrade(
        `Score ${body.score}. ${body.passed ? "Passed." : "Not a pass yet."}${verified} ${body.feedback ?? ""}`,
      );
      setAnswer("");
      setTask(null);
      await load();
    } catch (caught) {
      setGrade(shownCaughtError(caught, "Could not grade the test"));
    } finally {
      setBusy(null);
    }
  }

  async function startMock() {
    if (!selected) return;
    setBusy("mock");
    setMockFeedback(null);
    try {
      const body = await postJson(
        `/api/coach/plans/${selected.plan.id}/mocks`,
        {
          action: "start",
        },
      );
      setMockSessionId(body.sessionId ?? null);
      setQuestions(body.questions ?? []);
      setMockAnswers({});
    } catch (caught) {
      setMockFeedback(shownCaughtError(caught, "Could not start the mock"));
    } finally {
      setBusy(null);
    }
  }

  async function submitMock() {
    if (!selected || !mockSessionId) return;
    setBusy("mock-review");
    try {
      const body = await postJson(
        `/api/coach/plans/${selected.plan.id}/mocks`,
        {
          action: "review",
          sessionId: mockSessionId,
          answers: questions.map((question) => ({
            id: question.id,
            text: mockAnswers[question.id] ?? "",
          })),
        },
      );
      setMockFeedback(`Score ${body.score}. ${body.feedback ?? ""}`);
      setQuestions([]);
      setMockSessionId(null);
      await load();
    } catch (caught) {
      setMockFeedback(shownCaughtError(caught, "Could not review the mock"));
    } finally {
      setBusy(null);
    }
  }

  function choosePlan(nextPlanId: string) {
    speech.stopSpeak();
    speech.stopListen();
    setPlanId(nextPlanId);
    setTask(null);
    setGrade(null);
    setTutorMessages([]);
    setTutorError(null);
    setQuestions([]);
    setMockFeedback(null);
  }

  function chooseMode(next: CoachMode) {
    if (next !== "tutor") {
      speech.stopSpeak();
      speech.stopListen();
    }
    setMode(next);
  }

  return (
    <CoachWorkspace
      loading={loading}
      error={error}
      onRetry={() => void load()}
      programs={programs}
      allowance={allowance}
      coachEnabled={coachEnabled}
      notices={notices}
      planId={planId}
      onSelectPlan={choosePlan}
      mode={mode}
      onModeChange={chooseMode}
      railOpen={railOpen}
      onRailOpenChange={setRailOpen}
      onRefresh={() => void load()}
      refreshing={loading}
      tutor={
        <Card className="flex min-h-[28rem] flex-col">
          <CardContent className="flex flex-1 flex-col gap-3">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <TutorThread messages={tutorMessages} />
            </div>
            {tutorError ? (
              <p role="alert" className="text-destructive text-sm">
                {tutorError}
              </p>
            ) : null}
            <TutorComposer
              value={message}
              onChange={setMessage}
              onSend={() => void sendTutor()}
              busy={busy === "tutor"}
              disabledReason={
                !coachEnabled
                  ? "Coaching is paused right now."
                  : busy !== null && busy !== "tutor"
                    ? "Wait for the current request to finish."
                    : undefined
              }
              notice={speechNotice}
              micSlot={
                <CoachMicButton
                  listening={speech.listening}
                  disabled={speech.mode === "text-only"}
                  disabledReason={micReason ?? undefined}
                  describedBy={micReason ? "tutor-speech-notice" : undefined}
                  onPress={() => {
                    if (speech.listening) speech.stopListen();
                    else void speech.startListen();
                  }}
                />
              }
              speakerSlot={
                <CoachSpeakerButton
                  disabled={
                    speech.mode === "text-only" ||
                    lastAssistantText.trim().length === 0
                  }
                  disabledReason={
                    speech.mode === "text-only"
                      ? "Voice output is not available on this device."
                      : lastAssistantText.trim()
                        ? undefined
                        : "No tutor reply to play yet."
                  }
                  onSpeak={() => speech.speak(lastAssistantText)}
                  onStop={speech.stopSpeak}
                />
              }
            />
          </CardContent>
        </Card>
      }
      practice={
        <PracticePanel
          coachEnabled={coachEnabled}
          busy={busy}
          task={task}
          answer={answer}
          grade={grade}
          onAnswerChange={setAnswer}
          onStart={() => void startTest()}
          onSubmit={() => void submitTest()}
        />
      }
      mock={
        <MockPanel
          coachEnabled={coachEnabled}
          busy={busy}
          questions={questions}
          answers={mockAnswers}
          feedback={mockFeedback}
          onAnswerChange={(questionId, value) =>
            setMockAnswers((current) => ({
              ...current,
              [questionId]: value,
            }))
          }
          onStart={() => void startMock()}
          onSubmit={() => void submitMock()}
        />
      }
    />
  );
}
