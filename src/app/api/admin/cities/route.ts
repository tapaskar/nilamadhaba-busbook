/**
 * GET  /api/admin/cities  — list all cities (active first)
 * POST /api/admin/cities  — add new city  { id, name, state }
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const g = await requireAdmin();
  if ("error" in g) return g.error;

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const rows = await db`
    SELECT id, name, state, is_active, created_at
    FROM cities ORDER BY is_active DESC, name
  `;
  return NextResponse.json({ cities: rows });
}

export async function POST(req: Request) {
  const g = await requireAdmin();
  if ("error" in g) return g.error;

  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    name?: string;
    state?: string;
  };

  if (!body.id || !body.name || !body.state) {
    return NextResponse.json({ error: "id, name, state required" }, { status: 400 });
  }
  if (!/^[a-z0-9-]+$/.test(body.id)) {
    return NextResponse.json({ error: "id must be lowercase alphanumeric with dashes" }, { status: 400 });
  }

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  try {
    const rows = (await db`
      INSERT INTO cities (id, name, state, is_active)
      VALUES (${body.id}, ${body.name}, ${body.state}, true)
      RETURNING id, name, state, is_active
    `) as unknown as { id: string }[];
    return NextResponse.json({ ok: true, city: rows[0] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("duplicate")) {
      return NextResponse.json({ error: "City id already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
