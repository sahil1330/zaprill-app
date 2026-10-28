# Skill Coach streaming + Live Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stream Skill Coach tutor chat with the same AI SDK path as Resume Architect, add a kill-switched OpenAI Realtime Live mode on one shared coach core, and show HQ Billing cost and AI failures by action.

**Architecture:** `skill-coach-core` owns instructions, the four tool executions, the active-module pick, and the tutor meter open. Chat is a `ToolLoopAgent` behind `GET`/`POST /api/coach/plans/[id]/ai/chat` and a docked `useChat` thread. Live mints an ephemeral Realtime client secret, registers the same tool schemas, and relays `function_call` to the server for `execute`. Both adapters write UIMessages on the existing tutor `coachSession`. Rolling summary runs only after a chat turn has already streamed.

**Tech Stack:** Next.js App Router route handlers, AI SDK `ai@7` (`ToolLoopAgent`, `createAgentUIStreamResponse`, `smoothStream`, `useChat`, `DefaultChatTransport`), `@ai-sdk/openai`, OpenAI Realtime WebRTC (`gpt-realtime`), Drizzle + Neon, `node:test` + `tsx --test` (`pnpm test:unit`), Biome, shadcn/ui, Streamdown, `use-stick-to-bottom`.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-10-28-skill-coach-streaming-live-design.md` (approved). That file may land from PR #26 (`cursor/skill-coach-streaming-live-design-c8d8`) rather than this branch. Do not merge that PR from this work. Implement against the spec text.
- One implementation PR, commits in task order. That order is the spec rollout: Tasks 1–2 shared core (no user-visible tutor change), Tasks 3–6 chat streaming and JSON-session retirement, Tasks 7–8 Live, Tasks 9–10 admin HQ, Task 11 docs and env. Do not split Live or admin into a follow-up PR.
- Unit tests use **node:test + `tsx --test` / `pnpm test:unit`** — NEVER Vitest (`describe`/`it`/`test` from `node:test`, not vitest). `pnpm test:unit` runs an explicit file list in `package.json`. Every new test file listed below must be appended to that script in the same commit that adds the file. Do not remove existing paths.
- PRs as sahil1330 on `sahil1330/zaprill-app`. Do not merge without Sahil.
- Before adding a route handler, read the route docs under `node_modules/next/dist/docs/`. Prefer API routes. No Server Actions.
- No emoji in UI copy, JSX, or rendered strings. Lucide icons only.
- Tutor stays docked in the coach workspace. Do not make it a floating window. Do not edit `src/components/resume/editor/ResumeArchitectChat.tsx` or `src/lib/agents/resume-architect.ts`. Mirror those patterns; do not extract a shared Resume+Coach UI kit.
- Do not fork tool implementations. Chat and Live both call `executeSkillCoachTool`. The browser never imports it and never sees `OPENAI_API_KEY`.
- Model for chat is `COACH_LIMITS.model` (`gpt-5-mini`). `stopWhen` is `isStepCount(COACH_LIMITS.maxTutorSteps)`. Pass `providerOptions: coachModelOptions` so `reasoningSummary` stays `null` (a detailed summary burns the tutor text budget).
- Do not block the first chat token on `compressTutorSummary`. `ensureSharedOutline` still runs before the stream because the instructions need the module.
- Persist UIMessages (`id`, `role`, `parts`) on `coachSession` where `kind = "tutor"`. No new tables. Read path wraps legacy `{ role, content }` as one text part. Write path always stores UIMessages.
- `GET /api/coach/plans/[id]/ai/chat` does not insert a session. The first chat POST that persists a non-empty assistant reply inserts one. Live mint may insert one because the transcript needs a row.
- Live model id is the constant `COACH_LIVE_MODEL` (`gpt-realtime`). Log action `coach_live`. Live burns the tutor quota: one turn per completed user→assistant exchange with non-empty assistant text.
- `COACH_LIVE_ENABLED` is a server env var. Unset, empty, `false`, and `0` mean off. Only `true`, `yes`, and `1` (any case) mean on. Off hides the Live toggle and rejects mint with `503` `{ error: "COACH_LIVE_DISABLED" }`. Chat streaming stays up.
- Sarvam STT/TTS stay on the chat adapter only. Live uses Realtime audio. Do not call `/api/coach/speech/stt` or `/api/coach/speech/tts` from the Live path.
- Practice, mock, and outline generation stay on their current `generateText` routes. Do not stream them.
- Admin reads add by-action totals and recent `success = false` rows. Do not return `user_id`, `metadata`, prompts, or transcripts. Do not edit `src/app/hq/page.tsx`. The "System Healthy" badge stays. Billing is the source of truth for AI health in this slice.
- New UI uses existing shadcn components and semantic Tailwind tokens. Do not add one-off hex colors. Do not edit `src/app/globals.css`.
- Never log or return raw provider payloads, API keys, or ephemeral secrets except the Realtime client secret field the browser must use.
- After each code commit, run `graphify update .` (AST-only).
- Out of scope: Resume Architect answer quality, page or template metadata, skillset-fit guardrails, red-team harness, Gemini Live, phone or PSTN, external APM.

---

## File map

| Path | Responsibility |
| --- | --- |
| `src/services/coach/tutor-messages.ts` | **Create.** Legacy `{role,content}` ↔ UIMessage, summary shim, agent window, persistence merge. |
| `src/services/coach/tutor-messages.test.ts` | **Create.** Read/write shape, window, shim stripping. |
| `src/services/coach/skill-coach-core.ts` | **Create.** Instructions, four tool executions, Realtime schemas, active module, `openTutorMeter`. |
| `src/services/coach/skill-coach-core.test.ts` | **Create.** Instructions, schema, unknown tool, empty `moduleKey`, re-export identity. |
| `src/lib/agents/skill-coach-tools.ts` | Re-export the core. No second `execute`. |
| `src/services/coach/tutor.service.ts` | **Task 2:** call the core. **Task 6:** delete `sendTutorMessage` and this file. |
| `src/lib/agents/skill-coach-agent.ts` | **Create.** `createSkillCoachAgent` → `ToolLoopAgent`. |
| `src/lib/agents/skill-coach-agent.test.ts` | **Create.** Model, step cap, reasoning summary null, tool names. |
| `src/services/coach/tutor-chat.ts` | **Create.** Pure chat disposition, summary trigger, migration body. |
| `src/services/coach/tutor-chat.service.ts` | **Create.** Session load/save, summary after the stream, meter settle. |
| `src/services/coach/tutor-chat.test.ts` | **Create.** Refund vs persist, summary trigger, migration body, route source guards. |
| `src/app/api/coach/plans/[id]/ai/chat/route.ts` | **Create.** `GET`/`POST` streaming chat. |
| `src/components/coach/tutor-parts.tsx` | **Create.** Text, tool chips, reasoning collapse, labels. |
| `src/components/coach/tutor-parts.test.tsx` | **Create.** Chips, reasoning, empty thread. |
| `src/components/coach/tutor-thread.tsx` | Render UIMessage parts. |
| `src/components/coach/tutor-composer.tsx` | Enter sends, Shift+Enter newline, Stop while streaming. |
| `src/components/coach/tutor-chat.tsx` | **Create.** Docked `useChat` + Sarvam on chat only + Live slot. |
| `src/components/coach/tutor-ui.test.tsx` | UIMessage thread fixtures. Dashboard posts to `ai/chat`. |
| `src/components/coach/coach-dashboard.tsx` | Mount `TutorChat`. Drop `/sessions` tutor POST. |
| `src/app/api/coach/plans/[id]/sessions/route.ts` | `410` migration error. Do not call the model. |
| `scripts/coach-burn-in.ts` | Disabled-coach check uses `assertCoachModelsEnabled`, not `sendTutorMessage`. |
| `src/services/coach/live-flag.ts` | **Create.** `isCoachLiveEnabled`. |
| `src/services/coach/live-session.ts` | **Create.** Mint payload, usage cost, hold actions, secret redaction. |
| `src/services/coach/live-session.service.ts` | **Create.** Hold, abort, tool relay, transcript persist. |
| `src/services/coach/live-session.test.ts` | **Create.** Flag, cost, hold action, redaction, route source guards. |
| `src/services/coach/meter.service.ts` | `settleTutorReserve` for a later request. |
| `src/services/coach/model.ts` | `logCoachCall` accepts `coach_live`, model override, `costUsd`. |
| `src/services/ai/usage.service.ts` | `LogUsageParams.action` includes `coach_live`. Optional `costUsd` override. |
| `src/db/schema.ts` | `ai_action` enum value `coach_live`. |
| `src/db/migrations/0020_coach_live_action.sql` | **Create.** `ALTER TYPE`. |
| `src/db/migrations/meta/_journal.json` | Journal entry `0020_coach_live_action`. |
| `src/app/api/coach/plans/[id]/live/session/route.ts` | **Create.** Mint ephemeral secret. |
| `src/app/api/coach/plans/[id]/live/tool/route.ts` | **Create.** Server `execute` relay. |
| `src/app/api/coach/plans/[id]/live/turn/route.ts` | **Create.** Persist exchange, meter, log `coach_live`. |
| `src/app/api/coach/plans/[id]/live/abort/route.ts` | **Create.** Refund an outstanding mint hold. |
| `src/app/api/coach/programs/route.ts` | Add `liveEnabled` on the GET/POST JSON. |
| `src/components/coach/live-phase.ts` | **Create.** Live phase reducer and event names. |
| `src/components/coach/live-events.ts` | **Create.** Draft, function-call parse, exchange completion. |
| `src/components/coach/live-phase.test.ts` | **Create.** Phases and exchange completion. |
| `src/components/coach/voice/realtime-webrtc.ts` | **Create.** Browser WebRTC. No tool execute. |
| `src/components/coach/use-coach-live.ts` | **Create.** Mint, relay, transcript post, abort on leave. |
| `src/components/coach/coach-live-panel.tsx` | **Create.** Listening / speaking / tool states. No Streamdown. |
| `src/components/coach/format-coach-error.ts` | Map `COACH_LIVE_DISABLED`. |
| `src/services/ai/admin-usage.ts` | **Create.** Action labels, failure rate, row shapers that drop PII. |
| `src/services/ai/admin-usage.test.ts` | **Create.** |
| `src/app/api/admin/stats/route.ts` | Windowed by-action aggregates and recent failures. |
| `src/app/hq/billing/_components/ai-usage-panel.tsx` | **Create.** By-action table and error strip. |
| `src/app/hq/billing/_components/ai-usage-panel.test.tsx` | **Create.** |
| `src/app/hq/billing/_components/billing-content.tsx` | Render the panel under the model table. |
| `docs/skill-coach.md` | Streaming, Live, kill switch, Billing-as-truth note. |
| `.env.example` | `COACH_LIVE_ENABLED` commented unset. |
| `package.json` | Append the new test paths to `test:unit`. |

---

### Task 1: Message shape helpers

**Files:**
- Create: `src/services/coach/tutor-messages.ts`
- Create: `src/services/coach/tutor-messages.test.ts`
- Modify: `package.json` (`test:unit` only)

**Interfaces:**
- Consumes: `UIMessage` from `ai` (type-only).
- Produces:
  - `SUMMARY_SHIM_ID = "coach-summary-shim"`
  - `isLegacyCoachTurn(value: unknown): value is { role: "user" | "assistant"; content: string }`
  - `toUIMessages(value: unknown): UIMessage[]`
  - `textFromUIMessage(message: UIMessage): string`
  - `userTurnText(message: UIMessage): string | null` (trimmed, length 1–4000, else `null`)
  - `latestUserUIMessage(messages: unknown): UIMessage | null`
  - `buildAgentWindow(input: { history: UIMessage[]; summary: string | null; latestUser: UIMessage; historyMessages: number }): UIMessage[]`
  - `messagesForPersistence(input: { stored: UIMessage[]; latestUser: UIMessage; ended: UIMessage[] }): UIMessage[]`

- [ ] **Step 1: Write the failing test**

Create `src/services/coach/tutor-messages.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import type { UIMessage } from "ai";
import {
  buildAgentWindow,
  isLegacyCoachTurn,
  latestUserUIMessage,
  messagesForPersistence,
  SUMMARY_SHIM_ID,
  textFromUIMessage,
  toUIMessages,
  userTurnText,
} from "@/services/coach/tutor-messages";

const user = (id: string, text: string): UIMessage => ({
  id,
  role: "user",
  parts: [{ type: "text", text }],
});

const assistant = (id: string, text: string): UIMessage => ({
  id,
  role: "assistant",
  parts: [{ type: "text", text }],
});

test("legacy turns become one text part with a stable id", () => {
  const messages = toUIMessages([
    { role: "user", content: "Explain hooks" },
    { role: "assistant", content: "Hooks run each render." },
    { role: "system", content: "ignore" },
    { nope: true },
  ]);
  assert.equal(messages.length, 2);
  assert.equal(messages[0]?.id, "legacy-0-user");
  assert.equal(messages[0]?.role, "user");
  assert.deepEqual(messages[0]?.parts, [
    { type: "text", text: "Explain hooks" },
  ]);
  assert.equal(messages[1]?.id, "legacy-1-assistant");
  assert.equal(isLegacyCoachTurn(messages[0]), false);
});

test("UIMessage rows pass through and keep their ids", () => {
  const original = user("msg_1", "Keep me");
  const messages = toUIMessages([original, { role: "user", content: "old" }]);
  assert.equal(messages[0]?.id, "msg_1");
  assert.equal(messages[1]?.id, "legacy-1-user");
});

test("textFromUIMessage joins text parts and ignores tool parts", () => {
  const message: UIMessage = {
    id: "a",
    role: "assistant",
    parts: [
      { type: "text", text: "Hello" },
      {
        type: "tool-getProgress",
        toolCallId: "call_1",
        state: "output-available",
        input: {},
        output: { state: "in_progress" },
      },
      { type: "text", text: "world" },
    ],
  };
  assert.equal(textFromUIMessage(message), "Hello\nworld");
});

test("userTurnText rejects empty and over-long turns", () => {
  assert.equal(userTurnText(user("u", "  hi  ")), "hi");
  assert.equal(userTurnText(user("u", "   ")), null);
  assert.equal(userTurnText(user("u", "x".repeat(4001))), null);
});

test("latestUserUIMessage is the last user message only", () => {
  const messages = [
    user("u1", "first"),
    assistant("a1", "reply"),
    user("u2", "second"),
  ];
  assert.equal(latestUserUIMessage(messages)?.id, "u2");
  assert.equal(latestUserUIMessage([assistant("a1", "only")]), null);
  assert.equal(latestUserUIMessage("nope"), null);
});

test("buildAgentWindow keeps a summary shim and the last history slots", () => {
  const history = [
    user("u1", "1"),
    assistant("a1", "2"),
    user("u2", "3"),
    assistant("a2", "4"),
  ];
  const latest = user("u3", "5");
  const window = buildAgentWindow({
    history,
    summary: "Earlier facts",
    latestUser: latest,
    historyMessages: 3,
  });
  assert.equal(window[0]?.id, SUMMARY_SHIM_ID);
  assert.equal(textFromUIMessage(window[0] as UIMessage), "Earlier summary:\nEarlier facts");
  assert.deepEqual(
    window.slice(1).map((message) => message.id),
    ["a2", "u3"],
  );
});

test("buildAgentWindow omits a blank summary and does not duplicate the latest user", () => {
  const latest = user("u2", "now");
  const window = buildAgentWindow({
    history: [user("u1", "old"), latest],
    summary: "  ",
    latestUser: latest,
    historyMessages: 8,
  });
  assert.deepEqual(
    window.map((message) => message.id),
    ["u1", "u2"],
  );
});

test("messagesForPersistence appends the new turn and drops the summary shim", () => {
  const stored = [
    user(SUMMARY_SHIM_ID, "Earlier summary:\nsecret"),
    user("u1", "old"),
    assistant("a1", "old reply"),
  ];
  const latest = user("u2", "new");
  const ended = [
    user(SUMMARY_SHIM_ID, "Earlier summary:\nsecret"),
    assistant("a1", "old reply"),
    latest,
    assistant("a2", "new reply"),
  ];
  const saved = messagesForPersistence({ stored, latestUser: latest, ended });
  assert.deepEqual(
    saved.map((message) => message.id),
    ["u1", "a1", "u2", "a2"],
  );
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm exec tsx --test src/services/coach/tutor-messages.test.ts`

Expected: FAIL. The module `@/services/coach/tutor-messages` cannot be resolved.

- [ ] **Step 3: Implement the helpers**

Create `src/services/coach/tutor-messages.ts`:

```ts
import type { UIMessage } from "ai";

export const SUMMARY_SHIM_ID = "coach-summary-shim";

const MAX_USER_CHARS = 4000;

export function isLegacyCoachTurn(
  value: unknown,
): value is { role: "user" | "assistant"; content: string } {
  if (!value || typeof value !== "object") return false;
  const turn = value as { role?: unknown; content?: unknown; parts?: unknown };
  if (Array.isArray(turn.parts)) return false;
  return (
    (turn.role === "user" || turn.role === "assistant") &&
    typeof turn.content === "string"
  );
}

function isStoredUIMessage(value: unknown): value is UIMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as { id?: unknown; role?: unknown; parts?: unknown };
  return (
    typeof message.id === "string" &&
    (message.role === "user" || message.role === "assistant") &&
    Array.isArray(message.parts)
  );
}

export function toUIMessages(value: unknown): UIMessage[] {
  if (!Array.isArray(value)) return [];
  const messages: UIMessage[] = [];
  value.forEach((item, index) => {
    if (isStoredUIMessage(item)) {
      messages.push(item);
      return;
    }
    if (isLegacyCoachTurn(item)) {
      messages.push({
        id: `legacy-${index}-${item.role}`,
        role: item.role,
        parts: [{ type: "text", text: item.content }],
      });
    }
  });
  return messages;
}

export function textFromUIMessage(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } =>
        part.type === "text" && "text" in part && typeof part.text === "string",
    )
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export function userTurnText(message: UIMessage): string | null {
  const text = textFromUIMessage(message).trim();
  if (text.length < 1 || text.length > MAX_USER_CHARS) return null;
  return text;
}

export function latestUserUIMessage(messages: unknown): UIMessage | null {
  const ui = toUIMessages(messages);
  for (let index = ui.length - 1; index >= 0; index -= 1) {
    const message = ui[index];
    if (message && message.role === "user" && message.id !== SUMMARY_SHIM_ID) {
      return message;
    }
  }
  return null;
}

