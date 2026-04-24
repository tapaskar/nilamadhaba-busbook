"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import SupportHub from "./SupportHub";

/**
 * Renders the public-site chrome (Header, Footer, SupportHub) only on
 * non-admin routes. The admin console has its own sidebar + top bar
 * and shouldn't carry the consumer-facing nav.
 */
export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    // Admin routes get a bare shell — the dashboard supplies its own chrome
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <SupportHub />
    </>
  );
}
