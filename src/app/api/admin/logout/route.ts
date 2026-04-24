/**
 * POST /api/admin/logout
 * Clears the admin session cookie and deletes the server-side session row.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, deleteSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await deleteSession(token);
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
