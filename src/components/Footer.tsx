import Link from "next/link";
import { Bus, Globe, Mail, Phone, MessageCircle } from "lucide-react";

const quickLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
] as const;

const socialLinks = [
  { href: "https://twitter.com", icon: MessageCircle, label: "Twitter" },
  { href: "https://instagram.com", icon: Globe, label: "Instagram" },
  { href: "https://facebook.com", icon: Mail, label: "Facebook" },
  { href: "https://youtube.com", icon: Phone, label: "YouTube" },
] as const;

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-[#1a3a8f] to-[#2a52be]">
                <Bus className="h-4 w-4 text-[#f5c842]" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                NilaMadhaba
              </span>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs">
              Travel smarter with India&apos;s most comfortable bus service.
              Safe, reliable, and affordable.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <ul className="space-y-1.5">
              {quickLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Follow Us
            </h4>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:bg-[#f5c842] hover:text-[#1a1a2e] hover:border-[#f5c842] transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} NilaMadhaba. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
