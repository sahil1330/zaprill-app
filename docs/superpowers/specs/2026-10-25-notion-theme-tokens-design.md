# Zaprill theme: Notion warm paper (tokens-first)

**Date:** 2026-10-25  
**Status:** Approved  
**Repo:** sahil1330/zaprill-app  
**Refero source:** [Notion — warm paper notebook](https://styles.refero.design/style/2bf4c61f-de10-4614-ba1b-20c0453bd2a9)

## Goal

Replace Zaprill’s purple brand with Notion’s warm-paper system via CSS design tokens only, so the whole app (dashboard, resume, skill coach, mobile) picks up the new look without layout rewrites.

## Non-goals (this phase)

- Dashboard / resume / coach layout or UX redesign
- Marketing website (`zaprill-marketing-website`)
- New components, illustrations, or character marks
- Feature-flag / dual-theme toggle
- Changing font families (keep Satoshi headings + Inter body)

## Approach

**Remap `src/app/globals.css` `:root` and `.dark` shadcn CSS variables** to Notion values (oklch equivalents). Keep semantic score tokens; retune charts and achievement to the Notion accent cast. Adjust `--radius` so cards ≈ 12px and buttons ≈ 8px.

## Token map (light)

| Role | Current | Notion target | Notes |
| --- | --- | --- | --- |
| background | cool lilac-gray | `#f6f5f4` Paper Warmth | Never pure white page |
| foreground | cool near-black | ink / charcoal `#111111` | Hierarchy via alpha where practical |
| card | white | `#ffffff` | Hairline border `rgba(0,0,0,0.08)` |
| primary / ring | purple oklch ~303 | `#0075de` Notion Blue | Only filled CTA color |
| primary-foreground | light purple tint | white | |
| secondary / muted / accent | cool gray | `#e6f3fe` Sky Tint (or warm muted near paper) | Ghost / secondary surfaces |
| muted-foreground | cool gray | `#757575` Stone (warm `#615d59` Graphite for body where needed) | |
| border / input | cool gray | warm hairline ≈ `oklch` of `rgba(0,0,0,0.08)` on paper | |
| destructive | red | keep / align to coral `#f64932` if contrast OK | |
| achievement | amber | `#ffb110` Marigold | Wins / badges |
| achievement-muted | pale amber | soft marigold wash | |
| score-* | green/blue/amber/red washes | keep semantics; retune mid toward sky if purple-tinted | |
| chart-1…5 | purple-led | blue → sky → marigold → coral → midnight `#02093a` | |
| sidebar-* | purple-tinted | paper / white / blue active | Match canvas |
| radius | `0.875rem` (~14px) | base so cards ≈ 12px, buttons ≈ 8px | Notion: cards 12px, buttons 8px, pills full |

oklch references (approx.):

- paper `oklch(0.971 0.002 67.8)`
- blue `oklch(0.568 0.182 254.3)`
- sky tint `oklch(0.958 0.020 243.4)`
- marigold `oklch(0.814 0.168 76.4)`
- coral `oklch(0.651 0.213 30.9)`
- midnight `oklch(0.180 0.094 265.8)`
- graphite `oklch(0.481 0.008 67.6)`

## Dark mode

Retune `.dark` to a restrained dark surface (not a new brand). Prefer charcoal / near-midnight backgrounds with the same Notion Blue primary and marigold achievement — avoid purple leftovers. Do not invent a second accent system.

## Component / chrome rules (token-level only)

- Prefer hairline borders over heavy card shadows where tokens control elevation.
- Primary filled actions use Notion Blue only; secondary uses sky-tint / ghost.
- Do not introduce gradients via tokens.

## Files touched

- `src/app/globals.css` (required)
- Optional tiny follow-ups only if hardcoded purple hex/oklch appears outside tokens (grep + fix in same PR if trivial)

## Verification

- Visual smoke: dashboard, resume builder, skill coach, auth shell — light mode
- Spot-check dark mode once
- No layout regressions required beyond color/radius
- Biome / existing CI green

## Follow-on phases (separate specs)

1. Dashboard UX on warm paper  
2. Resume + floating chat chrome  
3. Skill Coach + mobile density  

## Decision log

- Theme source: Notion warm paper (Refero) — chosen 2026-10-25  
- Rollout: tokens-first — chosen 2026-10-25  
- Implementation path: remap `globals.css` only — approved 2026-10-25  
- Fonts: keep Satoshi + Inter for this phase  
