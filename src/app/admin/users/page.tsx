"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Plus,
  Mail,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Power,
  Trash2,
  X,
} from "lucide-react";

type AdminRow = {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminUsersPage() {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create-modal state
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load admins");
      } else {
        setRows(data.admins);
        setCurrentId(data.currentId);
      }
    } catch {
      setError("Network error — please try again");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createAdmin(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreateMessage(null);

    if (!email || !password) {
      setCreateError("Email and password are required");
      return;
    }
    if (password.length < 8) {
      setCreateError("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Failed to create admin");
        setSubmitting(false);
        return;
      }
      setCreateMessage(`Admin ${data.admin.email} ready. Share the credentials securely.`);
      setEmail("");
      setFullName("");
      setPassword("");
      load();
    } catch {
      setCreateError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(row: AdminRow) {
    const action = row.is_active ? "deactivate" : "reactivate";
    if (!confirm(`Are you sure you want to ${action} ${row.email}?`)) return;
    const res = await fetch(`/api/admin/users/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !row.is_active }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed");
      return;
    }
    load();
  }

  async function removeAdmin(row: AdminRow) {
    if (!confirm(`Remove ${row.email}? They will no longer be able to sign in.`)) return;
    const res = await fetch(`/api/admin/users/${row.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed");
      return;
    }
    load();
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gray-400" />
              Admin Users
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Anyone listed here with status <strong className="text-emerald-600">Active</strong> can sign in to the admin console.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setCreateError(null);
              setCreateMessage(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a3a8f] hover:bg-[#142d70] text-white px-4 py-2 text-sm font-bold shadow-md shadow-[#1a3a8f]/20 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add admin
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <p className="px-6 py-12 text-sm text-center text-gray-400">Loading admins…</p>
          ) : error ? (
            <div className="px-6 py-8 flex items-center justify-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left bg-gray-50/50">
                  {["Email", "Name", "Status", "Last login", "Created", ""].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((r) => {
                  const isMe = r.id === currentId;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#e8edf8] text-[#1a3a8f] text-xs font-bold shrink-0">
                            {r.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {r.email}
                            </p>
                            {isMe && (
                              <span className="text-[10px] font-bold text-[#1a3a8f] uppercase tracking-wider">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {r.full_name ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-3">
                        {r.is_active ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs font-bold">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-500 px-2 py-0.5 text-xs font-bold">
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {formatDate(r.last_login_at)}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {formatDate(r.created_at)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          {!isMe && (
                            <>
                              <button
                                type="button"
                                onClick={() => toggleActive(r)}
                                title={r.is_active ? "Deactivate" : "Reactivate"}
                                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              >
                                <Power className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeAdmin(r)}
                                title="Remove admin"
                                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create-admin modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#1a3a8f]" />
                Add new admin
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={createAdmin} className="p-6 space-y-4">
              {createMessage && (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-emerald-700">{createMessage}</p>
                </div>
              )}
              {createError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{createError}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="newadmin@nilamadhaba.com"
                    className="w-full rounded-xl border border-gray-200 pl-10 pr-3 py-2.5 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  Full name <span className="text-gray-300 font-normal normal-case">(optional)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full rounded-xl border border-gray-200 pl-10 pr-3 py-2.5 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  Initial password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPwd ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full rounded-xl border border-gray-200 pl-10 pr-10 py-2.5 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-gray-500">
                  The new admin can change this from their My Account page after first login.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a3a8f] hover:bg-[#142d70] disabled:opacity-50 text-white px-4 py-2 text-sm font-bold transition-colors"
                >
                  {submitting ? "Creating…" : "Create admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
