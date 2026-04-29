import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Online reservations",
  description: "Pending online bookings from /build.",
};

function dash(s: string | null | undefined) {
  const t = s?.trim();
  return t ? t : "—";
}

export default async function DashboardBookingsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <p className="text-sm text-zinc-400">
        Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
      </p>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase
    .from("bookings")
    .select(
      "id, product_slug, event_date, quantity, customer_name, phone, event_city, payment_proof_path, status, payment_status",
    )
    .eq("source", "online_reservation")
    .eq("status", "pending_confirmation")
    .eq("payment_status", "deposit_paid")
    .order("event_date", { ascending: true });

  if (error) {
    return (
      <p className="text-sm text-red-300">
        Could not load bookings: {error.message}
      </p>
    );
  }

  const list = rows ?? [];

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Online reservations
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Pending confirmations with deposit paid (from /build).
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Event date</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Proof path</th>
            </tr>
          </thead>
          <tbody className="text-zinc-200">
            {list.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-zinc-500">
                  No pending online reservations.
                </td>
              </tr>
            ) : (
              list.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-white/5 transition-colors hover:bg-white/[0.04]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/bookings/${r.id}`}
                      className="font-medium text-violet-300 underline-offset-2 hover:underline"
                    >
                      {dash(r.status)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{dash(r.payment_status)}</td>
                  <td className="px-4 py-3">{dash(r.product_slug)}</td>
                  <td className="px-4 py-3">{dash(r.event_date)}</td>
                  <td className="px-4 py-3">{r.quantity ?? "—"}</td>
                  <td className="px-4 py-3">{dash(r.customer_name)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{dash(r.phone)}</td>
                  <td className="px-4 py-3">{dash(r.event_city)}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-zinc-400">
                    {r.payment_proof_path ? r.payment_proof_path : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
