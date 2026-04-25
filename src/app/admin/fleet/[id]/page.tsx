"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bus,
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Power,
  Wifi,
  Wind,
  Zap,
  Coffee,
  Snowflake,
  Tv,
  ShieldCheck,
  Lightbulb,
} from "lucide-react";

type SeatRow = {
  id: string;
  label: string;
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
  type: "seater" | "sleeper" | "semi_sleeper";
  price_tier: "base" | "sleeper";
  ladies_only: boolean;
};
type Deck = { name: string; rows: number; cols: number; seats: SeatRow[] };
type Layout = { version: number; decks: Deck[] };

type BusDetail = {
  id: string;
  name: string;
  registration_number: string;
  bus_type: "seater" | "sleeper" | "semi_sleeper";
  total_seats: number;
  seat_layout: Layout;
  amenities: string[];
  photos: string[];
  is_active: boolean;
  schedule_count: number;
};

type LayoutPreset = {
  id: string;
  label: string;
  description: string;
  totalSeats: number;
  bus_type: "seater" | "sleeper" | "semi_sleeper";
};

const allAmenities = [
  { id: "AC",                  icon: Snowflake },
  { id: "WiFi",                icon: Wifi      },
  { id: "Charging Point",      icon: Zap       },
  { id: "Blanket",             icon: Wind      },
  { id: "Water Bottle",        icon: Coffee    },
  { id: "Reading Light",       icon: Lightbulb },
  { id: "Track My Bus",        icon: Bus       },
  { id: "CCTV",                icon: Tv        },
  { id: "Fire Extinguisher",   icon: ShieldCheck },
  { id: "Emergency Exit",      icon: ShieldCheck },
];

