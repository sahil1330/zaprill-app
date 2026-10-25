# Zaprill Notion UX redesign — design spec

**Date:** 2026-10-25  
**Status:** Approved in chat (foundation, Skill Coach + voice, Intelligence dashboard, mobile + chrome). Awaiting written-spec review before implementation plans.  
**Repo:** sahil1330/zaprill-app (fork; deploys to user's Vercel / `ai-job-god.vercel.app`)  
**Theme base:** Notion warm-paper tokens already on `main` (Refero style `2bf4c61f-de10-4614-ba1b-20c0453bd2a9`). Tokens-first is done; this spec is layout / UX / voice / mobile.

## Goals

- Replace capability-shell UIs (especially Skill Coach card dumps) with a coherent warm-paper product.
- One shared Notion layout system, then **Dashboard + Skill Coach + mobile** implement against it **in parallel**.
- Skill Coach tutor: **Sarvam STT/TTS**; chat replies stay on **gpt-5-mini**; **browser Web Speech API** if Sarvam fails.
- Scope is **full-big-bang** (whole app chrome + these surfaces), not a single-page polish.

## Non-goals (v1)

- Native iOS/Android apps
- Offline-first
- Marketing site redesign
- Soft skills / non-tech coach tracks
- Replacing tutor LLM with Sarvam chat models
- Changing billing/entitlement rules except surfacing clearer errors

## Execution

1. **Foundation PR:** shared Notion layout system (shell, primitives, chat/composer pattern, loaders/empties).
2. **Parallel PRs** against that kit (or stacked on the foundation branch if main is not ready):
   - Intelligence dashboard
   - Skill Coach (+ Sarvam voice wiring)
   - Mobile chrome refinements if not fully covered in foundation
3. Feature owners may land PRs in parallel; App Owner owns shared kit conflicts.
4. Separate track (already in flight): fix tutor `sessions` 500 + slow load — **must not wait** for this redesign; voice/UX do not block chat repair.

---

## 1. Shared Notion layout system

### Principles

- Paper canvas (`#f6f5f4` / token `--background`), white hairline cards, primary `#0075de`, marigold for achievements/wins.
- Card radius ~12px (`rounded-lg`), buttons ~8px (`rounded-md`).
- Satoshi + Inter (already chosen); no purple brand leftovers in chrome or illustrations.
- Sparse chrome: one primary action per view; secondary actions quiet.

### Deliverables

| Piece | Behavior |
| --- | --- |
| App shell | Desktop sidebar; mobile top bar + primary destinations reachable without hunting |
| Page header | Title, short subtitle, one primary CTA slot |
| Card / list / row | Hairline borders, consistent padding, no nested “card inside card” noise |
| Empty / error / loading | Human copy; skeleton on paper; never raw API strings |
| Chat / composer | Text field + mic + send + optional speaker; used by Skill Coach tutor |
| Density | Comfortable for students/freshers; avoid dense admin dashboards |

### Constraints

- Prefer existing shadcn primitives remapped to tokens over new CSS frameworks.
- No one-off color hexes in feature components — use semantic tokens.
- Shared kit owns responsive breakpoints for shell; features own content breakpoints inside the content column.

---

## 2. Skill Coach + voice

### Layout

- **Desktop:** left rail = active program + module checklist with one **Up next** highlight; center = tutor thread; practice/mock are **modes**, not forever-stacked cards under chat.
- **Mobile:** tutor thread is the main screen; program list in a sheet; practice/mock take full viewport.

### Tutor

- Real message bubbles + persisted history (existing `coachSession` messages).
- Composer: text + **mic** + send.
- **STT:** Sarvam → on failure, Web Speech API → on failure, text-only (mic disabled with reason).
- **TTS:** optional play on assistant messages via Sarvam → Web Speech fallback; do not block sending replies on TTS failure.
- **LLM:** unchanged coach path (`gpt-5-mini` / current `COACH_LIMITS.model`); Sarvam does **not** own chat text.
- Errors: map `COACH_DISABLED`, `COACH_LIMIT`, and generic failures to plain copy (never show `Coach request failed` as the only UI).

### Practice & mock

- **Practice:** start → prompt → answer → grade → if pass, verified skill affordance.
- **Mock:** start → questions → submit → score/feedback; full-focus mode.
- Exit returns to tutor/program context without losing thread.

### Meters

- Quiet strip: tutor turns / practice / mocks remaining (and spend if already exposed).
- Not a four-column KPI hero.

### Performance

- One load for plan list + selected plan context + allowance (no waterfall of serial client fetches).
- Skeletons while loading; keep interaction responsive after first paint.

### Env / secrets (implementation note)

- Add `SARVAM_API_KEY` (and any Sarvam base URL the SDK needs) to Vercel for production/preview; document in PR. Do not commit secrets.

---

## 3. Intelligence dashboard

### Hierarchy

1. **Hero:** score + one-line meaning + **one** primary CTA (Resume Builder **or** Skill Coach, chosen from gaps / `coach_enabled`).
2. **Market / gaps:** short role list; missing skills as chips linking into Coach programs when coach is on.
3. **Next steps:** at most **three** ordered actions.
4. **Secondary:** resume snapshot / verified skills as quieter rows.

### Empty

- No analysis yet → clear path (complete profile / run analysis).
- Coach off → gaps still listed; CTA prefers Resume; copy explains Coach is paused if relevant.

### Mobile

- Same IA stacked; sticky primary CTA; no compressed multi-column desktop grid.

---

## 4. Mobile + shared chrome

- Responsive web only (v1).
- Touch targets ≥44px; no hover-only critical actions.
- Nav: desktop sidebar; mobile top bar **and** bottom or sheet nav for Intelligence / Resume / Coach (approved).
- Voice controls stay reachable in coach composer; degrade to text if both speech stacks fail.
- Skeleton loaders; avoid multi-second blank screens.

---

## 5. Architecture notes

```text
[App shell / layout kit]
    ├── Intelligence dashboard (content)
    ├── Skill Coach workspace
    │     ├── Tutor thread + composer
    │     ├── Sarvam STT/TTS client (+ Web Speech fallback)
    │     ├── Practice mode
    │     └── Mock mode
    └── Other protected pages adopt shell over time in same big-bang ship
```

- Voice: browser talks to **app API routes** that hold Sarvam keys (do not expose Sarvam key to the client). Web Speech runs client-side only.
- Tutor text path remains existing `/api/coach/plans/[id]/sessions` (after the bugfix lands).

### Error handling

| Case | UX |
| --- | --- |
| Sarvam down | Auto Web Speech; subtle “using device speech” note |
| Web Speech unsupported / denied | Text-only composer |
| Coach limit | Existing limit copy + upgrade hint |
| Coach disabled | “Coaching is paused” — still show read-only plan context if available |
| Uncaught server error | Friendly retry; log detailed `[coach]` server error |

### Testing (implementation plans will expand)

- Unit: speech fallback selection; error mapping.
- Manual: tutor send, mic round-trip, TTS play, practice/mock flows, dashboard CTA routing, mobile nav at 375px and 768px.

---

## 6. Rollout order

1. Land tutor reliability fix (separate PR) if not already merged.
2. Foundation layout kit PR → review → merge.
3. Parallel: Dashboard PR, Skill Coach+voice PR, residual mobile/shell PR if needed.
4. Vercel: add Sarvam env; redeploy; verify on `ai-job-god.vercel.app` (force clean build if CSS cache repeats).

## 7. Success criteria

- Skill Coach no longer feels like stacked API cards; tutor chat works; voice works with documented fallbacks.
- Dashboard has clear hierarchy and one primary next action.
- Mobile can complete coach tutor + dashboard scan without horizontal chaos.
- Visual language matches warm-paper tokens end-to-end (no purple chrome).

---

## Approvals (chat)

- Voice ownership: Sarvam speech only; gpt-5-mini chat — **approved**
- Speech fallback: Web Speech API — **approved**
- Scope: full-big-bang — **approved**
- Execution: system-then-parallel — **approved**
- Sections: foundation, Skill Coach+voice, dashboard, mobile+chrome — **approved**
