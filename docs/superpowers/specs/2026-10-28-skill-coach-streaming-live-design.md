# Skill Coach streaming + Live Realtime + admin AI observability

**Date:** 2026-10-28  
**Status:** Approved for implementation planning  
**Repo:** sahil1330/zaprill-app  
**Slice:** Skill Coach tutor chat parity with Resume Architect, Live Realtime MVP on a shared core, and admin HQ cost-by-feature + AI error reporting.

## Problem

Skill Coach tutor turns buffer with `generateText` and return JSON `{ reply }`. There is no SSE / `useChat` streaming, so the product feels slow compared to ChatGPT, Grok, and Zaprill Resume Architect (`ToolLoopAgent` + `createAgentUIStreamResponse` + `useChat`).

Sahil also wants a GPT Live / Gemini Live–style **Live** mode using OpenAI Realtime, as the **same agent** (same tools and policy), with chat and live as adapters on a shared core.

Admin HQ already stores `ai_usage_log` rows (including `action`, `success`, `errorCode`, `cost_usd`) but the UI only shows total tokens, daily aggregates, and **by-model** cost — not **by feature/action**, and not AI error rates or recent failures.

## Goals

1. Instant first-token streaming and visible tool steps for Skill Coach **chat**, matching Resume Architect’s AI SDK path (do not invent a custom loop).
2. Shared coach **core** (instructions, tools, context, meter hooks) with **chat** and **live** adapters.
3. Live Realtime MVP in the **same** implementation as chat streaming.
4. Admin observability: cost/tokens **by action**, plus AI failure reporting on HQ.
5. `COACH_LIVE_ENABLED` kill switch for Live.

## Non-goals (this slice)

- Resume Architect answer quality, real page/template metadata, or skillset-fit guardrails (follow-up).
- Extracting a shared Resume+Coach UI kit (optional later).
- Red-team eval harness.
- Gemini Live, phone/PSTN, Sarvam on the Live path.
- Practice / mock / outline streaming (remain as today).
- External APM (Sentry/Datadog) or alert webhooks.

## Approach

**Mirror Resume Architect 1:1 for chat**, plus Live Realtime MVP and HQ AI panels, all on one shared core.

Reference patterns already in-repo:

- `src/lib/agents/resume-architect.ts` — `ToolLoopAgent`
- `src/app/api/resumes/[id]/ai/chat/route.ts` — `createAgentUIStreamResponse` + `smoothStream`
- `src/components/resume/editor/ResumeArchitectChat.tsx` — `useChat` + `DefaultChatTransport`
- Current coach: `src/services/coach/tutor.service.ts` (`generateText`), `src/app/api/coach/plans/[id]/sessions/route.ts` (JSON), `src/lib/agents/skill-coach-tools.ts`

Prefer AI SDK Core/UI APIs over custom streaming. shadcn `@shadcn/helpers/ai-sdk` is for **offline mock streams** (UI tests), not production agents.

---

## Architecture

### Shared core (no transport)

A single module owns:

- Instructions (language rules, fact rules, module/role context)
- Tool definitions + `execute` (`createSkillCoachTools`: `getLearningContext`, `listCuratedResources`, `getProgress`, `setModuleStatus`)
- Plan/session/context loaders
- Meter open / reconcile / refund helpers
- Turn policy constants (`COACH_LIMITS.maxTutorSteps`, curated-links-only, status transition limits)

Chat and Live call into this core. They must not fork tool implementations.

### Chat adapter

- `createSkillCoachAgent(ctx)` → `ToolLoopAgent` with core instructions/tools, model `gpt-5-mini` (same as `COACH_LIMITS.model`), `stopWhen: isStepCount(COACH_LIMITS.maxTutorSteps)`.
- Routes: `GET`/`POST` `/api/coach/plans/[id]/ai/chat` patterned on Resume Architect chat:
  - Auth + plan ownership
  - Load context / outline / active tutor session
  - `createAgentUIStreamResponse` + `smoothStream({ chunking: "word" })` + `abortSignal`
  - Persist UIMessages on `onEnd`
