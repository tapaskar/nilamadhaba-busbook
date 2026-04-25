/**
 * GET  /api/admin/settings — return all key-value settings as a flat object
 * PUT  /api/admin/settings — body { key: value, … }, upserts each
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_KEYS = new Set([
  "support_phone",
  "support_email",
  "support_whatsapp",
  "support_hours",
  "booking_window_days",
  "cancel_free_hours",
]);

export async function GET() {
  const g = await requireAdmin();
  if ("error" in g) return g.error;

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const rows = (await db`SELECT key, value FROM app_settings`) as unknown as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  return NextResponse.json({ settings });
}

export async function PUT(req: Request) {
  const g = await requireAdmin();
  if ("error" in g) return g.error;
  const me = g.admin;

  const body = (await req.json().catch(() => ({}))) as Record<string, string>;
  const updates: [string, string][] = [];
  for (const [k, v] of Object.entries(body)) {
    if (!ALLOWED_KEYS.has(k)) continue;
    if (typeof v !== "string") continue;
    updates.push([k, v.trim()]);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "No valid keys provided" }, { status: 400 });
  }

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  for (const [k, v] of updates) {
    await db`
      INSERT INTO app_settings (key, value, updated_by, updated_at)
      VALUES (${k}, ${v}, ${me.email}, now())
      ON CONFLICT (key) DO UPDATE
        SET value = excluded.value,
            updated_by = excluded.updated_by,
            updated_at = excluded.updated_at
    `;
  }

  return NextResponse.json({ ok: true, updated: updates.length });
}
