import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BookingCalendar } from "./_booking-calendar";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Operations daily snapshot.",
};

function todayStr(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

function tomorrowStr(): string {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

function slugToLabel(slug: string | null | undefined): string {
  const s = slug?.trim();
  if (!s) return "—";
  return s
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatShortDate(iso: string | null | undefined): string {
  if (!iso?.trim()) return "—";
  const d = iso.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const parsed = new Date(`${d}T12:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }
  return d;
}

export default async function DashboardHomePage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <p className="text-sm text-zinc-400">
        Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
      </p>
    );
  }

  const today = todayStr();
  const tomorrow = tomorrowStr();

  const nowDate = new Date();
  /** Calendar navigation: fetch a window client can scroll without round-trips (~6mo back → +12mo). */
  const calFetchStart = new Date(nowDate.getFullYear(), nowDate.getMonth() - 6, 1);
  const calFetchEnd = new Date(nowDate.getFullYear(), nowDate.getMonth() + 13, 0);
  const calStartStr = `${calFetchStart.getFullYear()}-${String(calFetchStart.getMonth() + 1).padStart(2, "0")}-${String(calFetchStart.getDate()).padStart(2, "0")}`;
  const calEndStr = `${calFetchEnd.getFullYear()}-${String(calFetchEnd.getMonth() + 1).padStart(2, "0")}-${String(calFetchEnd.getDate()).padStart(2, "0")}`;

  const supabase = await createSupabaseServerClient();

  const [
    { count: pendingCount },
    { count: confirmedUpcomingCount },
    { count: todayCount },
    { count: tomorrowCount },
    { data: attentionRows },
    { data: upcomingRows },
    { data: calendarRows },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("source", "online_reservation")
      .eq("status", "pending_confirmation"),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("source", "online_reservation")
      .eq("status", "confirmed")
      .gte("event_date", today),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("source", "online_reservation")
      .eq("event_date", today),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("source", "online_reservation")
      .eq("event_date", tomorrow),
    supabase
      .from("bookings")
      .select("id, customer_name, event_date, product_slug")
      .eq("source", "online_reservation")
      .eq("status", "pending_confirmation")
      .order("event_date", { ascending: true })
      .limit(5),
    supabase
      .from("bookings")
      .select("id, customer_name, event_date, product_slug")
      .eq("source", "online_reservation")
      .eq("status", "confirmed")
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(5),
    supabase
      .from("bookings")
      .select("id, event_date, status, customer_name, product_slug")
      .in("source", ["online_reservation", "staff_created"])
      .gte("event_date", calStartStr)
      .lte("event_date", calEndStr)
      .order("event_date", { ascending: true }),
  ]);

  const statCards = [
    {
      label: "Pending approval",
      value: pendingCount ?? 0,
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
      valueColor: "text-amber-200",
    },
    {
      label: "Confirmed upcoming",
      value: confirmedUpcomingCount ?? 0,
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
      valueColor: "text-emerald-200",
    },
    {
      label: "Events today",
      value: todayCount ?? 0,
      border: "border-sky-500/30",
      bg: "bg-sky-500/10",
      valueColor: "text-sky-200",
    },
    {
      label: "Events tomorrow",
      value: tomorrowCount ?? 0,
      border: "border-violet-500/30",
      bg: "bg-violet-500/10",
      valueColor: "text-violet-200",
    },
  ];

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Operations
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Daily snapshot of online reservations.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((c) => (
          <div
            key={c.label}
            className={`rounded-2xl border p-5 ${c.border} ${c.bg}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {c.label}
            </p>
            <p className={`mt-2 text-3xl font-bold tabular-nums ${c.valueColor}`}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <BookingCalendar
          bookings={calendarRows ?? []}
          initialYear={nowDate.getFullYear()}
          initialMonth={nowDate.getMonth()}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Needs attention
            </p>
            <Link
              href="/dashboard/bookings"
              className="text-xs font-medium text-violet-300 underline-offset-2 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {!attentionRows || attentionRows.length === 0 ? (
              <p className="text-sm text-zinc-500">All clear — no pending reservations.</p>
            ) : (
              attentionRows.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-100">
                      {r.customer_name?.trim() || "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {formatShortDate(r.event_date)} · {slugToLabel(r.product_slug)}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/bookings/${r.id}`}
                    className="shrink-0 text-xs font-semibold text-violet-300 underline-offset-2 hover:underline"
                  >
                    View
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Upcoming confirmed
            </p>
            <Link
              href="/dashboard/bookings?status=confirmed"
              className="text-xs font-medium text-violet-300 underline-offset-2 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {!upcomingRows || upcomingRows.length === 0 ? (
              <p className="text-sm text-zinc-500">No confirmed events coming up.</p>
            ) : (
              upcomingRows.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-100">
                      {r.customer_name?.trim() || "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {formatShortDate(r.event_date)} · {slugToLabel(r.product_slug)}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/bookings/${r.id}`}
                    className="shrink-0 text-xs font-semibold text-violet-300 underline-offset-2 hover:underline"
                  >
                    View
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
