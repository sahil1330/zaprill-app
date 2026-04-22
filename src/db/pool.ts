/**
 * pg Pool — for transaction-critical DB operations.
 *
 * The primary DB client (`src/db/index.ts`) uses @neondatabase/serverless
 * over HTTP, which doesn't support multi-statement transactions or
 * SELECT ... FOR UPDATE. This pool uses the `pg` package with a direct
 * connection for those cases (e.g., coupon reservation with row-level locking).
 *
 * Only use this where explicit transactions are required.
 */
import { Pool, type PoolClient } from "pg";

// Strip the pooler suffix and channel_binding to use the direct endpoint
// (required for reliable connection with pg package + Neon)
function buildDirectUrl(rawUrl: string): string {
  return rawUrl
    .replace("-pooler.", ".")
    .replace(/[&?]channel_binding=require/g, "");
}

let _pool: Pool | null = null;

export function getPool(): Pool {
  if (!_pool) {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) throw new Error("DATABASE_URL is not set");
    _pool = new Pool({
      connectionString: buildDirectUrl(rawUrl),
      ssl: { rejectUnauthorized: false },
      max: 5, // keep small — this is only for transaction paths
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

    _pool.on("error", (err) => {
      console.error("[pg-pool] Unexpected error:", err);
    });
  }
  return _pool;
}

/**
 * Run a callback inside a serializable transaction.
 * The pool client is acquired, BEGIN is sent, and COMMIT/ROLLBACK
 * is handled automatically.
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
