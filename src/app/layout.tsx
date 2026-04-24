import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BookingProvider } from "@/lib/store";
import { I18nProvider } from "@/lib/i18n";
import SiteChrome from "@/components/SiteChrome";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NilaMadhaba - Premium Bus Travel",
  description:
    "Book premium intercity bus tickets across India. AC Sleeper, Volvo, and Scania buses with live tracking, free cancellation, and on-time guarantee.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans antialiased flex flex-col">
        <I18nProvider>
          <BookingProvider>
            <SiteChrome>{children}</SiteChrome>
          </BookingProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
