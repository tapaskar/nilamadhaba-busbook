/**
 * POST /api/admin/cms/sections/[id]/blocks
 *      Body: { type, settings? }
 *      Appends a new block to the section.
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { sql } from "@/lib/db";
import { defaultSettings, findBlockDef } from "@/lib/cms-schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const g = await requireAdmin();
  if ("error" in g) return g.error;

  const { id: sectionId } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    type?: string;
    settings?: Record<string, unknown>;
  };

  const blockType = body.type?.trim();
  if (!blockType) return NextResponse.json({ error: "type required" }, { status: 400 });

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  // Look up section type to validate
  const sectionRows = (await db`
    SELECT type FROM cms_sections WHERE id = ${sectionId} LIMIT 1
  `) as unknown as Array<{ type: string }>;
  if (sectionRows.length === 0) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }
  const sectionType = sectionRows[0].type;

  const def = findBlockDef(sectionType, blockType);
  if (!def) {
    return NextResponse.json(
      { error: `Block type ${blockType} not allowed in ${sectionType}` },
      { status: 400 },
    );
  }

  // Check max
  const maxBlocks = def.max ?? 50;
  const countRows = (await db`
    SELECT COUNT(*)::integer AS n FROM cms_blocks WHERE section_id = ${sectionId} AND type = ${blockType}
  `) as unknown as Array<{ n: number }>;
  if ((countRows[0]?.n ?? 0) >= maxBlocks) {
    return NextResponse.json(
      { error: `Maximum ${maxBlocks} ${def.label} blocks reached` },
      { status: 409 },
    );
  }

  const settings = { ...defaultSettings(def.settings), ...(body.settings ?? {}) };

  const posRows = (await db`
    SELECT COALESCE(MAX(position), 0) AS max_pos FROM cms_blocks WHERE section_id = ${sectionId}
  `) as unknown as Array<{ max_pos: number }>;
  const nextPos = (posRows[0]?.max_pos ?? 0) + 10;

  const rows = (await db`
    INSERT INTO cms_blocks (section_id, type, position, settings, is_visible)
    VALUES (${sectionId}, ${blockType}, ${nextPos}, ${JSON.stringify(settings)}::jsonb, true)
    RETURNING id, section_id, type, position, settings, is_visible
  `) as unknown as Array<{ id: string }>;

  return NextResponse.json({ ok: true, block: rows[0] });
}
