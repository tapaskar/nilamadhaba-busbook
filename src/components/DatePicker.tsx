"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, CalendarRange, ChevronLeft, ChevronRight } from "lucide-react";
import { useT } from "@/lib/i18n";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  /** How far in the future a user is allowed to book (days). Default 60. */
  maxAdvanceDays?: number;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SHORT_DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const FULL_MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map((n) => parseInt(n, 10));
  return new Date(y, m - 1, d);
}
function getLabel(date: Date, today: Date): string | null {
  const diff = Math.round(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return null;
}

export default function DatePicker({
  value,
  onChange,
  maxAdvanceDays = 60,
}: DatePickerProps) {
  const t = useT();
  const scrollRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  // Month being shown in the popover — defaults to the month of the
  // currently-selected date, or current month if no value.
  const [monthCursor, setMonthCursor] = useState<Date>(() => {
    const base = value ? parseDate(value) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const maxDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() + maxAdvanceDays);
    return d;
  }, [today, maxAdvanceDays]);

  // Quick-strip — first 14 days, just enough for impulse bookings.
  const quickDays = useMemo(() => {
    const result: {
      date: Date;
      dateStr: string;
      label: string | null;
      dayName: string;
      dayNum: number;
      month: string;
    }[] = [];
    for (let i = 0; i < 14; i++) {
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
  }, [today]);

  // Scroll selected date into view when the value changes
  useEffect(() => {
    if (!scrollRef.current) return;
    const idx = quickDays.findIndex((d) => d.dateStr === value);
    if (idx > 0) {
      const child = scrollRef.current.children[idx] as HTMLElement | undefined;
      child?.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
    }
  }, [value, quickDays]);

  // Close popover on outside click + Escape
  useEffect(() => {
    if (!calendarOpen) return;
    function onClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setCalendarOpen(false);
    }
    const t = setTimeout(() => document.addEventListener("mousedown", onClick), 50);
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [calendarOpen]);

  // ─── Build the month grid for the popover ───
  const monthGrid = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: ({ date: Date; dateStr: string; isToday: boolean; isSelected: boolean; isPast: boolean; isOverMax: boolean } | null)[] = [];
    // Leading blanks
    for (let i = 0; i < startDayOfWeek; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateStr = toDateString(d);
      cells.push({
        date: d,
        dateStr,
        isToday: dateStr === toDateString(today),
        isSelected: dateStr === value,
        isPast: d < today,
        isOverMax: d > maxDate,
      });
    }
    return cells;
  }, [monthCursor, today, maxDate, value]);

  function shiftMonth(delta: number) {
    setMonthCursor((c) => {
      const next = new Date(c.getFullYear(), c.getMonth() + delta, 1);
      // Prevent navigating before this month or beyond maxDate's month
      const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      if (next < todayMonth) return todayMonth;
      if (next > maxMonth) return maxMonth;
      return next;
    });
  }

  function pickDate(dateStr: string) {
    onChange(dateStr);
    setCalendarOpen(false);
  }

  const selectedDate = value ? parseDate(value) : null;
  const selectedNotInQuickStrip = selectedDate
    ? selectedDate.getTime() - today.getTime() > 13 * 24 * 60 * 60 * 1000
    : false;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <Calendar className="h-3.5 w-3.5" />
          {t("search.date")}
        </label>
        <button
          type="button"
          onClick={() => setCalendarOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#e8edf8]/60 hover:bg-[#1a3a8f] hover:text-white text-[#1a3a8f] px-2.5 py-1 text-[11px] font-bold transition-colors"
        >
          <CalendarRange className="h-3 w-3" />
          {t("date.pickFromCalendar")}
        </button>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {quickDays.map((day) => {
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
                <span className={`text-[10px] font-medium ${isSelected ? "text-white/70" : "text-gray-400"}`}>
                  {day.dayName}
                </span>
                <span className="text-lg font-bold leading-tight">{day.dayNum}</span>
                <span className={`text-[10px] font-medium ${isSelected ? "text-white/70" : "text-gray-400"}`}>
                  {day.month}
                </span>
              </button>
            );
          })}

          {/* "Later date" tile — shows the picked date if it's beyond the quick strip */}
          {selectedNotInQuickStrip && selectedDate && (
            <button
              type="button"
              onClick={() => setCalendarOpen(true)}
              className="snap-center shrink-0 flex flex-col items-center rounded-xl px-3 py-2.5 min-w-[78px] border-2 border-primary bg-primary text-white shadow-lg shadow-primary/25"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#f5c842] mb-0.5">
                Booking
              </span>
              <span className="text-[10px] font-medium text-white/70">
                {DAY_NAMES[selectedDate.getDay()]}
              </span>
              <span className="text-lg font-bold leading-tight">{selectedDate.getDate()}</span>
              <span className="text-[10px] font-medium text-white/70">
                {MONTH_NAMES[selectedDate.getMonth()]}
              </span>
            </button>
          )}
        </div>

        {/* Calendar popover */}
        {calendarOpen && (
          <div
            ref={popoverRef}
            className="absolute z-30 left-0 right-0 sm:left-auto sm:right-0 sm:w-80 mt-1 rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                disabled={
                  monthCursor.getFullYear() === today.getFullYear() &&
                  monthCursor.getMonth() === today.getMonth()
                }
                aria-label="Previous month"
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="text-sm font-bold text-gray-900">
                {FULL_MONTH_NAMES[monthCursor.getMonth()]} {monthCursor.getFullYear()}
              </p>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                disabled={
                  monthCursor.getFullYear() === maxDate.getFullYear() &&
                  monthCursor.getMonth() === maxDate.getMonth()
                }
                aria-label="Next month"
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 px-3 py-2 bg-gray-50/50">
              {SHORT_DAYS.map((d, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-gray-400 uppercase py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5 p-3">
              {monthGrid.map((cell, idx) => {
                if (!cell) return <div key={idx} className="h-9" />;
                const disabled = cell.isPast || cell.isOverMax;
                return (
                  <button
                    key={cell.dateStr}
                    type="button"
                    disabled={disabled}
                    onClick={() => pickDate(cell.dateStr)}
                    className={`relative h-9 rounded-lg text-sm font-medium transition-colors ${
                      cell.isSelected
                        ? "bg-[#1a3a8f] text-white font-bold shadow-md"
                        : cell.isToday
                          ? "bg-[#f5c842]/30 text-[#1a3a8f] font-bold"
                          : disabled
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-700 hover:bg-[#e8edf8] hover:text-[#1a3a8f]"
                    }`}
                    aria-label={cell.dateStr}
                  >
                    {cell.date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 text-[11px] text-gray-500 flex items-center justify-between">
              <span>Bookings open up to {maxAdvanceDays} days ahead</span>
              <button
                type="button"
                onClick={() => {
                  pickDate(toDateString(today));
                  setMonthCursor(new Date(today.getFullYear(), today.getMonth(), 1));
                }}
                className="font-bold text-[#1a3a8f] hover:underline"
              >
                Today
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
