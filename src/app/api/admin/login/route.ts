/**
 * POST /api/admin/login
 * Body: { email, password }
 *
 * Verifies credentials, creates a server-side session, sets the
 * __nm_admin_session cookie, and returns the admin profile.
 */

import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_DAYS,
  createSession,
  findAdminByEmail,
  verifyPassword,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // bcryptjs + crypto

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 },
    );
  }

  const user = await findAdminByEmail(email);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const token = await createSession(user.id, {
    userAgent: req.headers.get("user-agent") ?? undefined,
    ip:
      req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      undefined,
  });

  const res = NextResponse.json({
    ok: true,
    admin: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
    },
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return res;
}
