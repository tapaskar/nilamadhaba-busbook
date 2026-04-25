/**
 * GET /api/cms/page?slug=home
 *
 * Public endpoint — returns visible sections + blocks for a given page,
 * ready for the public site to render.
 *
 * No auth required. If the database isn't configured, returns an empty
 * sections array so the home page falls back to its hardcoded defaults.
 */

import { NextResponse } from "next/server";
import { sql, hasDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") ?? "home";

  if (!hasDatabase()) {
    return NextResponse.json({ slug, sections: [] });
  }

  const db = sql();
  if (!db) return NextResponse.json({ slug, sections: [] });

  try {
    const sections = (await db`
      SELECT id, type, position, settings
      FROM cms_sections
      WHERE page = ${slug} AND is_visible = true
      ORDER BY position
    `) as unknown as Array<{ id: string; type: string; position: number; settings: unknown }>;

    if (sections.length === 0) {
      return NextResponse.json({ slug, sections: [] });
    }

    const blocks = (await db`
      SELECT id, section_id, type, position, settings
      FROM cms_blocks
      WHERE section_id = ANY(${sections.map((s) => s.id)})
        AND is_visible = true
      ORDER BY position
    `) as unknown as Array<{ id: string; section_id: string; type: string; position: number; settings: unknown }>;

    const blocksBySection = new Map<string, typeof blocks>();
    for (const b of blocks) {
      if (!blocksBySection.has(b.section_id)) blocksBySection.set(b.section_id, []);
      blocksBySection.get(b.section_id)!.push(b);
    }

    return NextResponse.json({
      slug,
      sections: sections.map((s) => ({
        id: s.id,
        type: s.type,
        position: s.position,
        settings: s.settings,
        blocks: blocksBySection.get(s.id) ?? [],
      })),
    });
  } catch (e) {
    console.error("[cms/page] failed:", e);
    return NextResponse.json({ slug, sections: [] });
  }
}
