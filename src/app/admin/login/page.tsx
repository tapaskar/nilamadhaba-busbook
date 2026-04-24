"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Bus, Lock, Mail, ArrowRight, Shield, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
          <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-[#f5c842] animate-spin" />
        </div>
      }
    >
      <AdminLoginInner />
    </Suspense>
  );
}

function AdminLoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // If already signed in, redirect straight to /admin
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        if (d?.admin) router.replace(next);
        else setChecking(false);
      })
      .catch(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router, next]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setSubmitting(false);
        return;
      }
      router.replace(next);
    } catch {
      setError("Network error — please try again");
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-[#f5c842] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a3a8f] via-[#1e3d95] to-[#1a1a2e] px-4 py-12 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-[#f5c842]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-[#2a52be]/30 blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Branding */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#f5c842] shadow-lg shadow-[#f5c842]/30 group-hover:scale-110 transition-transform">
            <Bus className="h-6 w-6 text-[#1a1a2e]" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">
            NilaMadhaba
          </span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-2xl shadow-black/40 overflow-hidden">
          <div className="px-7 py-6 border-b border-gray-100 bg-gradient-to-br from-white to-[#f8f9fc]">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1a3a8f]/10 text-[#1a3a8f] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider mb-2">
              <Shield className="h-3 w-3" />
              Operator Console
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Admin sign in</h1>
            <p className="text-sm text-gray-500 mt-1">
              Restricted to authorised NilaMadhaba staff.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-7 space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5"
              >
                Work email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@nilamadhaba.com"
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !email || !password}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1a3a8f] hover:bg-[#142d70] disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 text-sm font-bold shadow-lg shadow-[#1a3a8f]/30 transition-all"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-gray-400 text-center pt-2">
              Forgot your password? Contact your administrator.
            </p>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/50">
          ← <Link href="/" className="hover:text-white/80 underline">Back to NilaMadhaba</Link>
        </p>
      </div>
    </div>
  );
}
