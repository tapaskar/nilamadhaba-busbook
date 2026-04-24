"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  User,
  Lock,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

type Me = { id: string; email: string; full_name: string | null };

export default function AdminAccountPage() {
  const [me, setMe] = useState<Me | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setMe(d.admin))
      .catch(() => {});
  }, []);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must differ from the current one");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to change password");
        setSubmitting(false);
        return;
      }
      setSuccess("Password changed. Other sessions have been signed out.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  // Simple password-strength signal
  const strength =
    newPassword.length === 0
      ? 0
      : newPassword.length < 8
        ? 1
        : /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword) && newPassword.length >= 12
          ? 4
          : (/[A-Z]/.test(newPassword) ? 1 : 0) +
            (/[0-9]/.test(newPassword) ? 1 : 0) +
            (/[^A-Za-z0-9]/.test(newPassword) ? 1 : 0) +
            (newPassword.length >= 10 ? 1 : 0);

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength] || "Strong";
  const strengthColor =
    strength <= 1 ? "bg-red-500"
    : strength === 2 ? "bg-amber-500"
    : strength === 3 ? "bg-yellow-500"
    : "bg-emerald-500";

  return (
    <div className="max-w-3xl space-y-6">
      {/* Profile card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            Profile
          </h2>
        </div>
        <div className="p-6 flex items-center gap-5">
          <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-[#1a3a8f] to-[#1a1a2e] text-[#f5c842] text-2xl font-extrabold shrink-0">
            {me?.email.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-gray-900">
              {me?.full_name ?? "Unnamed admin"}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5" />
              {me?.email ?? "—"}
            </p>
            <span className="inline-flex items-center gap-1 mt-2 rounded bg-emerald-50 text-emerald-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck className="h-3 w-3" />
              Active admin
            </span>
          </div>
        </div>
      </div>

      {/* Change password card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Key className="h-4 w-4 text-gray-400" />
            Change Password
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            For your security, the password must be at least 8 characters and
            differ from the current one. Other sessions will be signed out.
          </p>
        </div>
        <form onSubmit={changePassword} className="p-6 space-y-4">
          {success && (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-sm text-emerald-700">{success}</p>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="cur"
              className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5"
            >
              Current password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="cur"
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 pl-10 pr-3 py-2.5 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="new"
              className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5"
            >
              New password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="new"
                type={showNew ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-gray-200 pl-10 pr-10 py-2.5 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                aria-label={showNew ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {newPassword.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full transition-all ${strengthColor}`}
                    style={{ width: `${strength * 25}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider min-w-[44px] text-right">
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5"
            >
              Confirm new password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Type it again"
                className="w-full rounded-xl border border-gray-200 pl-10 pr-3 py-2.5 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
              />
            </div>
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="mt-1.5 text-xs text-red-500">Passwords don&apos;t match</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !currentPassword || !newPassword || !confirmPassword}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a3a8f] hover:bg-[#142d70] disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 text-sm font-bold shadow-lg shadow-[#1a3a8f]/20 transition-all"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Updating…
                </>
              ) : (
                <>
                  <Key className="h-4 w-4" />
                  Update password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
