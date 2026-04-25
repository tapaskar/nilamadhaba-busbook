"use client";

import { useEffect, useState } from "react";
import {
  Layout,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Save,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import {
  sectionDefs,
  findSectionDef,
  findBlockDef,
  type FieldDef,
  type FieldType,
} from "@/lib/cms-schema";

type Block = {
  id: string;
  section_id: string;
  type: string;
  position: number;
  settings: Record<string, unknown>;
  is_visible: boolean;
};

type Section = {
  id: string;
  type: string;
  position: number;
  settings: Record<string, unknown>;
  is_visible: boolean;
  blocks: Block[];
};

export default function AdminLandingPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/cms/sections?page=home", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
      } else {
        setSections(data.sections);
        if (data.sections[0] && !activeId) setActiveId(data.sections[0].id);
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addSection(type: string) {
    setSaveMsg(null);
    const res = await fetch("/api/admin/cms/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: "home", type }),
    });
    const d = await res.json();
    if (!res.ok) {
      alert(d.error);
      return;
    }
    setSaveMsg("Section added.");
    setActiveId(d.section.id);
    load();
  }

  async function removeSection(s: Section) {
    if (!confirm(`Remove the ${findSectionDef(s.type)?.label || s.type} section? Its blocks will be deleted too.`)) return;
    await fetch(`/api/admin/cms/sections/${s.id}`, { method: "DELETE" });
    if (activeId === s.id) setActiveId(null);
    load();
  }

  async function moveSection(s: Section, dir: -1 | 1) {
    const idx = sections.findIndex((x) => x.id === s.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sections.length) return;
    const other = sections[swapIdx];
    await Promise.all([
      fetch(`/api/admin/cms/sections/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: other.position }),
      }),
      fetch(`/api/admin/cms/sections/${other.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: s.position }),
      }),
    ]);
    load();
  }

  async function toggleSectionVisibility(s: Section) {
    await fetch(`/api/admin/cms/sections/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !s.is_visible }),
    });
    load();
  }

  async function saveSettings(sectionId: string, settings: Record<string, unknown>) {
    setSaveMsg(null);
    setError(null);
    const res = await fetch(`/api/admin/cms/sections/${sectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed");
      return false;
    }
    setSaveMsg("Saved · live on the public site.");
    setTimeout(() => setSaveMsg(null), 3000);
    load();
    return true;
  }

  // Determine which section types are still addable
  const presentTypes = new Set(sections.map((s) => s.type));
  const addableSections = sectionDefs.filter((def) => !def.singular || !presentTypes.has(def.type));

  const active = sections.find((s) => s.id === activeId) ?? sections[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      {/* Sidebar — sections list */}
      <aside className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Layout className="h-4 w-4 text-gray-400" />
            Home page sections
          </h2>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Drag to reorder · click to edit
          </p>
        </div>

        <div className="p-2 space-y-1">
          {loading && <p className="px-3 py-4 text-xs text-gray-400">Loading…</p>}
          {!loading && sections.length === 0 && (
            <p className="px-3 py-4 text-xs text-gray-400 text-center">
              No sections yet. Add one below.
            </p>
          )}
          {sections.map((s, idx) => {
            const def = findSectionDef(s.type);
            const isActive = activeId === s.id;
            return (
              <div
                key={s.id}
                className={`group rounded-lg border-2 transition-colors ${
                  isActive
                    ? "border-[#1a3a8f] bg-[#e8edf8]/40"
                    : "border-transparent hover:bg-gray-50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveId(s.id)}
                  className="w-full text-left px-3 py-2 flex items-center gap-2"
                >
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${s.is_visible ? "bg-emerald-500" : "bg-gray-300"}`} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-bold text-gray-900 truncate">
                      {def?.label ?? s.type}
                    </span>
                    {s.blocks.length > 0 && (
                      <span className="block text-[10px] text-gray-400">
                        {s.blocks.length} block{s.blocks.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </span>
                </button>
                <div className="flex items-center gap-0.5 px-2 pb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => moveSection(s, -1)} disabled={idx === 0} className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30">
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={() => moveSection(s, 1)} disabled={idx === sections.length - 1} className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30">
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={() => toggleSectionVisibility(s)} className="rounded p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50" title={s.is_visible ? "Hide" : "Show"}>
                    {s.is_visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </button>
                  <button type="button" onClick={() => removeSection(s)} className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50" title="Remove">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {addableSections.length > 0 && (
          <div className="px-3 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Add section</p>
            <div className="space-y-1">
              {addableSections.map((def) => (
                <button
                  key={def.type}
                  type="button"
                  onClick={() => addSection(def.type)}
                  className="w-full flex items-center gap-2 rounded-lg border border-gray-200 bg-white hover:bg-[#e8edf8]/40 hover:border-[#1a3a8f]/30 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors"
                >
                  <Plus className="h-3 w-3 text-[#1a3a8f]" />
                  <span className="flex-1 text-left truncate">{def.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-3 py-3 border-t border-gray-100">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a3a8f] hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            View live home page
          </a>
        </div>
      </aside>

      {/* Editor pane */}
      <div className="space-y-3 min-w-0">
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

        {!active ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <Layout className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Pick a section from the left to edit it, or add a new one.
            </p>
          </div>
        ) : (
          <SectionEditor
            key={active.id}
            section={active}
            onSave={saveSettings}
            onReload={load}
          />
        )}
      </div>
    </div>
  );
}

// ─── SectionEditor ────────────────────────────────────────────────

function SectionEditor({
  section,
  onSave,
  onReload,
}: {
  section: Section;
  onSave: (id: string, settings: Record<string, unknown>) => Promise<boolean>;
  onReload: () => void;
}) {
  const def = findSectionDef(section.type);
  const [draft, setDraft] = useState<Record<string, unknown>>(section.settings);
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(key: string, value: unknown) {
    setDraft((d) => ({ ...d, [key]: value }));
    setDirty(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const ok = await onSave(section.id, draft);
    setSubmitting(false);
    if (ok) setDirty(false);
  }

  if (!def) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        Unknown section type <code>{section.type}</code> — schema may be out of date.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSave}
        className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{def.label}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{def.description}</p>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
          {def.settings.map((field) => (
            <FieldRenderer
              key={field.key}
              field={field}
              value={draft[field.key]}
              onChange={(v) => update(field.key, v)}
              wide={field.type === "long_text" || field.type === "image_url" || field.type === "url"}
            />
          ))}
        </div>

        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <span className="text-xs text-gray-500">
            {dirty ? "Unsaved changes" : "All changes saved"}
          </span>
          <button
            type="submit"
            disabled={submitting || !dirty}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a3a8f] hover:bg-[#142d70] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 text-sm font-bold shadow-sm transition-colors"
          >
            <Save className="h-4 w-4" />
            {submitting ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      {/* Blocks editor (only if section type allows blocks) */}
      {def.blocks && def.blocks.length > 0 && (
        <BlocksEditor section={section} onReload={onReload} />
      )}
    </div>
  );
}

// ─── BlocksEditor ─────────────────────────────────────────────────

function BlocksEditor({
  section,
  onReload,
}: {
  section: Section;
  onReload: () => void;
}) {
  const def = findSectionDef(section.type);
  if (!def?.blocks || def.blocks.length === 0) return null;
  // Most sections have one block-type; we'll surface that as the only "+ add" option.
  const primary = def.blocks[0];

  async function addBlock() {
    const res = await fetch(`/api/admin/cms/sections/${section.id}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: primary.type }),
    });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error);
      return;
    }
    onReload();
  }

  async function removeBlock(b: Block) {
    if (!confirm("Remove this block?")) return;
    await fetch(`/api/admin/cms/blocks/${b.id}`, { method: "DELETE" });
    onReload();
  }

  async function moveBlock(b: Block, dir: -1 | 1) {
    const idx = section.blocks.findIndex((x) => x.id === b.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= section.blocks.length) return;
    const other = section.blocks[swapIdx];
    await Promise.all([
      fetch(`/api/admin/cms/blocks/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: other.position }),
      }),
      fetch(`/api/admin/cms/blocks/${other.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: b.position }),
      }),
    ]);
    onReload();
  }

  async function toggleBlockVisibility(b: Block) {
    await fetch(`/api/admin/cms/blocks/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !b.is_visible }),
    });
    onReload();
  }

  async function saveBlock(b: Block, settings: Record<string, unknown>) {
    const res = await fetch(`/api/admin/cms/blocks/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error);
      return false;
    }
    onReload();
    return true;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">{primary.label}s</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {section.blocks.length} block{section.blocks.length !== 1 ? "s" : ""}
            {primary.max ? ` · max ${primary.max}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={addBlock}
          disabled={primary.max !== undefined && section.blocks.length >= primary.max}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a3a8f] hover:bg-[#142d70] disabled:opacity-50 text-white px-3 py-1.5 text-xs font-bold transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add {primary.label.toLowerCase()}
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {section.blocks.length === 0 && (
          <p className="px-6 py-12 text-center text-sm text-gray-400">
            No {primary.label.toLowerCase()}s yet. Click <strong>Add</strong>.
          </p>
        )}
        {section.blocks.map((b, idx) => {
          const blockDef = findBlockDef(section.type, b.type) ?? primary;
          return (
            <BlockEditor
              key={b.id}
              block={b}
              fields={blockDef.settings}
              onSave={(settings) => saveBlock(b, settings)}
              onRemove={() => removeBlock(b)}
              onToggleVisibility={() => toggleBlockVisibility(b)}
              canMoveUp={idx > 0}
              canMoveDown={idx < section.blocks.length - 1}
              onMoveUp={() => moveBlock(b, -1)}
              onMoveDown={() => moveBlock(b, 1)}
            />
          );
        })}
      </div>
    </div>
  );
}

function BlockEditor({
  block,
  fields,
  onSave,
  onRemove,
  onToggleVisibility,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: {
  block: Block;
  fields: FieldDef[];
  onSave: (settings: Record<string, unknown>) => Promise<boolean>;
  onRemove: () => void;
  onToggleVisibility: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(block.settings);
  const [submitting, setSubmitting] = useState(false);

  const title = (block.settings.title as string | undefined) ?? `Block ${block.id.slice(0, 6)}`;

  return (
    <div className="px-6 py-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex-1 text-left flex items-center gap-2"
        >
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${block.is_visible ? "bg-emerald-500" : "bg-gray-300"}`} />
          <span className="text-sm font-semibold text-gray-900 truncate">{title}</span>
          {open ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
        </button>
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={onMoveUp} disabled={!canMoveUp} className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30">
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onMoveDown} disabled={!canMoveDown} className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30">
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onToggleVisibility} className="rounded p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50" title={block.is_visible ? "Hide" : "Show"}>
            {block.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
          <button type="button" onClick={onRemove} className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {open && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitting(true);
            await onSave(draft);
            setSubmitting(false);
          }}
          className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4 pl-4 border-l-2 border-gray-100"
        >
          {fields.map((f) => (
            <FieldRenderer
              key={f.key}
              field={f}
              value={draft[f.key]}
              onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
              wide={f.type === "long_text" || f.type === "image_url" || f.type === "url"}
            />
          ))}
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a3a8f] hover:bg-[#142d70] disabled:opacity-50 text-white px-3 py-1.5 text-xs font-bold transition-colors">
              <Save className="h-3.5 w-3.5" />
              {submitting ? "Saving…" : "Save block"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── FieldRenderer ────────────────────────────────────────────────

function FieldRenderer({
  field,
  value,
  onChange,
  wide,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  wide?: boolean;
}) {
  const id = `f-${field.key}`;

  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
        {field.label}
      </label>
      <FieldInput field={field} value={value} onChange={onChange} id={id} />
      {field.help && <p className="text-[11px] text-gray-500 mt-1">{field.help}</p>}
      {field.type === "image_url" && typeof value === "string" && value && (
        <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-20 w-full object-cover rounded" />
        </div>
      )}
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  id,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  id: string;
}) {
  const t: FieldType = field.type;

  if (t === "long_text") {
    return (
      <textarea
        id={id}
        rows={3}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none resize-none"
      />
    );
  }

  if (t === "boolean") {
    const checked = Boolean(value);
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-[#1a3a8f] focus:ring-[#1a3a8f]"
        />
        <span className="text-sm text-gray-700">{checked ? "Enabled" : "Disabled"}</span>
      </label>
    );
  }

  if (t === "color") {
    const v = typeof value === "string" ? value : "";
    return (
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={v || "#1a3a8f"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 rounded border border-gray-200 cursor-pointer"
        />
        <input
          id={id}
          type="text"
          value={v}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#1a3a8f"
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
        />
      </div>
    );
  }

  if (t === "image_url") {
    return (
      <div className="relative">
        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          id={id}
          type="url"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? "https://images.unsplash.com/…"}
          className="w-full rounded-xl border border-gray-200 pl-10 pr-3 py-2 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
        />
      </div>
    );
  }

  return (
    <input
      id={id}
      type={t === "number" ? "number" : t === "url" ? "url" : "text"}
      value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
      onChange={(e) => onChange(t === "number" ? Number(e.target.value) : e.target.value)}
      placeholder={field.placeholder}
      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
    />
  );
}
