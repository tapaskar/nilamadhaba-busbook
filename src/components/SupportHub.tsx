"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquareText, X, Sparkles, Zap, Clock } from "lucide-react";
import SupportBot from "./SupportBot";
import WhatsAppChat from "./WhatsAppChat";

/**
 * Unified support launcher.
 *
 * One floating button in the bottom-right corner. Clicking it reveals
 * a small menu offering two channels:
 *   1. Nila Assist   — AI chat (instant, always-available)
 *   2. WhatsApp      — human reps (minutes-SLA, external app)
 *
 * Picking either opens its dedicated chat panel with a back-arrow
 * returning to the menu (not closing entirely). Picking the launcher
 * again while open closes everything.
 *
 * Replaces the two separate FABs that used to live side-by-side.
 */

type View = "closed" | "menu" | "ai" | "whatsapp";

export default function SupportHub() {
  const [view, setView] = useState<View>("closed");
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (view === "closed") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setView("closed");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  // Close when clicking outside the menu (but not while a chat is open)
  useEffect(() => {
    if (view !== "menu") return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setView("closed");
      }
    };
    // Delay binding so the opening click doesn't immediately close
    const t = setTimeout(() => document.addEventListener("mousedown", onClick), 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onClick);
    };
  }, [view]);

  const isOpen = view !== "closed";

  function handleLauncherClick() {
    setHasBeenOpened(true);
    setView(isOpen ? "closed" : "menu");
  }

  return (
    <>
      {/* Controlled sub-panels */}
      <SupportBot
        open={view === "ai"}
        onBack={() => setView("menu")}
        onClose={() => setView("closed")}
      />
      <WhatsAppChat
        open={view === "whatsapp"}
        onBack={() => setView("menu")}
        onClose={() => setView("closed")}
      />

      {/* Root wrapper — everything anchored bottom-right */}
      <div ref={rootRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
        {/* Menu panel (above the FAB) */}
        {view === "menu" && (
          <div className="pointer-events-auto w-[calc(100vw-3rem)] sm:w-80 rounded-2xl bg-white shadow-2xl shadow-[#1a1a2e]/20 border border-gray-100 overflow-hidden animate-chat-in">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#1a3a8f] to-[#1a1a2e] px-5 py-5 text-white overflow-hidden">
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-[#f5c842]/20 blur-2xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="font-extrabold text-lg tracking-tight">
                      Need a hand?
                    </p>
                    <Sparkles className="h-4 w-4 text-[#f5c842]" />
                  </div>
                  <p className="text-sm text-white/75">
                    We&apos;re here to help — pick how you&apos;d like to chat.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setView("closed")}
                  aria-label="Close menu"
                  className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Channel options */}
            <div className="p-3 space-y-2">
              {/* Nila Assist (AI) */}
              <button
                type="button"
                onClick={() => setView("ai")}
                className="group relative w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#1a3a8f]/40 hover:bg-[#e8edf8]/60 transition-all text-left"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-[#1a3a8f] to-[#1a1a2e] shadow-md shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#f5c842" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v4M8 16h.01M16 16h.01" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm text-gray-900">Nila Assist</p>
                    <span className="inline-flex items-center rounded-md bg-[#f5c842] text-[#1a1a2e] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
                      AI
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-[#f5c842]" />
                    Instant answers, always online
                  </p>
                </div>
                <svg className="h-4 w-4 text-gray-300 group-hover:text-[#1a3a8f] group-hover:translate-x-1 transition-all shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* WhatsApp */}
              <button
                type="button"
                onClick={() => setView("whatsapp")}
                className="group relative w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#25D366]/40 hover:bg-[#25D366]/5 transition-all text-left"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#25D366] shadow-md shrink-0">
                  <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900">WhatsApp</p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[#25D366]" />
                    Our reps reply in minutes
                  </p>
                </div>
                <svg className="h-4 w-4 text-gray-300 group-hover:text-[#25D366] group-hover:translate-x-1 transition-all shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* Footer — toll-free number */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">
                Prefer a call?
              </span>
              <a
                href="tel:18001234567"
                className="text-xs font-bold text-[#1a3a8f] hover:underline"
              >
                1800-123-4567
              </a>
            </div>
          </div>
        )}

        {/* The one launcher FAB */}
        <button
          type="button"
          onClick={handleLauncherClick}
          aria-label={isOpen ? "Close support menu" : "Open support menu"}
          aria-expanded={isOpen}
          className="pointer-events-auto relative flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-[#1a3a8f] to-[#1a1a2e] text-[#f5c842] shadow-xl shadow-[#1a3a8f]/40 hover:scale-105 hover:shadow-2xl hover:shadow-[#1a3a8f]/60 active:scale-95 transition-all duration-200"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <MessageSquareText className="h-6 w-6" />

              {/* Gold pulse ring — only until first open */}
              {!hasBeenOpened && (
                <span className="absolute inset-0 rounded-full bg-[#f5c842]/30 animate-ping" />
              )}

              {/* Unread badge — small, elegant */}
              {!hasBeenOpened && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-[#f5c842] text-[#1a1a2e] text-[10px] font-black border-2 border-white shadow-md">
                  1
                </span>
              )}
            </>
          )}
        </button>

        {/* Hover-reveal tooltip (pointer-events-none so it doesn't steal clicks) */}
        {view === "closed" && (
          <div className="absolute bottom-4 right-[4.5rem] pointer-events-none opacity-0 hover:opacity-100 transition-opacity hidden sm:block">
            {/* The tooltip is controlled by the parent hover via group-hover — simplified: omitted for now */}
          </div>
        )}
      </div>
    </>
  );
}
