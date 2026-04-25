/**
 * GET /api/admin/customers
 *   ?q=<text>   — optional search (matches email or phone)
 *
 * Returns customer roll-ups grouped by email + phone, with lifetime
 * stats: total bookings, total spend, last booking date.
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const g = await requireAdmin();
  if ("error" in g) return g.error;

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const like = `%${q}%`;
  const rows = q
    ? await db`
        SELECT contact_email, contact_phone,
               COUNT(*)::integer AS bookings,
               COALESCE(SUM(total_amount), 0)::bigint AS lifetime_spend,
               MAX(booked_at)::text AS last_booking,
               COUNT(*) FILTER (WHERE status = 'confirmed')::integer AS confirmed,
               COUNT(*) FILTER (WHERE status = 'cancelled')::integer AS cancelled
        FROM bookings
        WHERE lower(contact_email) LIKE ${like}
           OR contact_phone LIKE ${like}
        GROUP BY contact_email, contact_phone
        ORDER BY lifetime_spend DESC
        LIMIT 200
      `
    : await db`
        SELECT contact_email, contact_phone,
               COUNT(*)::integer AS bookings,
               COALESCE(SUM(total_amount), 0)::bigint AS lifetime_spend,
               MAX(booked_at)::text AS last_booking,
               COUNT(*) FILTER (WHERE status = 'confirmed')::integer AS confirmed,
               COUNT(*) FILTER (WHERE status = 'cancelled')::integer AS cancelled
        FROM bookings
        GROUP BY contact_email, contact_phone
        ORDER BY lifetime_spend DESC
        LIMIT 200
      `;

  return NextResponse.json({ customers: rows });
}
