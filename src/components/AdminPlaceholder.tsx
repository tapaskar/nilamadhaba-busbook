import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

/**
 * Placeholder for admin sub-pages we haven't built out yet — keeps the
 * navigation working and tells the user what's planned.
 */
export default function AdminPlaceholder({
  title,
  description,
  icon: Icon,
  features,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}) {
  return (
    <div className="max-w-3xl">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-[#1a3a8f] to-[#1a1a2e] px-6 py-8 text-white relative overflow-hidden">
          <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-[#f5c842]/20 blur-2xl pointer-events-none" />
          <div className="relative flex items-start gap-4">
            <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-[#f5c842] text-[#1a1a2e] shadow-lg shrink-0">
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#f5c842] mb-2">
                <Sparkles className="h-3 w-3" />
                Coming soon
              </div>
              <h2 className="text-2xl font-extrabold">{title}</h2>
              <p className="text-sm text-white/70 mt-1 max-w-lg">{description}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            What this page will do
          </p>
          <ul className="space-y-2">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#e8edf8] text-[#1a3a8f] text-xs font-bold shrink-0 mt-0.5">
                  ✓
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs text-gray-400">
            Want this prioritised? Reach out to engineering — we ship on a 2-week sprint.
          </p>
        </div>
      </div>
    </div>
  );
}
