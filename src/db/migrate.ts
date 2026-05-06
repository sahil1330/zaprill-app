/**
 * Custom migration runner using @neondatabase/serverless.
 * Run with: pnpm db:migrate
 *
 * Why a custom script instead of `drizzle-kit push`?
 * drizzle-kit uses the `pg` driver which has SSL/channel_binding
 * issues with Neon. The @neondatabase/serverless driver handles it correctly.
 */

import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: ".env.local" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

const migrationsFolder = path.resolve(__dirname, "migrations");

async function runMigrations() {
  console.log("🚀 Running migrations from:", migrationsFolder);
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder });
  console.log("✅ Migrations applied successfully!");
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
