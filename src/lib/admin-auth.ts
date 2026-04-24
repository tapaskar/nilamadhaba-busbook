/**
 * Admin authentication — password + HTTP-only-cookie session tokens.
 *
 * Storage: admin_users + admin_sessions tables in Neon.
 * Hashing: bcryptjs (10 rounds — pure JS, runs in any runtime).
 * Cookie:  __nm_admin_session, HTTP-only, Secure, SameSite=Lax,
 *          30-day rolling expiry.
 *
 * Server-side only — never import in client components.
 */

import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { sql } from "./db";

export const SESSION_COOKIE = "__nm_admin_session";
export const SESSION_DAYS = 30;

export type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
};

// ─── Hashing ──────────────────────────────────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ─── User lookup ──────────────────────────────────────────────────────────

export async function findAdminByEmail(
  email: string,
): Promise<(AdminUser & { password_hash: string }) | null> {
  const db = sql();
  if (!db) return null;
  const rows = (await db`
    SELECT id, email, password_hash, full_name, is_active
    FROM admin_users
    WHERE lower(email) = lower(${email})
    LIMIT 1
  `) as unknown as (AdminUser & { password_hash: string })[];
  if (rows.length === 0) return null;
  if (!rows[0].is_active) return null;
  return rows[0];
}

// ─── Sessions ─────────────────────────────────────────────────────────────

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createSession(
  adminId: string,
  meta: { userAgent?: string; ip?: string } = {},
): Promise<string> {
  const db = sql();
  if (!db) throw new Error("Database not configured");
  const token = generateSessionToken();
  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  await db`
    INSERT INTO admin_sessions (admin_id, token, user_agent, ip_address, expires_at)
    VALUES (${adminId}, ${token}, ${meta.userAgent ?? null}, ${meta.ip ?? null}, ${expiresAt})
  `;
  await db`UPDATE admin_users SET last_login_at = now() WHERE id = ${adminId}`;
  return token;
}

export async function deleteSession(token: string): Promise<void> {
  const db = sql();
  if (!db) return;
  await db`DELETE FROM admin_sessions WHERE token = ${token}`;
}

/**
 * Look up the admin behind a session token. Returns null when:
 *   - Token is missing or empty
 *   - Token doesn't exist in the DB
 *   - Token has expired
 *   - The associated admin user is deactivated
 */
export async function getAdminFromToken(
  token: string | null | undefined,
): Promise<AdminUser | null> {
  if (!token) return null;
  const db = sql();
  if (!db) return null;
  const rows = (await db`
    SELECT u.id, u.email, u.full_name, u.is_active
    FROM admin_sessions s
    JOIN admin_users u ON u.id = s.admin_id
    WHERE s.token = ${token}
      AND s.expires_at > now()
      AND u.is_active = true
    LIMIT 1
  `) as unknown as AdminUser[];
  return rows[0] ?? null;
}