export function buildAgentWindow(input: {
  history: UIMessage[];
  summary: string | null;
  latestUser: UIMessage;
  historyMessages: number;
}): UIMessage[] {
  const summary = input.summary?.trim() ?? "";
  const prior = input.history.filter(
    (message) =>
      message.id !== SUMMARY_SHIM_ID && message.id !== input.latestUser.id,
  );
  const slots = Math.max(0, input.historyMessages - 1);
  const window = prior.slice(-slots);
  const shim: UIMessage[] =
    summary.length > 0
      ? [
          {
            id: SUMMARY_SHIM_ID,
            role: "user",
            parts: [{ type: "text", text: `Earlier summary:\n${summary}` }],
          },
        ]
      : [];
  return [...shim, ...window, input.latestUser];
}

export function messagesForPersistence(input: {
  stored: UIMessage[];
  latestUser: UIMessage;
  ended: UIMessage[];
}): UIMessage[] {
  const base = input.stored.filter((message) => message.id !== SUMMARY_SHIM_ID);
  const withUser = base.some((message) => message.id === input.latestUser.id)
    ? base
    : [...base, input.latestUser];
  const seen = new Set(withUser.map((message) => message.id));
  const assistants = input.ended.filter(
    (message) =>
      message.role === "assistant" &&
      message.id !== SUMMARY_SHIM_ID &&
      !seen.has(message.id),
  );
  return [...withUser, ...assistants];
}
```

- [ ] **Step 4: Re-run the test**

Run: `pnpm exec tsx --test src/services/coach/tutor-messages.test.ts`

Expected: PASS. 8 tests pass.

- [ ] **Step 5: Append the test path**

In `package.json`, append a space and `src/services/coach/tutor-messages.test.ts` to the `test:unit` script. Do not remove existing paths.

Run: `pnpm test:unit`

Expected: PASS. The new file is in the run.

- [ ] **Step 6: Commit**

```bash
git add src/services/coach/tutor-messages.ts src/services/coach/tutor-messages.test.ts package.json
git commit -m "test: add skill coach UIMessage helpers"
```

---

### Task 2: Shared core extract

**Files:**
- Create: `src/services/coach/skill-coach-core.ts`
- Create: `src/services/coach/skill-coach-core.test.ts`
- Modify: `src/lib/agents/skill-coach-tools.ts`
- Modify: `src/services/coach/tutor.service.ts`
- Modify: `package.json` (`test:unit` only)

**Interfaces:**
- Consumes: `COACH_LANGUAGE_RULES`, `COACH_FACT_RULES`, `COACH_LIMITS`, `emptyToolInputSchema`, `openCoachMeter`, `MeterHold`, `CoachTier`, `CoachOutline`.
- Produces:
  - `interface SkillCoachTurnContext { userId: string; planId: string; skillKey: string; displayName: string; roleTitle: string; segment: string | null; module: { key: string; title: string; objective: string } | null; summary: string | null }`
  - `type SkillCoachToolContext = SkillCoachTurnContext` (alias, same fields)
  - `const SKILL_COACH_TOOL_NAMES = ["getLearningContext", "listCuratedResources", "getProgress", "setModuleStatus"] as const`
  - `type SkillCoachToolName = (typeof SKILL_COACH_TOOL_NAMES)[number]`
  - `buildSkillCoachInstructions(ctx: SkillCoachTurnContext): string`
  - `activeCoachModule(outline: CoachOutline, currentModuleKey: string | null | undefined): SkillCoachTurnContext["module"]`
  - `skillCoachRealtimeTools(): Array<{ type: "function"; name: SkillCoachToolName; description: string; parameters: Record<string, unknown> }>`
  - `executeSkillCoachTool(ctx: SkillCoachTurnContext, name: string, input: unknown): Promise<Record<string, unknown>>`
  - `createSkillCoachTools(ctx: SkillCoachTurnContext):` the same four AI SDK tools as today
  - `openTutorMeter(input: { userId: string; tier: CoachTier }): Promise<MeterHold>`

- [ ] **Step 1: Write the failing test**

Create `src/services/coach/skill-coach-core.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  createSkillCoachTools as toolsFromAgentPath,
  type SkillCoachToolContext,
} from "@/lib/agents/skill-coach-tools";
import { COACH_FACT_RULES, COACH_LANGUAGE_RULES } from "@/services/coach/prompts";
import {
  activeCoachModule,
  buildSkillCoachInstructions,
  createSkillCoachTools,
  executeSkillCoachTool,
  skillCoachRealtimeTools,
  SKILL_COACH_TOOL_NAMES,
  type SkillCoachTurnContext,
} from "@/services/coach/skill-coach-core";

const ctx: SkillCoachTurnContext = {
  userId: "user_1",
  planId: "plan_1",
  skillKey: "react",
  displayName: "React",
  roleTitle: "Frontend engineer",
  segment: "fresher",
  module: {
    key: "hooks",
    title: "Hooks",
    objective: "Use state and effect.",
  },
  summary: "Covered JSX.",
};

test("instructions keep the current tutor rules and the active module", () => {
  const text = buildSkillCoachInstructions(ctx);
  assert.match(text, /Frontend engineer/);
  assert.match(text, /Current skill: React/);
  assert.match(text, /Module: Hooks/);
  assert.match(text, /Use state and effect/);
  assert.match(text, /Call getLearningContext before a long explanation/);
  assert.ok(text.includes(COACH_LANGUAGE_RULES));
  assert.ok(text.includes(COACH_FACT_RULES));
  assert.doesNotMatch(text, /salary|resume/i);
});

test("activeCoachModule prefers the progress key and falls back to the first module", () => {
  const outline = {
    why: "Jobs ask for it.",
    estimatedTime: "2 weeks",
    modules: [
      { key: "jsx", title: "JSX", objective: "Markup", resources: [] },
      { key: "hooks", title: "Hooks", objective: "State", resources: [] },
    ],
  };
  assert.equal(activeCoachModule(outline, "hooks")?.key, "hooks");
  assert.equal(activeCoachModule(outline, "missing")?.key, "jsx");
  assert.equal(activeCoachModule(outline, null)?.key, "jsx");
  assert.equal(
    activeCoachModule({ why: "", estimatedTime: "", modules: [] }, null),
    null,
  );
});

test("realtime schemas are the four tools and setModuleStatus cannot name a status", () => {
  const tools = skillCoachRealtimeTools();
  assert.deepEqual(
    tools.map((tool) => tool.name),
    [...SKILL_COACH_TOOL_NAMES],
  );
  const status = tools.find((tool) => tool.name === "setModuleStatus");
  assert.ok(status);
  const parameters = status.parameters as {
    properties: Record<string, unknown>;
    required: string[];
  };
  assert.deepEqual(Object.keys(parameters.properties), ["moduleKey"]);
  assert.deepEqual(parameters.required, ["moduleKey"]);
  assert.match(status.description, /Cannot set demonstrated or verified/);
  const resources = tools.find((tool) => tool.name === "listCuratedResources");
  assert.match(resources?.description ?? "", /Do not invent links/);
});

test("getLearningContext returns the turn context and no salary or resume", () => {
  return executeSkillCoachTool(ctx, "getLearningContext", {}).then((result) => {
    assert.equal(result.segment, "fresher");
    assert.equal(result.roleTitle, "Frontend engineer");
    assert.equal(result.skill, "React");
    assert.equal(result.normalizedName, "react");
    assert.equal("salary" in result, false);
    assert.equal("resume" in result, false);
  });
});

test("unknown tools and empty module keys fail closed without throwing", () => {
  return Promise.all([
    executeSkillCoachTool(ctx, "web_search", {}),
    executeSkillCoachTool(ctx, "setModuleStatus", { moduleKey: "" }),
    executeSkillCoachTool(ctx, "setModuleStatus", { status: "verified" }),
  ]).then(([unknown, empty, verified]) => {
    assert.deepEqual(unknown, { error: "unknown_tool" });
    assert.deepEqual(empty, { updated: false, error: "invalid_input" });
    assert.deepEqual(verified, { updated: false, error: "invalid_input" });
  });
});

test("the agent path re-exports the core factory", () => {
  assert.equal(toolsFromAgentPath, createSkillCoachTools);
  const aliased: SkillCoachToolContext = ctx;
  assert.equal(aliased.planId, "plan_1");
  assert.deepEqual(Object.keys(createSkillCoachTools(ctx)), [
    ...SKILL_COACH_TOOL_NAMES,
  ]);
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm exec tsx --test src/services/coach/skill-coach-core.test.ts`

Expected: FAIL. `@/services/coach/skill-coach-core` cannot be resolved.

- [ ] **Step 3: Add the core module**

Create `src/services/coach/skill-coach-core.ts`:

```ts
import { tool } from "ai";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import db from "@/db";
import { coachProgress, learningResources } from "@/db/schema";
import type { CoachOutline } from "@/services/coach/gaps";
import type { CoachTier } from "@/services/coach/limits";
import { openCoachMeter, type MeterHold } from "@/services/coach/meter.service";
import {
  COACH_FACT_RULES,
  COACH_LANGUAGE_RULES,
} from "@/services/coach/prompts";
import { emptyToolInputSchema } from "@/services/coach/provider-schema";

export interface SkillCoachTurnContext {
  userId: string;
  planId: string;
  skillKey: string;
  displayName: string;
  roleTitle: string;
  segment: string | null;
  module: {
    key: string;
    title: string;
    objective: string;
  } | null;
  summary: string | null;
}

export type SkillCoachToolContext = SkillCoachTurnContext;

export const SKILL_COACH_TOOL_NAMES = [
  "getLearningContext",
  "listCuratedResources",
  "getProgress",
  "setModuleStatus",
] as const;

export type SkillCoachToolName = (typeof SKILL_COACH_TOOL_NAMES)[number];

const MODULE_KEY = z.object({
  moduleKey: z.string().trim().min(1).max(80),
});

const TOOL_COPY: Record<
  SkillCoachToolName,
  { description: string; parameters: Record<string, unknown> }
> = {
  getLearningContext: {
    description:
      "Read the learner's segment, target role, skill, current module, and rolling summary. No resume and no salary.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
      required: [],
    },
  },
  listCuratedResources: {
    description:
      "List active catalog resources for this skill. Use only these URLs. Do not invent links.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
      required: [],
    },
  },
  getProgress: {
    description:
      "Read progress for this plan. You cannot mark a skill verified.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
      required: [],
    },
  },
  setModuleStatus: {
    description:
      "Move this plan from not_started to in_progress. Cannot set demonstrated or verified.",
    parameters: {
      type: "object",
      properties: {
        moduleKey: { type: "string", minLength: 1, maxLength: 80 },
      },
      required: ["moduleKey"],
      additionalProperties: false,
    },
  },
};

export function buildSkillCoachInstructions(ctx: SkillCoachTurnContext): string {
  return `You are Zaprill Skill Coach, tutoring one technical skill for the role "${ctx.roleTitle}".
Current skill: ${ctx.displayName}.
Module: ${ctx.module?.title ?? ctx.displayName}. Objective: ${ctx.module?.objective || "Build working familiarity."}
Call getLearningContext before a long explanation. Use listCuratedResources when suggesting material. Use setModuleStatus only to mark the module in progress.
${COACH_LANGUAGE_RULES}
${COACH_FACT_RULES}`;
}

export function activeCoachModule(
  outline: CoachOutline,
  currentModuleKey: string | null | undefined,
): SkillCoachTurnContext["module"] {
  const module =
    outline.modules.find((item) => item.key === currentModuleKey) ??
    outline.modules[0];
  if (!module) return null;
  return { key: module.key, title: module.title, objective: module.objective };
}

export function skillCoachRealtimeTools(): Array<{
  type: "function";
  name: SkillCoachToolName;
  description: string;
  parameters: Record<string, unknown>;
}> {
  return SKILL_COACH_TOOL_NAMES.map((name) => ({
    type: "function" as const,
    name,
    description: TOOL_COPY[name].description,
    parameters: TOOL_COPY[name].parameters,
  }));
}

function isToolName(name: string): name is SkillCoachToolName {
  return (SKILL_COACH_TOOL_NAMES as readonly string[]).includes(name);
}

export async function executeSkillCoachTool(
  ctx: SkillCoachTurnContext,
  name: string,
  input: unknown,
): Promise<Record<string, unknown>> {
  if (!isToolName(name)) return { error: "unknown_tool" };
  try {
    if (name === "getLearningContext") {
      return {
        segment: ctx.segment,
        roleTitle: ctx.roleTitle,
        skill: ctx.displayName,
        normalizedName: ctx.skillKey,
        module: ctx.module,
        summary: ctx.summary,
      };
    }
    if (name === "listCuratedResources") {
      const rows = await db
        .select({
          name: learningResources.name,
          url: learningResources.url,
          type: learningResources.type,
          isFree: learningResources.isFree,
          estimatedTime: learningResources.estimatedTime,
        })
        .from(learningResources)
        .where(
          and(
            eq(learningResources.skill, ctx.skillKey),
            eq(learningResources.isActive, true),
          ),
        )
        .limit(8);
      return { resources: rows };
    }
    if (name === "getProgress") {
      const [row] = await db
        .select()
        .from(coachProgress)
        .where(
          and(
            eq(coachProgress.planId, ctx.planId),
            eq(coachProgress.userId, ctx.userId),
          ),
        )
        .limit(1);
      return {
        state: row?.state ?? "not_started",
        currentModuleKey: row?.currentModuleKey ?? null,
        tasksAttempted: row?.tasksAttempted ?? 0,
        tasksPassed: row?.tasksPassed ?? 0,
        masteryScore: row?.masteryScore ?? null,
      };
    }
    const parsed = MODULE_KEY.safeParse(input);
    if (!parsed.success) return { updated: false, error: "invalid_input" };
    const [row] = await db
      .select()
      .from(coachProgress)
      .where(eq(coachProgress.planId, ctx.planId))
      .limit(1);
    if (!row || row.userId !== ctx.userId || row.state !== "not_started") {
      return { updated: false, state: row?.state ?? "not_started" };
    }
    await db
      .update(coachProgress)
      .set({
        state: "in_progress",
        currentModuleKey: parsed.data.moduleKey,
        lastSessionAt: new Date(),
      })
      .where(eq(coachProgress.planId, ctx.planId));
    return { updated: true, state: "in_progress" };
  } catch {
    return { error: "tool_failed" };
  }
}

export function createSkillCoachTools(ctx: SkillCoachTurnContext) {
  return {
    getLearningContext: tool({
      description: TOOL_COPY.getLearningContext.description,
      inputSchema: emptyToolInputSchema,
      execute: async () => executeSkillCoachTool(ctx, "getLearningContext", {}),
    }),
    listCuratedResources: tool({
      description: TOOL_COPY.listCuratedResources.description,
      inputSchema: emptyToolInputSchema,
      execute: async () =>
        executeSkillCoachTool(ctx, "listCuratedResources", {}),
    }),
    getProgress: tool({
      description: TOOL_COPY.getProgress.description,
      inputSchema: emptyToolInputSchema,
      execute: async () => executeSkillCoachTool(ctx, "getProgress", {}),
    }),
    setModuleStatus: tool({
      description: TOOL_COPY.setModuleStatus.description,
      inputSchema: MODULE_KEY,
      execute: async (input) =>
        executeSkillCoachTool(ctx, "setModuleStatus", input),
    }),
  };
}

export async function openTutorMeter(input: {
  userId: string;
  tier: CoachTier;
}): Promise<MeterHold> {
  return openCoachMeter({
    userId: input.userId,
    tier: input.tier,
    quota: "tutor",
    spend: "tutor",
  });
}
```

Replace `src/lib/agents/skill-coach-tools.ts` with:

```ts
export {
  createSkillCoachTools,
  executeSkillCoachTool,
  skillCoachRealtimeTools,
  SKILL_COACH_TOOL_NAMES,
  type SkillCoachToolContext,
  type SkillCoachToolName,
  type SkillCoachTurnContext,
} from "@/services/coach/skill-coach-core";
```

- [ ] **Step 4: Point the JSON tutor at the core without changing its control flow**

In `src/services/coach/tutor.service.ts`, replace the import of `createSkillCoachTools` and `openCoachMeter` with:

```ts
import {
  activeCoachModule,
  buildSkillCoachInstructions,
  createSkillCoachTools,
  openTutorMeter,
} from "@/services/coach/skill-coach-core";
```

Delete the `openCoachMeter` import from `@/services/coach/meter.service`. Delete the `COACH_FACT_RULES` / `COACH_LANGUAGE_RULES` import from this file (the core owns that copy). Keep `COACH_LIMITS`.

Replace the meter open:

```ts
  const meter = await openTutorMeter({ userId, tier });
```

Replace the module lookup and the `generateText` `system` / `tools` fields with:

```ts
    const outlineModule = activeCoachModule(
      outline,
      context.progress?.currentModuleKey,
    );
    const turn = {
      userId,
      planId,
      skillKey: context.plan.skillKey,
      displayName: context.plan.displayName,
      roleTitle: context.program.roleTitle,
      segment: context.segment,
      module: outlineModule,
      summary,
    };

    const result = await generateText({
      model: openai(COACH_LIMITS.model),
      system: buildSkillCoachInstructions(turn),
      messages,
      tools: createSkillCoachTools(turn),
      stopWhen: isStepCount(COACH_LIMITS.maxTutorSteps),
      maxOutputTokens: COACH_LIMITS.tutorMaxOutputTokens,
      providerOptions: coachModelOptions,
    });
```

Use `outlineModule?.key` wherever this function previously used `module?.key` for `moduleKey` on the session update. Leave summarize-before-generate, `{ role, content }` persistence, quota, and logging as they are in this task. This commit must not change the HTTP response of `POST …/sessions`.

- [ ] **Step 5: Re-run the test**

Run: `pnpm exec tsx --test src/services/coach/skill-coach-core.test.ts`

Expected: PASS. 6 tests pass.

Run: `pnpm exec tsc --noEmit --pretty false`

Expected: PASS. `tutor.service.ts` typechecks against `openTutorMeter` and `activeCoachModule`.

- [ ] **Step 6: Append the test path**

Append `src/services/coach/skill-coach-core.test.ts` to `package.json` `test:unit`.

Run: `pnpm test:unit`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/services/coach/skill-coach-core.ts src/services/coach/skill-coach-core.test.ts src/lib/agents/skill-coach-tools.ts src/services/coach/tutor.service.ts package.json
git commit -m "refactor: extract the skill coach core"
```

---

### Task 3: Skill Coach ToolLoopAgent

