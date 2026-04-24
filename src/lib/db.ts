/**
 * Neon Postgres client (serverless-HTTP driver).
 *
 * Single tagged-template SQL helper. Works in Node.js and Edge runtimes.
 * Uses HTTPS, so no connection pooling required for serverless.
 *
 * Env:
 *   DATABASE_URL — Neon connection string (provided by Vercel ⇄ Neon integration)
 */

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

export function hasDatabase(): boolean {
  return !!DATABASE_URL && DATABASE_URL.length > 10;
}

let _sql: NeonQueryFunction<false, false> | null = null;

/**
 * Returns the Neon SQL tag-function, or null when DATABASE_URL is not set
 * (the app runs in demo mode with mock data in that case).
 */
export function sql(): NeonQueryFunction<false, false> | null {
  if (!hasDatabase()) return null;
  if (!_sql) {
    _sql = neon(DATABASE_URL!);
  }
  return _sql;
}
