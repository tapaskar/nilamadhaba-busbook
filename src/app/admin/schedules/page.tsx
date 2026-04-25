"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Plus,
  Power,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  MapPinned,
  Bus,
  Clock,
  Eye,
  Pencil,
} from "lucide-react";

type Tab = "routes" | "schedules" | "occupancy";

type CityRow = { id: string; name: string; state: string; is_active: boolean };
type RouteRow = {
  id: string;
  origin_city_id: string;
  destination_city_id: string;
  origin_name: string;
  origin_state: string;
  destination_name: string;
  destination_state: string;
  distance_km: number | null;
  estimated_duration_minutes: number | null;
  is_active: boolean;
  schedule_count: number;
};
type ScheduleRow = {
  id: string;
  route_id: string;
  bus_id: string;
  departure_time: string;
  arrival_time: string;
  base_price: number;
  sleeper_price: number | null;
  days_of_week: number[];
  is_active: boolean;
  bus_name: string;
  bus_type: string;
  total_seats: number;
  origin_name: string;
  destination_name: string;
};
type BusOption = { id: string; name: string; total_seats: number; is_active: boolean };

function formatINR(paise: number): string {
  return "\u20B9" + Math.round(paise / 100).toLocaleString("en-IN");
}
function formatTime(t: string): string {
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AdminSchedulesPage() {
  const [tab, setTab] = useState<Tab>("routes");
  const [cities, setCities] = useState<CityRow[]>([]);
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [buses, setBuses] = useState<BusOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [routeModal, setRouteModal] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteRow | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleRow | null>(null);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [cRes, rRes, sRes, bRes] = await Promise.all([
        fetch("/api/admin/cities",    { cache: "no-store" }),
        fetch("/api/admin/routes",    { cache: "no-store" }),
        fetch("/api/admin/schedules", { cache: "no-store" }),
        fetch("/api/admin/buses",     { cache: "no-store" }),
      ]);
      const cD = await cRes.json();
      const rD = await rRes.json();
      const sD = await sRes.json();
      const bD = await bRes.json();
      if (!cRes.ok) setError(cD.error);
      else setCities(cD.cities);
      if (rRes.ok) setRoutes(rD.routes);
      if (sRes.ok) setSchedules(sD.schedules);
      if (bRes.ok) {
        setBuses(
          (bD.buses as BusOption[]).filter((b) => b.is_active),
        );
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div className="space-y-4">
      {/* Tab strip */}
      <div className="rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm inline-flex">
        {(["routes", "schedules", "occupancy"] as Tab[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
              tab === id
                ? "bg-[#1a3a8f] text-white shadow"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {id === "routes" ? `Routes (${routes.length})` :
             id === "schedules" ? `Schedules (${schedules.length})` :
             "Occupancy"}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* ─── Routes tab ─── */}
      {tab === "routes" && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-gray-400" />
                Routes
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Origin → destination pairs. Each route can carry multiple schedules.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRouteModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a3a8f] hover:bg-[#142d70] text-white px-4 py-2 text-sm font-bold transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add route
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left bg-gray-50/50">
                  {["Route", "Distance", "Duration", "Schedules", "Status", ""].map((h) => (
                    <th key={h} className="whitespace-nowrap px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {!loading && routes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">
                      No routes yet. Click <strong>Add route</strong>.
                    </td>
                  </tr>
                )}
                {routes.map((r) => (
                  <tr key={r.id} className={r.is_active ? "" : "opacity-60"}>
                    <td className="px-5 py-3">
                      <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        {r.origin_name}
                        <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                        {r.destination_name}
                      </p>
                      <p className="text-[10px] font-mono text-gray-400">{r.id}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700">
                      {r.distance_km ? `${r.distance_km} km` : "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700">
                      {r.estimated_duration_minutes
                        ? `${Math.floor(r.estimated_duration_minutes / 60)}h ${r.estimated_duration_minutes % 60}m`
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700 font-medium">
                      {r.schedule_count}
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
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingRoute(r)}
                          title="Edit"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:text-[#1a3a8f] hover:bg-[#e8edf8]/50 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm(`${r.is_active ? "Deactivate" : "Reactivate"} ${r.origin_name} → ${r.destination_name}?`)) return;
                            await fetch(`/api/admin/routes/${r.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ isActive: !r.is_active }),
                            });
                            loadAll();
                          }}
                          title={r.is_active ? "Deactivate" : "Reactivate"}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Schedules tab ─── */}
      {tab === "schedules" && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                Schedules
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Recurring departures. Each binds a route to a bus and a price.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setScheduleModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a3a8f] hover:bg-[#142d70] text-white px-4 py-2 text-sm font-bold transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add schedule
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left bg-gray-50/50">
                  {["Route", "Bus", "Times", "Days", "Base price", "Sleeper", "Status", ""].map((h) => (
                    <th key={h} className="whitespace-nowrap px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {!loading && schedules.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                      No schedules yet.
                    </td>
                  </tr>
                )}
                {schedules.map((s) => (
                  <tr key={s.id} className={s.is_active ? "" : "opacity-60"}>
                    <td className="px-5 py-3">
                      <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        {s.origin_name}
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        {s.destination_name}
                      </p>
                      <p className="text-[10px] font-mono text-gray-400">{s.id}</p>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-600">
                      {s.bus_name.replace("NilaMadhaba ", "")}
                      <p className="text-[10px] text-gray-400">{s.total_seats} seats</p>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-700">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        {formatTime(s.departure_time)} → {formatTime(s.arrival_time)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-0.5">
                        {dayLabels.map((d, i) => (
                          <span
                            key={d}
                            className={`inline-flex items-center justify-center h-5 w-5 rounded text-[9px] font-bold ${
                              s.days_of_week.includes(i)
                                ? "bg-[#1a3a8f] text-white"
                                : "bg-gray-100 text-gray-300"
                            }`}
                          >
                            {d[0]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm font-bold text-gray-900">
                      {formatINR(s.base_price)}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700">
                      {s.sleeper_price ? formatINR(s.sleeper_price) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      {s.is_active ? (
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
                        <button
                          type="button"
                          onClick={() => setEditingSchedule(s)}
                          title="Edit"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:text-[#1a3a8f] hover:bg-[#e8edf8]/50 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm(`${s.is_active ? "Deactivate" : "Reactivate"} this schedule?`)) return;
                            await fetch(`/api/admin/schedules/${s.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ isActive: !s.is_active }),
                            });
                            loadAll();
                          }}
                          title={s.is_active ? "Deactivate" : "Reactivate"}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm("Remove this schedule? It will be deactivated.")) return;
                            const res = await fetch(`/api/admin/schedules/${s.id}`, { method: "DELETE" });
                            if (!res.ok) {
                              const d = await res.json();
                              alert(d.error || "Failed");
                            }
                            loadAll();
                          }}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove"
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
      )}

      {/* ─── Occupancy tab ─── */}
      {tab === "occupancy" && (
        <OccupancyView schedules={schedules} />
      )}

      {/* Route modal */}
      {routeModal && (
        <RouteModal
          cities={cities.filter((c) => c.is_active)}
          onClose={() => setRouteModal(false)}
          onCreated={() => {
            setRouteModal(false);
            loadAll();
          }}
        />
      )}

      {/* Schedule modal */}
      {scheduleModal && (
        <ScheduleModal
          routes={routes.filter((r) => r.is_active)}
          buses={buses}
          onClose={() => setScheduleModal(false)}
          onCreated={() => {
            setScheduleModal(false);
            loadAll();
          }}
        />
      )}

      {/* Edit-route modal */}
      {editingRoute && (
        <EditRouteModal
          route={editingRoute}
          onClose={() => setEditingRoute(null)}
          onSaved={() => {
            setEditingRoute(null);
            loadAll();
          }}
        />
      )}

      {/* Edit-schedule modal */}
      {editingSchedule && (
        <EditScheduleModal
          schedule={editingSchedule}
          buses={buses}
          onClose={() => setEditingSchedule(null)}
          onSaved={() => {
            setEditingSchedule(null);
            loadAll();
          }}
        />
      )}
    </div>
  );
}

// ─── Route modal ────────────────────────────────────────────────────

function RouteModal({
  cities,
  onClose,
  onCreated,
}: {
  cities: CityRow[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [id, setId] = useState("");
  const [origin, setOrigin] = useState("");
  const [dest, setDest] = useState("");
  const [km, setKm] = useState("");
  const [mins, setMins] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Auto-generate id when both cities chosen
  useMemo(() => {
    if (origin && dest && !id) {
      setId(`route-${origin.replace("city-", "")}-${dest.replace("city-", "")}`);
    }
  }, [origin, dest, id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    const res = await fetch("/api/admin/routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        origin_city_id: origin,
        destination_city_id: dest,
        distance_km: km ? parseInt(km, 10) : null,
        estimated_duration_minutes: mins ? parseInt(mins, 10) : null,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setErr(data.error);
      return;
    }
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <MapPinned className="h-4 w-4 text-[#1a3a8f]" />
            Add new route
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {err && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{err}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">From</label>
              <select required value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none">
                <option value="">Select…</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}, {c.state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">To</label>
              <select required value={dest} onChange={(e) => setDest(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none">
                <option value="">Select…</option>
                {cities.filter((c) => c.id !== origin).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}, {c.state}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Route ID</label>
            <input type="text" required value={id} onChange={(e) => setId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="route-xxx-yyy" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Distance (km)</label>
              <input type="number" min="0" value={km} onChange={(e) => setKm(e.target.value)} placeholder="350" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Duration (min)</label>
              <input type="number" min="0" value={mins} onChange={(e) => setMins(e.target.value)} placeholder="360" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none" />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2 justify-end">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a3a8f] hover:bg-[#142d70] disabled:opacity-50 text-white px-4 py-2 text-sm font-bold">
              {submitting ? "Adding…" : "Add route"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Schedule modal ────────────────────────────────────────────────

function ScheduleModal({
  routes,
  buses,
  onClose,
  onCreated,
}: {
  routes: RouteRow[];
  buses: BusOption[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [id, setId] = useState("");
  const [routeId, setRouteId] = useState("");
  const [busId, setBusId] = useState("");
  const [departure, setDeparture] = useState("21:00");
  const [arrival, setArrival] = useState("03:00");
  const [basePriceRupees, setBasePriceRupees] = useState("");
  const [sleeperPriceRupees, setSleeperPriceRupees] = useState("");
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function toggleDay(d: number) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!id || !routeId || !busId || !basePriceRupees) {
      setErr("Fill all required fields");
      return;
    }
    if (days.length === 0) {
      setErr("Select at least one day");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/admin/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        route_id: routeId,
        bus_id: busId,
        departure_time: departure,
        arrival_time: arrival,
        base_price: Math.round(parseFloat(basePriceRupees) * 100),
        sleeper_price: sleeperPriceRupees ? Math.round(parseFloat(sleeperPriceRupees) * 100) : null,
        days_of_week: days,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setErr(data.error);
      return;
    }
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#1a3a8f]" />
            Add new schedule
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4 overflow-y-auto">
          {err && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{err}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Schedule ID</label>
            <input type="text" required value={id} onChange={(e) => setId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="sch-blr-chn-2100" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Route</label>
            <select required value={routeId} onChange={(e) => setRouteId(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none">
              <option value="">Select route…</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>{r.origin_name} → {r.destination_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Bus</label>
            <select required value={busId} onChange={(e) => setBusId(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none">
              <option value="">Select bus…</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>{b.name} · {b.total_seats} seats</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Departure</label>
              <input type="time" required value={departure} onChange={(e) => setDeparture(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Arrival</label>
              <input type="time" required value={arrival} onChange={(e) => setArrival(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Base price (₹)</label>
              <input type="number" required min="0" step="0.01" value={basePriceRupees} onChange={(e) => setBasePriceRupees(e.target.value)} placeholder="899" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Sleeper price (₹)</label>
              <input type="number" min="0" step="0.01" value={sleeperPriceRupees} onChange={(e) => setSleeperPriceRupees(e.target.value)} placeholder="1099 (optional)" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Operating days</label>
            <div className="flex gap-1.5">
              {dayLabels.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                    days.includes(i)
                      ? "bg-[#1a3a8f] text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2 justify-end">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a3a8f] hover:bg-[#142d70] disabled:opacity-50 text-white px-4 py-2 text-sm font-bold">
              {submitting ? "Adding…" : "Add schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Occupancy view (lookup + seat-map) ──────────────────────────────

type OccupancyPayload = {
  schedule: {
    id: string;
    departure_time: string;
    arrival_time: string;
    bus_name: string;
    registration_number: string;
    total_seats: number;
    seat_layout: { decks: { name: string; rows: number; cols: number; seats: { id: string; label: string; row: number; col: number }[] }[] };
    origin_name: string;
    destination_name: string;
  };
  seats: { seat_number: string; passenger_name: string; age: number; gender: string; total_amount: number; booking_id: string; contact_phone: string }[];
  booked_count: number;
  available_count: number;
  occupancy_pct: number;
  revenue_paise: number;
};

function OccupancyView({ schedules }: { schedules: ScheduleRow[] }) {
  const [scheduleId, setScheduleId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<OccupancyPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function lookup(e?: React.FormEvent) {
    e?.preventDefault();
    if (!scheduleId || !date) return;
    setLoading(true);
    setErr(null);
    setData(null);
    const res = await fetch(`/api/admin/occupancy?scheduleId=${scheduleId}&date=${date}`, { cache: "no-store" });
    const d = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErr(d.error || "Failed to load");
      return;
    }
    setData(d);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={lookup} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Trip</label>
            <select value={scheduleId} onChange={(e) => setScheduleId(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none">
              <option value="">Select schedule…</option>
              {schedules.filter((s) => s.is_active).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.origin_name} → {s.destination_name} · {formatTime(s.departure_time)} · {s.bus_name.replace("NilaMadhaba ", "")}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-44">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none" />
          </div>
          <button type="submit" disabled={!scheduleId || loading} className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a3a8f] hover:bg-[#142d70] disabled:opacity-50 text-white px-4 py-2.5 text-sm font-bold whitespace-nowrap">
            <Eye className="h-4 w-4" />
            {loading ? "Loading…" : "Look up"}
          </button>
        </div>
      </form>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {err}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile label="Booked" value={`${data.booked_count} / ${data.schedule.total_seats}`} accent="#1a3a8f" />
            <StatTile label="Available" value={String(data.available_count)} accent="#16a34a" />
            <StatTile label="Occupancy" value={`${data.occupancy_pct}%`} accent={data.occupancy_pct >= 80 ? "#16a34a" : data.occupancy_pct >= 50 ? "#f59e0b" : "#dc2626"} />
            <StatTile label="Revenue" value={formatINR(data.revenue_paise)} accent="#f5c842" />
          </div>

          {/* Bus header */}
          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-[#1a3a8f] to-[#1a1a2e] p-5 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-[#f5c842] text-[#1a1a2e]">
                <Bus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-bold">
                  {data.schedule.origin_name} → {data.schedule.destination_name}
                </p>
                <p className="text-xs text-white/70 mt-0.5 flex items-center gap-2">
                  <span>{data.schedule.bus_name}</span>
                  <span>·</span>
                  <span>{data.schedule.registration_number}</span>
                  <span>·</span>
                  <span>{formatTime(data.schedule.departure_time)} → {formatTime(data.schedule.arrival_time)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Seat-map visualisation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Seat map</p>
              <div className="space-y-4">
                {data.schedule.seat_layout.decks.map((deck) => (
                  <div key={deck.name}>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{deck.name}</p>
                    <div
                      className="grid gap-1"
                      style={{ gridTemplateColumns: `repeat(${deck.cols}, minmax(0, 1fr))` }}
                    >
                      {Array.from({ length: deck.rows }).flatMap((_, rowIdx) =>
                        Array.from({ length: deck.cols }).map((__, colIdx) => {
                          const seat = deck.seats.find((s) => s.row === rowIdx && s.col === colIdx);
                          if (!seat) return <div key={`${rowIdx}-${colIdx}`} className="h-7" />;
                          const passenger = data.seats.find((s) => s.seat_number === seat.id);
                          const booked = !!passenger;
                          return (
                            <div
                              key={seat.id}
                              title={
                                booked
                                  ? `${seat.label} · ${passenger.passenger_name} (${passenger.age}${passenger.gender[0].toUpperCase()})`
                                  : `${seat.label} · Available`
                              }
                              className={`h-7 rounded text-[9px] font-bold flex items-center justify-center transition-colors ${
                                booked
                                  ? "bg-[#1a3a8f] text-[#f5c842]"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {seat.label.slice(-3)}
                            </div>
                          );
                        }),
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-[#1a3a8f]" /> Booked</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-100 border border-emerald-300" /> Available</span>
              </div>
            </div>

            {/* Passenger manifest */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Passenger manifest
                </p>
                <span className="text-xs text-gray-500">{data.seats.length} passenger{data.seats.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                {data.seats.length === 0 ? (
                  <p className="px-5 py-8 text-center text-gray-400 text-sm">No passengers booked yet for this date.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left bg-gray-50/50">
                        {["Seat", "Passenger", "Phone", "Amount"].map((h) => (
                          <th key={h} className="whitespace-nowrap px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.seats.map((s) => (
                        <tr key={s.seat_number} className="hover:bg-gray-50/50">
                          <td className="px-4 py-2.5 font-mono text-xs font-bold text-[#1a3a8f]">{s.seat_number}</td>
                          <td className="px-4 py-2.5">
                            <p className="text-sm text-gray-900">{s.passenger_name}</p>
                            <p className="text-[10px] text-gray-400">{s.age}y · {s.gender}</p>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-600 font-mono">{s.contact_phone}</td>
                          <td className="px-4 py-2.5 text-xs font-bold text-gray-900">{formatINR(s.total_amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-extrabold mt-1" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}

// ─── EditRouteModal ─────────────────────────────────────────────────

function EditRouteModal({
  route,
  onClose,
  onSaved,
}: {
  route: RouteRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [km, setKm] = useState(route.distance_km?.toString() ?? "");
  const [mins, setMins] = useState(route.estimated_duration_minutes?.toString() ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    const res = await fetch(`/api/admin/routes/${route.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        distance_km: km ? parseInt(km, 10) : null,
        estimated_duration_minutes: mins ? parseInt(mins, 10) : null,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const d = await res.json();
      setErr(d.error || "Failed to save");
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Pencil className="h-4 w-4 text-[#1a3a8f]" />
              Edit route
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {route.origin_name} → {route.destination_name}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {err && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{err}</p>
            </div>
          )}

          <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-xs text-gray-600">
            <p className="font-bold text-gray-800 mb-1">Route ID</p>
            <p className="font-mono">{route.id}</p>
            <p className="mt-2 text-[11px] text-gray-500">
              The cities and route ID can&apos;t be changed once created. To
              switch cities, deactivate this route and create a new one.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Distance (km)</label>
              <input
                type="number"
                min="0"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Duration (min)</label>
              <input
                type="number"
                min="0"
                value={mins}
                onChange={(e) => setMins(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2 justify-end">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a3a8f] hover:bg-[#142d70] disabled:opacity-50 text-white px-4 py-2 text-sm font-bold">
              {submitting ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── EditScheduleModal ──────────────────────────────────────────────

function EditScheduleModal({
  schedule,
  buses,
  onClose,
  onSaved,
}: {
  schedule: ScheduleRow;
  buses: BusOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [busId, setBusId] = useState(schedule.bus_id);
  const [departure, setDeparture] = useState(schedule.departure_time.slice(0, 5));
  const [arrival, setArrival] = useState(schedule.arrival_time.slice(0, 5));
  const [basePriceRupees, setBasePriceRupees] = useState(
    (schedule.base_price / 100).toFixed(2).replace(/\.00$/, ""),
  );
  const [sleeperPriceRupees, setSleeperPriceRupees] = useState(
    schedule.sleeper_price ? (schedule.sleeper_price / 100).toFixed(2).replace(/\.00$/, "") : "",
  );
  const [days, setDays] = useState<number[]>(schedule.days_of_week);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function toggleDay(d: number) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (days.length === 0) {
      setErr("Select at least one operating day");
      return;
    }
    if (!basePriceRupees) {
      setErr("Base price is required");
      return;
    }
    setSubmitting(true);
    const res = await fetch(`/api/admin/schedules/${schedule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bus_id: busId,
        departure_time: departure,
        arrival_time: arrival,
        base_price: Math.round(parseFloat(basePriceRupees) * 100),
        sleeper_price: sleeperPriceRupees ? Math.round(parseFloat(sleeperPriceRupees) * 100) : null,
        days_of_week: days,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const d = await res.json();
      setErr(d.error || "Failed to save");
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Pencil className="h-4 w-4 text-[#1a3a8f]" />
              Edit schedule
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {schedule.origin_name} → {schedule.destination_name}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4 overflow-y-auto">
          {err && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{err}</p>
            </div>
          )}

          <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-xs text-gray-600">
            <p className="font-bold text-gray-800 mb-1">Schedule ID</p>
            <p className="font-mono">{schedule.id}</p>
            <p className="mt-2 text-[11px] text-gray-500">
              The route can&apos;t be changed once created. Move to a different
              route by deactivating this and creating a new schedule.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Bus</label>
            <select
              required
              value={busId}
              onChange={(e) => setBusId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
            >
              {/* Make sure the currently-assigned bus is selectable even if inactive */}
              {!buses.some((b) => b.id === busId) && (
                <option value={busId}>{schedule.bus_name} · {schedule.total_seats} seats (current)</option>
              )}
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} · {b.total_seats} seats
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Departure</label>
              <input type="time" required value={departure} onChange={(e) => setDeparture(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Arrival</label>
              <input type="time" required value={arrival} onChange={(e) => setArrival(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Base price (₹)</label>
              <input type="number" required min="0" step="0.01" value={basePriceRupees} onChange={(e) => setBasePriceRupees(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Sleeper price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={sleeperPriceRupees}
                onChange={(e) => setSleeperPriceRupees(e.target.value)}
                placeholder="optional"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Operating days</label>
            <div className="flex gap-1.5">
              {dayLabels.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                    days.includes(i) ? "bg-[#1a3a8f] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2 justify-end">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a3a8f] hover:bg-[#142d70] disabled:opacity-50 text-white px-4 py-2 text-sm font-bold">
              {submitting ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
