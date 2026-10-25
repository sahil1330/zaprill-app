# Notion Warm Paper Tokens Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Remap Zaprill’s shadcn CSS variables in `src/app/globals.css` from purple brand to Notion warm-paper tokens, and land the approved design spec + this plan under `docs/superpowers/`.

**Architecture:** Single-source token change in `globals.css` (`:root` + `.dark`). No layout or component redesign. Gradients and glow that still reference purple must be retuned to Notion blue / paper neutrals.

**Tech Stack:** Next.js app, Tailwind v4 `@theme`, shadcn CSS variables, Biome CI.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-10-25-notion-theme-tokens-design.md` (create from attached upload if missing)
- Primary CTA / ring / sidebar-primary: Notion Blue `#0075de` → `oklch(0.568 0.182 254.3)` (light); slightly brighter blue in dark
- Page background: Paper `#f6f5f4` → `oklch(0.971 0.002 67.8)` — never pure white page
- Cards: white; borders warm hairline (approx `oklch(0.92 0.004 70)` or `oklch(0 0 0 / 8%)`)
- Achievement: Marigold `#ffb110` → `oklch(0.814 0.168 76.4)`
- Charts: blue → sky → marigold → coral → midnight (no purple)
- Radius: set `--radius` so cards ≈ 12px and buttons ≈ 8px (e.g. `--radius: 0.75rem` with existing calc scale, or document the chosen base)
- Fonts: do **not** change Satoshi / Inter wiring
- Do **not** redesign layouts, marketing site, or add theme feature flags
- PR author account: sahil1330; open a PR against `main`
- Out of scope hardcoded purple hex elsewhere: only fix trivial leftovers in the same PR if grep finds obvious purple brand literals; do not drive-by refactor

## File map

| File | Responsibility |
| --- | --- |
| `docs/superpowers/specs/2026-10-25-notion-theme-tokens-design.md` | Approved design (create) |
| `docs/superpowers/plans/2026-10-25-notion-theme-tokens.md` | This plan (create) |
| `src/app/globals.css` | Remap `:root`, `.dark`, gradients, shadow-glow |

---

### Task 1: Add design docs

**Files:**
- Create: `docs/superpowers/specs/2026-10-25-notion-theme-tokens-design.md`
- Create: `docs/superpowers/plans/2026-10-25-notion-theme-tokens.md`

- [x] **Step 1:** Create directories `docs/superpowers/specs` and `docs/superpowers/plans` if missing.
- [x] **Step 2:** Copy attached uploads into those paths (or recreate from prompt if uploads missing). Mark spec Status as `Approved`.
- [x] **Step 3:** Commit `docs: add Notion warm-paper tokens design and plan`

---

### Task 2: Remap light + dark tokens in globals.css

**Files:**
- Modify: `src/app/globals.css` (`:root` from ~line 69, `.dark` from ~line 168, gradients/glow)

**Target light values (use these oklch numbers unless contrast fails WCAG on primary buttons — then nudge L only):**

