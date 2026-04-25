/**
 * PATCH  /api/admin/cms/sections/[id]
 *        Body: { settings?: object, position?: number, isVisible?: boolean }
 *
 * DELETE /api/admin/cms/sections/[id]
 *        Cascades to blocks via FK.
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const g = await requireAdmin();
  if ("error" in g) return g.error;
  const me = g.admin;

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    settings?: Record<string, unknown>;
    position?: number;
    isVisible?: boolean;
  };

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  if (body.settings !== undefined) {
    await db`
      UPDATE cms_sections
      SET settings = ${JSON.stringify(body.settings)}::jsonb,
          updated_by = ${me.email},
          updated_at = now()
      WHERE id = ${id}
    `;
  }
  if (body.position !== undefined) {
    await db`UPDATE cms_sections SET position = ${body.position} WHERE id = ${id}`;
  }
  if (body.isVisible !== undefined) {
    await db`UPDATE cms_sections SET is_visible = ${body.isVisible} WHERE id = ${id}`;
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const g = await requireAdmin();
  if ("error" in g) return g.error;
  const { id } = await params;

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  await db`DELETE FROM cms_sections WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
