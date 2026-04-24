/**
 * POST /api/admin/change-password
 * Body: { currentPassword: string, newPassword: string }
 *
 * Verifies the current password, hashes + writes the new one, and
 * deletes ALL OTHER sessions for the admin (current session stays
 * valid so the user isn't booted from the page they just used).
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  getAdminFromToken,
  hashPassword,
  verifyPassword,
} from "@/lib/admin-auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Both current and new passwords are required" },
      { status: 400 },
    );
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters" },
      { status: 400 },
    );
  }
  if (newPassword === currentPassword) {
    return NextResponse.json(
      { error: "New password must differ from the current one" },
      { status: 400 },
    );
  }

  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const admin = await getAdminFromToken(token);
  if (!admin || !token) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const db = sql();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  // Fetch current hash
  const rows = (await db`
    SELECT password_hash FROM admin_users WHERE id = ${admin.id} LIMIT 1
  `) as unknown as { password_hash: string }[];
  if (rows.length === 0) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  const ok = await verifyPassword(currentPassword, rows[0].password_hash);
  if (!ok) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 401 },
    );
  }

  const newHash = await hashPassword(newPassword);
  await db`
    UPDATE admin_users
    SET password_hash = ${newHash}
    WHERE id = ${admin.id}
  `;

  // Boot every other session — current one stays so the user keeps working
  await db`
    DELETE FROM admin_sessions
    WHERE admin_id = ${admin.id}
      AND token <> ${token}
  `;

  return NextResponse.json({ ok: true });
}
