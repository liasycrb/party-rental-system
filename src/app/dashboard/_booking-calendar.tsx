"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";

export type CalendarBooking = {
  id: string;
  event_date: string;
  status: string | null;
  customer_name: string | null;
  product_slug: string | null;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function slugToLabel(slug: string | null | undefined): string {
  if (!slug?.trim()) return "—";
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function statusStyle(status: string | null) {
  switch (status) {
    case "confirmed":
      return {
        dot: "bg-emerald-400",
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      };
    case "pending_confirmation":
      return {
        dot: "bg-amber-400",
        badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      };
    default:
      return {
        dot: "bg-zinc-500",
        badge: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
      };
  }
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** One pass: build YYYY-MM-DD → bookings lookup; reused for any visible month. */
function groupByEventDate(bookings: CalendarBooking[]) {
  const byDate: Record<string, CalendarBooking[]> = {};
  for (const b of bookings) {
    if (!b.event_date) continue;
    const key = b.event_date.slice(0, 10);
    (byDate[key] ??= []).push(b);
  }
  return byDate;
}

export function BookingCalendar({
  bookings,
  initialYear,
  initialMonth,
}: {
  bookings: CalendarBooking[];
  initialYear: number;
  initialMonth: number;
}) {
  const [viewAnchor, setViewAnchor] = useState(
    () => new Date(initialYear, initialMonth, 1),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [monthGridVisible, setMonthGridVisible] = useState(true);

  const viewYear = viewAnchor.getFullYear();
  const viewMonth = viewAnchor.getMonth();

  const byDate = useMemo(() => groupByEventDate(bookings), [bookings]);

  const goMonth = useCallback((delta: number) => {
    setSelectedDate(null);
    setMonthGridVisible(false);
    window.setTimeout(() => {
      setViewAnchor(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1),
      );
      window.setTimeout(() => setMonthGridVisible(true), 40);
    }, 200);
  }, []);

  const today = new Date();
  const todayKey = dateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const firstDay = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startOffset = firstDay.getDay();

  const monthTitle = firstDay.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const cells: (number | null)[] = [
    ...Array<number | null>(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedBookings = selectedDate ? (byDate[selectedDate] ?? []) : [];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      {/* Header row */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Booking calendar
        </p>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => goMonth(-1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-zinc-800/70 text-lg text-zinc-200 transition hover:border-cyan-500/35 hover:bg-zinc-700/70"
          >
            ←
          </button>
          <span className="min-w-[9.5rem] text-center text-sm font-semibold text-zinc-200 sm:min-w-[11rem] sm:text-base">
            {monthTitle}
          </span>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => goMonth(1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-zinc-800/70 text-lg text-zinc-200 transition hover:border-cyan-500/35 hover:bg-zinc-700/70"
          >
            →
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="mb-2 grid grid-cols-7 gap-1.5">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-600"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid — taller cells, min wrapper height */}
      <div className="min-h-[560px] sm:min-h-[620px]">
        <div
          className={cn(
            "grid grid-cols-7 gap-1.5 rounded-xl bg-white/[0.04] p-1.5 transition-opacity duration-200 motion-reduce:transition-none motion-reduce:opacity-100",
            monthGridVisible ? "opacity-100" : "opacity-25",
          )}
        >
          {cells.map((day, idx) => {
            if (day === null) {
              return (
                <div
                  key={`pad-${viewYear}-${viewMonth}-${idx}`}
                  className="min-h-[90px] rounded-lg bg-zinc-900/35 sm:min-h-[110px]"
                />
              );
            }

            const key = dateKey(viewYear, viewMonth, day);
            const dayBookings = byDate[key] ?? [];
            const isToday = key === todayKey;
            const isSelected = key === selectedDate;
            const hasBookings = dayBookings.length > 0;

            const dots = dayBookings.slice(0, 3);

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDate(isSelected ? null : key)}
                className={cn(
                  "relative flex min-h-[90px] flex-col rounded-lg border px-3 py-3 text-left transition-all duration-200 sm:min-h-[110px] sm:p-4",
                  isSelected
                    ? "border-violet-400/35 bg-gradient-to-br from-violet-600/28 to-violet-900/25 shadow-[0_0_20px_-4px_rgba(139,92,246,0.45)]"
                    : hasBookings
                    ? "border-white/12 bg-zinc-800/50 hover:border-cyan-500/25 hover:bg-zinc-800/70"
                    : "border-white/8 bg-zinc-900/50 hover:border-white/15 hover:bg-zinc-800/50",
                  isToday && "ring-2 ring-cyan-500/40",
                )}
                aria-label={`${key}${dayBookings.length ? `, ${dayBookings.length} booking${dayBookings.length > 1 ? "s" : ""}` : ""}`}
              >
                <span className="shrink-0 text-xs font-semibold tabular-nums text-zinc-300 sm:text-sm">
                  {day}
                </span>

                <div className="flex flex-1 flex-col items-center justify-center gap-1 pt-1">
                  {hasBookings && (
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="flex flex-wrap items-center justify-center gap-[5px]">
                        {dots.map((b) => (
                          <span
                            key={b.id}
                            className={`h-2 w-2 shrink-0 rounded-full ${statusStyle(b.status).dot} shadow-[0_0_6px_rgba(0,0,0,0.35)]`}
                          />
                        ))}
                        {dayBookings.length > 3 ? (
                          <span className="text-[11px] font-bold tabular-nums text-zinc-400">
                            +{dayBookings.length - 3}
                          </span>
                        ) : null}
                      </div>
                      <span className="text-[10px] font-bold tabular-nums leading-none text-zinc-500">
                        {dayBookings.length === 1
                          ? "1 booking"
                          : `${dayBookings.length} bookings`}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-white/5 pt-3">
        <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          Pending
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Confirmed
        </span>
      </div>

      {selectedDate && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
            {selectedBookings.length === 0 ? (
              <span className="ml-2 font-normal normal-case text-zinc-600">
                — no bookings
              </span>
            ) : null}
          </p>
          <div className="space-y-2">
            {selectedBookings.map((b) => {
              const style = statusStyle(b.status);
              return (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-100">
                      {b.customer_name?.trim() || "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {slugToLabel(b.product_slug)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${style.badge}`}
                    >
                      {b.status?.replace(/_/g, " ") ?? "—"}
                    </span>
                    <Link
                      href={`/dashboard/bookings/${b.id}`}
                      className="text-xs font-semibold text-violet-300 underline-offset-2 hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
