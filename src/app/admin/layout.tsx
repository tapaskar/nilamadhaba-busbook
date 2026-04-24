"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Bus,
  Ticket,
  Users,
  IndianRupee,
  Settings,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  UserCog,
} from "lucide-react";

/**
 * Shared chrome for every /admin/* page (except /admin/login, which
 * renders its own full-bleed layout).
 *
 * - Left sidebar with real Next.js <Link> navigation + active highlight
 * - Top bar with admin profile pill + sign-out
 * - Auth gate: any non-login admin route redirects to /admin/login if
 *   the user isn't signed in (the middleware already does this server
 *   side; this is a belt-and-braces client check + provides admin
 *   profile to children if they want it later).
 */

const navItems = [
  { href: "/admin",            label: "Dashboard",   icon: LayoutDashboard },
  { href: "/admin/bookings",   label: "Bookings",    icon: Ticket          },
  { href: "/admin/schedules",  label: "Schedules",   icon: Calendar        },
  { href: "/admin/fleet",      label: "Fleet",       icon: Bus             },
  { href: "/admin/customers",  label: "Customers",   icon: Users           },
  { href: "/admin/revenue",    label: "Revenue",     icon: IndianRupee     },
  { href: "/admin/users",      label: "Admin Users", icon: ShieldCheck     },
  { href: "/admin/account",    label: "My Account",  icon: UserCog         },
  { href: "/admin/settings",   label: "Settings",    icon: Settings        },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<{ email: string; full_name: string | null } | null>(null);

  // Auth check + profile fetch (skip on the login page itself)
  useEffect(() => {
    if (isLoginPage) return;
    let cancelled = false;
    fetch("/api/admin/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        if (!d?.admin) {
          router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
        } else {
          setAdmin(d.admin);
        }
      })
      .catch(() => router.replace("/admin/login"));
    return () => {
      cancelled = true;
    };
  }, [isLoginPage, pathname, router]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  // Login page renders standalone — no sidebar, no top bar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Currently-active nav item (used for top-bar title + highlight)
  const active =
    navItems.find((i) => i.href === pathname) ??
    navItems.find((i) => i.href !== "/admin" && pathname.startsWith(i.href)) ??
    navItems[0];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-5">
          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-gradient-to-br from-[#1a3a8f] to-[#1a1a2e] shrink-0">
            <Bus className="h-4 w-4 text-[#f5c842]" />
          </div>
          <span className="text-lg font-extrabold text-[#1a3a8f] tracking-tight">
            NilaMadhaba
          </span>
          <span className="ml-1 rounded bg-[#f5c842]/20 text-[#1a3a8f] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            Admin
          </span>
          <button
            type="button"
            className="ml-auto rounded-md p-1 hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <nav className="mt-4 space-y-0.5 px-3 pb-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#1a3a8f]/10 text-[#1a3a8f] shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer — quick logout */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:px-6 shrink-0">
          <button
            type="button"
            className="rounded-md p-1.5 hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{active.label}</h1>
          <span className="hidden text-sm text-gray-500 sm:block">
            {admin?.full_name ? `Welcome back, ${admin.full_name.split(" ")[0]}` : ""}
          </span>
          <div className="ml-auto flex items-center gap-3">
            {admin && (
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#e8edf8]/60">
                <div className="flex items-center justify-center h-7 w-7 rounded-full bg-[#1a3a8f] text-[#f5c842] text-xs font-bold">
                  {admin.email.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {admin.email}
                </span>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
