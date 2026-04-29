import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Reservations",
  description: "Online reservations from the website.",
};

type StatusFilter = "pending_confirmation" | "confirmed" | "cancelled" | "all";

const ONLINE_STATUSES = ["pending_confirmation", "confirmed", "cancelled"] as const;

function parseStatusFilter(raw: string | string[] | undefined): StatusFilter {
  const v = (Array.isArray(raw) ? raw[0] : raw)?.trim().toLowerCase();
  if (v === "all" || v === "confirmed" || v === "cancelled" || v === "pending_confirmation") {
    return v;
  }
  return "pending_confirmation";
}

function slugToReadableName(slug: string | null | undefined): string {
  const s = slug?.trim();
  if (!s) return "—";
  return s
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function humanizeLabel(value: string | null | undefined): string {
  const v = value?.trim();
  if (!v) return "—";
  return v
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatListEventDate(iso: string | null | undefined): string {
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

function eventDatePriorityLabel(eventDateStr: string | null | undefined): string {
  if (!eventDateStr?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(eventDateStr.trim())) {
    return "—";
  }
  const d = eventDateStr.trim();
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayStr = `${y}-${m}-${day}`;

  const tmr = new Date(now);
  tmr.setDate(tmr.getDate() + 1);
  const ty = tmr.getFullYear();
  const tm = String(tmr.getMonth() + 1).padStart(2, "0");
  const td = String(tmr.getDate()).padStart(2, "0");
  const tomorrowStr = `${ty}-${tm}-${td}`;

  if (d < todayStr) return "Past";
  if (d === todayStr) return "Today";
  if (d === tomorrowStr) return "Tomorrow";
  return "Upcoming";
}

function priorityPillClass(label: string): string {
  switch (label) {
    case "Today":
      return "border-amber-500/40 bg-amber-500/15 text-amber-200";
    case "Tomorrow":
      return "border-sky-500/40 bg-sky-500/15 text-sky-200";
    case "Upcoming":
      return "border-emerald-500/35 bg-emerald-500/10 text-emerald-200";
    case "Past":
      return "border-white/15 bg-white/5 text-zinc-400";
    default:
      return "border-white/10 bg-white/5 text-zinc-500";
  }
}

type PageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};

export default async function DashboardBookingsPage({ searchParams }: PageProps) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <p className="text-sm text-zinc-400">
        Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
      </p>
    );
  }

  const sp = await searchParams;
  const statusFilter = parseStatusFilter(sp.status);

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("bookings")
    .select(
      "id, product_slug, event_date, customer_name, phone, status, payment_status",
    )
    .eq("source", "online_reservation")
    .order("event_date", { ascending: true });

  if (statusFilter === "all") {
    query = query.in("status", [...ONLINE_STATUSES]);
  } else {
    query = query.eq("status", statusFilter);
  }

  const { data: rows, error } = await query;

  if (error) {
    return (
      <p className="text-sm text-red-300">
        Could not load bookings: {error.message}
      </p>
    );
  }

  const list = rows ?? [];

  const tabs: Array<{ href: string; label: string; filter: StatusFilter }> = [
    { href: "/dashboard/bookings", label: "Pending", filter: "pending_confirmation" },
    { href: "/dashboard/bookings?status=confirmed", label: "Confirmed", filter: "confirmed" },
    { href: "/dashboard/bookings?status=cancelled", label: "Cancelled", filter: "cancelled" },
    { href: "/dashboard/bookings?status=all", label: "All", filter: "all" },
  ];

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Reservations
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Website bookings that need your attention or review.
          </p>
        </div>
      </div>

      <nav
        className="mt-6 flex flex-wrap gap-2 border-b border-white/10 pb-1"
        aria-label="Reservation status"
      >
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.filter;
          return (
            <Link
              key={tab.filter}
              href={tab.href}
              className={
                isActive
                  ? "rounded-t-lg border border-b-0 border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-t-lg border border-transparent px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Rental</th>
              <th className="px-4 py-3">Event Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3 text-right">Open</th>
            </tr>
          </thead>
          <tbody className="text-zinc-200">
            {list.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                  No reservations found for this status.
                </td>
              </tr>
            ) : (
              list.map((r) => {
                const priority = eventDatePriorityLabel(r.event_date);
                return (
                  <tr
                    key={r.id}
                    className="border-b border-white/5 transition-colors hover:bg-white/[0.04]"
                  >
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${priorityPillClass(priority)}`}
                      >
                        {priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top font-medium text-zinc-100">
                      {r.customer_name?.trim() || "—"}
                    </td>
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      {r.phone?.trim() || "—"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {slugToReadableName(r.product_slug)}
                    </td>
                    <td className="px-4 py-3 align-top text-zinc-300">
                      {formatListEventDate(r.event_date)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {humanizeLabel(r.status)}
                    </td>
                    <td className="px-4 py-3 align-top text-zinc-400">
                      {humanizeLabel(r.payment_status)}
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <Link
                        href={`/dashboard/bookings/${r.id}`}
                        className="font-semibold text-violet-300 underline-offset-2 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
