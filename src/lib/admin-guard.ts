import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  getAdminFromToken,
  type AdminUser,
} from "./admin-auth";

/**
 * Helper for admin API routes: returns the signed-in admin OR a 401
 * NextResponse. Use:
 *
 *   const guard = await requireAdmin();
 *   if ("error" in guard) return guard.error;
 *   const me = guard.admin;
 */
export async function requireAdmin(): Promise<
  { admin: AdminUser } | { error: NextResponse }
> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const admin = await getAdminFromToken(token);
  if (!admin) {
    return {
      error: NextResponse.json({ error: "Not signed in" }, { status: 401 }),
    };
  }
  return { admin };
}
