import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware — gate /admin/* behind the session cookie.
 *
 * Logic:
 *   - /admin/login is always allowed (you need to be able to sign in!)
 *   - Anything else under /admin/ requires the __nm_admin_session cookie.
 *     If missing, redirect to /admin/login?next=<original-path>.
 *
 * Note: middleware only checks for cookie *presence* — actual session
 * validity is checked server-side in /api/admin/me and the dashboard's
 * own data fetches. Edge runtime can't talk to Postgres directly.
 */

const SESSION_COOKIE = "__nm_admin_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard /admin/* — everything else passes through
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Login page itself + the auth API never require a session
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/login")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
