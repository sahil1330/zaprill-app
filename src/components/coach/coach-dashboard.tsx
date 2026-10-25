"use client";

import {
  GraduationCap,
  Loader2,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { formatCoachError } from "@/components/coach/format-coach-error";
import { TutorComposer } from "@/components/coach/tutor-composer";
import {
  type TutorMessage,
  TutorThread,
} from "@/components/coach/tutor-thread";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { LearningResource } from "@/types";

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

export function CoachDashboard() {
  const [programs, setPrograms] = useState<ProgramView[]>([]);
  const [allowance, setAllowance] = useState<Allowance | null>(null);
  const [coachEnabled, setCoachEnabled] = useState(false);
  const [notices, setNotices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
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

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8">
      <PageHeader
        eyebrow="Skill Coach"
        title="Close the technical gaps"
        description="Programs come from your target roles and the latest job analysis. The tutor answers in the language you write. A passing test is recorded on your career profile."
        actions={
          <Button
            variant="outline"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            Refresh
          </Button>
        }
      />

      {coachEnabled ? null : (
        <p className="rounded-2xl bg-muted px-4 py-3 text-muted-foreground text-sm">
          Skill Coach model calls are switched off. Saved programs stay
          readable. Tutor, tests, and mocks wait until coaching is turned on.
        </p>
      )}

      {allowance && (
        <Card>
          <CardContent className="grid gap-3 px-6 sm:grid-cols-4">
            <Stat label="Plan" value={allowance.tier} />
            <Stat
              label="Tutor today"
              value={`${allowance.tutorTurnsUsed} / ${allowance.tutorTurnsPerDay}`}
            />
            <Stat
              label="Tests this week"
              value={`${allowance.gradedPracticeUsed} / ${allowance.gradedPracticePerWeek}`}
            />
            <Stat
              label="Mocks this month"
              value={`${allowance.mockInterviewsUsed} / ${allowance.mockInterviewsPerMonth}`}
            />
          </CardContent>
        </Card>
      )}

      {error && (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-destructive text-sm">
          {error}
        </p>
      )}
      {notices.map((notice) => (
        <p
          key={notice}
          className="rounded-2xl bg-muted px-4 py-3 text-muted-foreground text-sm"
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

      {loading && programs.length === 0 ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="animate-spin" />
          Loading programs
        </div>
      ) : programs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target />
              No active program
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Add a target role and run an analysis. Free accounts keep one active
            program. Saved plans stay available when a limit is hit.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="flex flex-col gap-3">
            {programs.map((program) => (
              <Card key={program.id} size="sm">
                <CardHeader>
                  <CardTitle>{program.roleTitle}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {program.plans
                    .filter((plan) => plan.status !== "archived")
                    .map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => {
                          setPlanId(plan.id);
                          setTask(null);
                          setGrade(null);
                          setTutorMessages([]);
                          setTutorError(null);
                          setQuestions([]);
                          setMockFeedback(null);
                        }}
                        className={`rounded-2xl px-3 py-2 text-left text-sm ${
                          plan.id === planId
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/70"
                        }`}
                      >
                        <span className="block font-medium">
                          {plan.displayName}
                        </span>
                        <span className="block text-xs opacity-80">
                          {plan.priority} ·{" "}
                          {plan.progress.state.replaceAll("_", " ")}
                        </span>
                      </button>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {selected && (
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap />
                    {selected.plan.displayName}
                    <Badge variant="outline">{selected.roleTitle}</Badge>
                    {selected.plan.progress.state === "demonstrated" && (
                      <Badge>
                        <ShieldCheck />
                        Demonstrated
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p>
                    {selected.plan.outline.why ||
                      "Outline will fill in as you start a lesson."}
                  </p>
                  {selected.plan.outline.estimatedTime && (
                    <p className="text-muted-foreground text-sm">
                      {selected.plan.outline.estimatedTime}
                    </p>
                  )}
                  {selected.plan.outline.modules.map((module) => (
                    <div
                      key={module.key}
                      className="rounded-2xl bg-muted px-3 py-3"
                    >
                      <p className="font-medium">{module.title}</p>
                      {module.objective && (
                        <p className="mt-1 text-muted-foreground text-sm">
                          {module.objective}
                        </p>
                      )}
                      {module.resources.length > 0 && (
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
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare />
                    Tutor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <TutorThread messages={tutorMessages} />
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
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Practice test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => void startTest()}
                    disabled={busy !== null || !coachEnabled}
                  >
                    {busy === "test" && <Loader2 className="animate-spin" />}
                    Start test
                  </Button>
                  {task && (
                    <>
                      <p className="text-sm">{task.prompt}</p>
                      <Textarea
                        value={answer}
                        onChange={(event) => setAnswer(event.target.value)}
                        placeholder="Write the answer in the language you want feedback in."
                      />
                      <Button
                        onClick={() => void submitTest()}
                        disabled={busy !== null}
                      >
                        {busy === "grade" && (
                          <Loader2 className="animate-spin" />
                        )}
                        Submit answer
                      </Button>
                    </>
                  )}
                  {grade && (
                    <p className="whitespace-pre-wrap text-sm">{grade}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mock interview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground text-sm">
                    A mock is practice only. It does not verify a skill.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => void startMock()}
                    disabled={busy !== null || !coachEnabled}
                  >
                    {busy === "mock" && <Loader2 className="animate-spin" />}
                    Start mock
                  </Button>
                  {questions.map((question) => (
                    <div key={question.id} className="space-y-2 text-sm">
                      <p>{question.prompt}</p>
                      <Textarea
                        aria-label={question.prompt}
                        value={mockAnswers[question.id] ?? ""}
                        onChange={(event) =>
                          setMockAnswers((current) => ({
                            ...current,
                            [question.id]: event.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                  {questions.length > 0 && (
                    <Button
                      onClick={() => void submitMock()}
                      disabled={busy !== null}
                    >
                      {busy === "mock-review" && (
                        <Loader2 className="animate-spin" />
                      )}
                      Submit mock
                    </Button>
                  )}
                  {mockFeedback && (
                    <p className="whitespace-pre-wrap text-sm">
                      {mockFeedback}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </p>
      <p className="font-heading text-lg capitalize">{value}</p>
    </div>
  );
}
