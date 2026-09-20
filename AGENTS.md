<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Project Architecture Rules

Follow the guidelines in [.agents/ARCHITECTURE.md](.agents/ARCHITECTURE.md).

- Always separate frontend and backend.
- Prefer API routes over Server Actions for data mutations and heavy fetching.
- Treat this as an application, not a marketing site.

# UI & Design Rules

- **No emojis** in any UI component, page, or text content. This is a professional product. Use Lucide icons instead.
- Do not use emoji literals (`🎉`), HTML entities (`&#x1F4CA;`), or Unicode escapes (`\u{1F4CA}`) in JSX or rendered strings.

# GitHub project tracking

All bugs, todos, and in-progress work go on the Zaprill Project v2 board. Follow **[.agents/GITHUB_PROJECT.md](.agents/GITHUB_PROJECT.md)** in every session:

- File issues on `zaprillcom-cpu/zaprill-app` (not only this test repo).
- Set the board **Status** field (`Todo` / `In progress` / `Done`). A `[Todo]` title prefix is not enough.
- Use `gh` as **sahil1330**. Never `gh auth logout`.
- GitHub MCP can create issues; it cannot move Project v2 Status.
- After every implementation: burn-in, harvest new defects onto the board, do not mark Done without that loop.

# Knowledge Graph

A pre-built knowledge graph of this codebase lives at `graphify-out/graph.json` — 1695 nodes (every function, component, API route, DB table, type) and 4575 edges mapping their relationships.

**Before writing or modifying code**, run `/graphify query "<your question>"` to get context from the graph. This gives ~8x fewer tokens than reading source files directly.

Other useful graph commands:
- `/graphify query "<question>" --dfs` — trace a specific dependency chain
- `/graphify . --update` — re-extract changed files after modifying code
- `/graphify path "ModuleA" "ModuleB"` — shortest dependency path between two concepts

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

# Local / Cloud Agent development

This is a **Next.js 16 App Router** app (`next@16.2.1`). Future agents should treat the notes below as operating context, not a second README.

## Canonical commands

Package manager is **pnpm** (`pnpm-lock.yaml`). Runtime is **Node 22**.

| Task | Command | Notes |
| --- | --- | --- |
| Install | `pnpm install --frozen-lockfile` | Do not rewrite the lockfile during setup. |
| Dev server | `pnpm dev` | Next.js on port **3000**. |
| Lint | `pnpm lint` | Biome (`biome check`). Many pre-existing failures — **not a setup blocker**. |
| E2E | `pnpm test:e2e` | Lives in `e2e/`. There is no unit-test script. |

Do not treat a red `pnpm lint` as a broken environment.

## Cloud Agent environment (DB-managed)

This repo does **not** use a committed `.cursor/environment.json`. The Cloud Agent environment is **DB-managed** (Cursor dashboard / Environment panel). Editing files in the repo does not change the saved environment; the dashboard config is authoritative.

- Secrets are injected as **process env** from the Environment panel. They are not committed.
- Next.js, drizzle-kit, and several `src/scripts/*` load **`.env.local`**, not only process env. The environment **start** script should write a gitignored `.env.local` from those injected secrets on each boot.
- `.gitignore` matches `.env*`. **Never commit** `.env`, `.env.local`, or any `.env*` file.
- `install` should stay idempotent (deps from the lockfile). `start` should materialize `.env.local` and reconcile runtime. `pnpm dev` belongs in `terminals` (or a start supervisor that then exits), not in `install`.

## Required vs optional secrets

Ask for **these app secrets** if a new Cloud Agent is missing them. Do **not** ask for a demo login instead.

Required (app will not boot or will crash on import without these):

- `DATABASE_URL` — Neon **pooled** connection string
- `BETTER_AUTH_SECRET` — 32+ character random string
- `RESEND_API_KEY` — real Resend key, or `re_placeholder` so `src/lib/emails/sendMail.ts` can construct `new Resend(...)` at module load

Optional (feature-gated; email/password auth works without Google):

- `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET`
- `OPENAI_API_KEY`
- `ADZUNA_APP_ID` / `ADZUNA_APP_KEY`
- `CASHFREE_CLIENT_ID` / `CASHFREE_CLIENT_SECRET`
- `NEXT_PUBLIC_APP_URL` — defaults to `http://localhost:3000` in `src/lib/auth-client.ts`

**Not required:** `DEMO_EMAIL` and `DEMO_PASSWORD`. They are only Playwright fallbacks in `e2e/ux-audit/auth.setup.ts` (hardcoded demo defaults if unset). **Never block environment setup on them.**

Do not put secret **values** (passwords inside `DATABASE_URL`, API keys) in this file or in chat.

## Neon: use the development branch

Prefer the Neon **development** branch, not production. The pooled hostname is:

`ep-fragrant-unit-a1hitczr-pooler.ap-southeast-1.aws.neon.tech`

If `DATABASE_URL` points at a different host, you are probably on the wrong branch.

## Isolated test user (already on that branch)

| Field | Value |
| --- | --- |
| Email | `cloud-agent@zaprill.local` |
| Password | `CloudAgent123` |
| Email verified | yes |
| Auth provider | email/password (`credential`) |

Better Auth email/password accounts use `account.provider_id = 'credential'`, **not** `'email'`. The older `src/scripts/create-test-user.ts` update path still filters on `"email"` and will miss this user.

This test user **must** have a `user_profile` row. `src/app/page.tsx` keeps rendering `DashboardSkeleton` forever when `session` is set but `/api/profile` returns no `profile` (`if (session && (!profile || isFetchingProfile))`). Seed `onboarding_status` as `not_started` so the home page reaches the logged-in onboarding CTA instead of an infinite skeleton.

## Hello-world check (after `pnpm dev`)

1. `GET /` — marketing/home renders.
2. `GET /sign-in` — sign-in page renders.
3. `POST /api/auth/sign-in/email` with `{ "email": "cloud-agent@zaprill.local", "password": "CloudAgent123", "rememberMe": true }` — session cookie is set.

Then open `/` authenticated and confirm you see the onboarding CTA, not a stuck skeleton.

## Architecture reminders (do not regress)

- Prefer **API routes** over Server Actions for mutations and heavy fetching (see `.agents/ARCHITECTURE.md`).
- **No emojis** in UI, pages, or rendered copy — Lucide icons only.
- Before codebase/architecture questions, read `graphify-out/GRAPH_REPORT.md` (and `graphify-out/wiki/index.md` if present). Query the graph instead of grepping first.
