# Zaprill

Career app for resume analysis, Indian job matching, and an AI resume editor. Built with Next.js and pnpm.

## Run locally

Requirements: Node.js 22+, pnpm, and a `.env.local` copied from `.env.example`.

```bash
pnpm install
pnpm db:migrate
pnpm db:seed-plans
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Admin HQ is [http://hq.lvh.me:3000](http://hq.lvh.me:3000) for a user whose `role` is `admin`.

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm start
```

AI calls use OpenAI `gpt-5-mini` via `@ai-sdk/openai`. Set `OPENAI_API_KEY` in `.env.local`.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Next.js dev server on port 3000 |
| `pnpm build` / `pnpm start` | Production build and serve |
| `pnpm lint` | Biome |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:migrate` | Apply Drizzle migrations |
| `pnpm db:backfill-log` | Dry-run a migration-log backfill (see `src/db/migrations/README.md`) |
| `pnpm db:seed-plans` | Seed Free and Pro plans |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm test:e2e` | Playwright (app must already be running) |
