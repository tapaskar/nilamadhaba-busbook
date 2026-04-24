/**
 * PATCH /api/admin/users/[id]
 * Body: { isActive?: boolean, fullName?: string }
 *
 * Toggle active status or update name. An admin cannot deactivate
 * themselves (would lock everyone out if they're the only admin).
 *
 * DELETE /api/admin/users/[id]
 * Soft-delete by setting is_active=false. Same self-deactivation guard.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, getAdminFromToken } from "@/lib/admin-auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function requireAdmin() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return getAdminFromToken(token);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const me = await requireAdmin();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    isActive?: boolean;
    fullName?: string;
  };

  if (id === me.id && body.isActive === false) {
    return NextResponse.json(
      { error: "You cannot deactivate yourself" },
      { status: 400 },
    );
  }

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  // Build dynamic update — only set fields the caller passed
  const updates: string[] = [];
  if (body.isActive !== undefined) updates.push("is_active");
  if (body.fullName !== undefined) updates.push("full_name");
  if (updates.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  if (body.isActive !== undefined && body.fullName !== undefined) {
    await db`
      UPDATE admin_users
      SET is_active = ${body.isActive}, full_name = ${body.fullName}
      WHERE id = ${id}
    `;
  } else if (body.isActive !== undefined) {
    await db`
      UPDATE admin_users
      SET is_active = ${body.isActive}
      WHERE id = ${id}
    `;
    if (body.isActive === false) {
      // Boot all sessions for the deactivated admin
      await db`DELETE FROM admin_sessions WHERE admin_id = ${id}`;
    }
  } else {
    await db`
      UPDATE admin_users
      SET full_name = ${body.fullName ?? null}
      WHERE id = ${id}
    `;
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const me = await requireAdmin();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  if (id === me.id) {
    return NextResponse.json(
      { error: "You cannot remove yourself" },
      { status: 400 },
    );
  }

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  await db`UPDATE admin_users SET is_active = false WHERE id = ${id}`;
  await db`DELETE FROM admin_sessions WHERE admin_id = ${id}`;

  return NextResponse.json({ ok: true });
}