- Client: tutor thread + composer use `useChat` + `DefaultChatTransport` (docked in coach workspace — not a floating window).
- Render message **parts**: streaming text (Streamdown), tool chips, optional reasoning collapse (`sendReasoning: true`).
- Sarvam STT/TTS remain **chat-only** (STT → text into `sendMessage`; TTS only on **completed** assistant text).
- Deprecate tutor use of `POST …/sessions` JSON `{ reply }` once the client migrates (return a clear migration error or remove).

### Live adapter (Realtime MVP)

- Server mints an **ephemeral Realtime client secret** after authZ + meter reserve. Example: `POST /api/coach/plans/[id]/live/session`. Never expose the long-lived OpenAI API key to the browser.
- Browser connects via OpenAI Realtime (WebRTC preferred). `session.update` registers the **same four function tools** (schemas from core) and the same instructions text.
- **Tool execution is server-only** via a thin relay: Realtime emits `function_call` → server runs core `execute` with signed plan context → `function_call_output` → `response.create`. Browser must not execute privileged tools.
- Persist Live turns into the same `coachSession` as UIMessages (transcripts + tool parts) so Chat|Live share one thread.
- UI: Chat | Live toggle in the coach chat column. Live shows listening / speaking / tool-running states (no Streamdown reasoning block). Leaving Live ends the Realtime session cleanly.
- Pin the current Realtime model id at implement time from OpenAI’s list; log under action `coach_live`.
- **Kill switch:** `COACH_LIVE_ENABLED` env (Vercel). When unset/false: hide Live UI, reject live session mint with a clear error. Chat streaming remains available.

### Meter & quota

- Open coach meter before chat stream or Live session start (same reserve pattern).
- Reconcile actual usage on stream/session end; refund on abort, connect failure, or empty assistant reply (chat).
- Live burns the tutor quota pool: **one turn per completed user→assistant exchange** in MVP (document clearly in code comments).
- Distinct `coach_live` usage action for spend clarity vs `coach_tutor`.

### Summary compression

- Do **not** block first tokens with the pre-turn `summarize` call.
- When history length crosses `summaryAfterMessages`, summarize **after** the streamed turn settles (or at the start of the *next* request without delaying that turn’s first token if already summarized). Failed summary leaves prior summary intact.

---

## Data & persistence

- Keep `coachSession` (`kind: "tutor"`). Fields: `messages`, `summary`, `moduleKey`, `turnCount`. No new tables required for MVP.
- Persist **UIMessages** (id, role, parts) like Resume Architect.
- **Read path:** legacy `{ role, content }` turns wrap as a single text part with a stable generated id.
- **Write path (`onEnd`):** always save UIMessage arrays (one-way upgrade).
- Agent context window: last `COACH_LIMITS.historyMessages` text turns + optional summary prefix (not unbounded raw JSON).
- `GET` chat returns `{ messages }` for the active session; creates no session until first successful chat POST.
- AuthZ: authenticated user must own the plan (existing coach helpers).

---

## UX & voice

- Tutor stays docked; outline/progress rails unchanged.
- Chat: submitted/drafting state, word-chunk streaming, tool chips (pending/done labels for the four tools), stop + retry, stick-to-bottom.
- Composer: Enter send / Shift+Enter newline → `sendMessage`.
- Voice: Sarvam (Web Speech fallback) only on chat adapter; Live uses Realtime native audio — do not double-stack Sarvam on Live.
- Errors: map AI SDK / entitlement failures through `format-coach-error`; Architect-style inline retry for stream failures; keep upgrade CTAs for tier limits.

---

## Admin observability

### Logging

- Extend `LogUsageParams.action` with `coach_live` (retain existing coach/resume actions).
- Chat and Live always log via `logAiUsage` / `logCoachCall`: tokens, cost, latency, `success`, `errorCode`, metadata including `planId`, `sessionId`, `adapter: "chat" | "live"`.
- Keep fire-and-forget insert semantics (never block the response on log failure).