**Files:**
- Create: `src/lib/agents/skill-coach-agent.ts`
- Create: `src/lib/agents/skill-coach-agent.test.ts`
- Modify: `package.json` (`test:unit` only)

**Interfaces:**
- Consumes: `SkillCoachTurnContext`, `buildSkillCoachInstructions`, `createSkillCoachTools`, `SKILL_COACH_TOOL_NAMES`, `COACH_LIMITS`, `coachModelOptions`.
- Produces:
  - `interface SkillCoachAgentContext { turn: SkillCoachTurnContext; onUsage?: (usage: LanguageModelUsage) => void }`
  - `skillCoachAgentSettings(ctx: SkillCoachAgentContext): { id: "skill-coach"; modelId: string; instructions: string; stopSteps: number; maxOutputTokens: number; toolNames: string[]; reasoningEffort: "low"; reasoningSummary: null }`
  - `createSkillCoachAgent(ctx: SkillCoachAgentContext): ToolLoopAgent`
  - `type SkillCoachUIMessage = InferAgentUIMessage<ReturnType<typeof createSkillCoachAgent>>`

- [ ] **Step 1: Write the failing test**

Create `src/lib/agents/skill-coach-agent.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { COACH_LIMITS } from "@/services/coach/limits";
import { coachModelOptions } from "@/services/coach/model";
import { SKILL_COACH_TOOL_NAMES } from "@/services/coach/skill-coach-core";
import {
  createSkillCoachAgent,
  skillCoachAgentSettings,
} from "@/lib/agents/skill-coach-agent";

const turn = {
  userId: "user_1",
  planId: "plan_1",
  skillKey: "react",
  displayName: "React",
  roleTitle: "Frontend engineer",
  segment: "fresher",
  module: { key: "hooks", title: "Hooks", objective: "Use state." },
  summary: null,
};

test("agent settings pin gpt-5-mini, the tutor step cap, and a null reasoning summary", () => {
  const settings = skillCoachAgentSettings({ turn });
  assert.equal(settings.id, "skill-coach");
  assert.equal(settings.modelId, COACH_LIMITS.model);
  assert.equal(settings.modelId, "gpt-5-mini");
  assert.equal(settings.stopSteps, COACH_LIMITS.maxTutorSteps);
  assert.equal(settings.maxOutputTokens, COACH_LIMITS.tutorMaxOutputTokens);
  assert.deepEqual(settings.toolNames, [...SKILL_COACH_TOOL_NAMES]);
  assert.equal(settings.reasoningEffort, "low");
  assert.equal(settings.reasoningSummary, null);
  assert.equal(
    settings.reasoningSummary,
    coachModelOptions.openai.reasoningSummary,
  );
  assert.match(settings.instructions, /Frontend engineer/);
});

test("createSkillCoachAgent returns the skill-coach agent", () => {
  const agent = createSkillCoachAgent({ turn });
  assert.equal(agent.id, "skill-coach");
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm exec tsx --test src/lib/agents/skill-coach-agent.test.ts`

Expected: FAIL. `@/lib/agents/skill-coach-agent` cannot be resolved.

- [ ] **Step 3: Implement the agent**

Create `src/lib/agents/skill-coach-agent.ts`:

```ts
import { openai } from "@ai-sdk/openai";
import {
  type InferAgentUIMessage,
  isStepCount,
  type LanguageModelUsage,
  ToolLoopAgent,
} from "ai";
import { COACH_LIMITS } from "@/services/coach/limits";
import { coachModelOptions } from "@/services/coach/model";
import {
  buildSkillCoachInstructions,
  createSkillCoachTools,
  SKILL_COACH_TOOL_NAMES,
  type SkillCoachTurnContext,
} from "@/services/coach/skill-coach-core";

export interface SkillCoachAgentContext {
  turn: SkillCoachTurnContext;
  onUsage?: (usage: LanguageModelUsage) => void;
}

export function skillCoachAgentSettings(ctx: SkillCoachAgentContext) {
  return {
    id: "skill-coach" as const,
    modelId: COACH_LIMITS.model,
    instructions: buildSkillCoachInstructions(ctx.turn),
    stopSteps: COACH_LIMITS.maxTutorSteps,
    maxOutputTokens: COACH_LIMITS.tutorMaxOutputTokens,
    toolNames: [...SKILL_COACH_TOOL_NAMES],
    reasoningEffort: coachModelOptions.openai.reasoningEffort,
    reasoningSummary: coachModelOptions.openai.reasoningSummary,
  };
}

export function createSkillCoachAgent(ctx: SkillCoachAgentContext) {
  const settings = skillCoachAgentSettings(ctx);
  return new ToolLoopAgent({
    id: settings.id,
    model: openai(settings.modelId),
    instructions: settings.instructions,
    tools: createSkillCoachTools(ctx.turn),
    stopWhen: isStepCount(settings.stopSteps),
    maxOutputTokens: settings.maxOutputTokens,
    providerOptions: coachModelOptions,
    onEnd: ({ usage }) => {
      ctx.onUsage?.(usage);
    },
  });
}

export type SkillCoachUIMessage = InferAgentUIMessage<
  ReturnType<typeof createSkillCoachAgent>
>;
```

- [ ] **Step 4: Re-run the test**

Run: `pnpm exec tsx --test src/lib/agents/skill-coach-agent.test.ts`

Expected: PASS. 2 tests pass. `agent.id` is `skill-coach`.

- [ ] **Step 5: Append the test path**

Append `src/lib/agents/skill-coach-agent.test.ts` to `package.json` `test:unit`.

Run: `pnpm test:unit`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/agents/skill-coach-agent.ts src/lib/agents/skill-coach-agent.test.ts package.json
git commit -m "feat: add the skill coach ToolLoopAgent"
```

---

### Task 4: Streaming chat route

**Files:**
- Create: `src/services/coach/tutor-chat.ts`
- Create: `src/services/coach/tutor-chat.service.ts`
- Create: `src/services/coach/tutor-chat.test.ts`
- Create: `src/app/api/coach/plans/[id]/ai/chat/route.ts`
- Modify: `package.json` (`test:unit` only)

**Interfaces:**
- Consumes: `toUIMessages`, `textFromUIMessage`, `userTurnText`, `latestUserUIMessage`, `buildAgentWindow`, `messagesForPersistence`, `SUMMARY_SHIM_ID`, `createSkillCoachAgent`, `SkillCoachUIMessage`, `activeCoachModule`, `openTutorMeter`, `loadPlanContext`, `ensureSharedOutline`, `settleFailure`, `logCoachCall`, `readTokenUsage`, `paiseForTokens`, `actualPaise`, `COACH_LIMITS`.
- Produces:
  - `chatTurnDisposition(input: { aborted: boolean; assistantText: string }): "refund" | "persist"`
  - `summaryDue(messageCount: number, threshold?: number): boolean`
  - `tutorSessionMigrationBody(): { error: "TUTOR_MOVED"; detail: string }`
  - `loadActiveTutorSession(userId: string, planId: string): Promise<typeof coachSession.$inferSelect | null>` (no insert)
  - `persistTutorTurn(...)` and `compressTutorSummary(...)` used by the route's `onEnd`
  - Route `GET` returns `{ messages: UIMessage[] }`. Route `POST` streams UI messages.

- [ ] **Step 1: Write the failing test**

Create `src/services/coach/tutor-chat.test.ts`:

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { COACH_LIMITS } from "@/services/coach/limits";
import {
  chatTurnDisposition,
  summaryDue,
  tutorSessionMigrationBody,
} from "@/services/coach/tutor-chat";

test("aborted and empty assistant turns refund", () => {
  assert.equal(
    chatTurnDisposition({ aborted: true, assistantText: "partial" }),
    "refund",
  );
  assert.equal(
    chatTurnDisposition({ aborted: false, assistantText: "  " }),
    "refund",
  );
  assert.equal(
    chatTurnDisposition({ aborted: false, assistantText: "A closure keeps scope." }),
    "persist",
  );
});

test("summary is due only at the history threshold", () => {
  assert.equal(summaryDue(COACH_LIMITS.summaryAfterMessages - 1), false);
  assert.equal(summaryDue(COACH_LIMITS.summaryAfterMessages), true);
  assert.equal(summaryDue(3, 3), true);
});

test("the migration body names the chat route", () => {
  assert.deepEqual(tutorSessionMigrationBody(), {
    error: "TUTOR_MOVED",
    detail: "Tutor chat moved to POST /api/coach/plans/:id/ai/chat",
  });
});

test("the chat route streams with the architect helpers and does not summarize first", () => {
  const source = readFileSync(
    new URL("../../app/api/coach/plans/[id]/ai/chat/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /createAgentUIStreamResponse/);
  assert.match(source, /smoothStream\(\{ chunking: "word" \}\)/);
  assert.match(source, /createSkillCoachAgent/);
  assert.match(source, /sendReasoning: true/);
  assert.match(source, /abortSignal: request\.signal/);
  assert.match(source, /compressTutorSummary/);
  assert.doesNotMatch(source, /generateText\(/);
  const streamAt = source.indexOf("createAgentUIStreamResponse");
  const summaryAt = source.indexOf("compressTutorSummary");
  assert.ok(streamAt > -1 && summaryAt > streamAt);
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm exec tsx --test src/services/coach/tutor-chat.test.ts`

Expected: FAIL. `@/services/coach/tutor-chat` cannot be resolved, and the route file is missing.

- [ ] **Step 3: Add the pure chat decisions**

Create `src/services/coach/tutor-chat.ts`:

```ts
import { COACH_LIMITS } from "@/services/coach/limits";

export function chatTurnDisposition(input: {
  aborted: boolean;
  assistantText: string;
}): "refund" | "persist" {
  if (input.aborted) return "refund";
  if (input.assistantText.trim().length === 0) return "refund";
  return "persist";
}

export function summaryDue(
  messageCount: number,
  threshold: number = COACH_LIMITS.summaryAfterMessages,
): boolean {
  return messageCount >= threshold;
}

export function tutorSessionMigrationBody(): {
  error: "TUTOR_MOVED";
  detail: string;
} {
  return {
    error: "TUTOR_MOVED",
    detail: "Tutor chat moved to POST /api/coach/plans/:id/ai/chat",
  };
}
```

- [ ] **Step 4: Add session persistence and the route**

Create `src/services/coach/tutor-chat.service.ts`:

```ts
import { openai } from "@ai-sdk/openai";
import { generateText, type UIMessage } from "ai";
import { and, desc, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import db from "@/db";
import { coachProgress, coachSession } from "@/db/schema";
import { COACH_LIMITS } from "@/services/coach/limits";
import {
  actualPaise,
  coachModelOptions,
  logCoachCall,
  paiseForTokens,
  readTokenUsage,
  usageFromError,
} from "@/services/coach/model";
import { textFromUIMessage, toUIMessages } from "@/services/coach/tutor-messages";

const OPEN_STATUSES = ["active", "live_hold"] as const;

export async function loadActiveTutorSession(userId: string, planId: string) {
  const [existing] = await db
    .select()
    .from(coachSession)
    .where(
      and(
        eq(coachSession.userId, userId),
        eq(coachSession.planId, planId),
        eq(coachSession.kind, "tutor"),
        inArray(coachSession.status, [...OPEN_STATUSES]),
      ),
    )
    .orderBy(desc(coachSession.startedAt))
    .limit(1);
  return existing ?? null;
}

export async function insertTutorSession(input: {
  userId: string;
  planId: string;
  programId: string;
  messages: UIMessage[];
  summary: string | null;
  moduleKey: string | null;
  turnCount: number;
}) {
  const id = nanoid();
  const [created] = await db
    .insert(coachSession)
    .values({
      id,
      planId: input.planId,
      programId: input.programId,
      userId: input.userId,
      kind: "tutor",
      status: "active",
      messages: input.messages,
      summary: input.summary,
      moduleKey: input.moduleKey,
      turnCount: input.turnCount,
    })
    .returning();
  return created;
}

export async function saveTutorSession(input: {
  sessionId: string;
  messages: UIMessage[];
  summary: string | null;
  moduleKey: string | null;
  turnCount: number;
}) {
  await db
    .update(coachSession)
    .set({
      messages: input.messages,
      summary: input.summary,
      moduleKey: input.moduleKey,
      turnCount: input.turnCount,
    })
    .where(eq(coachSession.id, input.sessionId));
}

export async function touchCoachProgress(planId: string) {
  await db
    .update(coachProgress)
    .set({ lastSessionAt: new Date() })
    .where(eq(coachProgress.planId, planId));
}

export function sessionUiMessages(value: unknown): UIMessage[] {
  return toUIMessages(value);
}

/**
 * Runs only after the streamed tutor turn has settled.
 * A failed call returns null and the caller keeps the previous summary.
 */
export async function compressTutorSummary(input: {
  userId: string;
  tier: string;
  planId: string;
  sessionId: string;
  skillKey: string;
  messages: UIMessage[];
}): Promise<{ summary: string; paise: number | null } | null> {
  const older = input.messages.slice(0, Math.floor(input.messages.length / 2));
  if (older.length === 0) return null;
  const started = Date.now();
  try {
    const { text, usage } = await generateText({
      model: openai(COACH_LIMITS.model),
      maxOutputTokens: COACH_LIMITS.summaryMaxOutputTokens,
      providerOptions: coachModelOptions,
      prompt: `Compress this tutoring span into at most 150 words. Keep the language of the span. Keep technical names in English.
${older.map((turn) => `${turn.role}: ${textFromUIMessage(turn)}`).join("\n")}`,
    });
    const tokens = readTokenUsage(usage);
    const summary = text.trim();
    logCoachCall({
      userId: input.userId,
      action: "coach_tutor",
      usage: tokens,
      latencyMs: Date.now() - started,
      success: Boolean(summary),
      errorCode: summary ? undefined : "EMPTY_SUMMARY",
      metadata: {
        planId: input.planId,
        sessionId: input.sessionId,
        normalizedName: input.skillKey,
        kind: "summary",
        adapter: "chat",
        tier: input.tier,
      },
    });
    if (!summary) {
      return {
        summary: "",
        paise: paiseForTokens(
          COACH_LIMITS.model,
          tokens.promptTokens,
          tokens.completionTokens,
        ),
      };
    }
    return {
      summary,
      paise: paiseForTokens(
        COACH_LIMITS.model,
        tokens.promptTokens,
        tokens.completionTokens,
      ),
    };
  } catch (error) {
    const usage = usageFromError(error) ?? {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      reasoningTokens: 0,
    };
    logCoachCall({
      userId: input.userId,
      action: "coach_tutor",
      usage,
      latencyMs: Date.now() - started,
      success: false,
      errorCode: "SCHEMA_VALIDATION_FAILED",
      metadata: {
        planId: input.planId,
        sessionId: input.sessionId,
        kind: "summary",
        adapter: "chat",
        tier: input.tier,
      },
    });
    return {
      summary: "",
      paise: usage.totalTokens
        ? paiseForTokens(
            COACH_LIMITS.model,
            usage.promptTokens,
            usage.completionTokens,
          )
        : null,
    };
  }
}
```

Create `src/app/api/coach/plans/[id]/ai/chat/route.ts`:

