"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bus,
  Search,
  Ticket,
  HelpCircle,
  Menu,
  X,
  User,
} from "lucide-react";

const navLinks = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/my-trips", label: "My Trips", icon: Ticket },
  { href: "/help", label: "Help", icon: HelpCircle },
] as const;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Bus className="h-7 w-7 text-primary" />
            <span className="text-xl font-extrabold tracking-tight text-primary">
              NilaMadhaba
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-primary hover:bg-primary-light transition-colors"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop login */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full border-2 border-primary px-5 py-1.5 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
            >
              <User className="h-4 w-4" />
              Login
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-primary transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-light hover:text-primary transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-1.5 rounded-full border-2 border-primary px-5 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
            >
              <User className="h-4 w-4" />
              Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
