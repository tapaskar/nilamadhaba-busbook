/**
 * GET /api/admin/layouts — returns the seat-layout presets the admin
 * can pick when creating a new bus.
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { layoutPresets } from "@/lib/seat-layouts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const g = await requireAdmin();
  if ("error" in g) return g.error;

  return NextResponse.json({
    layouts: layoutPresets.map((p) => ({
      id: p.id,
      label: p.label,
      description: p.description,
      totalSeats: p.totalSeats,
      bus_type: p.bus_type,
    })),
  });
}