```ts
import {
  AISDKError,
  createAgentUIStreamResponse,
  createIdGenerator,
  smoothStream,
  type UIMessage,
} from "ai";
import { NextResponse } from "next/server";
import {
  createSkillCoachAgent,
  type SkillCoachUIMessage,
} from "@/lib/agents/skill-coach-agent";
import { requireApiUserId } from "@/lib/api-session";
import { coachErrorResponse } from "@/lib/coach/http";
import {
  ensureSharedOutline,
  loadPlanContext,
  settleFailure,
} from "@/services/coach/context.service";
import {
  assertCoachModelsEnabled,
  resolveCoachTier,
} from "@/services/coach/entitlement.service";
import { coachNotFound } from "@/services/coach/errors";
import { COACH_LIMITS } from "@/services/coach/limits";
import type { MeterHold } from "@/services/coach/meter.service";
import {
  actualPaise,
  logCoachCall,
  paiseForTokens,
  readTokenUsage,
} from "@/services/coach/model";
import {
  activeCoachModule,
  openTutorMeter,
} from "@/services/coach/skill-coach-core";
import { chatTurnDisposition, summaryDue } from "@/services/coach/tutor-chat";
import {
  compressTutorSummary,
  insertTutorSession,
  loadActiveTutorSession,
  saveTutorSession,
  sessionUiMessages,
  touchCoachProgress,
} from "@/services/coach/tutor-chat.service";
import {
  buildAgentWindow,
  latestUserUIMessage,
  messagesForPersistence,
  textFromUIMessage,
  userTurnText,
} from "@/services/coach/tutor-messages";

export const maxDuration = 60;

type RouteParams = { params: Promise<{ id: string }> };

async function requirePlan(planId: string) {
  const authResult = await requireApiUserId();
  if (!authResult.ok) return authResult;
  const context = await loadPlanContext(authResult.userId, planId);
  if (!context) throw coachNotFound("Plan not found");
  return { ok: true as const, userId: authResult.userId, context };
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authz = await requirePlan(id);
    if ("response" in authz) return authz.response;
    const session = await loadActiveTutorSession(authz.userId, id);
    return NextResponse.json({
      messages: session ? sessionUiMessages(session.messages) : [],
    });
  } catch (error) {
    return coachErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const started = Date.now();
  let meter: MeterHold | null = null;
  let settled = false;
  try {
    const { id: planId } = await params;
    await assertCoachModelsEnabled();
    const authz = await requirePlan(planId);
    if ("response" in authz) return authz.response;
    const { userId, context } = authz;
    const tier = await resolveCoachTier(userId);

    let body: { messages?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const latestUser = latestUserUIMessage(body.messages);
    const latestText = latestUser ? userTurnText(latestUser) : null;
    if (!latestUser || !latestText) {
      return NextResponse.json(
        { error: "A user message of 1 to 4000 characters is required" },
        { status: 400 },
      );
    }

    const outline = await ensureSharedOutline({
      userId,
      tier,
      planId,
      skillKey: context.plan.skillKey,
      displayName: context.plan.displayName,
      segment: context.segment,
      outline: context.outline,
    });
    const module = activeCoachModule(
      outline,
      context.progress?.currentModuleKey,
    );
    const existing = await loadActiveTutorSession(userId, planId);
    const stored = existing ? sessionUiMessages(existing.messages) : [];
    let summary = existing?.summary ?? null;
    const agentMessages = buildAgentWindow({
      history: stored,
      summary,
      latestUser,
      historyMessages: COACH_LIMITS.historyMessages,
    });

    meter = await openTutorMeter({ userId, tier });
    const hold = meter;
    const charges: Array<number | null> = [];
    let turnUsage = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      reasoningTokens: 0,
    };

    const turn = {
      userId,
      planId,
      skillKey: context.plan.skillKey,
      displayName: context.plan.displayName,
      roleTitle: context.program.roleTitle,
      segment: context.segment,
      module,
      summary,
    };
    const agent = createSkillCoachAgent({
      turn,
      onUsage: (usage) => {
        turnUsage = readTokenUsage(usage);
      },
    });

    return await createAgentUIStreamResponse({
      agent,
      uiMessages: agentMessages as SkillCoachUIMessage[],
      originalMessages: agentMessages as SkillCoachUIMessage[],
      abortSignal: request.signal,
      sendReasoning: true,
      generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
      experimental_transform: smoothStream({ chunking: "word" }),
      consumeSseStream: async ({ stream }) => {
        const reader = stream.getReader();
        try {
          while (true) {
            const { done } = await reader.read();
            if (done) break;
          }
        } catch {
          // Client disconnect is expected. Persistence still runs in onEnd.
        }
      },
      onEnd: async ({ messages, isAborted, responseMessage }) => {
        try {
          const aborted = isAborted || request.signal.aborted;
          const assistantText = textFromUIMessage(responseMessage as UIMessage);
          const disposition = chatTurnDisposition({ aborted, assistantText });
          charges.push(
            paiseForTokens(
              COACH_LIMITS.model,
              turnUsage.promptTokens,
              turnUsage.completionTokens,
            ),
          );
          if (disposition === "refund") {
            await hold.refundQuota(actualPaise(charges, hold.reservePaise));
            settled = true;
            logCoachCall({
              userId,
              action: "coach_tutor",
              usage: turnUsage,
              latencyMs: Date.now() - started,
              success: false,
              errorCode: aborted ? "ABORTED" : "EMPTY_REPLY",
              metadata: {
                planId,
                sessionId: existing?.id ?? null,
                adapter: "chat",
                tier,
                kind: "tutor_turn",
              },
            });
            return;
          }

          const nextMessages = messagesForPersistence({
            stored,
            latestUser,
            ended: messages as UIMessage[],
          });
          let sessionId = existing?.id ?? null;
          if (!sessionId) {
            const created = await insertTutorSession({
              userId,
              planId,
              programId: context.program.id,
              messages: nextMessages,
              summary,
              moduleKey: module?.key ?? null,
              turnCount: (existing?.turnCount ?? 0) + 1,
            });
            sessionId = created.id;
          }

          if (summaryDue(nextMessages.length)) {
            const compressed = await compressTutorSummary({
              userId,
              tier,
              planId,
              sessionId,
              skillKey: context.plan.skillKey,
              messages: nextMessages,
            });
            if (compressed?.summary) summary = compressed.summary;
            if (compressed) charges.push(compressed.paise);
          }

          if (existing) {
            await saveTutorSession({
              sessionId,
              messages: nextMessages,
              summary,
              moduleKey: module?.key ?? null,
              turnCount: existing.turnCount + 1,
            });
          } else if (summary) {
            await saveTutorSession({
              sessionId,
              messages: nextMessages,
              summary,
              moduleKey: module?.key ?? null,
              turnCount: 1,
            });
          }
          await touchCoachProgress(planId);
          await hold.reconcile(actualPaise(charges, hold.reservePaise));
          settled = true;
          logCoachCall({
            userId,
            action: "coach_tutor",
            usage: turnUsage,
            latencyMs: Date.now() - started,
            success: true,
            metadata: {
              planId,
              sessionId,
              adapter: "chat",
              tier,
              kind: "tutor_turn",
              normalizedName: context.plan.skillKey,
            },
          });
        } catch (error) {
          if (!settled) {
            await settleFailure(hold, error);
            settled = true;
          }
        }
      },
    });
  } catch (error) {
    if (meter && !settled) await settleFailure(meter, error);
    if (AISDKError.isInstance(error)) {
      return NextResponse.json(
        { error: "The tutor could not finish that reply. Try again." },
        { status: 400 },
      );
    }
    return coachErrorResponse(error);
  }
}
```

The route file above already imports `openTutorMeter` statically. Do not add a dynamic `import()`.

- [ ] **Step 5: Re-run the test**

Run: `pnpm exec tsx --test src/services/coach/tutor-chat.test.ts`

Expected: PASS. 4 tests pass. The source assertion finds `compressTutorSummary` after `createAgentUIStreamResponse`.

Run: `pnpm exec tsc --noEmit --pretty false`

Expected: PASS.

- [ ] **Step 6: Append the test path**

Append `src/services/coach/tutor-chat.test.ts` to `package.json` `test:unit`.

Run: `pnpm test:unit`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/services/coach/tutor-chat.ts src/services/coach/tutor-chat.service.ts src/services/coach/tutor-chat.test.ts "src/app/api/coach/plans/[id]/ai/chat/route.ts" package.json
git commit -m "feat: stream skill coach chat"
```

---

### Task 5: Docked useChat tutor

**Files:**
- Create: `src/components/coach/tutor-parts.tsx`
- Create: `src/components/coach/tutor-parts.test.tsx`
- Create: `src/components/coach/tutor-chat.tsx`
- Modify: `src/components/coach/tutor-thread.tsx`
- Modify: `src/components/coach/tutor-composer.tsx`
- Modify: `src/components/coach/tutor-ui.test.tsx`
- Modify: `src/components/coach/coach-dashboard.tsx`
- Modify: `package.json` (`test:unit` only)

**Interfaces:**
- Consumes: `SkillCoachUIMessage` (or `UIMessage`), `useChat`, `DefaultChatTransport`, `useCoachSpeech`, `formatCoachError`, `COACH_STT_PATH` behavior already inside `useCoachSpeech`.
- Produces:
  - `COACH_TOOL_LABELS`
  - `composerKeyAction(key: string, shiftKey: boolean): "send" | "newline"`
  - `TutorMessageParts`, `TutorThread` (`messages: UIMessage[]`)
  - `TutorChatSession` props: `{ planId: string; coachEnabled: boolean; liveEnabled: boolean; liveSlot?: ReactNode }`
  - Chat transport URL: `` `/api/coach/plans/${planId}/ai/chat` ``

- [ ] **Step 1: Write the failing parts test and update the thread fixtures**

Create `src/components/coach/tutor-parts.test.tsx`:

```tsx
import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { UIMessage } from "ai";
import {
  COACH_TOOL_LABELS,
  TutorMessageParts,
} from "@/components/coach/tutor-parts";
import { TutorThread } from "@/components/coach/tutor-thread";

test("tool chips show pending and done labels for the four coach tools", () => {
  const message: UIMessage = {
    id: "a1",
    role: "assistant",
    parts: [
      {
        type: "tool-getProgress",
        toolCallId: "call_1",
        state: "input-available",
        input: {},
      },
      {
        type: "tool-listCuratedResources",
        toolCallId: "call_2",
        state: "output-available",
        input: {},
        output: { resources: [] },
      },
    ],
  };
  const html = renderToStaticMarkup(
    <TutorMessageParts message={message} isLastMessage={false} isStreaming={false} />,
  );
  assert.match(html, new RegExp(COACH_TOOL_LABELS.getProgress.pending));
  assert.match(html, new RegExp(COACH_TOOL_LABELS.listCuratedResources.done));
  assert.match(html, /data-slot="tutor-tool"/);
  assert.match(html, /data-tool="getProgress"/);
  assert.match(html, /data-state="pending"/);
  assert.match(html, /data-state="done"/);
});

test("reasoning collapses behind a Thought control", () => {
  const message: UIMessage = {
    id: "a1",
    role: "assistant",
    parts: [
      { type: "reasoning", text: "Check the module first." },
      { type: "text", text: "Start with state." },
    ],
  };
  const html = renderToStaticMarkup(
    <TutorMessageParts message={message} isLastMessage={false} isStreaming={false} />,
  );
  assert.match(html, /Thought/);
  assert.match(html, /Check the module first/);
  assert.match(html, /aria-expanded="false"/);
});

