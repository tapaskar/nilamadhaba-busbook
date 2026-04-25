"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bus,
  Plus,
  Power,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Wind,
  Wifi,
  Zap,
  Coffee,
  Pencil,
} from "lucide-react";

type BusRow = {
  id: string;
  name: string;
  registration_number: string;
  bus_type: "seater" | "sleeper" | "semi_sleeper";
  total_seats: number;
  amenities: string[];
  is_active: boolean;
  schedule_count: number;
  booking_count: number;
};

type LayoutPreset = {
  id: string;
  label: string;
  description: string;
  totalSeats: number;
  bus_type: "seater" | "sleeper" | "semi_sleeper";
};

const allAmenities = [
  { id: "AC",              icon: Wind   },
  { id: "WiFi",            icon: Wifi   },
  { id: "Charging Point",  icon: Zap    },
  { id: "Blanket",         icon: Coffee },
  { id: "Water Bottle",    icon: Coffee },
  { id: "Reading Light",   icon: Coffee },
  { id: "Track My Bus",    icon: Coffee },
  { id: "CCTV",            icon: Coffee },
];

export default function AdminFleetPage() {
  const [rows, setRows] = useState<BusRow[]>([]);
  const [layouts, setLayouts] = useState<LayoutPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  // Form
  const [busId, setBusId] = useState("");
  const [name, setName] = useState("");
  const [reg, setReg] = useState("");
  const [layoutId, setLayoutId] = useState("");
  const [picked, setPicked] = useState<string[]>(["AC", "Charging Point"]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [bRes, lRes] = await Promise.all([
        fetch("/api/admin/buses",   { cache: "no-store" }),
        fetch("/api/admin/layouts", { cache: "no-store" }),
      ]);
      const bData = await bRes.json();
      const lData = await lRes.json();
      if (!bRes.ok) setError(bData.error || "Failed to load buses");
      else setRows(bData.buses);
      if (lRes.ok) setLayouts(lData.layouts);
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createBus(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreateMsg(null);

    if (!busId || !name || !reg || !layoutId) {
      setCreateError("All fields are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/buses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: busId,
          name,
          registration_number: reg,
          layoutId,
          amenities: picked,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Failed to create");
        setSubmitting(false);
        return;
      }
      setCreateMsg(`Bus ${data.bus.name} added.`);
      setBusId("");
      setName("");
      setReg("");
      setLayoutId("");
      load();
    } catch {
      setCreateError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleBus(row: BusRow) {
    const action = row.is_active ? "deactivate" : "reactivate";
    if (!confirm(`${action} ${row.name} (${row.registration_number})?`)) return;
    const res = await fetch(`/api/admin/buses/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !row.is_active }),
    });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error || "Failed");
      return;
    }
    load();
  }

  async function removeBus(row: BusRow) {
    if (!confirm(`Remove ${row.name}? It will be deactivated, not destroyed — past bookings stay intact.`)) return;
    const res = await fetch(`/api/admin/buses/${row.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error || "Failed");
      return;
    }
    load();
  }

  function toggleAmenity(id: string) {
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Bus className="h-4 w-4 text-gray-400" />
              Fleet
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {loading ? "Loading…" : `${rows.length} bus${rows.length !== 1 ? "es" : ""} · ${rows.filter((b) => b.is_active).length} active`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setCreateError(null);
              setCreateMsg(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a3a8f] hover:bg-[#142d70] text-white px-4 py-2 text-sm font-bold shadow-md shadow-[#1a3a8f]/20 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add bus
          </button>
        </div>

        {error && (
          <div className="px-6 py-3 flex items-center gap-2 text-red-600 text-sm bg-red-50/50 border-b border-red-100">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left bg-gray-50/50">
                {["Bus", "Registration", "Type", "Seats", "Amenities", "Schedules", "Bookings", "Status", ""].map((h) => (
                  <th key={h} className="whitespace-nowrap px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-gray-400 text-sm">
                    No buses yet. Click <strong>Add bus</strong> to onboard your first vehicle.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className={r.is_active ? "" : "opacity-60"}>
                  <td className="px-5 py-3">
                    <p className="text-sm font-bold text-gray-900">{r.name}</p>
                    <p className="text-[10px] font-mono text-gray-400">{r.id}</p>
                  </td>
                  <td className="px-5 py-3 text-sm font-mono text-gray-700">
                    {r.registration_number}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex rounded-full bg-[#e8edf8] text-[#1a3a8f] px-2 py-0.5 text-xs font-bold capitalize">
                      {r.bus_type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-700 font-medium">{r.total_seats}</td>
                  <td className="px-5 py-3">
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">
                      {r.amenities.slice(0, 3).join(", ")}
                      {r.amenities.length > 3 && ` +${r.amenities.length - 3}`}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-700">{r.schedule_count}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{r.booking_count}</td>
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
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/admin/fleet/${r.id}`}
                        title="Configure bus"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:text-[#1a3a8f] hover:bg-[#e8edf8]/50 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleBus(r)}
                        title={r.is_active ? "Deactivate" : "Reactivate"}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBus(r)}
                        title="Remove bus"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add-bus modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#1a3a8f]" />
                Add new bus
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={createBus} className="p-6 space-y-4 overflow-y-auto">
              {createMsg && (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-emerald-700">{createMsg}</p>
                </div>
              )}
              {createError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{createError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Internal ID
                  </label>
                  <input
                    type="text"
                    required
                    value={busId}
                    onChange={(e) => setBusId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="bus-volvo-09"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Registration #
                  </label>
                  <input
                    type="text"
                    required
                    value={reg}
                    onChange={(e) => setReg(e.target.value.toUpperCase())}
                    placeholder="KA-01-AB-1234"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  Display name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="NilaMadhaba Volvo B11R AC Sleeper"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  Seat layout preset
                </label>
                <div className="space-y-2">
                  {layouts.map((l) => {
                    const active = layoutId === l.id;
                    return (
                      <label
                        key={l.id}
                        className={`flex items-start gap-3 rounded-xl border-2 p-3 cursor-pointer transition-all ${
                          active
                            ? "border-[#1a3a8f] bg-[#e8edf8]/40"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="layout"
                          value={l.id}
                          checked={active}
                          onChange={() => setLayoutId(l.id)}
                          className="mt-0.5 h-4 w-4 text-[#1a3a8f] focus:ring-[#1a3a8f]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold text-gray-900">{l.label}</p>
                            <span className="text-xs font-bold text-[#1a3a8f]">
                              {l.totalSeats} seats
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{l.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {allAmenities.map((a) => {
                    const active = picked.includes(a.id);
                    const Icon = a.icon;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => toggleAmenity(a.id)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                          active
                            ? "bg-[#1a3a8f] border-[#1a3a8f] text-white"
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        {a.id}
                      </button>
                    );
                  })}
                </div>
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
                  {submitting ? "Adding…" : "Add bus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