### HQ API

Extend `/api/admin/stats` or add `/api/admin/stats/ai` for the selected window:

1. **By action:** calls, tokens, `SUM(cost_usd)`, success count, failure count  
2. **Errors:** recent rows where `success = false` (action, model, errorCode, latencyMs, createdAt) — **no** raw prompts or PII  
3. Keep existing daily totals and by-model table  

### HQ UI

On Billing (or an AI usage block there):

1. Table/chart: cost & tokens **by feature/action** (human labels: Resume chat, Coach tutor, Coach live, …)  
2. Error strip: failure rate for the window + last N failures  
3. Overview may keep total tokens; optional “AI errors (7d)” is nice-to-have, not required if Billing covers errors  

Replace reliance on the hardcoded “System Healthy” badge for LLM health; do not claim system health from static copy once error data exists (either drive the badge from failure rate or leave it unchanged and put truth on Billing — prefer documenting Billing as source of truth for this slice).

---

## Errors & reliability

| Surface | Behavior |
| --- | --- |
| Chat stream fail / abort | Meter refund / `settleFailure`; inline retry |
| Empty assistant text | Refund like today’s empty-reply path |
| Live mint while kill switch off | 503/403 with clear message; no secret issued |
| Live connect fail | Refund reserve; toast; suggest chat |
| Mid-Live disconnect | End session; reconcile partial usage |
| Tool execute fail (Live) | Safe `function_call_output` error payload so the model can recover |
| Keys | Never leak API keys or raw provider payloads to the client |

---

## Rollout (one PR, ordered commits)

1. Extract shared core (instructions + tools + context/meter hooks) without user-visible behavior change.
2. Chat adapter: `/ai/chat` + `useChat` UI; migrate message shape; deprecate JSON tutor sessions.
3. Live adapter: ephemeral session + server tool relay + Chat|Live toggle; gated by `COACH_LIVE_ENABLED`.
4. Admin: by-action stats + error strip; ensure `coach_live` / chat paths log correctly.
5. Tests + short docs note (`docs/skill-coach.md` or architecture note).

**Env checklist (Vercel):** document `COACH_LIVE_ENABLED` (and existing OpenAI / Sarvam keys). Default Live **off** until the flag is explicitly enabled in an environment.

## Success checks

- Chat: first token streams; tool chips visible; history reload keeps parts; Sarvam STT→send and TTS-on-complete still work; meter/quota still enforce.
- Live (flag on): start session without long-lived key in browser; speak → hear reply; tools update via **server** execute; leave Live cleans up; chat history shows Live transcript turns; flag off hides/rejects Live.
- Admin: Billing shows cost by action including coach tutor/live and resume chat; failed calls appear in the error strip with codes.
- Policy: no invented resource URLs; `setModuleStatus` cannot jump to verified.

## Testing notes

- UI: AI SDK / shadcn mock streams for chat parts rendering.
- Server: agent + route smoke with mocked model where Resume already patterns that.
- Live: unit-test tool schema mapping + kill switch gating; integration against Realtime can be manual/staging behind the flag.

## Follow-ups (explicitly out of this PR)

- Resume page-count / template / skillset metadata and answer-quality guardrails.
- Shared premium chat shell extraction across Resume + Coach.
- Red-team eval harness.
- Optional overview AI-error badge driven by live failure rate.

## Decision log

| Decision | Choice |
| --- | --- |
| First product slice | Skill Coach streaming/parity before Resume quality |
| Chat approach | Mirror Resume Architect 1:1 (`ToolLoopAgent` + `createAgentUIStreamResponse` + `useChat`) |
| Live | GPT Realtime MVP in the **same** implementation; chat + live as adapters on shared core |
| Tool execution (Live) | Server-only relay |
| History | Merge Live into same tutor `coachSession` UIMessages |
| Summary | Never block first token |
| Observability | By-action cost + AI errors on HQ in this same design |
| Live kill switch | `COACH_LIVE_ENABLED` required |

