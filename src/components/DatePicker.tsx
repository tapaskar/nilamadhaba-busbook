"use client";

import { useMemo, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";
import { useT } from "@/lib/i18n";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getLabel(date: Date, today: Date): string | null {
  const diff = Math.round(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return null;
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const t = useT();
  const scrollRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result: {
      date: Date;
      dateStr: string;
      label: string | null;
      dayName: string;
      dayNum: number;
      month: string;
    }[] = [];

    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      result.push({
        date: d,
        dateStr: toDateString(d),
        label: getLabel(d, today),
        dayName: DAY_NAMES[d.getDay()],
        dayNum: d.getDate(),
        month: MONTH_NAMES[d.getMonth()],
      });
    }
    return result;
  }, []);

  // Scroll to selected date on mount
  useEffect(() => {
    if (!scrollRef.current) return;
    const idx = days.findIndex((d) => d.dateStr === value);
    if (idx > 0) {
      const child = scrollRef.current.children[idx] as HTMLElement;
      child?.scrollIntoView({ inline: "center", behavior: "smooth" });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        <Calendar className="h-3.5 w-3.5" />
        {t("search.date")}
      </label>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {days.map((day) => {
          const isSelected = day.dateStr === value;

          return (
            <button
              key={day.dateStr}
              type="button"
              onClick={() => onChange(day.dateStr)}
              className={`
                snap-center shrink-0 flex flex-col items-center rounded-xl px-3 py-2.5 min-w-[68px]
                border-2 transition-all duration-150
                ${
                  isSelected
                    ? "border-primary bg-primary text-white shadow-lg shadow-primary/25"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              {day.label && (
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                    isSelected ? "text-[#f5c842]" : "text-primary"
                  }`}
                >
                  {day.label === "Today" ? t("search.today") : day.label === "Tomorrow" ? t("search.tomorrow") : day.label}
                </span>
              )}
              <span
                className={`text-[10px] font-medium ${
                  isSelected ? "text-white/70" : "text-gray-400"
                }`}
              >
                {day.dayName}
              </span>
              <span className="text-lg font-bold leading-tight">
                {day.dayNum}
              </span>
              <span
                className={`text-[10px] font-medium ${
                  isSelected ? "text-white/70" : "text-gray-400"
                }`}
              >
                {day.month}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
