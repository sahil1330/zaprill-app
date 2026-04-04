import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next.js, so we load .env.local manually
dotenv.config({ path: ".env.local" });

// Use the direct (non-pooler) Neon endpoint for drizzle-kit migrations.
// The pooler URL has "-pooler" in the hostname; we strip it and remove
// channel_binding which is only needed for the Neon HTTP driver.
const rawUrl = process.env.DATABASE_URL!;
const directUrl = rawUrl
  .replace("-pooler.", ".")
  .replace(/[&?]channel_binding=require/g, "");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: directUrl,
  },
  verbose: true,
  strict: true,
});
