"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

const DOW_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayStr(): string {
  const d = new Date();
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

type Props = {
  bookedDates: string[];
  value: string;
  onChange: (date: string) => void;
  disabled?: boolean;
  isCrb: boolean;
};

export function AvailabilityCalendar({
  bookedDates,
  value,
  onChange,
  disabled = false,
  isCrb,
}: Props) {
  const booked = new Set(bookedDates);
  const today = todayStr();

  const [viewYear, setViewYear] = useState<number>(() => {
    if (value) return Number(value.slice(0, 4));
    return new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    if (value) return Number(value.slice(5, 7)) - 1;
    return new Date().getMonth();
  });

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        isCrb
          ? "border-slate-600/60 bg-slate-900/70"
          : "border-stone-200 bg-white/90",
      )}
    >
      {/* Month navigation */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className={cn(
            "rounded-lg px-2.5 py-1 text-sm font-bold transition hover:bg-white/10",
            isCrb ? "text-cyan-300" : "text-rose-600",
          )}
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className={cn("text-sm font-bold", isCrb ? "text-white" : "text-stone-900")}>
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className={cn(
            "rounded-lg px-2.5 py-1 text-sm font-bold transition hover:bg-white/10",
            isCrb ? "text-cyan-300" : "text-rose-600",
          )}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {DOW_LABELS.map((d) => (
          <span
            key={d}
            className={cn(
              "text-center text-[11px] font-semibold uppercase tracking-wide",
              isCrb ? "text-slate-500" : "text-stone-400",
            )}
          >
            {d}
          </span>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) {
            return <span key={`empty-${i}`} />;
          }

          const dateStr = toDateStr(viewYear, viewMonth, day);
          const isPast = dateStr < today;
          const isBooked = booked.has(dateStr);
          const isSelected = dateStr === value;
          const isBlocked = isPast || isBooked || disabled;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isBlocked}
              onClick={() => !isBlocked && onChange(dateStr)}
              title={isBooked ? "Already booked" : isPast ? "Past date" : undefined}
              className={cn(
                "rounded-lg py-1.5 text-center text-sm transition",
                // selected
                isSelected &&
                  (isCrb
                    ? "bg-cyan-500 font-black text-black"
                    : "bg-rose-600 font-black text-white"),
                // booked — strikethrough gray
                isBooked && !isSelected &&
                  "cursor-not-allowed bg-stone-100 text-stone-400 line-through",
                isBooked && !isSelected && isCrb &&
                  "bg-slate-700/60 text-slate-500",
                // past — dim
                isPast && !isBooked && !isSelected &&
                  "cursor-not-allowed opacity-25",
                // available
                !isBlocked && !isSelected &&
                  (isCrb
                    ? "text-slate-200 hover:bg-cyan-500/20 hover:text-cyan-200"
                    : "text-stone-700 hover:bg-rose-100 hover:text-rose-700"),
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className={cn("mt-3 flex flex-wrap gap-3 text-[11px]", isCrb ? "text-slate-500" : "text-stone-400")}>
        <span className="flex items-center gap-1">
          <span className={cn("inline-block h-3 w-3 rounded", isCrb ? "bg-cyan-500" : "bg-rose-600")} />
          Selected
        </span>
        <span className="flex items-center gap-1">
          <span className={cn("inline-block h-3 w-3 rounded", isCrb ? "bg-slate-700/60" : "bg-stone-100")} />
          Unavailable
        </span>
      </div>
    </div>
  );
}
