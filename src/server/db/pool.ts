import type { Pool, PoolOptions } from "mysql2/promise";

let pool: Pool | null = null;

const DB_HOST = process.env.MYSQL_HOST || "177.153.20.134";
const DB_PORT = process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306;
const DB_USER = process.env.MYSQL_USER || "root";
const DB_PASSWORD =
  process.env.MYSQL_PASSWORD ||
  process.env.MYSQL_ROOT_PASSWORD ||
  "bxCKqXSMvBRGW3br2Ob9e4tCPJoEN3YmXm7mzeC6wuuEVtjlQ6c0QCJvJdNxU1te";
const DATABASE_NAME = process.env.MYSQL_DATABASE || "siteapp_hml";

if (!process.env.MYSQL_DATABASE) {
  console.warn('[DB] Env MYSQL_DATABASE not set. Using default "agenda_db"');
}
if (!process.env.MYSQL_HOST) {
  console.warn('[DB] Env MYSQL_HOST not set. Using default host');
}
if (!process.env.MYSQL_USER) {
  console.warn('[DB] Env MYSQL_USER not set. Using default user');
}
if (!process.env.MYSQL_PASSWORD && !process.env.MYSQL_ROOT_PASSWORD) {
  console.warn('[DB] Env MYSQL_PASSWORD/MYSQL_ROOT_PASSWORD not set. Using default password');
}

function escapeId(id: string) {
  return "`" + id.replace(/`/g, "``") + "`";
}

const DB_CONFIG: PoolOptions = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DATABASE_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10_000,
};

export function isDBConfigured() {
  return true;
}

export async function getPool(): Promise<Pool> {
  if (!isDBConfigured()) {
    throw new Error("Database not configured.");
  }
  if (pool) return pool;
  const mysql = await import("mysql2/promise");
  console.log(`[DB] Connecting to ${DB_USER}@${DB_HOST}:${DB_PORT} / ${DATABASE_NAME}`);

  // Ensure database exists before creating the pool bound to it
  const maxAttempts = 10;
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  let lastErr: any = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const conn = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        port: DB_PORT,
        connectTimeout: 10_000,
      });
      await conn.query(
        `CREATE DATABASE IF NOT EXISTS ${escapeId(DATABASE_NAME)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await conn.end();
      lastErr = null;
      break;
    } catch (e: any) {
      lastErr = e;
      const code = e?.code || e?.errno || e?.message;
      console.warn(`[DB] Ensure DB attempt ${attempt}/${maxAttempts} failed:`, code);
      if (attempt < maxAttempts) await delay(1_500);
    }
  }
  if (lastErr) {
    console.warn("[DB] Could not ensure database exists after retries:", lastErr);
  }

  pool = mysql.createPool(DB_CONFIG);
  // Optional warm-up to surface connection issues early
  try {
    const c = await pool.getConnection();
    await c.ping();
    c.release();
  } catch (e) {
    console.warn("[DB] Pool warm-up failed:", e);
  }
  return pool;
}
