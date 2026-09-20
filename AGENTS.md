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