```css
:root {
  --radius: 0.75rem; /* cards ~12px via --radius-xl / named radii — verify against Notion 12px cards / 8px buttons */

  --background: oklch(0.971 0.002 67.8); /* paper */
  --foreground: oklch(0.178 0 0); /* charcoal-ish */

  --card: oklch(1 0 0);
  --card-foreground: oklch(0.178 0 0);

  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.178 0 0);

  /* Brand — Notion Blue */
  --primary: oklch(0.568 0.182 254.3);
  --primary-foreground: oklch(1 0 0);

  --secondary: oklch(0.958 0.020 243.4); /* sky tint */
  --secondary-foreground: oklch(0.45 0.12 254);

  --muted: oklch(0.96 0.005 70);
  --muted-foreground: oklch(0.562 0 0); /* stone */

  --accent: oklch(0.958 0.020 243.4);
  --accent-foreground: oklch(0.45 0.12 254);

  --destructive: oklch(0.651 0.213 30.9); /* coral-aligned */
  --destructive-foreground: oklch(1 0 0);

  --border: oklch(0 0 0 / 8%);
  --input: oklch(0 0 0 / 8%);
  --ring: oklch(0.568 0.182 254.3);

  --achievement: oklch(0.814 0.168 76.4);
  --achievement-foreground: oklch(0.28 0.06 70);
  --achievement-muted: oklch(0.95 0.05 80);

  /* score-* keep semantic hues; ensure not purple-tinted */
  /* charts */
  --chart-1: oklch(0.568 0.182 254.3); /* blue */
  --chart-2: oklch(0.729 0.123 246.7); /* sky */
  --chart-3: oklch(0.814 0.168 76.4); /* marigold */
  --chart-4: oklch(0.651 0.213 30.9); /* coral */
  --chart-5: oklch(0.180 0.094 265.8); /* midnight */

  --sidebar: oklch(0.971 0.002 67.8);
  --sidebar-foreground: oklch(0.178 0 0);
  --sidebar-primary: oklch(0.568 0.182 254.3);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.958 0.020 243.4);
  --sidebar-accent-foreground: oklch(0.45 0.12 254);
  --sidebar-border: oklch(0 0 0 / 8%);
  --sidebar-ring: oklch(0.568 0.182 254.3);

  --surface-1: oklch(0.985 0.002 70);
  --surface-2: oklch(0.96 0.005 70);
  --surface-3: oklch(0.94 0.01 70);

  /* Retune gradients away from purple → blue / paper */
  --gradient-primary: linear-gradient(135deg, oklch(0.60 0.18 254), oklch(0.50 0.16 250));
  --gradient-accent: linear-gradient(135deg, oklch(0.958 0.020 243.4), oklch(0.971 0.002 67.8));
  --gradient-background: linear-gradient(180deg, oklch(1 0 0), oklch(0.971 0.002 67.8));
  --shadow-glow: 0 0 0 1px oklch(0.568 0.182 254.3 / 0.12), 0 12px 40px oklch(0.568 0.182 254.3 / 0.08);
}
```

- [x] **Step 1:** Apply light `:root` remaps including gradients / shadow-glow / surfaces / sidebar / charts / achievement / radius.
- [x] **Step 2:** Apply `.dark` remaps: charcoal / near-midnight surfaces, brighter Notion blue primary, marigold achievement, chart series without purple, no purple leftovers in comments.
- [x] **Step 3:** Grep repo for purple brand leftovers (`303.9`, `305.5`, `oklch(0.606 0.266`, `#7c3aed`, `purple`) in CSS/TSX that hardcode the old brand; fix only trivial token-adjacent cases in this PR.
- [x] **Step 4:** Run Biome / existing lint if available (`pnpm` scripts as in repo). Fix issues introduced by this change only.
- [x] **Step 5:** Commit `feat(theme): Notion warm-paper tokens in globals.css`
- [x] **Step 6:** Open PR to `main` summarizing: tokens-first Notion theme; links Refero style; notes follow-on UX phases out of scope.

## Done when

- Spec + plan committed under `docs/superpowers/`
- App no longer uses purple as `--primary` in light or dark
- Paper canvas + Notion blue CTAs via tokens
- PR open for review

## Implementation notes

- `--radius: 0.75rem` (12px). `Card` used `rounded-4xl` (2.6×), which could not be 12px while `Button` (same utility) was 8px. Primitives now use `rounded-lg` (cards) and `rounded-md` (buttons). `--radius-md` is `calc(var(--radius) * 2 / 3)` so buttons are 8px.
- Contrast nudges (lightness only): `--muted-foreground` `0.562` → `0.545` (stone on paper was ~4.2:1); `--destructive` `0.651` → `0.545` so coral text on paper and white on a filled button both clear 4.5:1. Primary stays `oklch(0.568 0.182 254.3)` — white on that fill is ~4.6:1.
- Dark primary is a brighter Notion blue with dark ink foreground so filled buttons and `text-primary` on charcoal both clear 4.5:1. Score hues were already green / blue / amber / red and were left in place.
- Trivial brand leftovers (`text-violet-*`, `text-purple-*`) now use `primary` or `accent` tokens. Resume template hex and third-party brand colors were not touched.
