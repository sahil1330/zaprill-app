import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  CoachDashboard,
  CoachWorkspace,
  type CoachWorkspaceProps,
} from "@/components/coach/coach-dashboard";
import { MockPanel } from "@/components/coach/mock-panel";
import { PracticePanel } from "@/components/coach/practice-panel";
import { ProgramRail } from "@/components/coach/program-rail";

const program = {
  id: "prog-1",
  roleTitle: "Frontend engineer",
  status: "active",
  advice: null,
  plans: [
    {
      id: "plan-1",
      skillKey: "react",
      displayName: "React",
      priority: "high",
      category: "framework",
      status: "active",
      outline: {
        why: "Job posts ask for React.",
        estimatedTime: "2 weeks",
        modules: [
          {
            key: "hooks",
            title: "Hooks",
            objective: "Use state",
            resources: [
              {
                type: "documentation" as const,
                name: "React docs",
                url: "https://react.dev",
                free: true,
              },
            ],
          },
        ],
      },
      progress: {
        state: "in_progress",
        masteryScore: null,
        tasksAttempted: 0,
        tasksPassed: 0,
      },
    },
  ],
};

const allowance = {
  tier: "free" as const,
  activePrograms: 1,
  tutorTurnsPerDay: 5,
  tutorTurnsUsed: 1,
  gradedPracticePerWeek: 3,
  gradedPracticeUsed: 0,
  mockInterviewsPerMonth: 1,
  mockInterviewsUsed: 0,
  monthlySpendCeilingInr: 0,
  spendPaise: 0,
};

function renderWorkspace(overrides: Partial<CoachWorkspaceProps> = {}) {
  const props: CoachWorkspaceProps = {
    loading: false,
    error: null,
    onRetry: () => undefined,
    programs: [],
    allowance: null,
    coachEnabled: true,
    notices: [],
    planId: null,
    onSelectPlan: () => undefined,
    mode: "tutor",
    onModeChange: () => undefined,
    railOpen: false,
    onRailOpenChange: () => undefined,
    onRefresh: () => undefined,
    refreshing: false,
    tutor: <div data-slot="tutor-panel-marker">thread</div>,
    practice: <div data-slot="practice-panel">practice</div>,
    mock: <div data-slot="mock-panel">mock</div>,
    ...overrides,
  };
  return renderToStaticMarkup(<CoachWorkspace {...props} />);
}

test("loading shows a page skeleton and hides the workspace", () => {
  const html = renderWorkspace({ loading: true });
  assert.match(html, /data-slot="page-skeleton"/);
  assert.doesNotMatch(html, /data-slot="page-empty"/);
  assert.doesNotMatch(html, /data-slot="tutor-panel-marker"/);
  assert.doesNotMatch(html, /data-slot="practice-panel"/);
  assert.doesNotMatch(html, /data-slot="mock-panel"/);
});

test("a failed load shows PageError with retry", () => {
  const html = renderWorkspace({ error: "Could not load Skill Coach" });
  assert.match(html, /data-slot="page-error"/);
  assert.match(html, /Could not load Skill Coach/);
  assert.match(html, /Retry/);
  assert.doesNotMatch(html, /data-slot="page-empty"/);
  assert.doesNotMatch(html, /data-slot="coach-workspace"/);
});

test("no programs shows PageEmpty", () => {
  const html = renderWorkspace();
  assert.match(html, /data-slot="page-empty"/);
  assert.match(html, /No active program/);
  assert.match(html, /href="\/intelligence"/);
  assert.doesNotMatch(html, /data-slot="coach-workspace"/);
  assert.doesNotMatch(html, /data-slot="tutor-panel-marker"/);
});

