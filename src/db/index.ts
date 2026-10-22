import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/** Loopback URLs are throwaway Postgres. Neon hosts stay on the HTTP driver. */
function isLoopbackPostgres(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

type AppDatabase = ReturnType<typeof drizzleNeon<typeof schema>>;

function createDb(): AppDatabase {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  if (isLoopbackPostgres(url)) {
    const pool = new Pool({ connectionString: url });
    return drizzlePg(pool, { schema }) as unknown as AppDatabase;
  }
  return drizzleNeon(neon(url), { schema });
}

const db = createDb();

export default db;
export { schema };