test("an empty thread keeps the docked placeholder", () => {
  const html = renderToStaticMarkup(<TutorThread messages={[]} />);
  assert.match(html, /The tutor replies here/);
  assert.doesNotMatch(html, /data-role=/);
});
```

In `src/components/coach/tutor-ui.test.tsx`, replace the two `TutorThread` tests so they pass UIMessage values:

```tsx
test("TutorThread renders user and assistant bubbles with preserved line breaks", () => {
  const html = renderToStaticMarkup(
    <TutorThread
      messages={[
        {
          id: "u1",
          role: "user",
          parts: [{ type: "text", text: "Explain closures" }],
        },
        {
          id: "a1",
          role: "assistant",
          parts: [{ type: "text", text: "A closure keeps\nits scope." }],
        },
      ]}
    />,
  );

  assert.match(html, /data-slot="tutor-thread"/);
  assert.match(html, /data-role="user"/);
  assert.match(html, /data-role="assistant"/);
  assert.match(html, /Explain closures/);
  assert.match(html, /A closure keeps/);
  assert.match(html, /its scope/);
  assert.doesNotMatch(html, /purple|violet|#7c3aed|#6d28d9/i);
});

test("TutorThread renders an empty log without bubbles", () => {
  const html = renderToStaticMarkup(<TutorThread messages={[]} />);
  assert.match(html, /data-slot="tutor-thread"/);
  assert.doesNotMatch(html, /data-role=/);
});
```

Add `import type { UIMessage } from "ai"` only if a test annotates it. The object literals above do not need the import.

Replace the dashboard source test with:

```tsx
test("coach dashboard mounts TutorChat on the streaming route", () => {
  const source = readFileSync(
    new URL("./coach-dashboard.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /<TutorChatSession/);
  assert.match(source, /liveEnabled/);
  assert.doesNotMatch(source, /\/sessions/);
  assert.doesNotMatch(source, /sendTutor\(/);
  assert.match(source, /formatCoachError/);
  assert.doesNotMatch(source, /Coach request failed/);
});
```

Add this composer test to `tutor-ui.test.tsx`:

```tsx
test("composerKeyAction sends on Enter and keeps Shift+Enter as a newline", () => {
  assert.equal(composerKeyAction("Enter", false), "send");
  assert.equal(composerKeyAction("Enter", true), "newline");
  assert.equal(composerKeyAction("a", false), "newline");
});
```

Import `composerKeyAction` from `@/components/coach/tutor-composer`.

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `pnpm exec tsx --test src/components/coach/tutor-parts.test.tsx src/components/coach/tutor-ui.test.tsx`

Expected: FAIL. `TutorMessageParts` and `composerKeyAction` are missing, and the dashboard source still posts to `/sessions`.

- [ ] **Step 3: Implement parts, composer keys, thread, and TutorChat**

Create `src/components/coach/tutor-parts.tsx`:

```tsx
"use client";

import { isToolUIPart, type UIMessage } from "ai";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

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
          ? "ml-auto rounded-lg bg-primary px-3 py-2 text-primary-foreground whitespace-pre-wrap"
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
              <Streamdown
                isAnimating={streamingThis}
                mode={streamingThis ? "streaming" : "static"}
              >
                {part.text}
              </Streamdown>
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
      {open && text ? (
        <p className="mt-1 border-border border-l pl-2 text-[11px] text-muted-foreground">
          {text}
        </p>
      ) : null}
    </div>
  );
}
```

Replace `src/components/coach/tutor-thread.tsx` with:

```tsx
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
```

Delete the `TutorMessage` interface from this file. Update any remaining import of `TutorMessage` in `coach-dashboard.tsx` in the next step (it goes away with the local message state).

In `src/components/coach/tutor-composer.tsx`, add this export and use it from the textarea:

```tsx
export function composerKeyAction(
  key: string,
  shiftKey: boolean,
): "send" | "newline" {
  if (key === "Enter" && !shiftKey) return "send";
  return "newline";
}
```

Add optional props `showStop?: boolean` and `onStop?: () => void`. On the textarea:

```tsx
        onKeyDown={(event) => {
          if (composerKeyAction(event.key, event.shiftKey) !== "send") return;
          event.preventDefault();
          if (!canSend) return;
          onSend();
        }}
```

Next to the Send button, when `showStop` is true, render:

```tsx
        {showStop ? (
          <Button type="button" variant="secondary" onClick={onStop}>
            Stop
          </Button>
        ) : null}
```

Create `src/components/coach/tutor-chat.tsx`:

```tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Loader2 } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
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
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

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
      className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2"
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
  const { messages, sendMessage, status, error, regenerate, stop, setMessages } =
    useChat({
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
        if (!cancelled && Array.isArray(body.messages)) setMessages(body.messages);
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
    const last = [...messages].reverse().find((message) => message.role === "assistant");
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
      ? [...messages].reverse().find((message) => message.role === "assistant")?.id
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
          <div role="group" aria-label="Tutor channel" className="flex gap-2">
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
          </div>
        ) : null}
        <StickToBottom className="relative min-h-0 flex-1 overflow-y-auto" resize="smooth">
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
              <Button type="button" variant="secondary" onClick={() => void regenerate()}>
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
              disabled={speech.mode === "text-only" || lastAssistant.trim().length === 0}
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
```

`speech.speak` runs only in that `status === "ready"` effect, and only when `channel === "chat"`. Do not call it while `status === "streaming"`.

In `CoachDashboard`:
- Add `const [liveEnabled, setLiveEnabled] = useState(false);`
- In `load`, `setLiveEnabled(body.liveEnabled === true);`
- Add `liveEnabled?: boolean` on `ProgramsResponse`.
- Remove `message`, `speech`, `tutorMessages`, `tutorError`, `sendTutor`, and the `TutorComposer` / `TutorThread` / mic imports that only served that card.
- `choosePlan` no longer clears tutor messages. Keep clearing practice and mock state. `TutorChatSession` is keyed by plan id so it reloads.
- Replace the `tutor={` card with:

```tsx
      tutor={
        planId ? (
          <TutorChatSession
            key={planId}
            planId={planId}
            coachEnabled={coachEnabled}
            liveEnabled={liveEnabled}
          />
        ) : (
          <p className="text-muted-foreground text-sm">The tutor replies here.</p>
        )
      }
```

The toggle renders only when `liveEnabled && liveSlot`. Task 5 passes no `liveSlot`, so Chat stays the only control. Task 8 passes `liveSlot`.

- [ ] **Step 4: Re-run the tests**

Run: `pnpm exec tsx --test src/components/coach/tutor-parts.test.tsx src/components/coach/tutor-ui.test.tsx src/components/coach/coach-workspace.test.tsx`

Expected: PASS. Workspace tests still render the `tutor` slot the dashboard passes in. Parts tests show the four-tool labels they assert. Dashboard source has `TutorChatSession` and no `/sessions`.

- [ ] **Step 5: Append the test path**

Append `src/components/coach/tutor-parts.test.tsx` to `package.json` `test:unit`.

Run: `pnpm test:unit`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/coach/tutor-parts.tsx src/components/coach/tutor-parts.test.tsx src/components/coach/tutor-chat.tsx src/components/coach/tutor-thread.tsx src/components/coach/tutor-composer.tsx src/components/coach/tutor-ui.test.tsx src/components/coach/coach-dashboard.tsx package.json
git commit -m "feat: stream the docked skill coach thread"
```

---
### Task 6: Retire the JSON tutor route

**Files:**
- Modify: `src/app/api/coach/plans/[id]/sessions/route.ts`
- Modify: `src/services/coach/tutor-chat.test.ts`
- Delete: `src/services/coach/tutor.service.ts`
- Modify: `scripts/coach-burn-in.ts`

**Interfaces:**
- Consumes: `tutorSessionMigrationBody()` from Task 4. `assertCoachModelsEnabled()` from `src/services/coach/entitlement.service.ts`.
- Produces: `POST /api/coach/plans/[id]/sessions` responds `410` with `tutorSessionMigrationBody()`. No model call.

- [ ] **Step 1: Extend the chat test**

Append these tests to `src/services/coach/tutor-chat.test.ts`:

```ts
test("the sessions route returns the migration body and does not call the tutor", () => {
  const source = readFileSync(
    new URL("../../app/api/coach/plans/[id]/sessions/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /tutorSessionMigrationBody/);
  assert.match(source, /status: 410/);
  assert.doesNotMatch(source, /sendTutorMessage/);
  assert.doesNotMatch(source, /generateText/);
});

test("coach burn-in no longer imports the JSON tutor", () => {
  const source = readFileSync(
    new URL("../../../scripts/coach-burn-in.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /sendTutorMessage/);
  assert.match(source, /assertCoachModelsEnabled/);
});
```

`readFileSync` is already imported in that test file. The burn-in URL is relative to `src/services/coach/tutor-chat.test.ts`: `../../../scripts/coach-burn-in.ts`.

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm exec tsx --test src/services/coach/tutor-chat.test.ts`

Expected: FAIL. The sessions route still imports `sendTutorMessage`. The burn-in script still imports it.

- [ ] **Step 3: Replace the sessions route**

Replace `src/app/api/coach/plans/[id]/sessions/route.ts` with:

```ts
import { NextResponse } from "next/server";
import { tutorSessionMigrationBody } from "@/services/coach/tutor-chat";

export const maxDuration = 60;

export async function POST() {
  return NextResponse.json(tutorSessionMigrationBody(), { status: 410 });
}
```

Delete `src/services/coach/tutor.service.ts`.

In `scripts/coach-burn-in.ts`, replace the import of `sendTutorMessage` with:

```ts
import { assertCoachModelsEnabled } from "@/services/coach/entitlement.service";
```

`CoachServiceError` stays imported. Replace the disabled-tutor try block with:

```ts
    let disabled = false;
    try {
      await assertCoachModelsEnabled();
    } catch (error) {
      disabled =
        error instanceof CoachServiceError &&
        error.status === 503 &&
        error.body.error === "COACH_DISABLED";
    }
    check(disabled, "tutor did not stop while coach_enabled is false");
    const beforeCap = await readCoachUsage(userA);
    check(beforeCap.tutorTurns === 0, "disabled tutor still consumed a turn");
    results.push("disabled tutor did not consume quota");
```

Leave the later `openCoachMeter` cap loop as it is. It does not call `sendTutorMessage`.

- [ ] **Step 4: Re-run the test**

Run: `pnpm exec tsx --test src/services/coach/tutor-chat.test.ts`

Expected: PASS.

Run: `pnpm exec tsc --noEmit --pretty false`

Expected: PASS. Nothing still imports `@/services/coach/tutor.service`.

- [ ] **Step 5: Commit**

```bash
git add "src/app/api/coach/plans/[id]/sessions/route.ts" src/services/coach/tutor-chat.test.ts src/services/coach/tutor.service.ts scripts/coach-burn-in.ts
git commit -m "feat: retire the JSON skill coach tutor route"
```

---

### Task 7: Live kill switch, mint, and server tool relay

**Files:**
- Create: `src/services/coach/live-flag.ts`
- Create: `src/services/coach/live-session.ts`
- Create: `src/services/coach/live-session.service.ts`
- Create: `src/services/coach/live-session.test.ts`
- Create: `src/app/api/coach/plans/[id]/live/session/route.ts`
- Create: `src/app/api/coach/plans/[id]/live/tool/route.ts`
- Create: `src/app/api/coach/plans/[id]/live/turn/route.ts`
- Create: `src/app/api/coach/plans/[id]/live/abort/route.ts`
- Create: `src/db/migrations/0020_coach_live_action.sql`
- Modify: `src/db/migrations/meta/_journal.json`
- Modify: `src/db/schema.ts` (`aiActionEnum`)
- Modify: `src/services/ai/usage.service.ts`
- Modify: `src/services/coach/model.ts`
- Modify: `src/services/coach/meter.service.ts`
- Modify: `src/app/api/coach/programs/route.ts`
- Modify: `package.json` (`test:unit` only)

**Interfaces:**
- Consumes: `executeSkillCoachTool`, `skillCoachRealtimeTools`, `buildSkillCoachInstructions`, `activeCoachModule`, `openTutorMeter`, `SkillCoachTurnContext`, `loadActiveTutorSession`, `insertTutorSession`, `saveTutorSession`, `sessionUiMessages`.
- Produces:
  - `isCoachLiveEnabled(env?: NodeJS.ProcessEnv): boolean`
  - `COACH_LIVE_MODEL = "gpt-realtime"`
  - `interface RealtimeUsageParts { inputTextTokens: number; inputAudioTokens: number; outputTextTokens: number; outputAudioTokens: number }`
  - `estimateRealtimeCostUsd(usage: RealtimeUsageParts): number`
  - `readRealtimeUsage(event: unknown): RealtimeUsageParts | null`
  - `liveTurnMeterAction(status: string): "settle_hold" | "open_new"`
  - `liveExchangeDisposition(assistantText: string): "count" | "refund"`
  - `redactSecrets(value: unknown): unknown`
  - `functionCallOutputPayload(callId: string, output: unknown): { type: "conversation.item.create"; item: { type: "function_call_output"; call_id: string; output: string } }`
  - `RESPONSE_CREATE = { type: "response.create" }`
  - `mintRealtimeClientSecret(input: { instructions: string; tools: ReturnType<typeof skillCoachRealtimeTools>; apiKey: string; fetchImpl?: typeof fetch }): Promise<{ value: string; expiresAt: number | null }>`
  - `settleTutorReserve(input: { userId: string; actualPaise: number; refundQuota: boolean; now?: Date }): Promise<void>`
  - `logCoachCall` action union adds `"coach_live"`. Optional `model?: string` and `costUsd?: number | null`.
  - `LogUsageParams.action` adds `"coach_live"`. Optional `costUsd?: number | null` overrides the rate table when not a cache hit.
  - Programs JSON adds `liveEnabled: boolean`.
  - Live routes under `/api/coach/plans/[id]/live/{session,tool,turn,abort}`.

- [ ] **Step 1: Write the failing test**

Create `src/services/coach/live-session.test.ts`:

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isCoachLiveEnabled } from "@/services/coach/live-flag";
import {
  COACH_LIVE_MODEL,
  estimateRealtimeCostUsd,
  functionCallOutputPayload,
  liveExchangeDisposition,
  liveTurnMeterAction,
  mintRealtimeClientSecret,
  readRealtimeUsage,
  redactSecrets,
  RESPONSE_CREATE,
} from "@/services/coach/live-session";
import { skillCoachRealtimeTools } from "@/services/coach/skill-coach-core";

test("the live flag is off unless explicitly enabled", () => {
  assert.equal(isCoachLiveEnabled({} as NodeJS.ProcessEnv), false);
  assert.equal(isCoachLiveEnabled({ COACH_LIVE_ENABLED: "" } as NodeJS.ProcessEnv), false);
  assert.equal(isCoachLiveEnabled({ COACH_LIVE_ENABLED: "false" } as NodeJS.ProcessEnv), false);
  assert.equal(isCoachLiveEnabled({ COACH_LIVE_ENABLED: "0" } as NodeJS.ProcessEnv), false);
  assert.equal(isCoachLiveEnabled({ COACH_LIVE_ENABLED: "true" } as NodeJS.ProcessEnv), true);
  assert.equal(isCoachLiveEnabled({ COACH_LIVE_ENABLED: "TRUE" } as NodeJS.ProcessEnv), true);
  assert.equal(isCoachLiveEnabled({ COACH_LIVE_ENABLED: "yes" } as NodeJS.ProcessEnv), true);
  assert.equal(isCoachLiveEnabled({ COACH_LIVE_ENABLED: "1" } as NodeJS.ProcessEnv), true);
});

test("realtime audio rates price a 1k/1k audio exchange at 0.096 USD", () => {
  assert.equal(COACH_LIVE_MODEL, "gpt-realtime");
  const usd = estimateRealtimeCostUsd({
    inputTextTokens: 0,
    inputAudioTokens: 1000,
    outputTextTokens: 0,
    outputAudioTokens: 1000,
  });
  assert.equal(Number(usd.toFixed(6)), 0.096);
});

test("readRealtimeUsage splits text and audio and ignores other fields", () => {
  const usage = readRealtimeUsage({
    type: "response.done",
    response: {
      usage: {
        input_tokens: 10,
        output_tokens: 4,
        input_token_details: { text_tokens: 3, audio_tokens: 7 },
        output_token_details: { text_tokens: 1, audio_tokens: 3 },
      },
    },
  });
  assert.deepEqual(usage, {
    inputTextTokens: 3,
    inputAudioTokens: 7,
    outputTextTokens: 1,
    outputAudioTokens: 3,
  });
  assert.equal(readRealtimeUsage({ type: "response.created" }), null);
});

test("the first live exchange settles the mint hold and a later one opens a new meter", () => {
  assert.equal(liveTurnMeterAction("live_hold"), "settle_hold");
  assert.equal(liveTurnMeterAction("active"), "open_new");
  assert.equal(liveExchangeDisposition("  "), "refund");
  assert.equal(liveExchangeDisposition("Heard you."), "count");
});

test("tool output redacts secrets and is safe to send back to Realtime", () => {
  const payload = functionCallOutputPayload("call_1", {
    apiKey: "sk-secretsecret",
    note: "Bearer sk-secretsecret",
    ok: true,
  });
  assert.equal(payload.type, "conversation.item.create");
  assert.equal(payload.item.call_id, "call_1");
  assert.equal(payload.item.output.includes("sk-secret"), false);
  assert.match(payload.item.output, /\[redacted\]/);
  assert.deepEqual(redactSecrets("ek_abcdefghij"), "[redacted]");
  assert.equal(RESPONSE_CREATE.type, "response.create");
});

test("mint sends the server key only to OpenAI and returns the ephemeral value", async () => {
  let auth = "";
  const secret = await mintRealtimeClientSecret({
    instructions: "Tutor",
    tools: skillCoachRealtimeTools(),
    apiKey: "sk-server-key-not-for-browser",
    fetchImpl: async (url, init) => {
      auth = String((init?.headers as Record<string, string>).Authorization);
      assert.equal(String(url), "https://api.openai.com/v1/realtime/client_secrets");
      const body = JSON.parse(String(init?.body));
      assert.equal(body.session.model, COACH_LIVE_MODEL);
      assert.equal(body.session.type, "realtime");
      assert.equal(body.session.tools.length, 4);
      return new Response(
        JSON.stringify({
          value: "ek_ephemeral",
          expires_at: 1700000000,
          session: { client_secret: "do-not-forward" },
        }),
        { status: 200 },
      );
    },
  });
  assert.equal(secret.value, "ek_ephemeral");
  assert.equal(secret.expiresAt, 1700000000);
  assert.equal("session" in secret, false);
  assert.match(auth, /sk-server-key-not-for-browser/);
  assert.equal(JSON.stringify(secret).includes("sk-server"), false);
});

test("live routes keep execute on the server and the programs payload exposes the flag", () => {
  const tool = readFileSync(
    new URL("../../app/api/coach/plans/[id]/live/tool/route.ts", import.meta.url),
    "utf8",
  );
  const session = readFileSync(
    new URL("../../app/api/coach/plans/[id]/live/session/route.ts", import.meta.url),
    "utf8",
  );
  const programs = readFileSync(
    new URL("../../app/api/coach/programs/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(tool, /executeSkillCoachTool/);
  assert.match(session, /isCoachLiveEnabled/);
  assert.match(session, /COACH_LIVE_DISABLED/);
  assert.match(session, /clientSecret: secret\.clientSecret/);
  assert.doesNotMatch(session, /return NextResponse\.json\(openaiBody\)/);
  assert.match(programs, /liveEnabled: isCoachLiveEnabled\(\)/);
});
```

The session route may read `process.env.OPENAI_API_KEY` on the server. The test only forbids returning a raw OpenAI body. The JSON field in source is `clientSecret: secret.clientSecret`.

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm exec tsx --test src/services/coach/live-session.test.ts`

Expected: FAIL. `@/services/coach/live-flag` cannot be resolved.

- [ ] **Step 3: Add the flag, pure live helpers, enum, and logger**

Create `src/services/coach/live-flag.ts`:

```ts
const ON = new Set(["1", "true", "yes"]);

export function isCoachLiveEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const raw = env.COACH_LIVE_ENABLED?.trim().toLowerCase() ?? "";
  return ON.has(raw);
}
```

`live-session.ts` is imported by the browser through `live-events.ts`. Do not import `skill-coach-core`, `@/db`, or `meter.service` from it.

Create `src/services/coach/live-session.ts`:

```ts
/** Pinned for this slice. Re-check https://platform.openai.com/docs/models before changing the id. */
export const COACH_LIVE_MODEL = "gpt-realtime";

/**
 * gpt-realtime published split, USD per 1k tokens:
 * text in 0.004, text out 0.016, audio in 0.032, audio out 0.064.
 * Re-verify https://openai.com/api/pricing in this commit if those cards moved.
 */
const REALTIME_RATES = {
  inputTextPer1k: 0.004,
  inputAudioPer1k: 0.032,
  outputTextPer1k: 0.016,
  outputAudioPer1k: 0.064,
};

export interface RealtimeUsageParts {
  inputTextTokens: number;
  inputAudioTokens: number;
  outputTextTokens: number;
  outputAudioTokens: number;
}

export function estimateRealtimeCostUsd(usage: RealtimeUsageParts): number {
  return (
    (usage.inputTextTokens / 1000) * REALTIME_RATES.inputTextPer1k +
    (usage.inputAudioTokens / 1000) * REALTIME_RATES.inputAudioPer1k +
    (usage.outputTextTokens / 1000) * REALTIME_RATES.outputTextPer1k +
    (usage.outputAudioTokens / 1000) * REALTIME_RATES.outputAudioPer1k
  );
}

function numberFrom(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function readRealtimeUsage(event: unknown): RealtimeUsageParts | null {
  if (!event || typeof event !== "object") return null;
  const record = event as {
    type?: unknown;
    response?: { usage?: Record<string, unknown> };
  };
  if (record.type !== "response.done" || !record.response?.usage) return null;
  const usage = record.response.usage;
  const inputDetails = usage.input_token_details as
    | { text_tokens?: unknown; audio_tokens?: unknown }
    | undefined;
  const outputDetails = usage.output_token_details as
    | { text_tokens?: unknown; audio_tokens?: unknown }
    | undefined;
  return {
    inputTextTokens: numberFrom(inputDetails?.text_tokens),
    inputAudioTokens: numberFrom(inputDetails?.audio_tokens),
    outputTextTokens: numberFrom(outputDetails?.text_tokens),
    outputAudioTokens: numberFrom(outputDetails?.audio_tokens),
  };
}

export function liveTurnMeterAction(
  status: string,
): "settle_hold" | "open_new" {
  return status === "live_hold" ? "settle_hold" : "open_new";
}

export function liveExchangeDisposition(
  assistantText: string,
): "count" | "refund" {
  return assistantText.trim().length === 0 ? "refund" : "count";
}

const SECRET_TEXT = /(?:sk-|ek_)[A-Za-z0-9_-]{8,}|Bearer\s+\S+/g;

export function redactSecrets(value: unknown): unknown {
  if (typeof value === "string") return value.replace(SECRET_TEXT, "[redacted]");
  if (Array.isArray(value)) return value.map((item) => redactSecrets(item));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      out[key] = /api[_-]?key|authorization|secret|token/i.test(key)
        ? "[redacted]"
        : redactSecrets(item);
    }
    return out;
  }
  return value;
}

export function functionCallOutputPayload(callId: string, output: unknown) {
  return {
    type: "conversation.item.create" as const,
    item: {
      type: "function_call_output" as const,
      call_id: callId,
      output: JSON.stringify(redactSecrets(output)),
    },
  };
}

export const RESPONSE_CREATE = { type: "response.create" as const };

export async function mintRealtimeClientSecret(input: {
  instructions: string;
  tools: unknown[];
  apiKey: string;
  fetchImpl?: typeof fetch;
}): Promise<{ value: string; expiresAt: number | null }> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const response = await fetchImpl(
    "https://api.openai.com/v1/realtime/client_secrets",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: COACH_LIVE_MODEL,
          instructions: input.instructions,
          tools: input.tools,
          tool_choice: "auto",
        },
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`Realtime session mint failed (${response.status}).`);
  }
  const body = (await response.json()) as { value?: unknown; expires_at?: unknown };
  if (typeof body.value !== "string" || body.value.length === 0) {
    throw new Error("Realtime session mint failed (missing client secret).");
  }
  return {
    value: body.value,
    expiresAt: typeof body.expires_at === "number" ? body.expires_at : null,
  };
}
```

In `src/db/schema.ts`, add `"coach_live"` after `"coach_mock"` in `aiActionEnum`.

Create `src/db/migrations/0020_coach_live_action.sql`:

```sql
ALTER TYPE "ai_action" ADD VALUE IF NOT EXISTS 'coach_live';
```

Append this object as the last `entries` item in `src/db/migrations/meta/_journal.json` (idx 20, after `0019_coach_load_indexes`):

```json
    {
      "idx": 20,
      "version": "7",
      "when": 1793200000000,
      "tag": "0020_coach_live_action",
      "breakpoints": true
    }
```

In `LogUsageParams.action`, add `|"coach_live"` after `"coach_mock"`. Add optional `costUsd?: number | null`. In `logAiUsage`, compute cost as:

```ts
  const isCacheHit = params.cacheHit ?? false;
  const costUsd = isCacheHit
    ? 0
    : params.costUsd !== undefined
      ? params.costUsd
      : estimateCostUsd(
          params.model,
          params.promptTokens,
          params.completionTokens,
        );
```

In `logCoachCall`, extend the argument:

```ts
export function logCoachCall(input: {
  userId: string;
  action:
    | "coach_plan"
    | "coach_tutor"
    | "coach_practice"
    | "coach_mock"
    | "coach_live";
  usage: TokenUsage;
  latencyMs: number;
  success: boolean;
  errorCode?: string;
  cacheHit?: boolean;
  model?: string;
  costUsd?: number | null;
  metadata: Record<string, unknown>;
}): void {
  logAiUsage({
    userId: input.userId,
    action: input.action,
    model: input.model ?? COACH_LIMITS.model,
    promptTokens: input.usage.promptTokens,
    completionTokens: input.usage.completionTokens,
    totalTokens: input.usage.totalTokens,
    reasoningTokens: input.usage.reasoningTokens,
    latencyMs: input.latencyMs,
    cacheHit: input.cacheHit,
    success: input.success,
    errorCode: input.errorCode,
    costUsd: input.costUsd,
    metadata: input.metadata,
  });
}
```

Append `settleTutorReserve` to `src/services/coach/meter.service.ts`. It calls the existing private `applyActualSpend` and `refundQuota` helpers in that file:

```ts
export async function settleTutorReserve(input: {
  userId: string;
  actualPaise: number;
  refundQuota: boolean;
  now?: Date;
}): Promise<void> {
  const now = input.now ?? new Date();
  await applyActualSpend({
    userId: input.userId,
    periodStart: utcMonthStart(now),
    reservePaise: reservePaiseFor("tutor"),
    actualPaise: input.actualPaise,
  });
  if (input.refundQuota) {
    await refundQuota({
      userId: input.userId,
      quota: "tutor",
      periodStart: periodStartFor("tutor", now),
    });
  }
}
```

`reservePaiseFor` and `periodStartFor` are already imported in that file. `refundQuota` in this snippet is the private function, not `MeterHold.refundQuota`.

- [ ] **Step 4: Add the live service and routes**

Create `src/services/coach/live-session.service.ts`:

```ts
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { UIMessage } from "ai";
import db from "@/db";
import { coachSession } from "@/db/schema";
import {
  ensureSharedOutline,
  loadPlanContext,
  settleFailure,
} from "@/services/coach/context.service";
import {
  assertCoachModelsEnabled,
  resolveCoachTier,
} from "@/services/coach/entitlement.service";
import { coachNotFound, coachProviderError } from "@/services/coach/errors";
import { isCoachLiveEnabled } from "@/services/coach/live-flag";
import {
  COACH_LIVE_MODEL,
  estimateRealtimeCostUsd,
  liveExchangeDisposition,
  liveTurnMeterAction,
  mintRealtimeClientSecret,
  type RealtimeUsageParts,
} from "@/services/coach/live-session";
import { usdToPaise } from "@/services/coach/limits";
import { COACH_LIMITS } from "@/services/coach/limits";
import { settleTutorReserve } from "@/services/coach/meter.service";
import { logCoachCall } from "@/services/coach/model";
import {
  activeCoachModule,
  buildSkillCoachInstructions,
  executeSkillCoachTool,
  openTutorMeter,
  skillCoachRealtimeTools,
  type SkillCoachTurnContext,
} from "@/services/coach/skill-coach-core";
import {
  insertTutorSession,
  loadActiveTutorSession,
  saveTutorSession,
  sessionUiMessages,
  touchCoachProgress,
} from "@/services/coach/tutor-chat.service";