test("desktop workspace is a 280px rail plus a tutor thread by default", () => {
  const html = renderWorkspace({
    programs: [program],
    allowance,
    planId: "plan-1",
    mode: "tutor",
  });

  assert.match(html, /data-slot="coach-workspace"/);
  assert.match(html, /lg:grid-cols-\[280px_minmax\(0,1fr\)\]/);
  assert.match(
    html,
    /data-slot="program-rail-desktop"[^>]*hidden[^>]*lg:block/,
  );
  assert.match(html, /data-slot="coach-rail-trigger"[^>]*lg:hidden/);
  assert.match(html, /data-slot="coach-allowance"/);
  assert.match(html, /Tutor today/);
  assert.match(html, /1\/5/);
  assert.match(html, /data-slot="tutor-panel-marker"/);
  assert.match(html, /data-mode="tutor"[^>]*aria-selected="true"/);
  assert.doesNotMatch(html, /data-slot="practice-panel"/);
  assert.doesNotMatch(html, /data-slot="mock-panel"/);
  assert.match(html, /React/);
  assert.match(html, /Job posts ask for React\./);
  assert.doesNotMatch(html, /purple|violet|#7c3aed|#6d28d9/i);
});

test("practice mode replaces the tutor thread", () => {
  const html = renderWorkspace({
    programs: [program],
    planId: "plan-1",
    mode: "practice",
  });
  assert.match(html, /data-slot="practice-panel"/);
  assert.match(html, /data-mode="practice"[^>]*aria-selected="true"/);
  assert.doesNotMatch(html, /data-slot="tutor-panel-marker"/);
  assert.doesNotMatch(html, /data-slot="mock-panel"/);
});

test("mock mode replaces the tutor thread", () => {
  const html = renderWorkspace({
    programs: [program],
    planId: "plan-1",
    mode: "mock",
  });
  assert.match(html, /data-slot="mock-panel"/);
  assert.match(html, /data-mode="mock"[^>]*aria-selected="true"/);
  assert.doesNotMatch(html, /data-slot="tutor-panel-marker"/);
  assert.doesNotMatch(html, /data-slot="practice-panel"/);
});

test("practice panel keeps start and submit", () => {
  const html = renderToStaticMarkup(
    <PracticePanel
      coachEnabled
      busy={null}
      task={{ taskId: "t1", prompt: "Explain keys." }}
      answer=""
      grade={null}
      onAnswerChange={() => undefined}
      onStart={() => undefined}
      onSubmit={() => undefined}
    />,
  );
  assert.match(html, /data-slot="practice-panel"/);
  assert.match(html, /Start test/);
  assert.match(html, /Explain keys\./);
  assert.match(html, /Submit answer/);
  assert.doesNotMatch(html, /purple|violet|#7c3aed|#6d28d9/i);
});

test("mock panel keeps the practice-only mock", () => {
  const html = renderToStaticMarkup(
    <MockPanel
      coachEnabled
      busy={null}
      questions={[{ id: "q1", prompt: "Tell me about a bug you fixed." }]}
      answers={{ q1: "" }}
      feedback={null}
      onAnswerChange={() => undefined}
      onStart={() => undefined}
      onSubmit={() => undefined}
    />,
  );
  assert.match(html, /data-slot="mock-panel"/);
  assert.match(html, /A mock is practice only/);
  assert.match(html, /Tell me about a bug you fixed\./);
  assert.match(html, /Submit mock/);
});

test("program rail marks the selected skill", () => {
  const html = renderToStaticMarkup(
    <ProgramRail
      programs={[program]}
      planId="plan-1"
      onSelectPlan={() => undefined}
    />,
  );
  assert.match(html, /data-slot="program-rail"/);
  assert.match(html, /Frontend engineer/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /React/);
});

test("CoachDashboard first paint is the loading skeleton", () => {
  const html = renderToStaticMarkup(<CoachDashboard />);
  assert.match(html, /data-slot="page-header"/);
  assert.match(html, /data-slot="page-skeleton"/);
  assert.doesNotMatch(html, /data-slot="coach-workspace"/);
  assert.match(html, /Refresh/);
  assert.doesNotMatch(html, /data-slot="tutor-composer"/);
});

test("programs and allowance load from one request", () => {
  const source = readFileSync(
    new URL("./coach-dashboard.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /fetch\("\/api\/coach\/programs"\)/);
  assert.doesNotMatch(source, /\/api\/coach\/allowance/);
  assert.match(source, /useCoachSpeech/);
  assert.match(source, /TutorComposer/);
  assert.match(source, /CoachMicButton/);
  assert.match(source, /CoachSpeakerButton/);
});