export default function BusDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [bus, setBus] = useState<BusDetail | null>(null);
  const [layouts, setLayouts] = useState<LayoutPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Editable state
  const [name, setName] = useState("");
  const [reg, setReg] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoDraft, setPhotoDraft] = useState("");
  const [layoutChange, setLayoutChange] = useState<string>("");
  const [ladiesSeats, setLadiesSeats] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [bRes, lRes] = await Promise.all([
        fetch(`/api/admin/buses/${id}`,    { cache: "no-store" }),
        fetch(`/api/admin/layouts`,        { cache: "no-store" }),
      ]);
      const bData = await bRes.json();
      const lData = await lRes.json();
      if (!bRes.ok) {
        setError(bData.error || "Failed to load");
      } else {
        setBus(bData.bus);
        setName(bData.bus.name);
        setReg(bData.bus.registration_number);
        setAmenities(bData.bus.amenities ?? []);
        setPhotos(bData.bus.photos ?? []);
        setLadiesSeats(
          new Set(
            (bData.bus.seat_layout.decks as Deck[]).flatMap((d) =>
              d.seats.filter((s) => s.ladies_only).map((s) => s.id),
            ),
          ),
        );
      }
      if (lRes.ok) setLayouts(lData.layouts);
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function saveBasics(e: React.FormEvent) {
    e.preventDefault();
    setSaveMsg(null);
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/buses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          registration_number: reg,
          amenities,
          photos,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
      } else {
        setSaveMsg("Bus details saved.");
        setTimeout(() => setSaveMsg(null), 3000);
        load();
      }
    } catch {
      setError("Network error");
    }
    setSubmitting(false);
  }

  async function applyLayoutSwap() {
    if (!layoutChange) return;
    if (!confirm("Swapping the seat layout will reset all current ladies-only seat marks. Continue?")) return;
    setSubmitting(true);
    setError(null);
    setSaveMsg(null);
    try {
      const res = await fetch(`/api/admin/buses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layoutId: layoutChange }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
      } else {
        setSaveMsg("Seat layout swapped.");
        setLayoutChange("");
        load();
      }
    } catch {
      setError("Network error");
    }
    setSubmitting(false);
  }

  async function saveLadiesSeats() {
    setSubmitting(true);
    setError(null);
    setSaveMsg(null);
    try {
      const res = await fetch(`/api/admin/buses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ladiesOnlySeats: Array.from(ladiesSeats) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
      } else {
        setSaveMsg("Ladies-only seats updated.");
        setTimeout(() => setSaveMsg(null), 3000);
        load();
      }
    } catch {
      setError("Network error");
    }
    setSubmitting(false);
  }

  async function toggleActive() {
    if (!bus) return;
    if (!confirm(`${bus.is_active ? "Deactivate" : "Reactivate"} ${bus.name}?`)) return;
    await fetch(`/api/admin/buses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !bus.is_active }),
    });
    load();
  }

  function toggleAmenity(a: string) {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  function addPhoto() {
    const u = photoDraft.trim();
    if (!u) return;
    setPhotos((prev) => [...prev, u]);
    setPhotoDraft("");
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  function toggleLadiesSeat(seatId: string) {
    setLadiesSeats((prev) => {
      const next = new Set(prev);
      if (next.has(seatId)) next.delete(seatId);
      else next.add(seatId);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-10 w-10 rounded-full border-2 border-gray-200 border-t-[#1a3a8f] animate-spin" />
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-sm text-red-700">
        <p className="font-bold mb-1">Bus not found</p>
        <p>{error}</p>
        <button type="button" onClick={() => router.push("/admin/fleet")} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white border border-red-200 px-3 py-1.5 text-xs font-bold hover:bg-red-100 text-red-700">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Fleet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/fleet"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#1a3a8f]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Fleet
        </Link>
        <button
          type="button"
          onClick={toggleActive}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
            bus.is_active
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Power className="h-3.5 w-3.5" />
          {bus.is_active ? "Active" : "Deactivated"}
        </button>
      </div>

      {/* Top card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1a3a8f] to-[#1a1a2e] p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-[#f5c842]/20 blur-2xl pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-[#f5c842] text-[#1a1a2e] shrink-0">
            <Bus className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/60 font-bold uppercase tracking-wider">{bus.id}</p>
            <h1 className="text-xl font-extrabold mt-0.5">{bus.name}</h1>
            <p className="text-sm text-white/70 font-mono mt-0.5">{bus.registration_number}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-extrabold text-[#f5c842]">{bus.total_seats}</p>
            <p className="text-[10px] uppercase tracking-wider text-white/60">seats</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 text-xs text-white/70">
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-bold capitalize">
            {bus.bus_type.replace("_", " ")}
          </span>
          <span>·</span>
          <span>{bus.schedule_count} active schedule{bus.schedule_count !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}
      {saveMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> {saveMsg}
        </div>
      )}

      {/* ── Basics ── */}
      <form onSubmit={saveBasics} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Basic info</h2>
          <p className="text-xs text-gray-500 mt-0.5">Display name, registration number, amenities, photos.</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Display name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Registration #</label>
              <input
                type="text"
                required
                value={reg}
                onChange={(e) => setReg(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {allAmenities.map((a) => {
                const active = amenities.includes(a.id);
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

          {/* Photos */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Photos</label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="url"
                  value={photoDraft}
                  onChange={(e) => setPhotoDraft(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-3 py-2 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={addPhoto}
                disabled={!photoDraft.trim()}
                className="inline-flex items-center gap-1 rounded-xl bg-[#1a3a8f] hover:bg-[#142d70] disabled:opacity-50 text-white px-3 py-2 text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
            {photos.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {photos.map((p, i) => (
                  <div key={`${p}-${i}`} className="relative group rounded-lg overflow-hidden border border-gray-100 aspect-[4/3] bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 rounded-md bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove photo"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No photos yet — add a URL above.</p>
            )}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-gray-100 flex justify-end bg-gray-50/50">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a3a8f] hover:bg-[#142d70] disabled:opacity-50 text-white px-4 py-2 text-sm font-bold transition-colors"
          >
            <Save className="h-4 w-4" />
            {submitting ? "Saving…" : "Save basics"}
          </button>
        </div>
      </form>

      {/* ── Seat layout ── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Seat layout</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {bus.total_seats} seats · pick a different preset to swap layout, or tap individual seats below to mark them ladies-only.
          </p>
        </div>

        {/* Layout swap */}
        <div className="px-6 py-4 border-b border-gray-100 bg-amber-50/40">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-1 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-900 mb-2">Swap to a different layout preset</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={layoutChange}
                  onChange={(e) => setLayoutChange(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
                >
                  <option value="">Pick a preset…</option>
                  {layouts.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!layoutChange || submitting}
                  onClick={applyLayoutSwap}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-4 py-2 text-sm font-bold whitespace-nowrap"
                >
                  Swap layout
                </button>
              </div>
              <p className="text-[11px] text-amber-700 mt-1.5">
                Refused if there are upcoming bookings on this bus. Resets all ladies-only marks.
              </p>
            </div>
          </div>
        </div>

        {/* Seat grid (interactive) */}
        <div className="p-6 space-y-5">
          {bus.seat_layout.decks.map((deck) => (
            <div key={deck.name}>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{deck.name}</p>
              <div
                className="grid gap-1.5 mx-auto w-fit"
                style={{ gridTemplateColumns: `repeat(${deck.cols}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: deck.rows }).flatMap((_, rowIdx) =>
                  Array.from({ length: deck.cols }).map((__, colIdx) => {
                    const seat = deck.seats.find((s) => s.row === rowIdx && s.col === colIdx);
                    if (!seat) return <div key={`${rowIdx}-${colIdx}`} className="w-10 h-10" />;
                    const isLadies = ladiesSeats.has(seat.id);
                    return (
                      <button
                        key={seat.id}
                        type="button"
                        onClick={() => toggleLadiesSeat(seat.id)}
                        title={`${seat.label} — ${isLadies ? "Ladies only" : "Tap to mark ladies-only"}`}
                        className={`relative w-10 h-10 rounded-lg border-2 text-[10px] font-bold transition-colors ${
                          isLadies
                            ? "bg-pink-100 border-pink-400 text-pink-700"
                            : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {seat.label}
                      </button>
                    );
                  }),
                )}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-4 text-xs pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1.5 text-gray-500">
              <span className="inline-block h-3 w-3 rounded bg-pink-100 border border-pink-400" />
              Ladies only
            </span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500">{ladiesSeats.size} marked</span>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-gray-100 flex justify-end bg-gray-50/50">
          <button
            type="button"
            onClick={saveLadiesSeats}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a3a8f] hover:bg-[#142d70] disabled:opacity-50 text-white px-4 py-2 text-sm font-bold transition-colors"
          >
            <Save className="h-4 w-4" />
            {submitting ? "Saving…" : "Save ladies-only seats"}
          </button>
        </div>
      </div>
    </div>
  );
}
