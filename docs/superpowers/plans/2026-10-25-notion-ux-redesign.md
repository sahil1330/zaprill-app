# Notion UX redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a full warm-paper UX pass — shared layout kit on the existing app shell, then parallel Intelligence dashboard + Skill Coach (Sarvam STT/TTS + Web Speech fallback) + mobile chrome — matching `docs/superpowers/specs/2026-10-25-notion-ux-redesign-design.md`.

**Architecture:** Extend `AppShell` / `UserSidebar` / `MobileBottomNav` / tokens already on `main`. Add shared page primitives + a coach voice client (server Sarvam routes; client Web Speech fallback). Rebuild `CoachDashboard` into a thread-first workspace. Re-hierarchy `IntelligenceDashboard`. Do not replace tutor LLM (keep `gpt-5-mini`).

**Tech Stack:** Next.js App Router, React, shadcn/ui, Tailwind v4 CSS variables, AI SDK OpenAI for tutor text, Sarvam REST for STT/TTS, Web Speech API fallback, Vitest for unit tests, existing Biome CI.

## Global Constraints

- Spec path: `docs/superpowers/specs/2026-10-25-notion-ux-redesign-design.md` (PR #18 if not merged yet — merge or include).
- Tokens already on main: paper background, primary Notion blue `#0075de` / oklch 254.3, card ~12px, button ~8px; no purple chrome.
- Tutor chat model stays `COACH_LIMITS.model` (`gpt-5-mini`); Sarvam owns speech only.
- Speech fallback order: Sarvam → Web Speech → text-only.
- Never expose `SARVAM_API_KEY` to the client; call via app API routes.
- Never show raw `Coach request failed` as the only user-facing string.
- PRs as sahil1330 on `sahil1330/zaprill-app`; do not merge without Sahil.
- Tutor `sessions` reliability fix may land as a separate PR first — rebase UX work on it; do not block UX on voice if chat is still broken (chat fix is prerequisite for voice E2E).
- Minimize drive-by refactors outside shell, coach, intelligence, nav.

## File map

| Path | Responsibility |
| --- | --- |
| `src/components/app/app-shell.tsx` | Existing shell — keep; ensure paper padding |
| `src/components/app/mobile-bottom-nav.tsx` | Mobile primary destinations |
| `src/components/app/user-sidebar.tsx` | Desktop nav |
| `src/lib/app-nav.ts` | Nav items + `mobilePrimary` flags |
| `src/components/app/page-header.tsx` | **Create** — title, subtitle, primary CTA slot |
| `src/components/app/page-state.tsx` | **Create** — empty / error / skeleton helpers |
| `src/components/coach/voice/*` | **Create** — speech client + mic/speaker UI |
| `src/app/api/coach/speech/stt/route.ts` | **Create** — Sarvam STT proxy |
| `src/app/api/coach/speech/tts/route.ts` | **Create** — Sarvam TTS proxy |
| `src/lib/speech/sarvam.ts` | **Create** — server Sarvam helpers |
| `src/lib/speech/fallback.ts` | **Create** — Web Speech detection helpers (client-safe) |
| `src/components/coach/coach-dashboard.tsx` | Rebuild layout + thread UX |
| `src/components/coach/tutor-thread.tsx` | **Create** — bubbles + history |
| `src/components/coach/tutor-composer.tsx` | **Create** — text + mic + send |
| `src/components/intelligence/intelligence-dashboard.tsx` | Re-hierarchy hero / gaps / next steps |
| `src/services/coach/tutor.service.ts` | Only if needed for clearer errors (prefer bugfix PR) |

---

### Task 1: Nav — Intelligence + Skill Coach as mobile primaries

**Files:**
- Modify: `src/lib/app-nav.ts`
- Test: `src/lib/app-nav.test.ts` (create if missing)

**Interfaces:**
- Consumes: existing `AppNavItem`, `APP_NAV_PRIMARY`
- Produces: `mobilePrimary: true` on Intelligence (`/intelligence`), Skill Coach (`/skill-coach`), Resumes (`/resumes`); keep at most 5 bottom items — drop or demote lower-priority current primaries (Analyze / My Jobs / Career Insights) so bottom bar is Home + Intelligence + Resumes + Skill Coach (and at most one more if needed)

- [ ] **Step 1: Write failing test for mobile primary set**

```ts
import { describe, expect, it } from "vitest";
import { APP_NAV_PRIMARY } from "@/lib/app-nav";

describe("APP_NAV_PRIMARY mobile destinations", () => {
  it("marks Intelligence, Skill Coach, and Resumes as mobile primary", () => {
    const urls = APP_NAV_PRIMARY.filter((i) => i.mobilePrimary).map((i) => i.url);
    expect(urls).toContain("/intelligence");
    expect(urls).toContain("/skill-coach");
    expect(urls).toContain("/resumes");
    expect(urls.length).toBeLessThanOrEqual(5);
  });
});
```

- [ ] **Step 2: Run test — expect fail**

Run: `pnpm exec vitest run src/lib/app-nav.test.ts`
Expected: FAIL (Intelligence / Skill Coach not in mobilePrimary today)

- [ ] **Step 3: Update `APP_NAV_PRIMARY` flags**

Set `mobilePrimary: true` on Intelligence, Skill Coach, Resumes, Home. Set `mobilePrimary: false` (or omit) on Analyze, My Jobs, Career Insights so the bar stays ≤5 and matches the spec’s primary destinations.

- [ ] **Step 4: Re-run test — expect pass**

Run: `pnpm exec vitest run src/lib/app-nav.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/app-nav.ts src/lib/app-nav.test.ts
git commit -m "feat(nav): prioritize Intelligence, Coach, Resumes on mobile"
```

---

### Task 2: Page header + empty/error/skeleton primitives

**Files:**
- Create: `src/components/app/page-header.tsx`
- Create: `src/components/app/page-state.tsx`
- Test: `src/components/app/page-header.test.tsx`

**Interfaces:**
- Consumes: `Button` from `@/components/ui/button`
- Produces:
  - `PageHeader({ title, description?, action? }: { title: string; description?: string; action?: React.ReactNode })`
  - `PageEmpty({ title, description, action? })`
  - `PageError({ message, onRetry? })`
  - `PageSkeleton({ rows?: number })`

- [ ] **Step 1: Failing render test for PageHeader**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "@/components/app/page-header";

describe("PageHeader", () => {
  it("renders title and optional description", () => {
    render(<PageHeader title="Skill Coach" description="Practice the gaps." />);
    expect(screen.getByRole("heading", { name: "Skill Coach" })).toBeTruthy();
    expect(screen.getByText("Practice the gaps.")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test — expect fail (module missing)**

Run: `pnpm exec vitest run src/components/app/page-header.test.tsx`

- [ ] **Step 3: Implement primitives**

`page-header.tsx`: paper-friendly header with `h1`, muted description, action slot right-aligned on `sm+`, stacked on mobile.  
`page-state.tsx`: Empty = muted card with title/description/action; Error = destructive-soft banner + optional Retry button; Skeleton = `Skeleton` rows inside a hairline card.

- [ ] **Step 4: Tests pass**

Run: `pnpm exec vitest run src/components/app/page-header.test.tsx`

- [ ] **Step 5: Commit**

```bash
git add src/components/app/page-header.tsx src/components/app/page-state.tsx src/components/app/page-header.test.tsx
git commit -m "feat(app): add PageHeader and page empty/error/skeleton states"
```

---

### Task 3: Speech fallback helpers (client-safe)

**Files:**
- Create: `src/lib/speech/fallback.ts`
- Test: `src/lib/speech/fallback.test.ts`

**Interfaces:**
- Produces:
  - `type SpeechMode = "sarvam" | "web-speech" | "text-only"`
  - `function pickSpeechMode(input: { sarvamOk: boolean; webSpeechAvailable: boolean }): SpeechMode`
  - `function isWebSpeechAvailable(g: { webkitSpeechRecognition?: unknown; SpeechRecognition?: unknown; speechSynthesis?: { speak: unknown } }): boolean`

- [ ] **Step 1: Failing tests**

```ts
import { describe, expect, it } from "vitest";
import { isWebSpeechAvailable, pickSpeechMode } from "@/lib/speech/fallback";

describe("pickSpeechMode", () => {
  it("prefers Sarvam when healthy", () => {
    expect(pickSpeechMode({ sarvamOk: true, webSpeechAvailable: true })).toBe("sarvam");
  });
  it("falls back to Web Speech", () => {
    expect(pickSpeechMode({ sarvamOk: false, webSpeechAvailable: true })).toBe("web-speech");
  });
  it("falls back to text-only", () => {
    expect(pickSpeechMode({ sarvamOk: false, webSpeechAvailable: false })).toBe("text-only");
  });
});

describe("isWebSpeechAvailable", () => {
  it("requires recognition + synthesis", () => {
    expect(isWebSpeechAvailable({})).toBe(false);
    expect(
      isWebSpeechAvailable({
        SpeechRecognition: class {},
        speechSynthesis: { speak: () => undefined },
      }),
    ).toBe(true);
  });
});
```

- [ ] **Step 2–4: Implement until green; commit**

```bash
git commit -m "feat(speech): add Sarvam → Web Speech → text-only mode picker"
```

---

### Task 4: Sarvam server helpers + STT/TTS API routes

**Files:**
- Create: `src/lib/speech/sarvam.ts`
- Create: `src/app/api/coach/speech/stt/route.ts`
- Create: `src/app/api/coach/speech/tts/route.ts`
- Test: `src/lib/speech/sarvam.test.ts` (mock `fetch`)

**Interfaces:**
- Consumes: `process.env.SARVAM_API_KEY`, `requireApiUserId`
- Produces:
  - `transcribeWithSarvam(audio: Blob | ArrayBuffer, opts?: { languageCode?: string }): Promise<{ text: string }>`
  - `synthesizeWithSarvam(text: string, opts?: { languageCode?: string }): Promise<{ audioBase64: string; mimeType: string }>`
  - `POST /api/coach/speech/stt` multipart/form-data field `audio` → `{ text }` or typed error
  - `POST /api/coach/speech/tts` JSON `{ text }` → `{ audioBase64, mimeType }` or typed error
- On missing key or Sarvam HTTP failure: return `503` JSON `{ error: "SPEECH_UNAVAILABLE" }` (not generic 500)

- [ ] **Step 1: Unit-test sarvam helper maps missing key to a thrown error with code `SPEECH_UNAVAILABLE`**

- [ ] **Step 2: Implement `sarvam.ts` using Sarvam’s current STT/TTS HTTP APIs (verify against Sarvam docs at implement time; do not hardcode outdated URLs without checking).**

- [ ] **Step 3: Wire authenticated routes; reject > ~4MB audio; trim TTS text to 2000 chars.**

- [ ] **Step 4: Document in PR body: add `SARVAM_API_KEY` to Vercel production + preview.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(speech): add Sarvam STT/TTS API routes"
```

---

### Task 5: Tutor composer + thread UI (no voice wiring yet)

**Files:**
- Create: `src/components/coach/tutor-thread.tsx`
- Create: `src/components/coach/tutor-composer.tsx`
- Modify: `src/components/coach/coach-dashboard.tsx` (start wiring)

**Interfaces:**
- `TutorThread({ messages: { role: "user" | "assistant"; content: string }[] })`
- `TutorComposer({ value, onChange, onSend, busy, disabledReason? })` — text + Send; mic/speaker slots optional via props later

- [ ] **Step 1: Extract message list + composer from the card dump into these components; user bubbles vs assistant bubbles; `whitespace-pre-wrap`.**

- [ ] **Step 2: Map API errors through a small `formatCoachError(body)` helper so UI never displays bare `Coach request failed` (use “Something went wrong. Try again.” + retain server log detail).**

- [ ] **Step 3: Manual check: send still hits `/api/coach/plans/:id/sessions`.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(coach): add tutor thread and composer components"
```

---

### Task 6: Wire mic/speaker into composer

**Files:**
- Create: `src/components/coach/voice/use-coach-speech.ts`
- Modify: `src/components/coach/tutor-composer.tsx`

**Interfaces:**
- `useCoachSpeech()` → `{ mode, listening, startListen, stopListen, speak(text), stopSpeak, notice }`
- Mic fills composer text via STT; speaker reads last assistant message

- [ ] **Step 1: Hook tries Sarvam routes first; on `SPEECH_UNAVAILABLE` or network error, set mode to web-speech if available else text-only.**

- [ ] **Step 2: Web Speech: `SpeechRecognition` / `webkitSpeechRecognition` for STT; `speechSynthesis.speak` for TTS.

- [ ] **Step 3: Subtle notice when mode is `web-speech` (“Using device speech”); disable mic with tooltip when `text-only`.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(coach): Sarvam STT/TTS with Web Speech fallback"
```

---

### Task 7: Rebuild Skill Coach workspace layout

**Files:**
- Modify: `src/components/coach/coach-dashboard.tsx`
- Optional create: `src/components/coach/program-rail.tsx`, `src/components/coach/practice-panel.tsx`, `src/components/coach/mock-panel.tsx`

**Behavior:**
- Desktop: `lg:grid` with program rail (~280px) + main column (thread default).
- Modes: `tutor` | `practice` | `mock` — only one main panel.
- Quiet allowance strip under header.
- Use `PageHeader` / `PageSkeleton` / `PageError`.
- Single initial fetch for programs+allowance (parallel `Promise.all` if multiple endpoints; avoid serial waterfalls).
- Mobile: rail in `Sheet`; thread full width.

- [ ] **Step 1: Implement layout + mode switching without changing API contracts.**

- [ ] **Step 2: Smoke on `/skill-coach` at 375px and desktop width.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(coach): thread-first Skill Coach workspace layout"
```

---

### Task 8: Intelligence dashboard hierarchy

**Files:**
- Modify: `src/components/intelligence/intelligence-dashboard.tsx`
- Modify tests under `src/components/intelligence/*` if assertions break

**Behavior:**
- Hero: score + one-line meaning + one primary CTA (Coach if `coachEnabled` and gaps exist, else Resume).
- Gaps as chips linking to `/skill-coach` when enabled.
- Next steps ≤ 3.
- Secondary blocks quieter.
- Use `PageHeader` / empty states; sticky primary CTA on mobile.

- [ ] **Step 1: Restructure JSX to match hierarchy; keep data hooks.**

- [ ] **Step 2: Update/extend unit tests for CTA selection.**

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(intelligence): warm-paper dashboard hierarchy"
```

---

### Task 9: Shell polish + touch targets

**Files:**
- Modify: `src/components/app/app-shell.tsx`, `mobile-bottom-nav.tsx`, `user-sidebar.tsx` as needed
- Existing e2e: `e2e/ux-audit/03-mobile-navigation.spec.ts` — update selectors if labels change

**Behavior:**
- Bottom nav items ≥44px hit area; labels readable.
- Content column comfortable padding on paper.
- No hover-only critical actions on coach/intelligence.

- [ ] **Step 1: Adjust classes; run or update mobile nav e2e if CI includes it.**

- [ ] **Step 2: Commit**

```bash
git commit -m "fix(app): mobile nav hit targets and paper shell padding"
```

---

### Task 10: Integration checklist + PR split

**Files:** docs only in PR bodies

Recommended PR split (system-then-parallel):

1. **Foundation:** Tasks 1–2 (+ 9 if small) — `feat(app): Notion layout primitives + mobile nav priorities`
2. **Coach+voice:** Tasks 3–7 — `feat(coach): workspace + Sarvam speech`
3. **Dashboard:** Task 8 — `feat(intelligence): dashboard hierarchy`

- [ ] **Step 1: Open three PRs (or foundation first, then two parallel) against `main`.**

- [ ] **Step 2: Vercel: set `SARVAM_API_KEY`; after merge, verify `/skill-coach` tutor + mic + dashboard CTA on production; force clean redeploy if CSS cache issues recur.**

- [ ] **Step 3: Report PR URLs + any env action Sahil must take.**

---

## Spec coverage check

| Spec section | Tasks |
| --- | --- |
| Shared layout system | 1, 2, 9 |
| Skill Coach + voice | 3–7 |
| Intelligence dashboard | 8 |
| Mobile + chrome | 1, 7, 9 |
| Sarvam env / no client key | 4 |
| Error copy | 5 |
| Parallel execution | 10 |

## Out of plan

- Marketing site, native apps, Sarvam as chat LLM, billing rule changes, tutor 500 root-cause (separate agent/PR).
