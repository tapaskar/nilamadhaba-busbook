"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bus,
  Smartphone,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
} from "lucide-react";

/**
 * Consumer sign-in / sign-up page.
 *
 * The platform currently lets everyone book as a guest — account
 * signup is coming but not required. This page presents the *future*
 * sign-in methods (phone OTP + Google + Email) as disabled "Coming soon"
 * affordances, and makes "Continue as guest" the primary working path.
 *
 * This fixes the UAT-flagged broken /login link and sets up the UI
 * shell for real auth when we wire Clerk / phone-OTP / Google OAuth.
 */

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">
          <div className="h-10 w-10 rounded-full border-2 border-[#1a3a8f]/20 border-t-[#1a3a8f] animate-spin" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPhoneError(null);
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setPhoneError("Enter a 10-digit mobile number");
      return;
    }
    // OTP flow isn't wired yet — surface a friendly placeholder
    alert(
      `📱 OTP login is launching soon.\n\nFor now, you can book as a guest — your booking still works exactly the same.`,
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 flex items-center justify-center bg-gradient-to-br from-[#f8f9fc] via-white to-[#e8edf8]/30">
      <div className="w-full max-w-md">
        {/* Brand mark */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-[#1a3a8f] to-[#1a1a2e] shadow-lg group-hover:shadow-xl transition-shadow">
            <Bus className="h-5 w-5 text-[#f5c842]" />
          </div>
          <span className="text-2xl font-extrabold text-[#1a3a8f] tracking-tight">
            NilaMadhaba
          </span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-xl shadow-gray-900/5 border border-gray-100 overflow-hidden">
          <div className="px-7 pt-7 pb-5 text-center">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Sign in or create account
            </h1>
            <p className="text-sm text-gray-500 mt-1.5">
              Unlock <strong className="text-[#1a3a8f]">RideClub</strong> — 5% RideCoins, priority boarding, and trip history.
            </p>
          </div>

          <div className="px-7 pb-7 space-y-4">
            {/* Phone — primary */}
            <form onSubmit={handlePhoneSubmit}>
              <label
                htmlFor="phone"
                className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5"
              >
                Mobile number
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  autoComplete="tel"
                  className={`w-full rounded-xl border pl-16 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none transition-all ${
                    phoneError ? "border-red-300 bg-red-50/30" : "border-gray-200"
                  }`}
                />
              </div>
              {phoneError && (
                <p className="text-xs text-red-500 mt-1.5">{phoneError}</p>
              )}

              <button
                type="submit"
                className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-[#1a3a8f] hover:bg-[#142d70] text-white px-5 py-3 text-sm font-bold shadow-lg shadow-[#1a3a8f]/30 transition-all"
              >
                Send OTP
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-gray-400 font-medium">
                  or continue with
                </span>
              </div>
            </div>

            {/* Google — placeholder */}
            <button
              type="button"
              onClick={() => alert("🔒 Google Sign-in launches with our next release. Use phone OTP or continue as guest for now.")}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors"
            >
              <GoogleIcon className="h-4 w-4" />
              Continue with Google
              <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                Soon
              </span>
            </button>

            {/* Email — placeholder */}
            <button
              type="button"
              onClick={() => alert("✉️ Email sign-in launches with our next release. Use phone OTP or continue as guest for now.")}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors"
            >
              <Mail className="h-4 w-4 text-gray-500" />
              Continue with Email
              <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                Soon
              </span>
            </button>

            {/* Guest fallback — the actually-working path */}
            <div className="relative pt-4 mt-4 border-t border-gray-100">
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-emerald-900">
                      No account needed to book
                    </p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      You can reserve seats right now as a guest — your ticket
                      and refund policy are identical. Sign in later to collect
                      your RideCoins retroactively.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(next)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg bg-white hover:bg-emerald-100/40 border border-emerald-200 px-4 py-2 text-xs font-bold text-emerald-800 transition-colors"
                >
                  Continue as guest
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Legal strip */}
          <div className="px-7 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2 text-[11px] text-gray-500">
            <Lock className="h-3 w-3 text-gray-400 shrink-0" />
            <span>
              By continuing you agree to our{" "}
              <Link href="/terms" className="text-[#1a3a8f] hover:underline font-medium">
                Terms
              </Link>{" "}
              &amp;{" "}
              <Link href="/privacy" className="text-[#1a3a8f] hover:underline font-medium">
                Privacy
              </Link>
              .
            </span>
          </div>
        </div>

        {/* Loyalty teaser */}
        {mounted && (
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Sparkles className="h-3.5 w-3.5 text-[#f5c842]" />
            <span>
              <strong className="text-gray-700">2.4M+</strong> travellers ·
              <strong className="text-gray-700"> 4.8★</strong> rated ·
              <strong className="text-gray-700"> 24×7</strong> support
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Inline Google "G" glyph (brand-compliant colours) ───

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}
