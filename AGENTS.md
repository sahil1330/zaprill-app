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

- Package manager: **pnpm** with `pnpm-lock.yaml`. Node 22 is the verified runtime.
- Install: `pnpm install --frozen-lockfile`
- Dev server: `pnpm dev` (Next.js on port 3000)
- App env file is **`.env.local`** (gitignored). Required:
  - `DATABASE_URL` — Neon pooled connection string
  - `BETTER_AUTH_SECRET` — 32+ character random string
- `RESEND_API_KEY` must be present so `src/lib/emails/sendMail.ts` can load. Use a real Resend key, or `re_placeholder` if you are not sending mail.
- Google login needs `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET`. Email/password works with placeholders.
- Isolated Cloud Agent test user (email verified): `cloud-agent@zaprill.local` / `CloudAgent123`
- Prefer the Neon **development** branch, not production.
- `pnpm lint` currently reports many pre-existing Biome findings; there is no unit-test script. E2E lives in `e2e/` (`pnpm test:e2e`).
