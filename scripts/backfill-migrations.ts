/**
 * Backfill drizzle.__drizzle_migrations for migrations whose schema effects already
 * exist (applied via drizzle-kit push / by hand) so `drizzle-kit migrate` does not re-run them.
 *
 * Usage:
 *   tsx scripts/backfill-migrations.ts --url-env DATABASE_URL --expect-endpoint ep-xxxx \
 *       --from 0005 --through 0015 [--apply] [--backup path.json]
 *
 * - Refuses unless the URL host contains --expect-endpoint AND the server's neon.endpoint_id matches it.
 * - Dry-run by default; --apply writes. Never prints the URL.
 * - Verifies every CREATE TABLE / ADD COLUMN / CREATE TYPE / enum ADD VALUE / CREATE INDEX in the range
 *   exists (skipping tables dropped by a later migration). Any gap => abort, nothing written.
 * - Hash = sha256(full .sql file contents), created_at = journal `when` (same as drizzle-orm migrator).
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

const args = process.argv.slice(2);
const arg = (k: string) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const flag = (k: string) => args.includes(`--${k}`);
const die = (m: string): never => {
  console.error(`ABORT: ${m}`);
  process.exit(1);
};

const urlEnv = arg("url-env") ?? die("--url-env <ENV_VAR_NAME> required");
const url = process.env[urlEnv] ?? die(`env ${urlEnv} is empty`);
const expect = arg("expect-endpoint") ?? die("--expect-endpoint required");
const from = arg("from") ?? die("--from required (e.g. 0005)");
const through = arg("through") ?? die("--through required (e.g. 0015)");
const apply = flag("apply");
const dir = arg("dir") ?? "src/db/migrations";

const host = new URL(url).hostname;
if (!host.includes(expect)) die(`URL host does not contain ${expect}`);

const sql = neon(url);
const q = (t: string, p: unknown[] = []) =>
  sql.query(t, p) as Promise<Record<string, unknown>[]>;

const journal = JSON.parse(
  readFileSync(join(dir, "meta/_journal.json"), "utf8"),
).entries as { tag: string; when: number }[];
const all = journal.map((e) => ({
  ...e,
  query: readFileSync(join(dir, `${e.tag}.sql`), "utf8"),
}));
const range = all.filter(
  (e) => e.tag.slice(0, 4) >= from && e.tag.slice(0, 4) <= through,
);
if (!range.length) die("no migrations in range");

const droppedLater = (tag: string, table: string) =>
  all.some(
    (e) =>
      e.tag > tag &&
      new RegExp(`DROP TABLE (IF EXISTS )?"${table}"`, "i").test(e.query),
  );

async function main() {
  const [{ ep }] = await q(
    "select current_setting('neon.endpoint_id', true) ep",
  );
  if (ep !== expect) die(`server endpoint ${ep} != ${expect}`);
  const [{ br }] = await q("select current_setting('neon.branch_id', true) br");
  console.log(
    `target endpoint=${ep} branch=${br} mode=${apply ? "APPLY" : "dry-run"}`,
  );

  const rows = await q(
    "select id, hash, created_at from drizzle.__drizzle_migrations order by created_at",
  );
  const backup = arg("backup");
  if (backup) {
    writeFileSync(
      backup,
      JSON.stringify(
        { endpoint: ep, branch: br, at: new Date().toISOString(), rows },
        null,
        2,
      ),
    );
    console.log(`backup: ${rows.length} rows -> ${backup}`);
  }
  const have = new Set(rows.map((r) => r.hash));
  const last = Math.max(0, ...rows.map((r) => Number(r.created_at)));

  const tables = new Set(
    (
      await q(
        "select table_name t from information_schema.tables where table_schema='public'",
      )
    ).map((r) => r.t),
  );
  const cols = new Set(
    (
      await q(
        "select table_name||'.'||column_name c from information_schema.columns where table_schema='public'",
      )
    ).map((r) => r.c),
  );
  const types = new Set(
    (
      await q(
        "select typname t from pg_type t join pg_namespace n on n.oid=t.typnamespace where n.nspname='public'",
      )
    ).map((r) => r.t),
  );
  const enums = new Set(
    (
      await q(
        "select t.typname||'.'||e.enumlabel v from pg_enum e join pg_type t on t.oid=e.enumtypid",
      )
    ).map((r) => r.v),
  );
  const idx = new Set(
    (
      await q("select indexname i from pg_indexes where schemaname='public'")
    ).map((r) => r.i),
  );

  const missing: string[] = [];
  for (const m of range) {
    const s = m.query;
    let n = 0;
    for (const [, t] of s.matchAll(
      /CREATE TABLE (?:IF NOT EXISTS )?"(\w+)"/gi,
    )) {
      n++;
      if (!droppedLater(m.tag, t) && !tables.has(t))
        missing.push(`${m.tag}: table ${t}`);
    }
    for (const st of s.split(/;/)) {
      const tm = st.match(/ALTER TABLE "(?:public"\.")?(\w+)"/i);
      if (!tm) continue;
      for (const [, c] of st.matchAll(
        /ADD COLUMN (?:IF NOT EXISTS )?"(\w+)"/gi,
      )) {
        n++;
        if (!droppedLater(m.tag, tm[1]) && !cols.has(`${tm[1]}.${c}`))
          missing.push(`${m.tag}: column ${tm[1]}.${c}`);
      }
    }
    for (const [, t] of s.matchAll(/CREATE TYPE "public"\."(\w+)"/gi)) {
      n++;
      if (!types.has(t)) missing.push(`${m.tag}: type ${t}`);
    }
    for (const [, t, v] of s.matchAll(
      /ALTER TYPE "public"\."(\w+)" ADD VALUE '([^']+)'/gi,
    )) {
      n++;
      if (!enums.has(`${t}.${v}`)) missing.push(`${m.tag}: enum ${t}.${v}`);
    }
    for (const [, i, t] of s.matchAll(
      /CREATE (?:UNIQUE )?INDEX (?:IF NOT EXISTS )?"(\w+)" ON "(\w+)"/gi,
    )) {
      n++;
      if (!droppedLater(m.tag, t) && !idx.has(i))
        missing.push(`${m.tag}: index ${i}`);
    }
    console.log(`${m.tag}: ${n} objects checked`);
  }
  if (missing.length)
    die(`schema effects missing, not backfilling:\n  ${missing.join("\n  ")}`);

  const todo = range
    .map((m) => ({
      tag: m.tag,
      when: m.when,
      hash: createHash("sha256").update(m.query).digest("hex"),
    }))
    .filter((m) => !have.has(m.hash));
  for (const m of todo)
    if (m.when <= last)
      die(
        `${m.tag} when=${m.when} <= last applied ${last}; refusing out-of-order insert`,
      );
  console.log(`to backfill: ${todo.map((m) => m.tag).join(", ") || "(none)"}`);
  if (!apply) return console.log("dry-run: nothing written (pass --apply)");
  await sql.transaction(
    todo.map(
      (m) =>
        sql`insert into drizzle.__drizzle_migrations (hash, created_at) values (${m.hash}, ${m.when})`,
    ),
  );
  console.log(`inserted ${todo.length} rows`);
}
main().catch((e) => die(e.message));