export class CoachLiveDisabledError extends Error {
  readonly status = 503;
  readonly body = {
    error: "COACH_LIVE_DISABLED",
    detail: "Live is off in this environment.",
  };

  constructor() {
    super("Live is off in this environment.");
    this.name = "CoachLiveDisabledError";
  }
}

async function turnContext(
  userId: string,
  planId: string,
): Promise<{
  context: NonNullable<Awaited<ReturnType<typeof loadPlanContext>>>;
  tier: Awaited<ReturnType<typeof resolveCoachTier>>;
  turn: SkillCoachTurnContext;
}> {
  await assertCoachModelsEnabled();
  if (!isCoachLiveEnabled()) throw new CoachLiveDisabledError();
  const context = await loadPlanContext(userId, planId);
  if (!context) throw coachNotFound("Plan not found");
  const tier = await resolveCoachTier(userId);
  const outline = await ensureSharedOutline({
    userId,
    tier,
    planId,
    skillKey: context.plan.skillKey,
    displayName: context.plan.displayName,
    segment: context.segment,
    outline: context.outline,
  });
  const turn: SkillCoachTurnContext = {
    userId,
    planId,
    skillKey: context.plan.skillKey,
    displayName: context.plan.displayName,
    roleTitle: context.program.roleTitle,
    segment: context.segment,
    module: activeCoachModule(outline, context.progress?.currentModuleKey),
    summary: null,
  };
  return { context, tier, turn };
}

export async function beginLiveSession(userId: string, planId: string) {
  const { context, turn } = await turnContext(userId, planId);
  const existing = await loadActiveTutorSession(userId, planId);
  if (existing?.status === "live_hold") {
    await settleTutorReserve({
      userId,
      actualPaise: 0,
      refundQuota: true,
    });
    await db
      .update(coachSession)
      .set({ status: "active" })
      .where(eq(coachSession.id, existing.id));
  }
  const meter = await openTutorMeter({
    userId,
    tier: await resolveCoachTier(userId),
  });
  let sessionId = existing?.id ?? null;
  let created = false;
  if (!sessionId) {
    const row = await insertTutorSession({
      userId,
      planId,
      programId: context.program.id,
      messages: [],
      summary: existing?.summary ?? null,
      moduleKey: turn.module?.key ?? null,
      turnCount: 0,
    });
    sessionId = row.id;
    created = true;
  }
  const instructions = buildSkillCoachInstructions({
    ...turn,
    summary: existing?.summary ?? null,
  });
  const tools = skillCoachRealtimeTools();
  const apiKey = process.env.OPENAI_API_KEY?.trim() ?? "";
  if (!apiKey) {
    await meter.abort();
    if (created) {
      await db.delete(coachSession).where(eq(coachSession.id, sessionId));
    }
    throw coachProviderError("Live is not configured.");
  }
  try {
    const secret = await mintRealtimeClientSecret({
      instructions,
      tools,
      apiKey,
    });
    await db
      .update(coachSession)
      .set({ status: "live_hold" })
      .where(eq(coachSession.id, sessionId));
    return {
      clientSecret: secret.value,
      expiresAt: secret.expiresAt,
      model: COACH_LIVE_MODEL,
      instructions,
      tools,
      sessionId,
    };
  } catch (error) {
    await meter.abort();
    if (created) {
      await db.delete(coachSession).where(eq(coachSession.id, sessionId));
    }
    throw coachProviderError(
      error instanceof Error ? error.message : "Live session mint failed.",
    );
  }
}

export async function relayLiveTool(input: {
  userId: string;
  planId: string;
  name: string;
  arguments: unknown;
}) {
  const { turn } = await turnContext(input.userId, input.planId);
  const session = await loadActiveTutorSession(input.userId, input.planId);
  return executeSkillCoachTool(
    { ...turn, summary: session?.summary ?? null },
    input.name,
    input.arguments,
  );
}

async function claimHold(sessionId: string): Promise<boolean> {
  const rows = await db
    .update(coachSession)
    .set({ status: "active" })
    .where(
      and(eq(coachSession.id, sessionId), eq(coachSession.status, "live_hold")),
    )
    .returning({ id: coachSession.id });
  return rows.length > 0;
}

export async function abortLiveHold(userId: string, planId: string) {
  // Flag-off still refunds a hold that was opened while Live was on.
  const session = await loadActiveTutorSession(userId, planId);
  if (!session) return { refunded: false };
  const claimed = await claimHold(session.id);
  if (!claimed) return { refunded: false };
  await settleTutorReserve({ userId, actualPaise: 0, refundQuota: true });
  return { refunded: true };
}

export async function recordLiveExchange(input: {
  userId: string;
  planId: string;
  userText: string;
  assistantText: string;
  tools: Array<{ name: string; callId: string }>;
  usage: RealtimeUsageParts | null;
}) {
  const started = Date.now();
  const { context, tier, turn } = await turnContext(input.userId, input.planId);
  const session = await loadActiveTutorSession(input.userId, input.planId);
  if (!session) throw coachNotFound("Tutor session not found");
  const disposition = liveExchangeDisposition(input.assistantText);
  const action = liveTurnMeterAction(session.status);
  const reserve = COACH_LIMITS.turnReservePaise;
  const actual = input.usage
    ? usdToPaise(estimateRealtimeCostUsd(input.usage))
    : reserve;
  const promptTokens =
    (input.usage?.inputTextTokens ?? 0) + (input.usage?.inputAudioTokens ?? 0);
  const completionTokens =
    (input.usage?.outputTextTokens ?? 0) +
    (input.usage?.outputAudioTokens ?? 0);

  if (disposition === "refund") {
    if (action === "settle_hold") {
      const claimed = await claimHold(session.id);
      if (claimed) {
        await settleTutorReserve({
          userId: input.userId,
          actualPaise: 0,
          refundQuota: true,
        });
      }
    }
    logCoachCall({
      userId: input.userId,
      action: "coach_live",
      model: COACH_LIVE_MODEL,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        reasoningTokens: 0,
      },
      costUsd: input.usage ? estimateRealtimeCostUsd(input.usage) : null,
      latencyMs: Date.now() - started,
      success: false,
      errorCode: "EMPTY_REPLY",
      metadata: {
        planId: input.planId,
        sessionId: session.id,
        adapter: "live",
        tier,
        kind: "live_exchange",
      },
    });
    return { saved: false };
  }

  // One tutor-quota turn per completed user→assistant exchange.
  if (action === "settle_hold") {
    const claimed = await claimHold(session.id);
    if (claimed) {
      await settleTutorReserve({
        userId: input.userId,
        actualPaise: actual,
        refundQuota: false,
      });
    } else {
      const meter = await openTutorMeter({ userId: input.userId, tier });
      await meter.reconcile(actual);
    }
  } else {
    const meter = await openTutorMeter({ userId: input.userId, tier });
    try {
      await meter.reconcile(actual);
    } catch (error) {
      await settleFailure(meter, error);
      throw error;
    }
  }

  const stored = sessionUiMessages(session.messages);
  const userMessage: UIMessage = {
    id: `live-user-${nanoid()}`,
    role: "user",
    parts: [{ type: "text", text: input.userText }],
  };
  const assistantMessage: UIMessage = {
    id: `live-assistant-${nanoid()}`,
    role: "assistant",
    parts: [
      { type: "text", text: input.assistantText },
      ...input.tools.map((tool) => ({
        type: `tool-${tool.name}` as const,
        toolCallId: tool.callId,
        state: "output-available" as const,
        input: {},
        output: { relayed: true },
      })),
    ],
  };
  await saveTutorSession({
    sessionId: session.id,
    messages: [...stored, userMessage, assistantMessage],
    summary: session.summary,
    moduleKey: turn.module?.key ?? session.moduleKey,
    turnCount: session.turnCount + 1,
  });
  await touchCoachProgress(input.planId);
  logCoachCall({
    userId: input.userId,
    action: "coach_live",
    model: COACH_LIVE_MODEL,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      reasoningTokens: 0,
    },
    costUsd: input.usage ? estimateRealtimeCostUsd(input.usage) : null,
    latencyMs: Date.now() - started,
    success: true,
    metadata: {
      planId: input.planId,
      sessionId: session.id,
      adapter: "live",
      tier,
      kind: "live_exchange",
      normalizedName: context.plan.skillKey,
    },
  });
  return { saved: true, messages: [userMessage, assistantMessage] };
}
```

Do not log `userText` or `assistantText` in `metadata`.

`CoachLiveDisabledError` is not a `CoachServiceError`, so `coachErrorResponse` would turn it into a generic 500. In each live route, catch it first:

```ts
import { CoachLiveDisabledError } from "@/services/coach/live-session.service";
import { coachErrorResponse } from "@/lib/coach/http";
import { requireApiUserId } from "@/lib/api-session";
import { NextResponse } from "next/server";

function liveError(error: unknown) {
  if (error instanceof CoachLiveDisabledError) {
    return NextResponse.json(error.body, { status: error.status });
  }
  return coachErrorResponse(error);
}
```

Create `src/app/api/coach/plans/[id]/live/session/route.ts`:

```ts
import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/api-session";
import { coachErrorResponse } from "@/lib/coach/http";
import {
  beginLiveSession,
  CoachLiveDisabledError,
} from "@/services/coach/live-session.service";

export const maxDuration = 30;

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const { id } = await params;
    const secret = await beginLiveSession(authResult.userId, id);
    return NextResponse.json({
      clientSecret: secret.clientSecret,
      expiresAt: secret.expiresAt,
      model: secret.model,
      instructions: secret.instructions,
      tools: secret.tools,
      sessionId: secret.sessionId,
    });
  } catch (error) {
    if (error instanceof CoachLiveDisabledError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    return coachErrorResponse(error);
  }
}
```

Create `src/app/api/coach/plans/[id]/live/tool/route.ts`:

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUserId } from "@/lib/api-session";
import { coachErrorResponse } from "@/lib/coach/http";
import { functionCallOutputPayload, RESPONSE_CREATE } from "@/services/coach/live-session";
import {
  CoachLiveDisabledError,
  relayLiveTool,
} from "@/services/coach/live-session.service";

export const maxDuration = 30;

const bodySchema = z.object({
  callId: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(80),
  arguments: z.unknown().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const { id } = await params;
    const body = bodySchema.parse(await request.json());
    let parsed: unknown = body.arguments ?? {};
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        parsed = {};
      }
    }
    const output = await relayLiveTool({
      userId: authResult.userId,
      planId: id,
      name: body.name,
      arguments: parsed,
    });
    return NextResponse.json({
      outputEvent: functionCallOutputPayload(body.callId, output),
      followUp: RESPONSE_CREATE,
    });
  } catch (error) {
    if (error instanceof CoachLiveDisabledError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    return coachErrorResponse(error);
  }
}
```

Create `src/app/api/coach/plans/[id]/live/turn/route.ts`:

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUserId } from "@/lib/api-session";
import { coachErrorResponse } from "@/lib/coach/http";
import {
  CoachLiveDisabledError,
  recordLiveExchange,
} from "@/services/coach/live-session.service";

export const maxDuration = 30;

const usageSchema = z.object({
  inputTextTokens: z.number().int().nonnegative(),
  inputAudioTokens: z.number().int().nonnegative(),
  outputTextTokens: z.number().int().nonnegative(),
  outputAudioTokens: z.number().int().nonnegative(),
});

