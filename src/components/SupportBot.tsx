"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  X,
  Send,
  Headphones,
  Phone,
  Clock,
  Sparkles,
} from "lucide-react";

/**
 * AI Contact Center chatbot ("Nila Assist").
 *
 * Client-side NLU keyword matcher with canned FAQ responses covering
 * booking, cancellation, refunds, tracking, luggage, and fallback → escalate.
 *
 * Brand: Royal Blue gradient header, Gold accent, matches site palette.
 * In production, this component is the UI shell — swap the resolver with a
 * streaming call to /api/chat backed by Claude / Vercel AI Gateway.
 */

type Msg = {
  id: string;
  role: "bot" | "user";
  text: string;
  chips?: string[];
  ts: number;
};

type Intent =
  | "greeting"
  | "book"
  | "cancel"
  | "refund"
  | "track"
  | "reschedule"
  | "luggage"
  | "payment"
  | "safety"
  | "loyalty"
  | "contact"
  | "hours"
  | "fallback";

const suggestedStarters = [
  "How do I book a ticket?",
  "Cancellation & refund policy",
  "Track my bus",
  "Is it safe for solo women?",
  "Talk to a human",
];

function classify(input: string): Intent {
  const t = input.toLowerCase();
  if (/^(hi|hello|hey|namaste|hola)\b/.test(t)) return "greeting";
  if (/cancel/.test(t)) return "cancel";
  if (/refund|money.*back|chargeback/.test(t)) return "refund";
  if (/reschedul|change.*date|postpone/.test(t)) return "reschedule";
  if (/track|live.*location|where.*bus|gps/.test(t)) return "track";
  if (/luggage|baggage|bag.*limit/.test(t)) return "luggage";
  if (/pay|upi|card|wallet|net.?bank/.test(t)) return "payment";
  if (/safe|women|security|solo|cctv/.test(t)) return "safety";
  if (/loyalty|point|discount|coupon|offer/.test(t)) return "loyalty";
  if (/human|agent|contact|call|phone|whats.?app/.test(t)) return "contact";
  if (/hour|timing|open|24|support.*available/.test(t)) return "hours";
  if (/book|reserve|buy|ticket/.test(t)) return "book";
  return "fallback";
}

function resolve(intent: Intent): { text: string; chips?: string[] } {
  switch (intent) {
    case "greeting":
      return {
        text:
          "Hi! 👋 I'm Nila Assist, your NilaMadhaba travel concierge. How can I help today?",
        chips: ["Book a ticket", "Cancellation policy", "Track my bus"],
      };
    case "book":
      return {
        text:
          "Booking is easy:\n\n1. Enter your From & To cities on the home page\n2. Pick a travel date\n3. Choose your bus and seat\n4. Pay with UPI, card, or wallet\n\nYou'll get an instant e-ticket with QR code. Ready to start?",
        chips: ["Start booking", "What buses are available?", "Payment options"],
      };
    case "cancel":
      return {
        text:
          "Our cancellation policy:\n\n• 12+ hrs before departure → 100% refund\n• 6–12 hrs before → 75% refund\n• 2–6 hrs before → 50% refund\n• Under 2 hrs → no refund\n\nRefunds hit your wallet instantly, or your source account in 3–5 business days.",
        chips: ["Cancel my booking", "Check refund status"],
      };
    case "refund":
      return {
        text:
          "Refunds are processed instantly to your NilaMadhaba wallet, or within 3–5 business days to your original payment method. If it's been longer, share your booking ID and I'll look it up.",
        chips: ["Share booking ID", "Talk to agent"],
      };
    case "reschedule":
      return {
        text:
          "You can reschedule up to 4 hrs before departure — Silver tier and above get it free. Just open My Trips → pick the booking → 'Reschedule'. Date, time, seat — all changeable.",
        chips: ["Go to My Trips", "Loyalty tiers"],
      };
    case "track":
      return {
        text:
          "All NilaMadhaba buses have live GPS. Open My Trips → your booking → 'Track Bus' to see real-time location on a map. You can also share the link with family.",
        chips: ["My Trips", "ETA accuracy"],
      };
    case "luggage":
      return {
        text:
          "Each passenger can carry:\n\n• 1 check-in bag up to 15 kg\n• 1 cabin bag (7 kg) with you on the seat\n\nExtra luggage is ₹50/kg. No sharp objects, flammables, or illegal items.",
      };
    case "payment":
      return {
        text:
          "We accept UPI (GPay, PhonePe, Paytm), all major credit/debit cards, net banking, and in-app wallet. All transactions are PCI-DSS compliant and secured with 256-bit SSL.",
      };
    case "safety":
      return {
        text:
          "Safety first 🛡️\n\n• Every bus has CCTV + SOS button\n• Live GPS tracking shareable with family\n• Background-verified drivers\n• Ladies-only seats highlighted in seat map\n• 24/7 women's support helpline",
        chips: ["Ladies seats", "Talk to agent"],
      };
    case "loyalty":
      return {
        text:
          "Our RideClub rewards every trip:\n\n• 🥉 Bronze (0-999 pts) — free cancellation\n• 🥈 Silver (1,000+) — 3% off + priority seats\n• 🥇 Gold (5,000+) — 5% off + lounge access\n• 💎 Platinum (15,000+) — 8% off + free reschedule\n\n₹1 spent = 1 point. Points don't expire for 12 months.",
      };
    case "contact":
      return {
        text:
          "You can reach us 24/7 via:\n\n📞 Call: 1800-123-4567 (toll-free)\n💬 WhatsApp: +91 98765 43210\n✉️ Email: support@nilamadhaba.com\n\nAverage response time under 2 minutes.",
        chips: ["Open WhatsApp", "Call now"],
      };
    case "hours":
      return {
        text:
          "Our support is available 24×7, all 365 days a year — including holidays. Bookings can be made anytime on the website or app.",
      };
    default:
      return {
        text:
          "Got it — let me connect you with a human agent who can help. Meanwhile, you can also WhatsApp us for an instant response.",
        chips: ["Open WhatsApp", "Call support"],
      };
  }
}

