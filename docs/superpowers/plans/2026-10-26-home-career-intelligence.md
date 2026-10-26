# Home career-intelligence dense board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Personal Dashboard Home with the approved career-intelligence dense board, shrink primary nav to Home / Skill Coach / Resumes, and send signed-out `/` to `/sign-in`.

**Architecture:** Keep `GET /api/intelligence` and `GET /api/career-profile`. Extend `selectIntelligencePrimaryCta` and `IntelligenceInsights` into the six-region board. Extract the existing `#path` and `#pay` editors onto that board. `src/app/page.tsx` renders the board for every signed-in session and redirects guests to `/sign-in`. `/intelligence` client-redirects to `/`, preserving `#pay` and `#path`. Do not mount `IntelligenceDashboard` or `UserDashboard` on Home.

**Tech Stack:** Next.js 16 App Router, React 19, shadcn/ui (`Button`, `Input`, `PageError`, `Skeleton`), Tailwind v4 semantic tokens, `node:test` + `tsx --test` (`pnpm test:unit`), Biome.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-10-26-home-career-intelligence-design.md` (approved). Where it disagrees with `docs/superpowers/specs/2026-10-25-notion-ux-redesign-design.md` about Home, nav, or Home density, the 2026-10-26 spec wins. Do not delete the 2026-10-25 spec.
- Unit tests use **node:test + `tsx --test` / `pnpm test:unit`** — NEVER Vitest (`describe`/`it` from `node:test`, not vitest). `pnpm test:unit` runs an explicit file list in `package.json`. Every new test file must be appended to that script in the same commit that adds the file.
- PRs as sahil1330 on `sahil1330/zaprill-app`. Do not merge without Sahil.
- Prefer existing shadcn + tokens. No one-off hexes in feature components. Do not edit `src/app/globals.css`.
- Do not polish Skill Coach. Do not edit `src/components/coach/**`, `src/app/**/skill-coach/**`, `src/app/api/coach/**`, `src/lib/speech/**`, or `src/services/coach/**`. Linking to `/skill-coach` is in scope.
- Minimize drive-by refactors. Do not redesign Analyze (`/analyze`), My Jobs (`/jobs`), Career Insights (`/history`), Profile, Billing, Referrals, the marketing site, or the auth form pages.
- Do not edit `src/proxy.ts` or `src/app/(auth)/layout.tsx`. Do not add a cookie-only redirect from `/sign-in` to `/`.
- Do not call a model from Home and do not call `logAiUsage` for these reads. Do not fetch `/api/career-insights` for the metrics row.
- Home content regions use plain elements with `rounded-lg border border-border bg-card shadow-none`. Do not use `<Card>` for those regions: `src/components/ui/card.tsx` applies `shadow-md`.
- One filled control per Home view: the hero `Button` default variant only. No `variant="gradient"`, no sticky second CTA, no drop shadow on that button.
- Column max width is `max-w-[1100px]`. Do not use `max-w-6xl`. Do not add horizontal padding on the board; `APP_SHELL_CONTENT_CLASS` already pads 16px / 24px.
- `recommendNextSteps` hrefs stay `/intelligence#pay` and `/intelligence#path`. Do not edit `src/lib/career/next-steps.ts` or its test.
- Sign-out in `src/components/app/app-header.tsx` keeps `router.push("/")`. Guest `/` then continues to `/sign-in`. Do not edit the header.

---

## File map

| Path | Responsibility |
| --- | --- |
| `src/lib/app-nav.ts` | Primary nav shrinks. New `APP_NAV_LINKED` for Analyze, My Jobs, Career Insights. `getNavTitle` reads it. Sidebar does not. |
| `src/lib/app-nav.test.ts` | Mobile primaries, order, linked titles, `getNavTitle`. |
| `src/components/app/user-sidebar.tsx` | Renders primary + account only. Delete the journey footer. |
| `src/components/app/app-chrome.test.ts` | Assert the footer string is gone and the sidebar does not render `APP_NAV_LINKED`. |
| `src/components/intelligence/primary-cta.ts` | Coach, else analyze/onboarding, else Resume Builder. |
| `src/components/intelligence/home-metrics.ts` | **Create.** Primary-role salary, summed job count, verified skill names. |
| `src/components/intelligence/home-metrics.test.ts` | **Create.** |
| `src/components/intelligence/intelligence-insights.tsx` | Six-region board. New props `atsScore`, `verifiedSkills`. No sticky CTA. No market essay. |
| `src/components/intelligence/intelligence-insights.test.tsx` | CTA, metrics, gaps, cap of 3, verified, strip, density, no sticky bar. |
| `src/components/intelligence/career-file-editors.tsx` | **Create.** Move `#path` and `#pay` out of the dashboard. |
| `src/components/intelligence/career-file-editors.test.tsx` | **Create.** Anchors render. Academics and target roles do not. |
| `src/components/intelligence/intelligence-dashboard.tsx` | Swap in `CareerFileEditors`. Leave academics, experience, targets, and the full skill list here. This file is no longer routed. |
| `src/components/intelligence/home-board.tsx` | **Create.** `HomeBoardSkeleton`, `HomeBoardView`, `HomeBoard` (profile then report). |
| `src/components/intelligence/home-board.test.tsx` | **Create.** Skeleton order, profile error, report error keeps editors. |
| `src/lib/home-entry.ts` | **Create.** `resolveHomeEntry`. |
| `src/lib/home-entry.test.ts` | **Create.** Guest, loading, incomplete onboarding. |
| `src/app/page.tsx` | Guest redirect. Signed-in Home, including incomplete onboarding. Delete marketing branches. |
| `src/components/dashboard/UserDashboard.tsx` | **Delete.** |
| `src/components/loading/PageLoaders.tsx` | Delete unused `DashboardSkeleton` only. Keep `AnalyzeSkeleton`. |
| `src/components/intelligence/intelligence-redirect.tsx` | **Create.** Hash-preserving client redirect. |
| `src/components/intelligence/intelligence-redirect.test.ts` | **Create.** |
| `src/app/(protected)/intelligence/page.tsx` | Render the redirect. |
| `docs/intelligence-dashboard.md` | One paragraph: UI lives on Home; API unchanged. |
| `package.json` | Append new test paths to `test:unit`. |

---

### Task 1: Nav lists and header titles

**Files:**
- Modify: `src/lib/app-nav.ts`
- Modify: `src/lib/app-nav.test.ts`
- Test: `src/lib/app-nav.test.ts`

**Interfaces:**
- Consumes: existing `AppNavItem`
- Produces: `APP_NAV_PRIMARY` (Home, Skill Coach, Resumes, all `mobilePrimary: true`), unchanged `APP_NAV_SECONDARY`, new `APP_NAV_LINKED` (Analyze `/analyze`, My Jobs `/jobs`, Career Insights `/history`). `getNavTitle` matches primary, secondary, and linked. `ALL_APP_NAV` stays primary + secondary only, so the sidebar cannot see linked items.

- [ ] **Step 1: Replace the mobile-primary test**

Replace the body of `src/lib/app-nav.test.ts` with:

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  APP_NAV_LINKED,
  APP_NAV_PRIMARY,
  APP_NAV_SECONDARY,
  getNavTitle,
} from "@/lib/app-nav";

describe("APP_NAV_PRIMARY", () => {
  it("is Home, Skill Coach, and Resumes, all mobile primary", () => {
    assert.deepEqual(
      APP_NAV_PRIMARY.map((item) => item.title),
      ["Home", "Skill Coach", "Resumes"],
    );
    assert.deepEqual(
      APP_NAV_PRIMARY.map((item) => item.url),
      ["/", "/skill-coach", "/resumes"],
    );
    assert.deepEqual(
      APP_NAV_PRIMARY.map((item) => item.mobilePrimary),
      [true, true, true],
    );
  });

  it("does not list Intelligence, Analyze, My Jobs, or Career Insights", () => {
    const urls = APP_NAV_PRIMARY.map((item) => item.url);
    for (const url of ["/intelligence", "/analyze", "/jobs", "/history"]) {
      assert.equal(urls.includes(url), false);
    }
  });
});

describe("APP_NAV_SECONDARY", () => {
  it("stays Profile, Billing, Referrals", () => {
    assert.deepEqual(
      APP_NAV_SECONDARY.map((item) => [item.title, item.url]),
      [
        ["Profile", "/profile"],
        ["Billing", "/billing"],
        ["Referrals", "/referrals"],
      ],
    );
  });
});

describe("APP_NAV_LINKED", () => {
  it("is the Home strip, not a sidebar list", () => {
    assert.deepEqual(
      APP_NAV_LINKED.map((item) => [item.title, item.url]),
      [
        ["Analyze", "/analyze"],
        ["My Jobs", "/jobs"],
        ["Career Insights", "/history"],
      ],
    );
  });
});

describe("getNavTitle", () => {
  it("names linked routes and account routes", () => {
    assert.equal(getNavTitle("/"), "Home");
    assert.equal(getNavTitle("/analyze"), "Analyze");
    assert.equal(getNavTitle("/jobs"), "My Jobs");
    assert.equal(getNavTitle("/history"), "Career Insights");
    assert.equal(getNavTitle("/profile"), "Profile");
    assert.equal(getNavTitle("/billing"), "Billing");
    assert.equal(getNavTitle("/skill-coach"), "Skill Coach");
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm exec tsx --test src/lib/app-nav.test.ts`

Expected: FAIL. `APP_NAV_LINKED` is not exported, and `APP_NAV_PRIMARY` still includes `/intelligence`.

- [ ] **Step 3: Update `src/lib/app-nav.ts`**

Set `APP_NAV_PRIMARY` to these three objects, in order, each with `mobilePrimary: true`:

```ts
export const APP_NAV_PRIMARY: AppNavItem[] = [
  { title: "Home", url: "/", icon: Home, mobilePrimary: true },
  {
    title: "Skill Coach",
    url: "/skill-coach",
    icon: GraduationCap,
    mobilePrimary: true,
  },
  { title: "Resumes", url: "/resumes", icon: FileText, mobilePrimary: true },
];
```

Add this export after `APP_NAV_SECONDARY`. Keep `APP_NAV_SECONDARY` as Profile, Billing, Referrals. Keep `ALL_APP_NAV` as primary + secondary only.

```ts
export const APP_NAV_LINKED: AppNavItem[] = [
  { title: "Analyze", url: "/analyze", icon: Target },
  { title: "My Jobs", url: "/jobs", icon: Briefcase },
  { title: "Career Insights", url: "/history", icon: TrendingUp },
];
```

Change `getNavTitle` to search the linked list too:

```ts
export function getNavTitle(pathname: string): string {
  if (pathname === "/") return "Home";
  const match = [...ALL_APP_NAV, ...APP_NAV_LINKED].find(
    (item) =>
      pathname === item.url ||
      (item.url !== "/" && pathname.startsWith(item.url)),
  );
  return match?.title ?? "Zaprill";
}
```

Remove unused icon imports if Biome reports them. `Radar` leaves with Intelligence. Keep `Target`, `Briefcase`, and `TrendingUp` for `APP_NAV_LINKED`.

- [ ] **Step 4: Re-run the test**

Run: `pnpm exec tsx --test src/lib/app-nav.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/app-nav.ts src/lib/app-nav.test.ts
git commit -m "feat(nav): keep Home, Skill Coach, and Resumes in the primary list"
```

---

### Task 2: Remove the sidebar journey footer

**Files:**
- Modify: `src/components/app/user-sidebar.tsx`
- Modify: `src/components/app/app-chrome.test.ts`
- Test: `src/components/app/app-chrome.test.ts`

**Interfaces:**
- Consumes: `APP_NAV_PRIMARY` and `APP_NAV_SECONDARY` only
- Produces: no footer sentence. `MobileBottomNav` stays as it is; it already filters `mobilePrimary`.

- [ ] **Step 1: Add the failing assertions**

Append to `src/components/app/app-chrome.test.ts`:

```ts
import { readFileSync } from "node:fs";

test("the sidebar has no journey footer and does not render linked routes", () => {
  const source = readFileSync(
    new URL("./user-sidebar.tsx", import.meta.url),
    "utf8",
  );
  assert.equal(source.includes("Analyze → Jobs → Career Insights"), false);
  assert.equal(source.includes("APP_NAV_LINKED"), false);
  assert.match(source, /APP_NAV_PRIMARY/);
  assert.match(source, /APP_NAV_SECONDARY/);
});
```

`user-sidebar.tsx` cannot render under `tsx --test` without `SidebarProvider` and `next/navigation`. This assertion locks the visible sentence and the data source.

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm exec tsx --test src/components/app/app-chrome.test.ts`

Expected: FAIL because the footer string is still in `user-sidebar.tsx`.

- [ ] **Step 3: Delete the footer sentence**

In `src/components/app/user-sidebar.tsx`, delete the entire `<SidebarFooter>` block (the `<p>` whose text is `Analyze → Jobs → Career Insights`). Leave `<SidebarRail />`. Remove the `SidebarFooter` import. Do not add a replacement line. Do not import `APP_NAV_LINKED`.

- [ ] **Step 4: Re-run the test**

Run: `pnpm exec tsx --test src/components/app/app-chrome.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/app/user-sidebar.tsx src/components/app/app-chrome.test.ts
git commit -m "feat(nav): remove the Analyze, Jobs, Career Insights footer"
```

---

### Task 3: Hero CTA fallback

**Files:**
- Modify: `src/components/intelligence/primary-cta.ts`
- Modify: `src/components/intelligence/intelligence-insights.test.tsx`
- Test: `src/components/intelligence/intelligence-insights.test.tsx`

**Interfaces:**
- Consumes: `IntelligenceReport` fields `coachEnabled`, `market`, `score.careerScore`, `nextSteps`
- Produces:

```ts
export type IntelligencePrimaryCta = {
  kind: "coach" | "resume" | "analyze";
  href: "/skill-coach" | "/resumes" | "/analyze" | "/onboarding";
  label: "Skill Coach" | "Resume Builder" | "Run analysis" | "Add your resume";
};

export function selectIntelligencePrimaryCta(
  report: IntelligenceReport,
): IntelligencePrimaryCta;
```

Selection order:

1. `coachEnabled` and `intelligenceGapNames(report).length > 0` → Skill Coach.
2. `report.score.careerScore == null` or `report.market.basis === "none"` → if some next step has `id === "resume"` and `href === "/onboarding"`, Add your resume; otherwise Run analysis. Both use `kind: "analyze"`.
3. Otherwise Resume Builder.

- [ ] **Step 1: Replace the CTA unit test and add the fallback cases**

In `intelligence-insights.test.tsx`, replace the test named `selectIntelligencePrimaryCta is Coach only when coaching is on and a gap exists` with:

```ts
test("selectIntelligencePrimaryCta is Coach, else analysis, else Resume", () => {
  assert.deepEqual(
    selectIntelligencePrimaryCta(report({ coachEnabled: true })),
    {
      kind: "coach",
      href: "/skill-coach",
      label: "Skill Coach",
    },
  );
  assert.deepEqual(selectIntelligencePrimaryCta(report()), {
    kind: "resume",
    href: "/resumes",
    label: "Resume Builder",
  });
  assert.deepEqual(
    selectIntelligencePrimaryCta(
      report({
        coachEnabled: true,
        market: { basis: "none", roles: [] },
      }),
    ),
    {
      kind: "analyze",
      href: "/analyze",
      label: "Run analysis",
    },
  );
  assert.deepEqual(
    selectIntelligencePrimaryCta(
      report({
        score: {
          ...report().score,
          careerScore: null,
          readiness: null,
          basis: "none",
        },
        market: { basis: "none", roles: [] },
        nextSteps: [
          {
            id: "resume",
            title: "Add your resume",
            detail: "Skills are read from the resume you sync.",
            href: "/onboarding",
            action: "resume",
          },
        ],
      }),
    ),
    {
      kind: "analyze",
      href: "/onboarding",
      label: "Add your resume",
    },
  );
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm exec tsx --test src/components/intelligence/intelligence-insights.test.tsx`

Expected: FAIL. The basis `"none"` case still returns `kind: "resume"`, and the onboarding case is not implemented.

- [ ] **Step 3: Implement the fallback in `primary-cta.ts`**

Replace the `CtaReport` type and `selectIntelligencePrimaryCta` with:

```ts
import type { IntelligenceReport } from "@/types/intelligence";

export type IntelligencePrimaryCta = {
  kind: "coach" | "resume" | "analyze";
  href: "/skill-coach" | "/resumes" | "/analyze" | "/onboarding";
  label: "Skill Coach" | "Resume Builder" | "Run analysis" | "Add your resume";
};

export function intelligenceGapNames(report: {
  market: IntelligenceReport["market"];
}): string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const role of report.market.roles) {
    for (const skill of role.skills) {
      const name = skill.name.trim();
      if (skill.onProfile || name.length === 0 || seen.has(name)) continue;
      seen.add(name);
      names.push(name);
    }
  }
  return names;
}

export function selectIntelligencePrimaryCta(
  report: IntelligenceReport,
): IntelligencePrimaryCta {
  if (report.coachEnabled && intelligenceGapNames(report).length > 0) {
    return {
      kind: "coach",
      href: "/skill-coach",
      label: "Skill Coach",
    };
  }
  if (report.score.careerScore == null || report.market.basis === "none") {
    const needsResume = report.nextSteps.some(
      (step) => step.id === "resume" && step.href === "/onboarding",
    );
    if (needsResume) {
      return {
        kind: "analyze",
        href: "/onboarding",
        label: "Add your resume",
      };
    }
    return {
      kind: "analyze",
      href: "/analyze",
      label: "Run analysis",
    };
  }
  return {
    kind: "resume",
    href: "/resumes",
    label: "Resume Builder",
  };
}
```

Leave `intelligenceGapNames` behavior unchanged. The hero still renders whatever this function returns, so an unscored report now shows Run analysis in the hero and in the sticky bar. Task 5 removes the sticky bar. Do not change the render tests in this task other than the function test above.

- [ ] **Step 4: Re-run the test**

Run: `pnpm exec tsx --test src/components/intelligence/intelligence-insights.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/intelligence/primary-cta.ts src/components/intelligence/intelligence-insights.test.tsx
git commit -m "feat(home): choose Skill Coach, analysis, or Resume as the one CTA"
```

---

### Task 4: Metrics and verified-skill helpers

**Files:**
- Create: `src/components/intelligence/home-metrics.ts`
- Create: `src/components/intelligence/home-metrics.test.ts`
- Modify: `package.json` (`test:unit` script)
- Test: `src/components/intelligence/home-metrics.test.ts`

**Interfaces:**
- Consumes: `IntelligenceReport`, career-file skills with `evidence`
- Produces:

```ts
export function primaryMarketRole(
  report: IntelligenceReport,
): RoleMarket | null;

export function matchedJobCount(report: IntelligenceReport): number;

export function verifiedSkillNames(
  skills: { name: string; evidence: { kind: string }[] }[],
): string[];
```

`primaryMarketRole` is the role with `isPrimary`, else the first role, else null. `matchedJobCount` is the sum of every role's `jobCount` (0 when there are no roles). `verifiedSkillNames` keeps first-seen names whose evidence includes `kind: "verified"`.

- [ ] **Step 1: Write the failing test and register it**

Create `src/components/intelligence/home-metrics.test.ts`:

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  matchedJobCount,
  primaryMarketRole,
  verifiedSkillNames,
} from "@/components/intelligence/home-metrics";
import type { IntelligenceReport } from "@/types/intelligence";

function report(
  roles: IntelligenceReport["market"]["roles"],
): IntelligenceReport {
  return {
    segment: "professional",
    coachEnabled: false,
    score: {
      careerScore: 62,
      readiness: 70,
      completeness: 50,
      weights: { readiness: 0.75, completeness: 0.25 },
      signals: [],
      basis: "target_roles",
      analysisId: "analysis-1",
    },
    market: { basis: "target_roles", roles },
    nextSteps: [],
  };
}

const salary = {
  sampleSize: 2,
  lowInr: 1_200_000,
  medianInr: 1_500_000,
  highInr: 1_800_000,
};

describe("primaryMarketRole", () => {
  it("prefers the primary role and sums every job count", () => {
    const value = report([
      {
        id: "fe",
        title: "Frontend",
        isPrimary: false,
        jobCount: 1,
        salary: null,
        remoteCount: 0,
        remoteKnown: 0,
        companies: [],
        skills: [],
      },
      {
        id: "be",
        title: "Backend",
        isPrimary: true,
        jobCount: 2,
        salary,
        remoteCount: 0,
        remoteKnown: 0,
        companies: [],
        skills: [],
      },
    ]);
    assert.equal(primaryMarketRole(value)?.title, "Backend");
    assert.equal(matchedJobCount(value), 3);
  });

  it("returns null salary source and zero jobs when nothing was analyzed", () => {
    const value = report([]);
    value.market.basis = "none";
    assert.equal(primaryMarketRole(value), null);
    assert.equal(matchedJobCount(value), 0);
  });
});

describe("verifiedSkillNames", () => {
  it("keeps only verified evidence, first seen", () => {
    assert.deepEqual(
      verifiedSkillNames([
        { name: "Go", evidence: [{ kind: "resume_keyword" }] },
        {
          name: "TypeScript",
          evidence: [{ kind: "verified" }, { kind: "work" }],
        },
        { name: "TypeScript", evidence: [{ kind: "verified" }] },
      ]),
      ["TypeScript"],
    );
  });
});
```

Append `src/components/intelligence/home-metrics.test.ts` to the `test:unit` string in `package.json`.

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm exec tsx --test src/components/intelligence/home-metrics.test.ts`

Expected: FAIL with a module-not-found error for `home-metrics`.

- [ ] **Step 3: Implement the helpers**

Create `src/components/intelligence/home-metrics.ts`:

```ts
import type { RoleMarket } from "@/lib/career/market";
import type { IntelligenceReport } from "@/types/intelligence";

export function primaryMarketRole(
  report: IntelligenceReport,
): RoleMarket | null {
  return (
    report.market.roles.find((role) => role.isPrimary) ??
    report.market.roles[0] ??
    null
  );
}

export function matchedJobCount(report: IntelligenceReport): number {
  return report.market.roles.reduce((sum, role) => sum + role.jobCount, 0);
}

export function verifiedSkillNames(
  skills: { name: string; evidence: { kind: string }[] }[],
): string[] {
  const names: string[] = [];
  for (const skill of skills) {
    const verified = skill.evidence.some((item) => item.kind === "verified");
    if (!verified || names.includes(skill.name)) continue;
    names.push(skill.name);
  }
  return names;
}
```

- [ ] **Step 4: Re-run the test**

Run: `pnpm exec tsx --test src/components/intelligence/home-metrics.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/intelligence/home-metrics.ts src/components/intelligence/home-metrics.test.ts package.json
git commit -m "feat(home): derive salary, job count, and verified skill names"
```

---

### Task 5: Six-region IntelligenceInsights board

**Files:**
- Modify: `src/components/intelligence/intelligence-insights.tsx`
- Modify: `src/components/intelligence/intelligence-insights.test.tsx`
- Test: `src/components/intelligence/intelligence-insights.test.tsx`

**Interfaces:**
- Consumes: `selectIntelligencePrimaryCta`, `intelligenceGapNames`, `primaryMarketRole`, `matchedJobCount`, `APP_NAV_LINKED`, `formatInr` already in this file
- Produces:

```tsx
export function IntelligenceInsights({
  report,
  atsScore,
  verifiedSkills,
}: {
  report: IntelligenceReport;
  atsScore: number | null;
  verifiedSkills: { name: string }[];
}): JSX.Element;
```

Region order, each with `space-y-4` between them on a root `div` whose class is `mx-auto w-full max-w-[1100px] space-y-4`:

1. `data-slot="intelligence-hero"` — label "Career score", value `careerScore` or "Not scored", meaning sentence, one `data-primary-cta` wrapper. Meaning when scored: `` `${Math.round(report.score.weights.readiness * 100)}% readiness, ${Math.round(report.score.weights.completeness * 100)}% completeness.` `` Unscored: `` `Completeness is ${report.score.completeness}. The score appears after an analysis.` `` Score class: `font-heading text-5xl tabular-nums`. No eyebrow, no welcome headline.
2. `data-slot="home-metrics"` — always an ATS article (`data-slot="metric-ats"`) showing `${atsScore}%` or "Not scored" and a text link "Resume" to `/resumes`. Salary article (`data-slot="metric-salary"`) only when `primaryMarketRole(report)?.salary` is non-null, text `${formatInr(low)} – ${formatInr(high)}`. Jobs article (`data-slot="metric-jobs"`, label "Jobs matched") when salary is absent or when salary is present (it is the third card). Value is `matchedJobCount(report)`, including 0.
3. `data-slot="intelligence-gaps"` — existing chip behavior. Coach on: each chip is a link to `/skill-coach`. Coach off: a `span` chip plus the existing sentence "Coaching is paused. These gaps stay listed until you update your resume." Empty gaps keep the two existing sentences ("No missing skills in the latest analysis." / "Skill gaps show up here once an analysis has jobs for a target."). Delete the "On file:" paragraph.
4. `data-slot="intelligence-next"` — `nextSteps.slice(0, 3)` unchanged. Empty copy stays "Nothing urgent. Sync again when your resume or target changes."
5. `data-slot="home-verified"` — one list item per name, with `VERIFIED_SKILL_LABEL` ("Verified on Zaprill") on each item. Empty copy, exact: "No skills verified in Skill Coach yet."
6. `data-slot="home-secondary-strip"` — `APP_NAV_LINKED` as text links separated by a middle dot `·`. Class `text-sm text-muted-foreground`. Not buttons.

Delete `data-slot="intelligence-market"`, `data-slot="intelligence-score-detail"`, `data-slot="intelligence-sticky-cta"`, and `PageEmpty`. Do not render "Public ATS boards are not connected", company names, or per-role market cards. Articles use `rounded-lg border border-border bg-card p-4 shadow-none`. Hero button: `<Button className="mt-4 h-11 w-full shadow-none sm:w-auto" render={<Link href={cta.href} />}>`. It is visible at every width. Section labels use `text-sm text-muted-foreground`. Mini-card values use `text-2xl tabular-nums`.

- [ ] **Step 1: Point every render at the new props and replace the assertions that describe the old market essay**

Add this helper under `report()` in the test file and use it for every `renderToStaticMarkup(<IntelligenceInsights ...>)` call:

```tsx
function renderInsights(
  value: IntelligenceReport,
  extras: {
    atsScore?: number | null;
    verifiedSkills?: { name: string }[];
  } = {},
) {
  return renderToStaticMarkup(
    <IntelligenceInsights
      report={value}
      atsScore={extras.atsScore === undefined ? 75 : extras.atsScore}
      verifiedSkills={extras.verifiedSkills ?? []}
    />,
  );
}
```

Replace the first test with:

```tsx
test("the board shows score, ATS, salary, jobs, one resume CTA, and the strip", () => {
  const html = renderInsights(report());
  assert.match(html, /data-slot="intelligence-hero"/);
  assert.match(html, />62</);
  assert.match(html, /75% readiness, 25% completeness/);
  assert.match(html, /data-slot="metric-ats"/);
  assert.match(html, /75%/);
  assert.match(html, /href="\/resumes"/);
  assert.match(html, /data-slot="metric-salary"/);
  assert.match(html, /₹12 LPA/);
  assert.match(html, /₹18 LPA/);
  assert.match(html, /data-slot="metric-jobs"/);
  assert.match(html, /Jobs matched/);
  assert.match(html, /data-slot="gap-chip"/);
  assert.match(html, /Go/);
  assert.match(html, /data-slot="home-verified"/);
  assert.match(html, /No skills verified in Skill Coach yet/);
  assert.match(html, /data-slot="home-secondary-strip"/);
  assert.match(html, /href="\/analyze"/);
  assert.match(html, /href="\/jobs"/);
  assert.match(html, /href="\/history"/);
  assert.match(html, /max-w-\[1100px\]/);
  assert.match(html, /shadow-none/);
  assert.doesNotMatch(html, /data-slot="intelligence-market"/);
  assert.doesNotMatch(html, /data-slot="intelligence-sticky-cta"/);
  assert.doesNotMatch(html, /data-slot="intelligence-score-detail"/);
  assert.doesNotMatch(html, /Public ATS boards/);
  assert.doesNotMatch(html, /Razorpay/);
  assert.doesNotMatch(html, /Personal Dashboard/);
  assert.doesNotMatch(html, /Welcome back/);
  assert.doesNotMatch(html, /Analytical Search/);
  assert.doesNotMatch(html, /Synthesizing/);
  assert.equal(html.match(/data-primary-cta=/g)?.length, 1);
  const order = [
    "intelligence-hero",
    "home-metrics",
    "intelligence-gaps",
    "intelligence-next",
    "home-verified",
    "home-secondary-strip",
  ].map((slot) => html.indexOf(`data-slot="${slot}"`));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
  assert.ok(order.every((index) => index >= 0));
});
```

Replace the empty-analysis test with:

```tsx
test("an empty analysis has one Run analysis button and a zero job count", () => {
  const html = renderInsights(
    report({
      score: {
        ...report().score,
        careerScore: null,
        readiness: null,
        basis: "none",
      },
      market: { basis: "none", roles: [] },
      nextSteps: [],
    }),
    { atsScore: null },
  );
  assert.match(html, /Not scored/);
  assert.match(html, /The score appears after an analysis/);
  assert.match(html, /data-primary-cta="analyze"/);
  assert.match(html, /Run analysis/);
  assert.match(html, /href="\/analyze"/);
  assert.match(html, /Skill gaps show up here once an analysis has jobs/);
  assert.match(html, /Nothing urgent/);
  assert.match(html, /data-slot="metric-jobs"/);
  assert.doesNotMatch(html, /data-slot="metric-salary"/);
  assert.match(html, /data-slot="home-secondary-strip"/);
  assert.equal(html.match(/data-primary-cta=/g)?.length, 1);
  assert.doesNotMatch(html, /Activate Job Match Engine/);
  assert.doesNotMatch(html, /No matches detected/);
});
```

Replace the sticky-CTA test with:

```tsx
test("the primary CTA is only in the hero", () => {
  const html = renderInsights(report());
  assert.match(html, /data-slot="intelligence-hero"/);
  assert.doesNotMatch(html, /data-slot="intelligence-sticky-cta"/);
  assert.doesNotMatch(html, /fixed/);
  assert.equal(html.match(/data-primary-cta="resume"/g)?.length, 1);
});
```

Add:

```tsx
test("verified skills list only the names passed in", () => {
  const html = renderInsights(report(), {
    verifiedSkills: [{ name: "Go" }],
  });
  assert.match(html, /Go/);
  assert.match(html, /Verified on Zaprill/);
  assert.doesNotMatch(html, /No skills verified in Skill Coach yet/);
});
```

Keep the coach-on, coach-off, no-gap, and three-step tests. Change their `renderToStaticMarkup(<IntelligenceInsights report={...} />)` calls to `renderInsights(...)`. The coach-off test must still assert `Coaching is paused`, `data-slot="gap-chip"`, no `href="/skill-coach"`, and `data-primary-cta="resume"`. The no-gap coach-on test must still assert `data-primary-cta="resume"` and no `href="/skill-coach"`.

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm exec tsx --test src/components/intelligence/intelligence-insights.test.tsx`

Expected: FAIL. `IntelligenceInsights` does not accept `atsScore` / `verifiedSkills`, and the old market essay is still rendered.

- [ ] **Step 3: Rewrite the insights render**

Update the export signature. Delete `collectOnFile`, `MarketCard`, the market section, the score-detail section, and the sticky bar. Build the six regions with the classes and copy in the Interfaces block. Use `primaryMarketRole` and `matchedJobCount`. Import `APP_NAV_LINKED` from `@/lib/app-nav` and `VERIFIED_SKILL_LABEL` from `@/types/career-profile`.

Salary and jobs:

```tsx
const role = primaryMarketRole(report);
const jobs = matchedJobCount(report);
const salary = role?.salary ?? null;
```

```tsx
<section data-slot="home-metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <article data-slot="metric-ats" className="rounded-lg border border-border bg-card p-4 shadow-none">
    <p className="text-muted-foreground text-sm">ATS</p>
    <p className="font-heading text-2xl tabular-nums">
      {atsScore == null ? "Not scored" : `${atsScore}%`}
    </p>
    <Link href="/resumes" className="text-muted-foreground text-sm">
      Resume
    </Link>
  </article>
  {salary ? (
    <article data-slot="metric-salary" className="rounded-lg border border-border bg-card p-4 shadow-none">
      <p className="text-muted-foreground text-sm">Market</p>
      <p className="font-heading text-2xl tabular-nums">
        {formatInr(salary.lowInr)} – {formatInr(salary.highInr)}
      </p>
    </article>
  ) : null}
  <article data-slot="metric-jobs" className="rounded-lg border border-border bg-card p-4 shadow-none">
    <p className="text-muted-foreground text-sm">Jobs matched</p>
    <p className="font-heading text-2xl tabular-nums">{jobs}</p>
  </article>
</section>
```

The jobs article is always rendered. With a salary band that is three cards. Without a band that is ATS plus jobs.

Strip:

```tsx
<nav data-slot="home-secondary-strip" aria-label="More career tools">
  <ul className="flex flex-wrap items-center gap-x-2 text-muted-foreground text-sm">
    {APP_NAV_LINKED.map((item, index) => (
      <li key={item.url} className="flex items-center gap-2">
        {index > 0 ? <span aria-hidden="true">·</span> : null}
        <Link href={item.url} className="hover:text-foreground">
          {item.title}
        </Link>
      </li>
    ))}
  </ul>
</nav>
```

Verified:

```tsx
<section data-slot="home-verified" className="text-muted-foreground text-sm">
  <h2 className="text-sm">Verified skills</h2>
  {verifiedSkills.length === 0 ? (
    <p>No skills verified in Skill Coach yet.</p>
  ) : (
    <ul>
      {verifiedSkills.map((skill) => (
        <li key={skill.name}>
          {skill.name} · {VERIFIED_SKILL_LABEL}
        </li>
      ))}
    </ul>
  )}
</section>
```

Hero shell class: `rounded-lg border border-border bg-card px-5 py-4 shadow-none`. Root class includes `max-w-[1100px] space-y-4` and `data-slot="home-board-regions"`.

- [ ] **Step 4: Re-run the test**

Run: `pnpm exec tsx --test src/components/intelligence/intelligence-insights.test.tsx`

Expected: PASS. `pnpm exec biome check src/components/intelligence/intelligence-insights.tsx src/components/intelligence/intelligence-insights.test.tsx` exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/intelligence/intelligence-insights.tsx src/components/intelligence/intelligence-insights.test.tsx
git commit -m "feat(home): lay out the dense intelligence board"
```

---

### Task 6: Move path and pay editors under the board

**Files:**
- Create: `src/components/intelligence/career-file-editors.tsx`
- Create: `src/components/intelligence/career-file-editors.test.tsx`
- Modify: `src/components/intelligence/intelligence-dashboard.tsx`
- Modify: `package.json`
- Test: `src/components/intelligence/career-file-editors.test.tsx`

**Interfaces:**
- Consumes: `CareerProfileView`, `PUT /api/career-profile` (same body the dashboard sends today)
- Produces:

```tsx
export function CareerFileEditors({
  profile,
  onProfile,
}: {
  profile: CareerProfileView;
  onProfile: (profile: CareerProfileView) => void;
}): JSX.Element;
```

The component renders `<section id="path">` (Student / Fresher / Professional) and the pay summary plus `<Card id="pay">` with Save pay. It does not render academics, experience, target roles, or the full skill list. After a successful PUT, call `onProfile` with the returned profile. The parent refreshes the report. On failure, `toast.error` with the existing sentences ("Could not update your path", "Could not save pay"). Do not render `body.error`.

Move these functions and components verbatim from `intelligence-dashboard.tsx` into the new file: `PayFigure`, `PayEditor`, `MoneyField`, `formatPay`, `formatAnnualInr`, `formatPlace`, `formatYears`, `salaryHint`, `displayPay`, `expectedBand`, `displayExpected`, `figureForPeriod`, `expectedForPeriod`, `parseMoney`, `annualEquivalent`. They currently sit from `PayFigure` through `annualEquivalent` (about lines 464–871). Also move the `SEGMENTS` constant (lines 38–42).

On the pay `Card`, add `shadow-none ring-0 border border-border` to its `className` so the default `shadow-md` does not apply. Do not restyle the money fields.

`IntelligenceDashboard` replaces the inline `#path` block, the pay-figure grid, and `<PayEditor>` with:

```tsx
<CareerFileEditors
  profile={profile}
  onProfile={(next) => {
    setProfile(next);
    void refreshReport();
  }}
/>
```

Leave the empty-file `PageEmpty`, target roles, skills-on-file list, academics, and experience in `IntelligenceDashboard`. Do not delete that file. The route stops mounting it in Task 9.

- [ ] **Step 1: Write the failing render test and register it**

Create `src/components/intelligence/career-file-editors.test.tsx`:

```tsx
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { CareerFileEditors } from "@/components/intelligence/career-file-editors";
import type { CareerProfileView } from "@/types/career-profile";

function fixture(): CareerProfileView {
  return {
    id: "cp",
    userId: "user",
    segment: null,
    headline: null,
    location: { city: null, region: null, countryCode: "IN" },
    compensation: {
      currency: "INR",
      stipend: false,
      current: { period: "annual", amountInr: null, annualInr: null },
      expected: {
        period: "annual",
        minInr: null,
        maxInr: null,
        minAnnualInr: null,
        maxAnnualInr: null,
      },
      noticePeriodDays: null,
    },
    yearsOfExperience: null,
    openToRelocate: false,
    fieldSources: {},
    derivedFromResumeId: null,
    lastDerivedAt: null,
    academics: [],
    experience: [],
    skills: [],
    targetRoles: [],
    intelligence: {
      careerScore: null,
      readiness: null,
      completeness: 0,
      basis: "none",
      analysisId: null,
      roles: [],
      skillGaps: [],
    },
    createdAt: "2026-10-26T00:00:00.000Z",
    updatedAt: "2026-10-26T00:00:00.000Z",
  };
}

describe("CareerFileEditors", () => {
  it("renders path and pay anchors only", () => {
    const html = renderToStaticMarkup(
      <CareerFileEditors profile={fixture()} onProfile={() => undefined} />,
    );
    assert.match(html, /id="path"/);
    assert.match(html, /id="pay"/);
    assert.match(html, /Student/);
    assert.match(html, /Fresher/);
    assert.match(html, /Professional/);
    assert.match(html, /Save pay/);
    assert.match(html, /Choose the path that fits you right now/);
    assert.doesNotMatch(html, /Academics/);
    assert.doesNotMatch(html, /Target roles/);
    assert.doesNotMatch(html, /Skills on file/);
  });
});
```

Append `src/components/intelligence/career-file-editors.test.tsx` to `package.json` `test:unit`.

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm exec tsx --test src/components/intelligence/career-file-editors.test.tsx`

Expected: FAIL with module not found.

- [ ] **Step 3: Move the editors and point the dashboard at them**

Create `career-file-editors.tsx` with `"use client"`. Copy the listed helpers unchanged. `setSegment` lives inside `CareerFileEditors` and copies the dashboard's PUT `{ segment }` flow, then calls `onProfile(body.profile)`. `PayEditor`'s `onSaved` calls `onProfile`. Failure toasts use the existing fallback strings, not `body.error`.

Replace the dashboard's path section, pay-figure grid, and `PayEditor` with the one `<CareerFileEditors>` element. Delete the moved helpers from the dashboard so they are not declared twice. Keep `refreshReport` in the dashboard.

- [ ] **Step 4: Re-run the test**

Run: `pnpm exec tsx --test src/components/intelligence/career-file-editors.test.tsx`

Expected: PASS.

Run: `pnpm exec biome check src/components/intelligence/career-file-editors.tsx src/components/intelligence/career-file-editors.test.tsx src/components/intelligence/intelligence-dashboard.tsx`

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/intelligence/career-file-editors.tsx src/components/intelligence/career-file-editors.test.tsx src/components/intelligence/intelligence-dashboard.tsx package.json
git commit -m "feat(home): keep path and pay editors beside the intelligence board"
```

---

### Task 7: Home data loading, skeleton, and errors

**Files:**
- Create: `src/components/intelligence/home-board.tsx`
- Create: `src/components/intelligence/home-board.test.tsx`
- Modify: `package.json`
- Test: `src/components/intelligence/home-board.test.tsx`

**Interfaces:**
- Consumes: `IntelligenceInsights`, `CareerFileEditors`, `verifiedSkillNames`, `PageError`, `Skeleton`
- Produces:

```tsx
export function HomeBoardSkeleton(): JSX.Element;

export function HomeBoardView(props: {
  status: "loading" | "profile-error" | "report-error" | "ready";
  onRetryProfile: () => void;
  onRetryReport: () => void;
  atsScore: number | null;
  report: IntelligenceReport | null;
  profile: CareerProfileView | null;
  onProfile: (profile: CareerProfileView) => void;
}): JSX.Element;

export function HomeBoard({ atsScore }: { atsScore: number | null }): JSX.Element;
```

`HomeBoard` fetch order:

1. `GET /api/career-profile`. Failure or missing `profile` → `status: "profile-error"`. `console.error` the failure. Message shown: "Your career file could not be loaded."
2. Only after a profile: `GET /api/intelligence`. Failure or missing `report` → `status: "report-error"`. Message shown: "Market insights could not be loaded."
3. Both present → `status: "ready"`.

Do not render `body.error`. `onProfile` stores the new profile and runs step 2 again. `HomeBoard` does not pass skill names itself; `HomeBoardView` calls `verifiedSkillNames(profile.skills)` when `profile` is non-null.

`HomeBoardView`: `loading` returns only `HomeBoardSkeleton`. `profile-error` returns `PageError` with "Your career file could not be loaded." and no editors. `report-error` returns `PageError` with "Market insights could not be loaded." then `CareerFileEditors`. `ready` returns `IntelligenceInsights` (verified names from `verifiedSkillNames(profile.skills)`) then `CareerFileEditors` inside `data-slot="home-board"` with `mx-auto w-full max-w-[1100px] space-y-4`. There is no `verifiedSkills` prop; the view derives it from `profile`.

`HomeBoardSkeleton` root: `data-slot="home-board-skeleton"` and the same max-width and `space-y-4`. Children, in order, `data-slot` values: `skeleton-hero`, `skeleton-metrics`, `skeleton-gaps`, `skeleton-next`, `skeleton-verified`, `skeleton-strip`. Use `Skeleton` inside them. The hero skeleton includes three bars (score, meaning, button). The metrics skeleton is two bars. No "Synthesizing" string. `aria-hidden="true"` on the root.

- [ ] **Step 1: Write the failing view tests and register the file**

Create `src/components/intelligence/home-board.test.tsx`:

```tsx
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  HomeBoardSkeleton,
  HomeBoardView,
} from "@/components/intelligence/home-board";
import type { CareerProfileView } from "@/types/career-profile";
import type { IntelligenceReport } from "@/types/intelligence";

function profile(): CareerProfileView {
  return {
    id: "cp",
    userId: "user",
    segment: null,
    headline: null,
    location: { city: null, region: null, countryCode: "IN" },
    compensation: {
      currency: "INR",
      stipend: false,
      current: { period: "annual", amountInr: null, annualInr: null },
      expected: {
        period: "annual",
        minInr: null,
        maxInr: null,
        minAnnualInr: null,
        maxAnnualInr: null,
      },
      noticePeriodDays: null,
    },
    yearsOfExperience: null,
    openToRelocate: false,
    fieldSources: {},
    derivedFromResumeId: null,
    lastDerivedAt: null,
    academics: [],
    experience: [],
    skills: [
      {
        id: "skill-go",
        name: "Go",
        normalizedName: "go",
        category: "language",
        level: "advanced",
        levelLocked: false,
        evidence: [{ kind: "verified", label: "Verified on Zaprill" }],
        source: "self_reported",
        sortOrder: 0,
      },
    ],
    targetRoles: [],
    intelligence: {
      careerScore: 62,
      readiness: 70,
      completeness: 50,
      basis: "target_roles",
      analysisId: "analysis-1",
      roles: [],
      skillGaps: [],
    },
    createdAt: "2026-10-26T00:00:00.000Z",
    updatedAt: "2026-10-26T00:00:00.000Z",
  };
}

function readyReport(): IntelligenceReport {
  return {
    segment: "professional",
    coachEnabled: false,
    score: {
      careerScore: 62,
      readiness: 70,
      completeness: 50,
      weights: { readiness: 0.75, completeness: 0.25 },
      signals: [],
      basis: "target_roles",
      analysisId: "analysis-1",
    },
    market: {
      basis: "target_roles",
      roles: [
        {
          id: "be",
          title: "Backend Engineer",
          isPrimary: true,
          jobCount: 2,
          salary: null,
          remoteCount: 0,
          remoteKnown: 0,
          companies: [],
          skills: [],
        },
      ],
    },
    nextSteps: [],
  };
}

const noop = () => undefined;

describe("HomeBoardSkeleton", () => {
  it("follows the six board regions", () => {
    const html = renderToStaticMarkup(<HomeBoardSkeleton />);
    const slots = [
      "skeleton-hero",
      "skeleton-metrics",
      "skeleton-gaps",
      "skeleton-next",
      "skeleton-verified",
      "skeleton-strip",
    ];
    const order = slots.map((slot) => html.indexOf(`data-slot="${slot}"`));
    assert.deepEqual(order, [...order].sort((a, b) => a - b));
    assert.ok(order.every((index) => index >= 0));
    assert.match(html, /max-w-\[1100px\]/);
    assert.doesNotMatch(html, /Synthesizing/);
  });
});

describe("HomeBoardView", () => {
  it("blocks the board when the career file fails", () => {
    const html = renderToStaticMarkup(
      <HomeBoardView
        status="profile-error"
        onRetryProfile={noop}
        onRetryReport={noop}
        atsScore={null}
        report={null}
        profile={null}
        onProfile={noop}
      />,
    );
    assert.match(html, /data-slot="page-error"/);
    assert.match(html, /Your career file could not be loaded/);
    assert.doesNotMatch(html, /id="pay"/);
  });

  it("keeps path and pay when the report fails", () => {
    const html = renderToStaticMarkup(
      <HomeBoardView
        status="report-error"
        onRetryProfile={noop}
        onRetryReport={noop}
        atsScore={null}
        report={null}
        profile={profile()}
        onProfile={noop}
      />,
    );
    assert.match(html, /Market insights could not be loaded/);
    assert.match(html, /id="pay"/);
    assert.match(html, /id="path"/);
    assert.doesNotMatch(html, /data-slot="intelligence-hero"/);
  });

  it("renders the board and the editors when both loads succeed", () => {
    const html = renderToStaticMarkup(
      <HomeBoardView
        status="ready"
        onRetryProfile={noop}
        onRetryReport={noop}
        atsScore={75}
        report={readyReport()}
        profile={profile()}
        onProfile={noop}
      />,
    );
    assert.match(html, /data-slot="intelligence-hero"/);
    assert.match(html, /75%/);
    assert.match(html, /Go/);
    assert.match(html, /Verified on Zaprill/);
    assert.match(html, /id="path"/);
    assert.match(html, /id="pay"/);
  });
});
```

Do not mount `HomeBoard` in this file; it fetches. Append `src/components/intelligence/home-board.test.tsx` to `package.json` `test:unit`. The ready state passes a profile that already includes a verified Go skill. `HomeBoardView` must derive `verifiedSkills` with `verifiedSkillNames(profile.skills)` so this test does not take a separate `verifiedSkills` prop.

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm exec tsx --test src/components/intelligence/home-board.test.tsx`

Expected: FAIL with module not found.

- [ ] **Step 3: Implement `home-board.tsx`**

`"use client"`. Implement the three exports to the Interfaces contract. `HomeBoard` holds `status`, `profile`, and `report` in state and loads on mount with `useEffect`. It renders `HomeBoardView` only. `HomeBoardView` calls `verifiedSkillNames` and passes the result into `IntelligenceInsights`.

- [ ] **Step 4: Re-run the test**

Run: `pnpm exec tsx --test src/components/intelligence/home-board.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/intelligence/home-board.tsx src/components/intelligence/home-board.test.tsx package.json
git commit -m "feat(home): load the career file, then the intelligence report"
```

---

### Task 8: Signed-in Home and signed-out redirect

**Files:**
- Create: `src/lib/home-entry.ts`
- Create: `src/lib/home-entry.test.ts`
- Modify: `src/app/page.tsx`
- Delete: `src/components/dashboard/UserDashboard.tsx`
- Modify: `src/components/loading/PageLoaders.tsx` (remove `DashboardSkeleton` only)
- Modify: `package.json`
- Test: `src/lib/home-entry.test.ts`

**Interfaces:**
- Consumes: `HomeBoard`, `HomeBoardSkeleton`, `useSession`, `AppShell`
- Produces:

```ts
export type HomeEntry = "loading" | "sign-in" | "home";

export function resolveHomeEntry(input: {
  sessionLoading: boolean;
  hasSession: boolean;
  profilePending: boolean;
}): HomeEntry;
```

`sessionLoading` → `"loading"`. No session → `"sign-in"`. Session with `profilePending` → `"loading"`. Session with profile resolved, including a null profile or `onboardingStatus !== "completed"`, → `"home"`.

- [ ] **Step 1: Write the failing entry tests and the banned-copy test**

Create `src/lib/home-entry.test.ts`:

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { resolveHomeEntry } from "@/lib/home-entry";

describe("resolveHomeEntry", () => {
  it("waits while the session is unknown", () => {
    assert.equal(
      resolveHomeEntry({
        sessionLoading: true,
        hasSession: false,
        profilePending: false,
      }),
      "loading",
    );
  });

  it("sends a signed-out visitor to sign-in", () => {
    assert.equal(
      resolveHomeEntry({
        sessionLoading: false,
        hasSession: false,
        profilePending: false,
      }),
      "sign-in",
    );
  });

  it("waits for the profile request", () => {
    assert.equal(
      resolveHomeEntry({
        sessionLoading: false,
        hasSession: true,
        profilePending: true,
      }),
      "loading",
    );
  });

  it("opens Home after the profile resolves, including an incomplete file", () => {
    assert.equal(
      resolveHomeEntry({
        sessionLoading: false,
        hasSession: true,
        profilePending: false,
      }),
      "home",
    );
  });
});

describe("app root copy", () => {
  it("does not keep the marketing landing", () => {
    const source = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
    assert.equal(source.includes("Find the job you actually deserve."), false);
    assert.equal(source.includes("Get Started Now"), false);
    assert.equal(source.includes("UserDashboard"), false);
    assert.equal(source.includes("DashboardSkeleton"), false);
    assert.match(source, /router\.replace\("\/sign-in"\)/);
    assert.match(source, /HomeBoard/);
  });
});
```

Append `src/lib/home-entry.test.ts` to `package.json` `test:unit`. The `new URL` is relative to `src/lib/`, so `../app/page.tsx` is `src/app/page.tsx`.

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm exec tsx --test src/lib/home-entry.test.ts`

Expected: FAIL. `resolveHomeEntry` is missing, and `page.tsx` still contains the marketing strings.

- [ ] **Step 3: Implement the entry helper and rewrite the page branches**

Create `src/lib/home-entry.ts` with the function above.

In `src/app/page.tsx`:

- Keep the `/api/profile` fetch effect.
- Compute:

```tsx
const entry = resolveHomeEntry({
  sessionLoading,
  hasSession: Boolean(session?.user),
  profilePending: Boolean(session?.user) && (isFetchingProfile || profile === undefined),
});
```

- `useEffect` calls `router.replace("/sign-in")` when `entry === "sign-in"`.
- `entry === "sign-in"` returns `null`.
- `entry === "loading"` returns `<main className="bg-background"><HomeBoardSkeleton /></main>`. No `Navbar`, no `GridPattern`, no `WordFadeIn`.
- `entry === "home"` returns `<AppShell user={shellUser!}><HomeBoard atsScore={profile?.lastAtsScore ?? null} /></AppShell>`.
- Delete the incomplete-onboarding marketing section and the guest marketing section.
- Delete imports of `UserDashboard`, `DashboardSkeleton`, `Navbar`, `GridPattern`, `WordFadeIn`, and the marketing icons that become unused.
- Delete `handleUseSavedProfile` if nothing calls it.

Delete `src/components/dashboard/UserDashboard.tsx`. In `PageLoaders.tsx`, delete `DashboardSkeleton` and any imports that only it used. Leave `AnalyzeSkeleton`.

- [ ] **Step 4: Re-run the test**

Run: `pnpm exec tsx --test src/lib/home-entry.test.ts`

Expected: PASS.

Run: `pnpm exec biome check src/lib/home-entry.ts src/lib/home-entry.test.ts src/app/page.tsx src/components/loading/PageLoaders.tsx`

Expected: exit 0. Confirm `rg UserDashboard src` prints no matches.

- [ ] **Step 5: Commit**

```bash
git add src/lib/home-entry.ts src/lib/home-entry.test.ts src/app/page.tsx src/components/dashboard/UserDashboard.tsx src/components/loading/PageLoaders.tsx package.json
git commit -m "feat(home): show the intelligence board and send guests to sign-in"
```

---

### Task 9: Redirect `/intelligence` and preserve pay and path hashes

**Files:**
- Create: `src/components/intelligence/intelligence-redirect.tsx`
- Create: `src/components/intelligence/intelligence-redirect.test.ts`
- Modify: `src/app/(protected)/intelligence/page.tsx`
- Modify: `package.json`
- Test: `src/components/intelligence/intelligence-redirect.test.ts`

**Interfaces:**
- Consumes: `useRouter` from `next/navigation`
- Produces:

```ts
export function intelligenceRedirectTarget(
  hash: string,
): "/" | "/#pay" | "/#path";

export function IntelligenceRedirect(): JSX.Element | null;
```

`#pay` → `/#pay`. `#path` → `/#path`. Any other hash, including `""`, → `/`. The client component reads `window.location.hash` inside `useEffect` and calls `router.replace(intelligenceRedirectTarget(hash))`. It renders `null`.

Do not change `recommendNextSteps`. `/intelligence#pay` still works because the browser keeps the fragment and this effect forwards it. Editors on `/` use `id="pay"` and `id="path"`.

- [ ] **Step 1: Write the failing target test and register it**

Create `src/components/intelligence/intelligence-redirect.test.ts`:

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { intelligenceRedirectTarget } from "@/components/intelligence/intelligence-redirect";

describe("intelligenceRedirectTarget", () => {
  it("keeps pay and path hashes and drops everything else", () => {
    assert.equal(intelligenceRedirectTarget("#pay"), "/#pay");
    assert.equal(intelligenceRedirectTarget("#path"), "/#path");
    assert.equal(intelligenceRedirectTarget(""), "/");
    assert.equal(intelligenceRedirectTarget("#score"), "/");
  });
});

describe("intelligence route", () => {
  it("renders the client redirect instead of IntelligenceDashboard", () => {
    const source = readFileSync(
      new URL("../../app/(protected)/intelligence/page.tsx", import.meta.url),
      "utf8",
    );
    assert.match(source, /IntelligenceRedirect/);
    assert.equal(source.includes("IntelligenceDashboard"), false);
  });
});
```

The URL from `src/components/intelligence/` to the page is `../../app/(protected)/intelligence/page.tsx`. Append this test file to `package.json` `test:unit`.

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm exec tsx --test src/components/intelligence/intelligence-redirect.test.ts`

Expected: FAIL. The module is missing and the page still imports `IntelligenceDashboard`.

- [ ] **Step 3: Add the redirect**

Create `intelligence-redirect.tsx` with `"use client"`, the pure function, and:

```tsx
export function IntelligenceRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(intelligenceRedirectTarget(window.location.hash));
  }, [router]);
  return null;
}
```

Replace `src/app/(protected)/intelligence/page.tsx` with a server page that exports the existing metadata title updated to `"Home · Zaprill"` and returns `<IntelligenceRedirect />`. Do not call `redirect()` from `next/navigation` here; a server redirect cannot read the fragment.

- [ ] **Step 4: Re-run the test**

Run: `pnpm exec tsx --test src/components/intelligence/intelligence-redirect.test.ts`

Expected: PASS.

Run: `pnpm exec tsx --test src/lib/career/next-steps.test.ts`

Expected: PASS, still expecting `"/intelligence#pay"`.

- [ ] **Step 5: Commit**

```bash
git add src/components/intelligence/intelligence-redirect.tsx src/components/intelligence/intelligence-redirect.test.ts src/app/\(protected\)/intelligence/page.tsx package.json
git commit -m "feat(home): redirect intelligence to Home and keep pay and path hashes"
```

---

### Task 10: Doc note and full unit run

**Files:**
- Modify: `docs/intelligence-dashboard.md`
- Test: `pnpm test:unit`

**Interfaces:**
- Consumes: the shipped route and API, which are unchanged
- Produces: the doc no longer says the UI's only home is `/intelligence`

- [ ] **Step 1: Replace the opening of `docs/intelligence-dashboard.md`**

Replace the first paragraph under the title with:

```md
The career-intelligence UI is Home (`/`). `/intelligence` redirects there and keeps `#pay` and `#path`. `GET /api/intelligence` is unchanged. This view does not call a model. There is nothing to meter. `logAiUsage` stays unused here. A later written narrative would need a new `ai_action` enum value and a migration. Do not log these reads as `analyze_gaps`.
```

Leave the Score, Market, Skill gaps, Next steps, and API sections as they are. In "What's left", do not add Skill Coach polish.

- [ ] **Step 2: Run the whole unit list and Biome**

Run: `pnpm test:unit`

Expected: PASS, including `app-nav`, `intelligence-insights`, `home-metrics`, `career-file-editors`, `home-board`, `home-entry`, `intelligence-redirect`, and `next-steps`.

Run: `pnpm exec biome check src/lib/app-nav.ts src/lib/app-nav.test.ts src/lib/home-entry.ts src/lib/home-entry.test.ts src/components/app/user-sidebar.tsx src/components/app/app-chrome.test.ts src/components/intelligence src/app/page.tsx src/app/\(protected\)/intelligence/page.tsx src/components/loading/PageLoaders.tsx`

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add docs/intelligence-dashboard.md
git commit -m "docs: point the intelligence notes at Home"
```

---

## Spec coverage

| Spec section | Task |
| --- | --- |
| Goals: Home is the intelligence board | Tasks 5, 7, 8 |
| Goals: Analyze / My Jobs / Career Insights are quiet links, not primary nav | Tasks 1, 2, 5 |
| Goals: `/intelligence` opens Home | Task 9 |
| Goals: signed-out `/` is sign-in | Task 8 |
| Non-goals: no Skill Coach polish | No task edits coach files |
| Non-goals: no Analyze / Jobs / History rebuilds | No task edits those pages |
| Non-goals: no new model, narrative, or ATS feed | Task 7 reads the existing APIs only |
| Non-goals: no token retune, no marketing-site edit, no deletion of the 2026-10-25 spec | Global Constraints |
| Non-goals: in-app landing removed | Task 8 |
| Nav: primary Home, Skill Coach, Resumes, then Account | Task 1 |
| Nav: drop Intelligence, Analyze, My Jobs, Career Insights | Task 1 |
| Nav: kill journey footer | Task 2 |
| Nav: mobile bottom nav mirrors the three primaries | Task 1 (`mobilePrimary` on exactly those three; `MobileBottomNav` already filters) |
| Nav: `getNavTitle` still names the linked routes | Task 1 |
| Auth: redirect `/` to `/sign-in`, one sign-in URL | Task 8 |
| Auth: do not touch proxy or auth layout | Global Constraints |
| Auth: incomplete onboarding sees Home, not the marketing hero | Tasks 7, 8 |
| Auth: sign-out to `/` continues to sign-in | Global Constraints (header unchanged) + Task 8 |
| Layout order: hero, metrics, gaps, next, verified, strip | Task 5 |
| Layout: max 1100px, no second horizontal pad, 16px rhythm | Task 5 (`space-y-4`, `max-w-[1100px]`) |
| Layout: no sticky second CTA | Task 5 |
| Hero score, meaning, one CTA rule | Tasks 3, 5 |
| Metrics: ATS always, salary from primary role, jobs summed, third card only when salary exists, zero jobs allowed, no `/api/career-insights` | Tasks 4, 5, 7 |
| Gaps link to Skill Coach only when coach is on; paused copy stays | Task 5 |
| Next moves capped at 3 | Task 5 (existing `NEXT_STEP_LIMIT`) |
| Verified skills from evidence `kind: "verified"` | Tasks 4, 5, 7 |
| Secondary strip visible in the empty state | Task 5 |
| `#path` and `#pay` under the strip; no academics, targets, or full skill list on Home | Tasks 6, 7 |
| Data order: career profile, then intelligence report; ATS from `/api/profile` | Tasks 7, 8 |
| Empty copy and no match-engine panel | Task 5 |
| Loading skeletons in the six-region order; not `DashboardSkeleton`; never "Synthesizing" | Tasks 7, 8 |
| Profile error blocks the board; report error keeps editors; no raw API strings | Task 7 |
| Coach off: gaps remain, CTA follows rule 2 or 3 | Tasks 3, 5 |
| Density: tokens, hairline, no content-card shadow, radii, one filled primary | Task 5 and the pay `Card` override in Task 6 |
| Retire `UserDashboard` | Task 8 |
| Extend insights and `selectIntelligencePrimaryCta` | Tasks 3, 5 |
| Update app-nav tests | Task 1 |
| Do not change `recommendNextSteps` hrefs | Task 9 re-runs that test |
| Success: Skill Coach chat unchanged | No coach task |

## Self-review

- Placeholder scan: no TBD, TODO, or tests that omit their source. Task 7 inlines the profile and report fixtures the view test renders.
- Types: `IntelligencePrimaryCta.kind` includes `"analyze"` from Task 3 onward. `HomeBoardView` status strings match Task 7 tests. `APP_NAV_LINKED` is produced in Task 1 and consumed in Task 5. `verifiedSkillNames` is produced in Task 4 and consumed in Task 7.
- `selectIntelligencePrimaryCta` now requires `score` and `nextSteps`. Every current caller passes a full `IntelligenceReport` (`IntelligenceInsights` and the unit test).
- Vitest does not appear in this plan. Skill Coach files do not appear in any task's file list.
