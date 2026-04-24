/**
 * GET /api/admin/me
 * Returns the currently signed-in admin profile, or 401 if not signed in.
 * Useful for client-side gating on the dashboard.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, getAdminFromToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const admin = await getAdminFromToken(token);
  if (!admin) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  return NextResponse.json({ admin });
}