function rid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function SupportBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: rid(),
      role: "bot",
      text:
        "Hi! I'm Nila Assist 🤖 — your AI-powered travel concierge. Ask me about bookings, cancellations, tracking, or anything else!",
      chips: suggestedStarters,
      ts: Date.now(),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Msg = {
      id: rid(),
      role: "user",
      text: trimmed,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Special chip actions
    if (/open whats.?app/i.test(trimmed)) {
      setIsTyping(true);
      setTimeout(() => {
        const waUrl = `https://wa.me/${
          process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210"
        }?text=${encodeURIComponent(
          "Hi NilaMadhaba, I was chatting on the website and would like to continue here.",
        )}`;
        window.open(waUrl, "_blank", "noopener,noreferrer");
        setMessages((prev) => [
          ...prev,
          {
            id: rid(),
            role: "bot",
            text: "Opening WhatsApp in a new tab… 📱",
            ts: Date.now(),
          },
        ]);
        setIsTyping(false);
      }, 400);
      return;
    }

    if (/call.*(support|now)/i.test(trimmed)) {
      setMessages((prev) => [
        ...prev,
        {
          id: rid(),
          role: "bot",
          text:
            "Call us toll-free at **1800-123-4567**. Available 24×7. Tap the number on mobile to dial.",
          ts: Date.now(),
        },
      ]);
      return;
    }

    // NLU flow
    setIsTyping(true);
    setTimeout(() => {
      const intent = classify(trimmed);
      const { text: answer, chips } = resolve(intent);
      setMessages((prev) => [
        ...prev,
        {
          id: rid(),
          role: "bot",
          text: answer,
          chips,
          ts: Date.now(),
        },
      ]);
      setIsTyping(false);
    }, 700);
  }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className="fixed bottom-6 right-24 z-40 flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-[#1a3a8f] to-[#1a1a2e] text-[#f5c842] shadow-xl shadow-[#1a3a8f]/30 hover:scale-105 hover:shadow-2xl active:scale-95 transition-all duration-200"
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <Headphones className="h-6 w-6" />
            {/* Gold pulse ring */}
            <span className="absolute inset-0 rounded-full bg-[#f5c842]/30 animate-ping" />
            {/* Notification dot */}
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-5 w-5 rounded-full bg-[#f5c842] text-[#1a1a2e] text-[10px] font-bold border-2 border-white">
              1
            </span>
          </>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-[calc(100vw-3rem)] sm:w-96 h-[32rem] max-h-[calc(100vh-8rem)] rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-chat-in">
          {/* Header — Royal Blue gradient with gold accents */}
          <div className="relative bg-gradient-to-br from-[#1a3a8f] to-[#1a1a2e] p-4 text-white overflow-hidden shrink-0">
            {/* Gold orb */}
            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-[#f5c842]/20 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-[#f5c842] text-[#1a1a2e] shadow-lg">
                <Bot className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-base">Nila Assist</p>
                  <Sparkles className="h-3.5 w-3.5 text-[#f5c842]" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  Online • AI-powered
                </div>
              </div>
            </div>
          </div>

          {/* Quick utility bar */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#e8edf8]/50 border-b border-gray-100 text-xs shrink-0">
            <span className="inline-flex items-center gap-1 text-gray-600">
              <Clock className="h-3 w-3" />
              24×7 support
            </span>
            <span className="text-gray-300">•</span>
            <a
              href="tel:18001234567"
              className="inline-flex items-center gap-1 text-[#1a3a8f] font-semibold hover:underline"
            >
              <Phone className="h-3 w-3" />
              1800-123-4567
            </a>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-[#f8f9fc] to-white"
          >
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                msg={m}
                onChipClick={(chip) => sendMessage(chip)}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="p-3 border-t border-gray-100 bg-white shrink-0"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything…"
                className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#1a3a8f] text-white hover:bg-[#142d70] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-gray-400 text-center">
              Powered by NilaMadhaba AI · Responses are AI-generated
            </p>
          </form>
        </div>
      )}
    </>
  );
}

function MessageBubble({
  msg,
  onChipClick,
}: {
  msg: Msg;
  onChipClick: (chip: string) => void;
}) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#1a3a8f] text-white px-3.5 py-2 text-sm shadow-sm">
          {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-gradient-to-br from-[#1a3a8f] to-[#1a1a2e] text-[#f5c842] shrink-0 mt-1">
          <Bot className="h-3.5 w-3.5" />
        </div>
        <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white border border-gray-100 px-3.5 py-2 text-sm text-gray-800 shadow-sm whitespace-pre-line">
          {msg.text}
        </div>
      </div>
      {msg.chips && msg.chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pl-9">
          {msg.chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onChipClick(chip)}
              className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#e8edf8] text-[#1a3a8f] text-xs font-semibold hover:bg-[#1a3a8f] hover:text-white transition-colors border border-[#1a3a8f]/10"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2">
      <div className="flex items-center justify-center h-7 w-7 rounded-full bg-gradient-to-br from-[#1a3a8f] to-[#1a1a2e] text-[#f5c842] shrink-0 mt-1">
        <Bot className="h-3.5 w-3.5" />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-white border border-gray-100 px-3.5 py-2.5 shadow-sm flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" />
      </div>
    </div>
  );
}
