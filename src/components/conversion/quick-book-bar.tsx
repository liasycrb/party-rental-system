"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

function CalendarGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/** Accepts YYYY-MM-DD or mm/dd/yyyy; returns YYYY-MM-DD or null. */
function parseQuickBookDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (!m) return null;
  const month = Number(m[1]);
  const day = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(year, month - 1, day);
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  ) {
    return null;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function QuickBookBar({
  isCrb,
  className,
  id,
  /** Tighter, stacked field + CTA; only applied at `max-md` so desktop is unchanged. */
  compactMobile = false,
}: {
  isCrb: boolean;
  className?: string;
  /** Anchor target for hero CTAs (e.g. `quick-book`) */
  id?: string;
  compactMobile?: boolean;
}) {
  const router = useRouter();
  const [date, setDate] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const iso = parseQuickBookDate(date);
    if (iso) {
      router.push(`/build?date=${encodeURIComponent(iso)}`);
      return;
    }
    router.push("/build");
  }

  return (
    <form
      id={id}
      onSubmit={submit}
      className={cn(
        "grid w-full min-w-0 max-w-full grid-cols-1 gap-5 rounded-3xl border px-6 py-5",
        "lg:grid-cols-[1.05fr_0.95fr_1.05fr_0.75fr] lg:items-center lg:gap-6",
        isCrb
          ? "border-gray-200/90 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.25)] backdrop-blur-md"
          : "border-white/50 bg-white/95 shadow-[0_30px_80px_rgba(0,0,0,0.25)] backdrop-blur-md",
        compactMobile &&
          "max-md:gap-3 max-md:rounded-2xl max-md:px-4 max-md:py-3 max-md:shadow-lg",
        className,
      )}
    >
      {/* 1 — date label */}
      <div
        className={cn(
          "min-w-0 max-w-[240px]",
          compactMobile && "max-md:max-w-none",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2.5",
            compactMobile && "max-md:gap-2",
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              isCrb
                ? "bg-cyan-50 ring-1 ring-cyan-200/40"
                : "bg-pink-100",
              compactMobile && "max-md:h-9 max-md:w-9",
            )}
          >
            <CalendarGlyph
              className={cn(
                "h-4 w-4",
                isCrb ? "text-cyan-500" : "text-pink-600",
              )}
            />
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                "text-sm font-semibold leading-tight tracking-tight",
                isCrb ? "text-gray-800" : "text-stone-900",
                compactMobile && "max-md:text-[13px]",
              )}
            >
              <label htmlFor="quick-book-date" className="block">
                Choose your date
              </label>
            </p>
            <p
              className={cn(
                "mt-0.5 text-xs leading-snug text-gray-500",
                compactMobile && "max-md:hidden",
              )}
            >
              See real-time availability
            </p>
          </div>
        </div>
      </div>

      {/* 2 — date input */}
      <div className="min-w-0">
        <input
          id="quick-book-date"
          name="date"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="mm/dd/yyyy"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={cn(
            "box-border h-[60px] w-full max-w-full rounded-xl border px-4 text-sm font-semibold tabular-nums outline-none transition-[box-shadow,border-color] lg:max-w-[300px]",
            isCrb
              ? "border-gray-200 bg-gray-100 text-gray-800 placeholder:text-gray-400 focus-visible:border-cyan-400/55 focus-visible:ring-[3px] focus-visible:ring-cyan-300/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              : "border-gray-200 bg-gray-100 text-stone-900 placeholder:text-stone-400 focus-visible:border-pink-400/55 focus-visible:ring-[3px] focus-visible:ring-pink-300/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
            compactMobile && "max-md:h-[52px] max-md:text-[13px]",
          )}
        />
      </div>

      {/* 3 — CTA (divider sits on this column’s leading edge, desktop only) */}
      <div
        className={cn(
          "flex min-w-0 items-center border-t pt-4 lg:h-[72px] lg:border-l lg:border-t-0 lg:pt-0 lg:pl-5",
          isCrb ? "border-gray-200 lg:border-gray-300/60" : "border-gray-200 lg:border-gray-300/60",
          compactMobile && "max-md:border-t max-md:pt-3",
        )}
      >
        <button
          type="submit"
          className={cn(
            "inline-flex h-[60px] w-full max-w-[280px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-8 text-sm font-black transition-all duration-200",
            "hover:scale-[1.02] active:scale-100",
            isCrb
              ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-600"
              : "text-white shadow-[0_12px_30px_rgba(236,72,153,0.35)] ring-1 ring-white/45 hover:shadow-[0_16px_36px_rgba(236,72,153,0.42)]",
            compactMobile && "max-md:h-[52px] max-md:max-w-none max-md:px-6 max-md:text-[13px]",
          )}
          style={{
            background: isCrb ? undefined : "var(--brand-secondary)",
          }}
        >
          Check availability
          <ArrowRightIcon className="h-4 w-4 shrink-0" />
        </button>
      </div>

      {/* 4 — skip (tight to CTA) */}
      <div
        className={cn(
          "flex min-w-0 flex-col justify-center gap-0.5 lg:pl-2",
          compactMobile && "max-md:hidden",
        )}
      >
        <button
          type="button"
          onClick={() => router.push("/build")}
          className={cn(
            "w-fit text-left text-xs font-bold underline-offset-4 transition hover:underline",
            isCrb
              ? "text-gray-700 hover:text-gray-900"
              : "text-stone-700 hover:text-stone-900",
          )}
        >
          Skip — start now
        </button>
        <p
          className={cn(
            "text-xs leading-tight",
            isCrb ? "text-gray-400" : "text-gray-500",
          )}
        >
          No commitment
        </p>
      </div>
    </form>
  );
}