const bodySchema = z.object({
  userText: z.string().max(8000),
  assistantText: z.string().max(8000),
  tools: z
    .array(
      z.object({
        name: z.string().max(80),
        callId: z.string().max(120),
      }),
    )
    .max(8),
  usage: usageSchema.nullable(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const { id } = await params;
    const body = bodySchema.parse(await request.json());
    const result = await recordLiveExchange({
      userId: authResult.userId,
      planId: id,
      userText: body.userText,
      assistantText: body.assistantText,
      tools: body.tools,
      usage: body.usage,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof CoachLiveDisabledError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    return coachErrorResponse(error);
  }
}
```

Create `src/app/api/coach/plans/[id]/live/abort/route.ts`:

```ts
import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/api-session";
import { coachErrorResponse } from "@/lib/coach/http";
import {
  abortLiveHold,
  CoachLiveDisabledError,
} from "@/services/coach/live-session.service";

export const maxDuration = 15;

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const { id } = await params;
    const result = await abortLiveHold(authResult.userId, id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof CoachLiveDisabledError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    return coachErrorResponse(error);
  }
}
```

In `src/app/api/coach/programs/route.ts`, import `isCoachLiveEnabled` and return:

```ts
    const body = await syncCoachPrograms(authResult.userId);
    return NextResponse.json({
      ...body,
      liveEnabled: isCoachLiveEnabled(),
    });
```

Apply that in both `GET` and the `POST` that calls `GET`. `POST` already calls `GET()`, so changing `GET` is enough.

The programs assertion matches `liveEnabled: isCoachLiveEnabled()`. The session assertion matches `clientSecret: secret.clientSecret`.

- [ ] **Step 5: Re-run the test**

Run: `pnpm exec tsx --test src/services/coach/live-session.test.ts`

Expected: PASS.

Run: `pnpm exec tsc --noEmit --pretty false`

Expected: PASS. `coach_live` is a legal `logAiUsage` action.

- [ ] **Step 6: Append the test path**

Append `src/services/coach/live-session.test.ts` to `package.json` `test:unit`.

Run: `pnpm test:unit`

Expected: PASS. Unit tests do not need the database migration. Apply `pnpm db:migrate` before the manual Live burn-in in Task 11 so inserts of `coach_live` succeed.

- [ ] **Step 7: Commit**

```bash
git add src/services/coach/live-flag.ts src/services/coach/live-session.ts src/services/coach/live-session.service.ts src/services/coach/live-session.test.ts src/app/api/coach/plans/[id]/live src/db/migrations/0020_coach_live_action.sql src/db/migrations/meta/_journal.json src/db/schema.ts src/services/ai/usage.service.ts src/services/coach/model.ts src/services/coach/meter.service.ts src/app/api/coach/programs/route.ts package.json
git commit -m "feat: add the skill coach live session relay"
```

---

### Task 8: Live client

**Files:**
- Create: `src/components/coach/live-phase.ts`
- Create: `src/components/coach/live-events.ts`
- Create: `src/components/coach/live-phase.test.ts`
- Create: `src/components/coach/voice/realtime-webrtc.ts`
- Create: `src/components/coach/coach-live-panel.tsx`
- Create: `src/components/coach/use-coach-live.ts`
- Modify: `src/components/coach/tutor-chat.tsx`
- Modify: `src/components/coach/format-coach-error.ts`
- Modify: `src/components/coach/tutor-ui.test.tsx`
- Modify: `package.json` (`test:unit` only)

**Interfaces:**
- Consumes: `RealtimeUsageParts`, `readRealtimeUsage`, `functionCallOutputPayload` shape returned by `POST …/live/tool` as `{ outputEvent, followUp }`.
- Produces:
  - `type LivePhase = "idle" | "connecting" | "listening" | "speaking" | "tool" | "error"`
  - `type LiveSignal = { type: "start" | "connected" | "speech_started" | "speech_stopped" | "response_started" | "response_done" | "tool_started" | "tool_finished" | "fail" | "stop" }`
  - `reduceLivePhase(phase: LivePhase, signal: LiveSignal): LivePhase`
  - `signalFromRealtimeEvent(type: string): LiveSignal | null`
  - `applyLiveEvent(draft: LiveDraft, event: unknown): { draft: LiveDraft; toolCall: { callId: string; name: string; arguments: string } | null; exchange: { userText: string; assistantText: string; tools: Array<{ name: string; callId: string }>; usage: RealtimeUsageParts | null } | null }`
  - `connectRealtimeWebRTC(input: { clientSecret: string; onEvent: (event: unknown) => void }): Promise<RealtimeCall>`
  - `CoachLivePanel` states: Connecting, Listening, Speaking, Running a tool

- [ ] **Step 1: Write the failing test**

Create `src/components/coach/live-phase.test.ts`:

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { applyLiveEvent, emptyLiveDraft } from "@/components/coach/live-events";
import {
  reduceLivePhase,
  signalFromRealtimeEvent,
} from "@/components/coach/live-phase";

test("live phase follows connect, speech, tools, and stop", () => {
  let phase = reduceLivePhase("idle", { type: "start" });
  assert.equal(phase, "connecting");
  phase = reduceLivePhase(phase, { type: "connected" });
  assert.equal(phase, "listening");
  phase = reduceLivePhase(phase, { type: "response_started" });
  assert.equal(phase, "speaking");
  phase = reduceLivePhase(phase, { type: "tool_started" });
  assert.equal(phase, "tool");
  phase = reduceLivePhase(phase, { type: "tool_finished" });
  assert.equal(phase, "listening");
  phase = reduceLivePhase(phase, { type: "fail" });
  assert.equal(phase, "error");
  phase = reduceLivePhase(phase, { type: "stop" });
  assert.equal(phase, "idle");
});

test("realtime event names map onto the phase signals", () => {
  assert.deepEqual(signalFromRealtimeEvent("input_audio_buffer.speech_started"), {
    type: "speech_started",
  });
  assert.deepEqual(signalFromRealtimeEvent("response.created"), {
    type: "response_started",
  });
  assert.deepEqual(signalFromRealtimeEvent("response.done"), {
    type: "response_done",
  });
  assert.deepEqual(
    signalFromRealtimeEvent("response.function_call_arguments.done"),
    { type: "tool_started" },
  );
  assert.equal(signalFromRealtimeEvent("session.updated"), null);
});

test("a response.done with transcripts completes one exchange and resets the draft", () => {
  let step = applyLiveEvent(emptyLiveDraft(), {
    type: "conversation.item.input_audio_transcription.completed",
    transcript: "What is a hook?",
  });
  step = applyLiveEvent(step.draft, {
    type: "response.output_audio_transcript.done",
    transcript: "A hook is a function.",
  });
  step = applyLiveEvent(step.draft, {
    type: "response.function_call_arguments.done",
    call_id: "call_9",
    name: "getProgress",
    arguments: "{}",
  });
  assert.deepEqual(step.toolCall, {
    callId: "call_9",
    name: "getProgress",
    arguments: "{}",
  });
  step = applyLiveEvent(step.draft, {
    type: "response.done",
    response: {
      usage: {
        input_token_details: { text_tokens: 1, audio_tokens: 2 },
        output_token_details: { text_tokens: 3, audio_tokens: 4 },
      },
    },
  });
  assert.equal(step.exchange?.userText, "What is a hook?");
  assert.equal(step.exchange?.assistantText, "A hook is a function.");
  assert.deepEqual(step.exchange?.tools, [{ name: "getProgress", callId: "call_9" }]);
  assert.equal(step.exchange?.usage?.inputAudioTokens, 2);
  assert.equal(step.draft.userText, "");
  assert.equal(step.draft.assistantText, "");
});

test("the browser live files do not execute coach tools or render Streamdown", () => {
  const webrtc = readFileSync(
    new URL("./voice/realtime-webrtc.ts", import.meta.url),
    "utf8",
  );
  const panel = readFileSync(
    new URL("./coach-live-panel.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(webrtc, /executeSkillCoachTool|skill-coach-core|@\/db/);
  assert.doesNotMatch(panel, /streamdown|executeSkillCoachTool/);
  assert.match(panel, /Listening/);
  assert.match(panel, /Speaking/);
  assert.match(panel, /Running a tool/);
});
```

Append to `src/components/coach/tutor-ui.test.tsx`:

```tsx
test("formatCoachError explains a disabled live switch", () => {
  const formatted = formatCoachError({
    error: "COACH_LIVE_DISABLED",
    detail: "Live is off in this environment.",
  });
  assert.equal(formatted.message, "Live is off in this environment.");
  assert.match(formatted.detail ?? "", /COACH_LIVE_DISABLED/);
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm exec tsx --test src/components/coach/live-phase.test.ts src/components/coach/tutor-ui.test.tsx`

Expected: FAIL. `live-phase` cannot be resolved, and `COACH_LIVE_DISABLED` still falls through `formatCoachError` to the generic sentence.

- [ ] **Step 3: Implement phase, events, WebRTC, and the panel**

Create `src/components/coach/live-phase.ts`:

```ts
export type LivePhase =
  | "idle"
  | "connecting"
  | "listening"
  | "speaking"
  | "tool"
  | "error";

export type LiveSignal = {
  type:
    | "start"
    | "connected"
    | "speech_started"
    | "speech_stopped"
    | "response_started"
    | "response_done"
    | "tool_started"
    | "tool_finished"
    | "fail"
    | "stop";
};

export function reduceLivePhase(phase: LivePhase, signal: LiveSignal): LivePhase {
  if (signal.type === "stop") return "idle";
  if (signal.type === "fail") return "error";
  if (signal.type === "start") return "connecting";
  if (phase === "error") return phase;
  switch (signal.type) {
    case "connected":
    case "speech_started":
    case "speech_stopped":
    case "response_done":
    case "tool_finished":
      return "listening";
    case "response_started":
      return "speaking";
    case "tool_started":
      return "tool";
    default:
      return phase;
  }
}

export function signalFromRealtimeEvent(type: string): LiveSignal | null {
  switch (type) {
    case "input_audio_buffer.speech_started":
      return { type: "speech_started" };
    case "input_audio_buffer.speech_stopped":
      return { type: "speech_stopped" };
    case "response.created":
      return { type: "response_started" };
    case "response.done":
      return { type: "response_done" };
    case "response.function_call_arguments.done":
      return { type: "tool_started" };
    default:
      return null;
  }
}
```

Create `src/components/coach/live-events.ts`:

```ts
import {
  readRealtimeUsage,
  type RealtimeUsageParts,
} from "@/services/coach/live-session";

export interface LiveDraft {
  userText: string;
  assistantText: string;
  tools: Array<{ name: string; callId: string }>;
  usage: RealtimeUsageParts | null;
}

export interface LiveToolCall {
  callId: string;
  name: string;
  arguments: string;
}

export function emptyLiveDraft(): LiveDraft {
  return { userText: "", assistantText: "", tools: [], usage: null };
}

function textField(event: Record<string, unknown>, key: string): string {
  const value = event[key];
  return typeof value === "string" ? value : "";
}

export function applyLiveEvent(
  draft: LiveDraft,
  event: unknown,
): {
  draft: LiveDraft;
  toolCall: LiveToolCall | null;
  exchange: {
    userText: string;
    assistantText: string;
    tools: Array<{ name: string; callId: string }>;
    usage: RealtimeUsageParts | null;
  } | null;
} {
  if (!event || typeof event !== "object") {
    return { draft, toolCall: null, exchange: null };
  }
  const record = event as Record<string, unknown>;
  const type = typeof record.type === "string" ? record.type : "";
  if (type === "conversation.item.input_audio_transcription.completed") {
    return {
      draft: { ...draft, userText: textField(record, "transcript") || draft.userText },
      toolCall: null,
      exchange: null,
    };
  }
  if (
    type === "response.output_audio_transcript.done" ||
    type === "response.audio_transcript.done"
  ) {
    const transcript = textField(record, "transcript");
    return {
      draft: {
        ...draft,
        assistantText: transcript
          ? `${draft.assistantText}${draft.assistantText ? "\n" : ""}${transcript}`
          : draft.assistantText,
      },
      toolCall: null,
      exchange: null,
    };
  }
  if (type === "response.function_call_arguments.done") {
    const callId = textField(record, "call_id");
    const name = textField(record, "name");
    const toolCall =
      callId && name
        ? { callId, name, arguments: textField(record, "arguments") || "{}" }
        : null;
    return {
      draft: toolCall
        ? { ...draft, tools: [...draft.tools, { name, callId }] }
        : draft,
      toolCall,
      exchange: null,
    };
  }
  if (type === "response.done") {
    const usage = readRealtimeUsage(event) ?? draft.usage;
    // A function-call response often has no spoken answer yet. Keep the draft
    // so the follow-up transcript joins this exchange instead of billing a second tutor turn.
    if (draft.tools.length > 0 && draft.assistantText.trim().length === 0) {
      return { draft: { ...draft, usage }, toolCall: null, exchange: null };
    }
    const exchange =
      draft.userText.trim() || draft.assistantText.trim()
        ? {
            userText: draft.userText,
            assistantText: draft.assistantText,
            tools: draft.tools,
            usage,
          }
        : null;
    return { draft: emptyLiveDraft(), toolCall: null, exchange };
  }
  return { draft, toolCall: null, exchange: null };
}
```

Create `src/components/coach/voice/realtime-webrtc.ts`:

```ts
export interface RealtimeCall {
  stop: () => void;
  send: (event: unknown) => void;
}

export async function connectRealtimeWebRTC(input: {
  clientSecret: string;
  onEvent: (event: unknown) => void;
}): Promise<RealtimeCall> {
  const pc = new RTCPeerConnection();
  const audio = document.createElement("audio");
  audio.autoplay = true;
  pc.ontrack = (event) => {
    audio.srcObject = event.streams[0] ?? null;
  };
  const media = await navigator.mediaDevices.getUserMedia({ audio: true });
  const [track] = media.getTracks();
  if (!track) throw new Error("Microphone unavailable");
  pc.addTrack(track, media);
  const channel = pc.createDataChannel("oai-events");
  channel.addEventListener("message", (message) => {
    try {
      input.onEvent(JSON.parse(String(message.data)));
    } catch {
      input.onEvent(null);
    }
  });
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  const response = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    body: offer.sdp,
    headers: {
      Authorization: `Bearer ${input.clientSecret}`,
      "Content-Type": "application/sdp",
    },
  });
  if (!response.ok) {
    track.stop();
    pc.close();
    throw new Error(`Realtime connect failed (${response.status}).`);
  }
  await pc.setRemoteDescription({
    type: "answer",
    sdp: await response.text(),
  });
  return {
    send: (event) => {
      if (channel.readyState === "open") channel.send(JSON.stringify(event));
    },
    stop: () => {
      track.stop();
      channel.close();
      pc.close();
      audio.srcObject = null;
    },
  };
}
```

Create `src/components/coach/coach-live-panel.tsx`:

```tsx
"use client";

import { Loader2 } from "lucide-react";
import type { LivePhase } from "@/components/coach/live-phase";
import { Button } from "@/components/ui/button";

const COPY: Record<LivePhase, string> = {
  idle: "Live is off.",
  connecting: "Connecting",
  listening: "Listening",
  speaking: "Speaking",
  tool: "Running a tool",
  error: "Live stopped.",
};

export function CoachLivePanel({
  phase,
  error,
  onLeave,
}: {
  phase: LivePhase;
  error: string | null;
  onLeave: () => void;
}) {
  return (
    <div data-slot="coach-live-panel" className="flex flex-1 flex-col gap-3">
      <p className="text-sm text-foreground">
        {phase === "connecting" || phase === "tool" ? (
          <Loader2 className="mr-2 inline size-3 animate-spin" aria-hidden />
        ) : null}
        {error ?? COPY[phase]}
      </p>
      <Button type="button" variant="secondary" onClick={onLeave}>
        Leave Live
      </Button>
    </div>
  );
}
```

In `format-coach-error.ts`, add this branch before the `NOT_FOUND` branch:

```ts
  if (error === "COACH_LIVE_DISABLED") {
    return {
      message: "Live is off in this environment.",
      detail: joinDetail(["COACH_LIVE_DISABLED", serverDetail]),
    };
  }
```

Create `src/components/coach/use-coach-live.ts`:

```ts
"use client";

import { useCallback, useRef, useState } from "react";
import type { UIMessage } from "ai";
import { applyLiveEvent, emptyLiveDraft } from "@/components/coach/live-events";
import {
  reduceLivePhase,
  signalFromRealtimeEvent,
  type LivePhase,
} from "@/components/coach/live-phase";
import { connectRealtimeWebRTC, type RealtimeCall } from "@/components/coach/voice/realtime-webrtc";
import { formatCoachError } from "@/components/coach/format-coach-error";

export function useCoachLive(input: {
  planId: string;
  onMessages: (messages: UIMessage[]) => void;
}) {
  const [phase, setPhase] = useState<LivePhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const callRef = useRef<RealtimeCall | null>(null);
  const draftRef = useRef(emptyLiveDraft());
  const countedRef = useRef(false);
  const phaseRef = useRef<LivePhase>("idle");

  const setPhaseBoth = useCallback((next: LivePhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const leaveLive = useCallback(async () => {
    callRef.current?.stop();
    callRef.current = null;
    const shouldAbort = !countedRef.current && phaseRef.current !== "idle";
    setPhaseBoth("idle");
    if (!shouldAbort) return;
    await fetch(`/api/coach/plans/${input.planId}/live/abort`, { method: "POST" });
  }, [input.planId, setPhaseBoth]);

  const startLive = useCallback(async () => {
    setError(null);
    countedRef.current = false;
    draftRef.current = emptyLiveDraft();
    setPhaseBoth("connecting");
    const response = await fetch(`/api/coach/plans/${input.planId}/live/session`, {
      method: "POST",
    });
    const body = (await response.json().catch(() => ({}))) as {
      clientSecret?: string;
      instructions?: string;
      tools?: unknown[];
      error?: string;
    };
    if (!response.ok || !body.clientSecret) {
      setError(formatCoachError(body).message);
      setPhaseBoth("error");
      return false;
    }
    try {
      const call = await connectRealtimeWebRTC({
        clientSecret: body.clientSecret,
        onEvent: (event) => {
          const type =
            event && typeof event === "object" && "type" in event
              ? String((event as { type?: unknown }).type ?? "")
              : "";
          const signal = signalFromRealtimeEvent(type);
          if (signal) {
            setPhaseBoth(reduceLivePhase(phaseRef.current, signal));
          }
          const step = applyLiveEvent(draftRef.current, event);
          draftRef.current = step.draft;
          if (step.toolCall) {
            void (async () => {
              const toolResponse = await fetch(
                `/api/coach/plans/${input.planId}/live/tool`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    callId: step.toolCall?.callId,
                    name: step.toolCall?.name,
                    arguments: step.toolCall?.arguments,
                  }),
                },
              );
              const toolBody = (await toolResponse.json().catch(() => ({}))) as {
                outputEvent?: unknown;
                followUp?: unknown;
              };
              if (toolResponse.ok && toolBody.outputEvent) {
                call.send(toolBody.outputEvent);
                if (toolBody.followUp) call.send(toolBody.followUp);
              } else {
                call.send({
                  type: "conversation.item.create",
                  item: {
                    type: "function_call_output",
                    call_id: step.toolCall?.callId,
                    output: JSON.stringify({ error: "tool_failed" }),
                  },
                });
                call.send({ type: "response.create" });
              }
              setPhaseBoth(reduceLivePhase(phaseRef.current, { type: "tool_finished" }));
            })();
          }
          if (step.exchange) {
            void (async () => {
              const turnResponse = await fetch(
                `/api/coach/plans/${input.planId}/live/turn`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(step.exchange),
                },
              );
              const turnBody = (await turnResponse.json().catch(() => ({}))) as {
                saved?: boolean;
                messages?: UIMessage[];
              };
              if (turnBody.saved) countedRef.current = true;
              if (turnBody.saved && Array.isArray(turnBody.messages)) {
                input.onMessages(turnBody.messages);
              }
            })();
          }
        },
      });
      callRef.current = call;
      call.send({
        type: "session.update",
        session: {
          type: "realtime",
          instructions: body.instructions,
          tools: body.tools,
          tool_choice: "auto",
        },
      });
      setPhaseBoth("listening");
      return true;
    } catch (caught) {
      await fetch(`/api/coach/plans/${input.planId}/live/abort`, { method: "POST" });
      setError(
        formatCoachError({
          error: caught instanceof Error ? caught.message : "Live connect failed",
        }).message,
      );
      setPhaseBoth("error");
      return false;
    }
  }, [input.planId, input.onMessages, setPhaseBoth]);

  return { phase, error, startLive, leaveLive };
}
```

In `TutorChatSession`, call `useCoachLive({ planId, onMessages: (next) => setMessages((current) => [...current, ...next]) })`. The Live button calls `void startLive().then((ok) => { if (ok) setChannel("live"); })` after stopping Sarvam. Pass `liveSlot={<CoachLivePanel phase={phase} error={liveError} onLeave={() => { void leaveLive(); setChannel("chat"); }} />}`. The unmount effect calls `void leaveLive()`. Do not call `speech.startListen` or `speech.speak` when `channel === "live"`.

- [ ] **Step 4: Re-run the tests**

Run: `pnpm exec tsx --test src/components/coach/live-phase.test.ts src/components/coach/tutor-ui.test.tsx src/components/coach/tutor-parts.test.tsx`

Expected: PASS. `COACH_LIVE_DISABLED` renders `Live is off in this environment.`

- [ ] **Step 5: Append the test path**

Append `src/components/coach/live-phase.test.ts` to `package.json` `test:unit`.

Run: `pnpm test:unit`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/coach/live-phase.ts src/components/coach/live-events.ts src/components/coach/live-phase.test.ts src/components/coach/voice/realtime-webrtc.ts src/components/coach/use-coach-live.ts src/components/coach/coach-live-panel.tsx src/components/coach/tutor-chat.tsx src/components/coach/format-coach-error.ts src/components/coach/tutor-ui.test.tsx package.json
git commit -m "feat: add the skill coach live toggle"
```

---

### Task 9: Admin usage by action

**Files:**
- Create: `src/services/ai/admin-usage.ts`
- Create: `src/services/ai/admin-usage.test.ts`
- Modify: `src/app/api/admin/stats/route.ts`
- Modify: `package.json` (`test:unit` only)

**Interfaces:**
- Consumes: `ai_usage_log` columns `action`, `model`, `total_tokens`, `cost_usd`, `success`, `error_code`, `latency_ms`, `created_at`. The existing `days` query param and `startDate`.
- Produces:
  - `actionLabel(action: string): string`
  - `failureRate(successCount: number, failureCount: number): number`
  - `formatFailurePercent(rate: number): string`
  - `interface AiActionStat { action: string; label: string; calls: number; tokens: number; costUsd: number; successCount: number; failureCount: number }`
  - `interface AiErrorStat { action: string; label: string; model: string; errorCode: string | null; latencyMs: number | null; createdAt: string }`
  - `shapeActionStats(rows: unknown): AiActionStat[]`
  - `shapeErrorStats(rows: unknown): AiErrorStat[]`
  - `GET /api/admin/stats` adds `actions` and `aiErrors` for the same window. Existing `revenue`, `ai`, `growth`, and `models` stay.

- [ ] **Step 1: Write the failing test**

Create `src/services/ai/admin-usage.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  actionLabel,
  failureRate,
  formatFailurePercent,
  shapeActionStats,
  shapeErrorStats,
} from "@/services/ai/admin-usage";

test("action labels name coach and resume features", () => {
  assert.equal(actionLabel("resume_chat"), "Resume chat");
  assert.equal(actionLabel("coach_tutor"), "Coach tutor");
  assert.equal(actionLabel("coach_live"), "Coach live");
  assert.equal(actionLabel("custom_action"), "custom_action");
});

test("failure rate is zero when the window is empty", () => {
  assert.equal(failureRate(0, 0), 0);
  assert.equal(failureRate(3, 1), 0.25);
  assert.equal(formatFailurePercent(0.25), "25.0%");
  assert.equal(formatFailurePercent(0), "0.0%");
});

test("shapers drop user ids, metadata, and prompts", () => {
  const actions = shapeActionStats([
    {
      action: "coach_live",
      calls: "4",
      tokens: "100",
      cost: "0.096",
      success_count: "3",
      failure_count: "1",
      user_id: "user_secret",
    },
  ]);
  assert.deepEqual(actions, [
    {
      action: "coach_live",
      label: "Coach live",
      calls: 4,
      tokens: 100,
      costUsd: 0.096,
      successCount: 3,
      failureCount: 1,
    },
  ]);
  const errors = shapeErrorStats([
    {
      action: "coach_tutor",
      model: "gpt-5-mini",
      error_code: "EMPTY_REPLY",
      latency_ms: 40,
      created_at: "2026-10-28T00:00:00.000Z",
      user_id: "user_secret",
      metadata: { prompt: "Explain hooks" },
    },
  ]);
  const encoded = JSON.stringify(errors);
  assert.equal(encoded.includes("user_secret"), false);
  assert.equal(encoded.includes("Explain hooks"), false);
  assert.equal(errors[0]?.errorCode, "EMPTY_REPLY");
  assert.equal(errors[0]?.label, "Coach tutor");
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm exec tsx --test src/services/ai/admin-usage.test.ts`

Expected: FAIL. `@/services/ai/admin-usage` cannot be resolved.

- [ ] **Step 3: Implement the shapers and the stats queries**

Create `src/services/ai/admin-usage.ts`:

```ts
const LABELS: Record<string, string> = {
  parse_resume: "Resume parse",
  analyze_gaps: "Gap analysis",
  enhance_bullet: "Bullet enhance",
  generate_summary: "Summary",
  tailor_resume: "Tailor resume",
  ats_scan: "ATS scan",
  resume_roast: "Resume roast",
  resume_chat: "Resume chat",
  coach_plan: "Coach plan",
  coach_tutor: "Coach tutor",
  coach_practice: "Coach practice",
  coach_mock: "Coach mock",
  coach_live: "Coach live",
};

export function actionLabel(action: string): string {
  return LABELS[action] ?? action;
}

export function failureRate(successCount: number, failureCount: number): number {
  const total = successCount + failureCount;
  if (total <= 0) return 0;
  return failureCount / total;
}

export function formatFailurePercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export interface AiActionStat {
  action: string;
  label: string;
  calls: number;
  tokens: number;
  costUsd: number;
  successCount: number;
  failureCount: number;
}

export interface AiErrorStat {
  action: string;
  label: string;
  model: string;
  errorCode: string | null;
  latencyMs: number | null;
  createdAt: string;
}

function rowsOf(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (row): row is Record<string, unknown> =>
      !!row && typeof row === "object" && !Array.isArray(row),
  );
}

function num(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) return Number(value) || 0;
  return 0;
}

export function shapeActionStats(rows: unknown): AiActionStat[] {
  return rowsOf(rows).map((row) => {
    const action = String(row.action ?? "");
    return {
      action,
      label: actionLabel(action),
      calls: num(row.calls),
      tokens: num(row.tokens),
      costUsd: num(row.cost),
      successCount: num(row.success_count),
      failureCount: num(row.failure_count),
    };
  });
}

export function shapeErrorStats(rows: unknown): AiErrorStat[] {
  return rowsOf(rows).map((row) => {
    const action = String(row.action ?? "");
    const created =
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at ?? "");
    return {
      action,
      label: actionLabel(action),
      model: String(row.model ?? ""),
      errorCode:
        typeof row.error_code === "string" && row.error_code.length > 0
          ? row.error_code
          : null,
      latencyMs:
        row.latency_ms === null || row.latency_ms === undefined
          ? null
          : num(row.latency_ms),
      createdAt: created,
    };
  });
}
```

In `src/app/api/admin/stats/route.ts`, import the shapers and add these queries inside the existing `try`, using the same `startDate` as the daily AI query. Do not change the model query's lack of a date filter.

```ts
    const actionStats = await db.execute(sql`
      SELECT
        action,
        COUNT(*)::int as calls,
        COALESCE(SUM(total_tokens), 0)::int as tokens,
        COALESCE(SUM(cost_usd), 0) as cost,
        COUNT(*) FILTER (WHERE success = true)::int as success_count,
        COUNT(*) FILTER (WHERE success = false)::int as failure_count
      FROM ai_usage_log
      WHERE created_at >= ${startDate}
      GROUP BY action
      ORDER BY cost DESC
    `);

    const errorStats = await db.execute(sql`
      SELECT action, model, error_code, latency_ms, created_at
      FROM ai_usage_log
      WHERE created_at >= ${startDate}
        AND success = false
      ORDER BY created_at DESC
      LIMIT 20
    `);
