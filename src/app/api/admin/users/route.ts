/**
 * Admin user management — list + create.
 *
 * GET  /api/admin/users
 *   Returns all admin rows ordered newest-first. Caller must be a
 *   signed-in admin (any active admin can manage other admins).
 *
 * POST /api/admin/users
 *   Body: { email, password, fullName? }
 *   Creates a new admin or reactivates one if the email already exists
 *   with is_active=false.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  getAdminFromToken,
  hashPassword,
} from "@/lib/admin-auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function requireAdmin() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return getAdminFromToken(token);
}

export async function GET() {
  const me = await requireAdmin();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const rows = await db`
    SELECT id, email, full_name, is_active, created_at, last_login_at
    FROM admin_users
    ORDER BY created_at DESC
  `;
  return NextResponse.json({ admins: rows, currentId: me.id });
}

export async function POST(req: Request) {
  const me = await requireAdmin();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let body: { email?: string; password?: string; fullName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const fullName = body.fullName?.trim() || null;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 },
    );
  }
  if (!email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const hash = await hashPassword(password);

  const rows = (await db`
    INSERT INTO admin_users (email, password_hash, full_name, is_active)
    VALUES (${email}, ${hash}, ${fullName}, true)
    ON CONFLICT (email) DO UPDATE
      SET password_hash = excluded.password_hash,
          full_name = COALESCE(excluded.full_name, admin_users.full_name),
          is_active = true
    RETURNING id, email, full_name, is_active, created_at, last_login_at
  `) as unknown as { id: string }[];

  return NextResponse.json({ ok: true, admin: rows[0] });
}
