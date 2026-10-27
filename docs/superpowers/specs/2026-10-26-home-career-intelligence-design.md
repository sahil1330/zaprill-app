# Home career-intelligence dense board — design spec

**Date:** 2026-10-26  
**Status:** Approved by Sahil (2026-10-26). Implementation plan: `docs/superpowers/plans/2026-10-26-home-career-intelligence.md`. Do not start implementation until Sahil accepts that plan.  
**Repo:** sahil1330/zaprill-app  
**Approach:** A — dense intelligence board  
**Refero source:** [Notion — warm paper notebook](https://styles.refero.design/style/2bf4c61f-de10-4614-ba1b-20c0453bd2a9)

Sahil rejected the Home that shipped after #21–#23. Tokens moved to Notion warm paper, but Home still renders the old Personal Dashboard: a greeting plus an Analytical Search CTA, three oversized cards (Career Profile, ATS, Salary Intelligence with 0 jobs matched), a Recommended region that sits on “Synthesizing recommendations…”, and a sidebar whose footer reads `Analyze → Jobs → Career Insights`. This spec replaces that Home. It does not restyle Skill Coach.

## Goals

- Home is the career-intelligence dashboard: learned metrics, skill gaps, and the next moves.
- One dense board in a content column no wider than 1100px. Not slim copies of the old cards, and not a marketing editorial page.
- Analyze, My Jobs, and Career Insights stay in the product as quiet links on Home. They are not primary sidebar items.
- Intelligence is Home. `/intelligence` opens Home.
- A signed-out visit to the app root shows sign-in. The app does not keep a second marketing landing.

## Non-goals

- Skill Coach chat, outline, practice, or mock polish. That is a follow-on (see Out of scope).
- Rebuilding the internals of Analyze (`/analyze`), My Jobs (`/jobs`), or Career Insights (`/history`).
- A new intelligence model, a written narrative, or a live public ATS job feed.
- Retuning theme tokens. Light and dark values already on `main` stay.
- Editing the separate marketing site.
- Deleting the 2026-10-25 UX spec.
- The in-app unauthenticated landing. That surface is removed (see Auth / entry routing).

## Related specs

| Spec | Relationship |
| --- | --- |
| `docs/superpowers/specs/2026-10-25-notion-ux-redesign-design.md` | Still on `main`. It covers the shared shell, Skill Coach voice, and an Intelligence hierarchy. **This spec supersedes that document’s Home and Intelligence information architecture:** section 3 (Intelligence dashboard) and the section 4 nav line that lists Intelligence / Resume / Coach as the mobile destinations. It also supersedes the foundation density line “avoid dense admin dashboards” **for Home only**. Skill Coach, Sarvam speech, and the shared warm-paper principles in that spec stay in force. Do not delete that file. |
| `docs/superpowers/specs/2026-10-25-notion-theme-tokens-design.md` | Tokens-first work already approved and applied. This spec uses those tokens at Home density. It does not change `globals.css`. |
| `docs/intelligence-dashboard.md` | Current data contract for `GET /api/intelligence`. Home reads that contract. The “What’s left” items in that doc (live ATS boards, a written narrative) stay out of this ship. |

Where this file and the 2026-10-25 UX spec disagree about Home, nav, or Home density, this file wins.

## Nav & shell

Primary sidebar, in order:

1. Home (`/`)
2. Skill Coach (`/skill-coach`)
3. Resumes (`/resumes`)
4. Account group, unchanged: Profile (`/profile`), Billing (`/billing`), Referrals (`/referrals`)

Remove from the primary list: Intelligence, Analyze, My Jobs, Career Insights.

Remove the sidebar footer sentence `Analyze → Jobs → Career Insights`. Do not replace it with another journey line.

Mobile bottom nav mirrors the same three primaries: Home, Skill Coach, Resumes. Account stays available from the existing sidebar sheet (`SidebarTrigger`) and the header account menu. Do not put Profile, Billing, or Referrals on the bottom bar. Do not put Analyze, My Jobs, or Career Insights on the bottom bar.

`getNavTitle` still returns Analyze, My Jobs, and Career Insights when the member is on `/analyze`, `/jobs`, or `/history`. Those titles live in a route list the sidebar does not render. The header breadcrumb keeps working on those pages.

Pages and URLs that stay:

| Surface | URL | How the member reaches it |
| --- | --- | --- |
| Home (intelligence) | `/` | Primary nav |
| Skill Coach | `/skill-coach` | Primary nav, gap chips, hero CTA |
| Resumes | `/resumes` | Primary nav, hero CTA |
| Analyze | `/analyze` | Home secondary strip, hero CTA when nothing is scored |
| My Jobs | `/jobs` | Home secondary strip |
| Career Insights | `/history` | Home secondary strip |
| Profile, Billing, Referrals | existing URLs | Account group |

## Auth / entry routing

Zaprill already has a marketing site. The app root is not a second one.

Signed out, `/` redirects to the existing sign-in page at `/sign-in`. Do not render the guest branch of `src/app/page.tsx`: the “Find the job you actually deserve.” headline, “Get Started Now”, the grid backdrop, the marketing `Navbar`, or that page’s footer. `/sign-up`, `/forgot-password`, and `/reset-password` stay as they are.

Use a redirect, not a second copy of the sign-in form on `/`, so there is one sign-in URL. `(protected)/layout.tsx` already sends signed-out members to `/sign-in`. Match that destination.

Do not add a cookie-only reverse redirect from `/sign-in` to `/` in `src/proxy.ts`. `src/app/(auth)/layout.tsx` already sends a real session from the auth routes back to `/`. The comment in `src/proxy.ts` explains why a prefetch-cached reverse redirect breaks Sign in. Leave that behavior alone.

Signed in, `/` is Home inside `AppShell`, including a session that has not finished onboarding. That session does not see the marketing hero (today that branch repeats “Find the job you actually deserve.”). With nothing scored yet, Home uses the empty state below. Sign-out already navigates to `/`; after this change that request continues to `/sign-in`.

## Home layout (dense board)

The board sits in one centered column with max-width **1100px**. Do not use the current `max-w-6xl` (1152px) Personal Dashboard width. Shell padding stays 16px on small screens and 24px from the `md` breakpoint (`APP_SHELL_CONTENT_CLASS`). The board does not add a second horizontal pad. Vertical space between regions is 16px, 24px at most.

Order, top to bottom. Every region is present on a loaded Home:

1. **Hero.** Readiness / match score, one line of meaning, and one filled primary button.
2. **Metrics row.** Two or three hairline mini-cards.
3. **Skill-gap chips.**
4. **Next moves.** At most three.
5. **Verified skills.** Quieter than the gaps.
6. **Secondary strip.** Analyze · My Jobs · Career Insights, as quiet text links. Not buttons, not tabs that swap the board out.

On a narrow screen the same six regions stack in that order. The hero button is not copied into a sticky bar. One filled primary per view includes mobile.

### Hero

The score is the career score from `IntelligenceReport.score` (`scoreCareerProfile`: 75% readiness, 25% completeness). When `careerScore` is null, the number reads “Not scored”. The meaning line is one sentence:

- Scored: “75% readiness, 25% completeness.” (the report’s weights, same sentence `IntelligenceInsights` already builds).
- Unscored: “Completeness is {n}. The score appears after an analysis.”

There is no “Personal Dashboard” eyebrow, no “Welcome back” display headline, and no Analytical Search button.

Exactly one filled button. Selection rule, in order:

1. At least one skill gap and `coachEnabled` → **Skill Coach** (`/skill-coach`).
2. Otherwise, if `careerScore` is null or `market.basis` is `"none"` → analysis is missing.
   - If `nextSteps` already includes the resume step whose href is `/onboarding`, the button is **Add your resume** (`/onboarding`).
   - Otherwise the button is **Run analysis** (`/analyze`).
3. Otherwise → **Resume Builder** (`/resumes`).

`selectIntelligencePrimaryCta` today returns only Skill Coach or Resume Builder. Extend it with the analyze / onboarding fallback above. Do not show two filled buttons when both Resume and Analyze could apply.

### Metrics row

Two cards, or three when both a salary band and a job count exist.

| Card | Source | When |
| --- | --- | --- |
| ATS / resume | `lastAtsScore` on the profile Home already loads for the signed-in page | Always. Quiet text link to `/resumes`. |
| Market / salary | Salary band on the primary role in `IntelligenceReport.market` | When a band exists. |
| Jobs matched | Job count on that same market report (the roles’ `jobCount`) | When a salary band is absent, this card replaces salary. When a band is present, this is the third card. |

A zero job count may appear as a mini-card value. It is not a large empty Salary Intelligence widget. Do not fetch `/api/career-insights` for this row; the intelligence report is the market source.

### Skill-gap chips

Chips are the missing skills already collected by `intelligenceGapNames` / `IntelligenceInsights` (name, priority if present). When `coachEnabled` is true, each chip links to `/skill-coach`. When coaching is paused, the chips stay, they do not navigate, and one quiet line says coaching is paused. Gaps are not hidden because the coach flag is off.

### Next moves

Render `report.nextSteps` in order, capped at three (`NEXT_STEP_LIMIT` in `IntelligenceInsights` is already 3). Each row is a text link plus its detail. An empty list is one quiet line: nothing urgent, sync again when the resume or target changes. Do not invent extra moves to fill the list.

### Verified skills

Skills whose career-file evidence includes `kind: "verified"`, labeled with `VERIFIED_SKILL_LABEL` (“Verified on Zaprill”). This is the Skill Coach verification mark already appended in `IntelligenceDashboard`’s skills list. Show only those skills, as a quiet list, not level bars and not the full skills-on-file editor. If none are verified, the region is one line: “No skills verified in Skill Coach yet.”

### Secondary strip

Text links, separated with a middle dot:

- Analyze → `/analyze`
- My Jobs → `/jobs`
- Career Insights → `/history`

They use muted ink. They are not filled, and they are not the hero button. The strip is visible in the empty state too, so those tools are never sidebar-only.

### Editors that move with Intelligence

`IntelligenceDashboard` is the only UI for the segment picker (`#path`) and expected pay (`#pay`). Profile does not edit them. They are not part of the six regions above. Place those two existing sections under the secondary strip, quiet, so the next-step links still land. Do not move academics, experience, target-role management, or the full skill-level list onto Home.

## Data / empty / loading

Home reads, in this order, matching `IntelligenceDashboard.load`:

1. `GET /api/career-profile` — file, verified-skill evidence, and the profile used for pay/path editors.
2. `GET /api/intelligence` — `IntelligenceReport` (score, market, gaps, next steps, `coachEnabled`).

ATS uses the profile object `src/app/page.tsx` already fetches (`lastAtsScore`). No new table, no model call, and no `logAiUsage` on these reads (`docs/intelligence-dashboard.md`).

**Empty.** No analysis (`market.basis === "none"` or a null career score): the hero shows “Not scored”, the meaning line, and the single fallback button (onboarding or Run analysis). Mini-cards show an unscored ATS and no salary band rather than a giant zero-state illustration. Gap copy states that gaps appear after an analysis has jobs. The secondary strip stays. There is no “Activate Job Match Engine” panel and no “No matches detected” marketing block.

**Loading.** Skeletons in the same six-region order: hero (score line, meaning line, button), two mini-cards, a chip row, three move rows, a verified line, a strip. `DashboardSkeleton` matches the old Personal Dashboard and is not the Home loading state. Never a lone dashed panel that says “Synthesizing recommendations…”.

**Error.** Reuse `PageError` patterns: the career file failure blocks the board; an intelligence-report failure keeps the file editors reachable and shows a retry where the report regions sit. Do not show raw API strings.

**Coach off.** Gaps remain. The hero button follows rule 2 or 3. Chip links are off. The paused sentence is the one already used in `IntelligenceInsights`.

## Visual density rules

Apply the tokens already on `main`. Do not add one-off hexes in feature components.

| Rule | Value |
| --- | --- |
| Canvas | `#f6f5f4` (`--background`, paper) |
| Content cards | `#ffffff` (`--card`) |
| Card border | 1px hairline `rgba(0,0,0,0.08)` |
| Card shadow | None on Home content cards |
| Radius | Cards ~12px (`rounded-lg`), buttons ~8px (`rounded-md`), pills full (`rounded-full`) |
| Primary | One filled control per view, `#0075de` (`--primary`) |
| Accents | Status and wins only (existing score and achievement tokens). No second brand color, no gradient fill on the hero button |
| Gutters | 16px, up to 24px between regions |
| Type | Hierarchy by ink alpha (`foreground` / `muted-foreground`), not by a display headline. Score is the only large number (about 40–48px, tabular). Section labels are 13–14px muted. Mini-card values are 20–24px |

Dark mode uses the existing `.dark` tokens with the same hairline, no-shadow rule. Do not invent a second accent system.

Rejected for this surface:

- Slimmer versions of the Career Profile / ATS / Salary Intelligence cards.
- A marketing editorial Home (oversized headline, eyebrow, gradient CTA).
- Drop shadows, `shadow-xl` buttons, uppercase tracking-widest card titles, and `rounded-2xl` / `rounded-3xl` marketing cards.

## Architecture notes

```text
src/app/page.tsx
  signed out  → redirect /sign-in
  signed in   → AppShell
                 └── Home board (extended IntelligenceInsights)
                       ├── hero + selectIntelligencePrimaryCta
                       ├── metrics (ATS + market report)
                       ├── gap chips
                       ├── next steps (≤3)
                       ├── verified skills (career profile evidence)
                       ├── secondary strip
                       └── #path and #pay editors, below the strip

/intelligence  → redirect to /  (hash #pay and #path preserved)
```

**Reuse.** Extend `IntelligenceInsights` (`src/components/intelligence/intelligence-insights.tsx`) and `selectIntelligencePrimaryCta` (`src/components/intelligence/primary-cta.ts`). Keep `GET /api/intelligence`, `IntelligenceReport` (`src/types/intelligence.ts`), `scoreCareerProfile`, `buildMarketReport`, and `recommendNextSteps`. Home should not mount `IntelligenceDashboard` as the page: that component is the career-file screen (segment, targets, pay, every skill, academics, experience) with insights embedded. The board takes the insights, the verified subset, and only the `#path` and `#pay` sections.

**Retire on Home.** `UserDashboard` (`src/components/dashboard/UserDashboard.tsx`) is the rejected Personal Dashboard (greeting, Analytical Search, three large cards, Recommended jobs, the synthesizing void). The signed-in branch of `src/app/page.tsx` stops rendering it. Delete the component in the implementation change if nothing else imports it. `src/app/page.tsx` is the only importer today.

**Redirect.** Replace `src/app/(protected)/intelligence/page.tsx` with a redirect to `/`. The fragment is not sent to the server, so a server `redirect("/#pay")` cannot see the hash the member used. Use a client redirect on that route that reads `window.location.hash` and replaces to `/${hash}` when the hash is `#pay` or `#path`, and to `/` otherwise. Update the next-step hrefs only if those hashes move; if the editors render on `/`, `/intelligence#pay` and `/intelligence#path` keep working through that redirect and `recommendNextSteps` can stay on `/intelligence#pay` and `/intelligence#path`.

**Nav data.** In `src/lib/app-nav.ts`, `APP_NAV_PRIMARY` becomes Home, Skill Coach, Resumes, each with `mobilePrimary: true`. `APP_NAV_SECONDARY` stays Profile, Billing, Referrals. Add a non-rendered list for Analyze (`/analyze`), My Jobs (`/jobs`), and Career Insights (`/history`) that `getNavTitle` and the Home strip both use. `UserSidebar` stops rendering the footer paragraph. `MobileBottomNav` already filters `mobilePrimary` and needs no new structure. `src/lib/app-nav.test.ts` currently expects `/intelligence` on the mobile bar; update that test to expect `/`, `/skill-coach`, and `/resumes` only.

**CTA tests.** `src/components/intelligence/intelligence-insights.test.tsx` covers the coach button and the three-move cap. Extend it for the analyze and onboarding fallbacks. Do not raise the move cap above three.

**Shell width.** Home’s column class replaces `max-w-6xl` with `max-w-[1100px]`.

## Success criteria

- Signed out, `/` shows the existing sign-in page. The strings “Find the job you actually deserve.” and “Get Started Now” are gone from the app root.
- Signed in, Home shows the six regions in order, in a column no wider than 1100px, including a session that has not finished onboarding.
- The hero has one filled button, chosen by the rule in this spec.
- The board shows a score and a one-line meaning, gap chips, at most three next moves, an ATS/resume mini-card, a salary band or a jobs-matched count (both when both exist), and verified skills.
- Primary sidebar is Home, Skill Coach, Resumes, then Account (Profile, Billing, Referrals). Mobile bottom nav is those three primaries.
- Analyze, My Jobs, and Career Insights are absent from the sidebar and the bottom nav, and present on the Home strip. Their pages still show the right header title.
- The sidebar has no `Analyze → Jobs → Career Insights` footer.
- `/intelligence` opens Home. `#pay` and `#path` still reach the pay and path editors.
- Loading Home shows skeletons in the board’s order. It never shows a lone “Synthesizing recommendations…” panel.
- Home content cards are white, hairline-bordered, and shadowless. The view has one filled `#0075de` control.
- Skill Coach’s chat and outline are unchanged.

## Out of scope

Skill Coach visual polish (tutor thread, module outline, composer, practice, and mock layout) is a follow-on spec. This ship may link to `/skill-coach`. It does not restyle that route.

Also out of this ship: marketing-site edits, Analyze / My Jobs / Career Insights page redesigns, new market data sources, and a written intelligence narrative.
