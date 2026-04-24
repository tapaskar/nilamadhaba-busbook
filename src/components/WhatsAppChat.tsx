"use client";

import { useState } from "react";
import { MessageCircle, X, ExternalLink } from "lucide-react";

/**
 * WhatsApp floating chat widget.
 *
 * Click → reveals a panel with preset quick-reply prompts.
 * Clicking a prompt deep-links to wa.me with a pre-filled message.
 *
 * In production, replace NEXT_PUBLIC_WHATSAPP_NUMBER with your business number.
 */

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210"; // default demo number

const quickPrompts: { label: string; message: string }[] = [
  {
    label: "Help me book a ticket",
    message:
      "Hi NilaMadhaba, I need help booking a ticket. Can you assist me?",
  },
  {
    label: "Check booking status",
    message:
      "Hi NilaMadhaba, I'd like to check the status of my booking. Booking ID: ",
  },
  {
    label: "Cancel or reschedule",
    message:
      "Hi, I need to cancel or reschedule my booking. Can you help me with the process?",
  },
  {
    label: "Track my bus",
    message:
      "Hi, I'd like to track my bus live. Booking ID: ",
  },
  {
    label: "Refund query",
    message:
      "Hi, I have a question about my refund. Booking ID: ",
  },
];

/**
 * Props:
 *   open?       If provided, component is "controlled" — parent manages state
 *               and the built-in launcher FAB is hidden.
 *   onClose?    Called when user closes the panel.
 *   onBack?     When set, replaces close-X with a back-← arrow.
 */
export default function WhatsAppChat({
  open: controlledOpen,
  onClose: controlledOnClose,
  onBack,
}: {
  open?: boolean;
  onClose?: () => void;
  onBack?: () => void;
} = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    if (isControlled) {
      if (!v) controlledOnClose?.();
    } else {
      setInternalOpen(v);
    }
  };

  function openWhatsApp(message: string) {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message,
    )}`;
    // Try window.open; if blocked by popup-blocker, fall back to same-tab
    // navigation so the user still lands on WhatsApp.
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win || win.closed || typeof win.closed === "undefined") {
      window.location.href = url;
    }
  }

  return (
    <>
      {/* Floating button — only in uncontrolled (standalone) mode */}
      {!isControlled && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close WhatsApp chat" : "Chat on WhatsApp"}
          className="fixed bottom-6 right-6 z-40 flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 hover:scale-105 hover:shadow-2xl active:scale-95 transition-all duration-200"
        >
          {open ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="absolute inset-0 rounded-full bg-[#25D366]/60 animate-ping" />
            </>
          )}
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-[calc(100vw-3rem)] sm:w-80 rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden animate-chat-in">
          {/* Header */}
          <div className="bg-[#25D366] p-4 text-white">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  aria-label="Back to menu"
                  className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm shrink-0">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">NilaMadhaba Support</p>
                <div className="flex items-center gap-1.5 text-xs text-white/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-200 animate-pulse" />
                  Typically replies in minutes
                </div>
              </div>
              {isControlled && !onBack && (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Welcome message */}
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <div className="bg-white rounded-2xl rounded-tl-none px-3.5 py-2.5 shadow-sm border border-gray-100 max-w-[90%]">
              <p className="text-sm text-gray-700">
                👋 Hi there! Pick a question below to open WhatsApp with it already typed, or tap the green button to start a new chat.
              </p>
            </div>
          </div>

          {/* Quick prompts */}
          <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Quick Questions
            </p>
            {quickPrompts.map((prompt) => (
              <button
                key={prompt.label}
                type="button"
                onClick={() => openWhatsApp(prompt.message)}
                className="group w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left rounded-xl border border-gray-100 hover:border-[#25D366]/50 hover:bg-[#25D366]/5 transition-all text-sm text-gray-700 hover:text-gray-900"
              >
                <span className="font-medium truncate">{prompt.label}</span>
                <ExternalLink className="h-3.5 w-3.5 text-gray-300 group-hover:text-[#25D366] shrink-0 transition-colors" />
              </button>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="p-3 bg-gray-50 border-t border-gray-100">
            <button
              type="button"
              onClick={() =>
                openWhatsApp(
                  "Hi NilaMadhaba, I need assistance with my travel plans.",
                )
              }
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1DA851] text-white text-sm font-semibold transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Start WhatsApp Chat
            </button>
          </div>
        </div>
      )}
    </>
  );
}
