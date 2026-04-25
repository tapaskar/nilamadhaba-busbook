/**
 * GET  /api/admin/cms/sections?page=home
 *      List sections of a page (default 'home') with their blocks
 *      embedded, ordered by position.
 *
 * POST /api/admin/cms/sections
 *      Body: { page, type, settings? }
 *      Creates a new section with default settings from the schema
 *      registry and appends to the bottom of the page.
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { sql } from "@/lib/db";
import { defaultSettings, findSectionDef } from "@/lib/cms-schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const g = await requireAdmin();
  if ("error" in g) return g.error;

  const url = new URL(req.url);
  const page = url.searchParams.get("page") ?? "home";

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const sections = (await db`
    SELECT id, page, type, position, settings, is_visible, updated_at, updated_by
    FROM cms_sections
    WHERE page = ${page}
    ORDER BY position
  `) as unknown as Array<{ id: string; type: string; position: number; settings: unknown; is_visible: boolean }>;

  if (sections.length === 0) {
    return NextResponse.json({ sections: [] });
  }

  const sectionIds = sections.map((s) => s.id);
  const blocks = (await db`
    SELECT id, section_id, type, position, settings, is_visible
    FROM cms_blocks
    WHERE section_id = ANY(${sectionIds})
    ORDER BY position
  `) as unknown as Array<{ id: string; section_id: string; type: string; position: number; settings: unknown; is_visible: boolean }>;

  const blocksBySection = new Map<string, typeof blocks>();
  for (const b of blocks) {
    if (!blocksBySection.has(b.section_id)) blocksBySection.set(b.section_id, []);
    blocksBySection.get(b.section_id)!.push(b);
  }

  const enriched = sections.map((s) => ({
    ...s,
    blocks: blocksBySection.get(s.id) ?? [],
  }));

  return NextResponse.json({ sections: enriched });
}

export async function POST(req: Request) {
  const g = await requireAdmin();
  if ("error" in g) return g.error;
  const me = g.admin;

  const body = (await req.json().catch(() => ({}))) as {
    page?: string;
    type?: string;
    settings?: Record<string, unknown>;
  };

  const page = (body.page ?? "home").trim();
  const type = body.type?.trim();
  if (!type) return NextResponse.json({ error: "type is required" }, { status: 400 });

  const def = findSectionDef(type);
  if (!def) {
    return NextResponse.json({ error: `Unknown section type: ${type}` }, { status: 400 });
  }

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  if (def.singular) {
    const existing = (await db`
      SELECT 1 FROM cms_sections WHERE page = ${page} AND type = ${type} LIMIT 1
    `) as unknown as Array<unknown>;
    if (existing.length > 0) {
      return NextResponse.json(
        { error: `${def.label} can only appear once per page` },
        { status: 409 },
      );
    }
  }

  const settings = { ...defaultSettings(def.settings), ...(body.settings ?? {}) };

  // Append to bottom (last position + 10)
  const posRows = (await db`
    SELECT COALESCE(MAX(position), 0) AS max_pos
    FROM cms_sections WHERE page = ${page}
  `) as unknown as Array<{ max_pos: number }>;
  const nextPos = (posRows[0]?.max_pos ?? 0) + 10;

  const rows = (await db`
    INSERT INTO cms_sections (page, type, position, settings, is_visible, updated_by, updated_at)
    VALUES (${page}, ${type}, ${nextPos}, ${JSON.stringify(settings)}::jsonb, true, ${me.email}, now())
    RETURNING id, page, type, position, settings, is_visible
  `) as unknown as Array<{ id: string }>;

  return NextResponse.json({ ok: true, section: rows[0] });
}
