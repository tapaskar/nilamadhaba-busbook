"use client";

import { useEffect, useState } from "react";
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
  const [scrolled, setScrolled] = useState(false);

  // Scroll-aware: compact + stronger shadow after 20px
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-md border-b border-gray-100"
          : "bg-white/70 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? "h-14" : "h-16"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-[#1a3a8f] to-[#1a1a2e] shadow-sm group-hover:shadow-md group-hover:shadow-[#1a3a8f]/30 transition-all">
              <Bus className="h-5 w-5 text-[#f5c842] group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#1a3a8f]">
              NilaMadhaba
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-[#1a3a8f] hover:bg-[#e8edf8] transition-colors"
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
              className="flex items-center gap-1.5 rounded-full border-2 border-[#1a3a8f] px-5 py-1.5 text-sm font-semibold text-[#1a3a8f] hover:bg-[#1a3a8f] hover:text-white hover:shadow-lg hover:shadow-[#1a3a8f]/30 transition-all"
            >
              <User className="h-4 w-4" />
              Login
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-[#1a3a8f] transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#e8edf8] hover:text-[#1a3a8f] transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-1.5 rounded-full border-2 border-[#1a3a8f] px-5 py-2 text-sm font-semibold text-[#1a3a8f] hover:bg-[#1a3a8f] hover:text-white transition-colors"
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