```

Add to the JSON return:

```ts
      actions: shapeActionStats(actionStats.rows),
      aiErrors: shapeErrorStats(errorStats.rows),
```

Keep `revenue`, `ai`, `growth`, and `models`.

- [ ] **Step 4: Re-run the test**

Run: `pnpm exec tsx --test src/services/ai/admin-usage.test.ts`

Expected: PASS. 3 tests pass. The error fixture's prompt and user id are absent.

- [ ] **Step 5: Append the test path**

Append `src/services/ai/admin-usage.test.ts` to `package.json` `test:unit`.

Run: `pnpm test:unit`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/services/ai/admin-usage.ts src/services/ai/admin-usage.test.ts src/app/api/admin/stats/route.ts package.json
git commit -m "feat: report AI usage by action"
```

---

### Task 10: Billing AI panel

**Files:**
- Create: `src/app/hq/billing/_components/ai-usage-panel.tsx`
- Create: `src/app/hq/billing/_components/ai-usage-panel.test.tsx`
- Modify: `src/app/hq/billing/_components/billing-content.tsx`
- Modify: `package.json` (`test:unit` only)

**Interfaces:**
- Consumes: `AiActionStat`, `AiErrorStat`, `failureRate`, `formatFailurePercent` from Task 9.
- Produces: `AiUsagePanel({ actions, errors }: { actions: AiActionStat[]; errors: AiErrorStat[] })`. Billing renders it after the model table. `src/app/hq/page.tsx` is not modified.

- [ ] **Step 1: Write the failing test**

Create `src/app/hq/billing/_components/ai-usage-panel.test.tsx`:

```tsx
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AiUsagePanel } from "@/app/hq/billing/_components/ai-usage-panel";

test("the panel lists cost by action and the latest failure code", () => {
  const html = renderToStaticMarkup(
    <AiUsagePanel
      actions={[
        {
          action: "coach_tutor",
          label: "Coach tutor",
          calls: 2,
          tokens: 500,
          costUsd: 0.012,
          successCount: 2,
          failureCount: 0,
        },
        {
          action: "coach_live",
          label: "Coach live",
          calls: 1,
          tokens: 200,
          costUsd: 0.096,
          successCount: 0,
          failureCount: 1,
        },
      ]}
      errors={[
        {
          action: "coach_live",
          label: "Coach live",
          model: "gpt-realtime",
          errorCode: "EMPTY_REPLY",
          latencyMs: 80,
          createdAt: "2026-10-28T00:00:00.000Z",
        },
      ]}
    />,
  );
  assert.match(html, /Cost by feature/);
  assert.match(html, /Coach tutor/);
  assert.match(html, /Coach live/);
  assert.match(html, /\$0\.0960/);
  assert.match(html, /AI failures/);
  assert.match(html, /33\.3%/);
  assert.match(html, /EMPTY_REPLY/);
  assert.doesNotMatch(html, /System Healthy/);
});

test("an empty failure list says there were none", () => {
  const html = renderToStaticMarkup(
    <AiUsagePanel actions={[]} errors={[]} />,
  );
  assert.match(html, /No AI failures in this window/);
  assert.match(html, /0\.0%/);
});

test("billing renders the panel and the overview badge file is untouched by this component", () => {
  const billing = readFileSync(
    new URL("./billing-content.tsx", import.meta.url),
    "utf8",
  );
  assert.match(billing, /<AiUsagePanel/);
  assert.match(billing, /actions=\{data\?\.actions/);
  assert.match(billing, /errors=\{data\?\.aiErrors/);
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm exec tsx --test src/app/hq/billing/_components/ai-usage-panel.test.tsx`

Expected: FAIL. `AiUsagePanel` is not exported, and `billing-content.tsx` does not render it.

- [ ] **Step 3: Add the panel and mount it**

Create `src/app/hq/billing/_components/ai-usage-panel.tsx`:

```tsx
import {
  type AiActionStat,
  type AiErrorStat,
  failureRate,
  formatFailurePercent,
} from "@/services/ai/admin-usage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AiUsagePanel({
  actions,
  errors,
}: {
  actions: AiActionStat[];
  errors: AiErrorStat[];
}) {
  const success = actions.reduce((sum, row) => sum + row.successCount, 0);
  const failed = actions.reduce((sum, row) => sum + row.failureCount, 0);
  const rate = formatFailurePercent(failureRate(success, failed));

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Cost by feature</CardTitle>
          <CardDescription>
            Tokens and estimated USD for the selected window. Failure rate {rate}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b">
                  <th className="h-10 px-2 text-left font-medium text-muted-foreground">
                    Feature
                  </th>
                  <th className="h-10 px-2 text-right font-medium text-muted-foreground">
                    Calls
                  </th>
                  <th className="h-10 px-2 text-right font-medium text-muted-foreground">
                    Tokens
                  </th>
                  <th className="h-10 px-2 text-right font-medium text-muted-foreground">
                    Est. cost
                  </th>
                  <th className="h-10 px-2 text-right font-medium text-muted-foreground">
                    Failures
                  </th>
                </tr>
              </thead>
              <tbody>
                {actions.map((row) => (
                  <tr key={row.action} className="border-b">
                    <td className="p-2 font-medium">{row.label}</td>
                    <td className="p-2 text-right">{row.calls.toLocaleString()}</td>
                    <td className="p-2 text-right">{row.tokens.toLocaleString()}</td>
                    <td className="p-2 text-right font-mono">
                      ${row.costUsd.toFixed(4)}
                    </td>
                    <td className="p-2 text-right">{row.failureCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>AI failures</CardTitle>
          <CardDescription>
            Latest unsuccessful model calls in this window. No prompts are stored here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errors.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No AI failures in this window.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {errors.map((row) => (
                <li
                  key={`${row.createdAt}-${row.action}-${row.errorCode}`}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="font-medium">{row.label}</span>
                  {" · "}
                  {row.model}
                  {" · "}
                  {row.errorCode ?? "unknown"}
                  {row.latencyMs !== null ? ` · ${row.latencyMs} ms` : ""}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

In `billing-content.tsx`, import `AiUsagePanel` and render it immediately after the Model Distribution `Card` closes, still inside the fragment:

```tsx
      <AiUsagePanel
        actions={data?.actions ?? []}
        errors={data?.aiErrors ?? []}
      />
```

Do not edit `src/app/hq/page.tsx`.

- [ ] **Step 4: Re-run the test**

Run: `pnpm exec tsx --test src/app/hq/billing/_components/ai-usage-panel.test.tsx`

Expected: PASS. The mixed fixture shows `33.3%` because 1 failure / 3 calls.

- [ ] **Step 5: Append the test path**

Append `src/app/hq/billing/_components/ai-usage-panel.test.tsx` to `package.json` `test:unit`.

Run: `pnpm test:unit`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/hq/billing/_components/ai-usage-panel.tsx src/app/hq/billing/_components/ai-usage-panel.test.tsx src/app/hq/billing/_components/billing-content.tsx package.json
git commit -m "feat: show AI cost and errors on HQ billing"
```

---

### Task 11: Docs, env checklist, and success checks

**Files:**
- Modify: `docs/skill-coach.md`
- Modify: `.env.example`
- Modify: `package.json` only if a test path from Tasks 1–10 is missing

**Interfaces:**
- Consumes: the routes and env names from Tasks 4–10.
- Produces: a short streaming/Live section in `docs/skill-coach.md` and a commented `COACH_LIVE_ENABLED` line. No new runtime behavior.

- [ ] **Step 1: Confirm the unit-test script lists every new file**

`package.json` `test:unit` must be exactly this string (existing files first, then the files this plan added):

```text
tsx --test src/lib/career/derive.test.ts src/lib/career/pay.test.ts src/lib/career/score.test.ts src/lib/career/market.test.ts src/lib/career/next-steps.test.ts src/components/intelligence/intelligence-insights.test.tsx src/lib/resume-knowledge/rules.test.ts src/lib/resume/resume-owner-fixes.test.ts src/services/coach/policy.test.ts src/services/coach/provider-schema.test.ts src/lib/app-nav.test.ts src/components/app/page-header.test.tsx src/components/app/app-chrome.test.ts src/lib/speech/fallback.test.ts src/lib/speech/sarvam.test.ts src/components/coach/tutor-ui.test.tsx src/components/coach/voice/use-coach-speech.test.tsx src/components/coach/coach-workspace.test.tsx src/components/intelligence/home-metrics.test.ts src/components/intelligence/career-file-editors.test.tsx src/components/intelligence/home-board.test.tsx src/lib/home-entry.test.ts src/components/intelligence/intelligence-redirect.test.ts src/services/coach/tutor-messages.test.ts src/services/coach/skill-coach-core.test.ts src/lib/agents/skill-coach-agent.test.ts src/services/coach/tutor-chat.test.ts src/components/coach/tutor-parts.test.tsx src/services/coach/live-session.test.ts src/components/coach/live-phase.test.ts src/services/ai/admin-usage.test.ts src/app/hq/billing/_components/ai-usage-panel.test.tsx
```

If a path is missing, append it. Do not drop a pre-existing path that this list still contains.

Run: `pnpm test:unit`

Expected: PASS.

- [ ] **Step 2: Document streaming, Live, and the env flag**

Append this section to `docs/skill-coach.md`:

```md
## Streaming tutor and Live

Chat tutor turns use `ToolLoopAgent` and `POST /api/coach/plans/[id]/ai/chat` (`createAgentUIStreamResponse`, word chunking, `useChat` in the docked coach column). `GET` on that path reloads UIMessages and does not create a session. Legacy `{ role, content }` rows are read as a single text part. Writes store UIMessages. `POST /api/coach/plans/[id]/sessions` returns `410` `TUTOR_MOVED`.

Instructions, the four tools, and `openTutorMeter` live in `src/services/coach/skill-coach-core.ts`. Chat and Live both call `executeSkillCoachTool`. The rolling summary runs after the chat stream settles and never before the first token. `ensureSharedOutline` still runs first because the instructions need the module.

Live is OpenAI Realtime (`gpt-realtime`) behind `COACH_LIVE_ENABLED`. Unset or any value other than `true`, `yes`, or `1` hides the toggle and rejects `POST /api/coach/plans/[id]/live/session` with `503` `COACH_LIVE_DISABLED`. The browser receives an ephemeral client secret and connects with WebRTC. Tool calls are posted to `POST …/live/tool`; the browser does not execute them. Completed exchanges are stored on the same tutor `coachSession` and consume the tutor quota (one turn per user→assistant exchange with assistant text). Usage action is `coach_live`. Sarvam STT/TTS stay on chat only.

HQ Billing reads `actions` and `aiErrors` from `GET /api/admin/stats`. That panel is the source of truth for AI cost and failures in this slice. The overview "System Healthy" badge is unchanged and is not a model-health signal.

### Env checklist

| Name | Where | Behavior when missing |
| --- | --- | --- |
| `OPENAI_API_KEY` | Server | Chat and Live cannot call OpenAI. Live mint returns a provider error and refunds the reserve. |
| `COACH_LIVE_ENABLED` | Server (Vercel). Never `NEXT_PUBLIC_`. | Live UI hidden. Mint, tool, turn, and abort return `COACH_LIVE_DISABLED`. Chat streaming still works. |
| `SARVAM_API_KEY` | Server | Chat falls back per the existing speech hook. Live does not read this key. |
| `coach_enabled` app setting | `app_settings` | Unchanged. `false` still blocks coach model calls, including chat and Live. |
```

In `.env.example`, replace the OpenAI comment and add the Live flag after `OPENAI_API_KEY=`:

```text
# OpenAI. Server-only. Chat and Live both use this key. Live mints an ephemeral Realtime secret; the browser never sees this value.
OPENAI_API_KEY=

# Skill Coach Live (OpenAI Realtime). Unset or false hides Live and rejects session mint.
# Chat streaming does not read this flag. Never prefix with NEXT_PUBLIC_.
COACH_LIVE_ENABLED=
```

Keep the Sarvam comment as it is.

- [ ] **Step 3: Manual success checks**

These are burn-in for the implementation PR. They are not part of `pnpm test:unit`. Run them with `COACH_LIVE_ENABLED` unset, then again with it set to `true` on a dev database. Apply `pnpm db:migrate` first so `coach_live` exists on `ai_action`.

- Chat: a tutor send shows text before the full reply finishes. A tool call shows a chip (`Reading your plan`, `Looking up resources`, `Checking progress`, or `Updating the module`). Reload keeps parts. Sarvam transcript sends a chat message. Speaker audio starts only after the assistant message finishes, not on the first token. Stop refunds the tutor quota. An 11th free-tier turn in a UTC day returns the upgrade copy.
- Summary: a long thread's first token is not held for the summary model call. A failed summary leaves the previous summary in the session.
- Live off: the Chat | Live toggle is absent. `POST /api/coach/plans/[id]/live/session` is `503` with `COACH_LIVE_DISABLED` and no `clientSecret`.
- Live on: the browser network log shows `clientSecret` and no `sk-` long-lived key. Speaking produces audio. A tool updates progress only through `POST …/live/tool` (server `executeSkillCoachTool`). Leave Live closes the peer connection and aborts an unused hold. The chat thread shows the Live user and assistant text after the exchange. A completed exchange increments tutor turns by one.
- Policy: a tutor reply does not invent a resource URL that is not in `listCuratedResources` or the stored outline. `setModuleStatus` does not move a plan to demonstrated or verified.
- Admin: Billing shows Coach tutor, Coach live, and Resume chat in Cost by feature for the selected window. A forced failed call appears in AI failures with its `errorCode` and without a prompt. Overview still says System Healthy; do not treat that badge as the AI signal.
- Practice, mock, and outline routes still return JSON and do not stream.

- [ ] **Step 4: Commit**

```bash
git add docs/skill-coach.md .env.example package.json
git commit -m "docs: note skill coach streaming, live, and billing"
```

---

## Spec coverage

| Spec section | Tasks |
| --- | --- |
| Shared core (instructions, tools, meter, policy) | 2 |
| Chat `ToolLoopAgent` + `gpt-5-mini` + `isStepCount(maxTutorSteps)` | 3, 4 |
| `GET`/`POST /api/coach/plans/[id]/ai/chat`, smooth stream, abort | 4 |
| UIMessages, legacy read, write upgrade, no session on GET | 1, 4 |
| Summary after the stream, not before the first token | 4 |
| Docked `useChat`, parts, tool chips, reasoning, stop, retry, stick-to-bottom | 5 |
| Sarvam STT → `sendMessage`, TTS on completed assistant text, not on Live | 5, 8 |
| Deprecate `POST …/sessions` | 6 |
| Ephemeral Realtime secret, WebRTC, `session.update`, server tool relay | 7, 8 |
| Same `coachSession` for Live transcripts | 7, 8 |
| `COACH_LIVE_ENABLED` default off | 7, 8, 11 |
| Tutor quota: one Live exchange, refund on abort, empty reply, connect failure | 4, 7, 8 |
| `coach_live` log action, no prompt in metadata | 7, 9 |
| By-action cost and recent `success = false` rows, no PII | 9, 10 |
| Billing is the AI-health source; overview badge unchanged | 10, 11 |
| Env checklist | 11 |
| Non-goals (practice/mock/outline streaming, Gemini, Sarvam-on-Live, shared UI kit, red-team, APM, resume quality) | Global Constraints; those files are not in the file map |
