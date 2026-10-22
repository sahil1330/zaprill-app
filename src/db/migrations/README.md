# Migrations

SQL files in this directory are the Drizzle history for the app database. Apply ones that are not yet recorded with `pnpm db:migrate`.

## Backfill the migration log

Use this when a migration's schema changes are already in the database (applied with `drizzle-kit push` or by hand) but `drizzle.__drizzle_migrations` has no row for that file. `drizzle-kit migrate` will try to run the SQL again until the log row exists.

```bash
pnpm db:backfill-log -- --url-env DATABASE_URL --expect-endpoint ep-xxxx --from 0005 --through 0015
```

The script is a dry-run unless you pass `--apply`. It refuses to run without all of these:

- `--url-env` — name of the environment variable that holds the database URL. The URL itself is never printed.
- `--expect-endpoint` — Neon endpoint id. The URL host must contain it, and the server's `neon.endpoint_id` must match.
- `--from` and `--through` — inclusive migration-number bounds, such as `0005` and `0015`.

Optional flags:

- `--backup path.json` — write the current migration-log rows to a file before any insert.
- `--apply` — insert the missing log rows. Without this flag, nothing is written.

Run the dry-run against the Neon development branch and read the output before you point `--apply` at production.
