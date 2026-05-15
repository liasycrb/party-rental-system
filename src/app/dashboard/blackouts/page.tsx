import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getBookingBlackouts } from "@/lib/booking/get-booking-blackouts";
import { BRANDS } from "@/lib/brand/config";
import { resolveBrandSlugFromPageSearchParam } from "@/lib/brand/resolve-brand";

export const metadata: Metadata = { title: "Blackout Dates — Dashboard" };

async function addBlackout(formData: FormData) {
  "use server";
  const brandSlug = (formData.get("brand_slug") as string | null)?.trim();
  const startDate = (formData.get("start_date") as string | null)?.trim();
  const endDate = (formData.get("end_date") as string | null)?.trim();
  const labelRaw = ((formData.get("label") as string | null) ?? "").trim();
  const label = labelRaw.length ? labelRaw : null;

  if (!brandSlug) throw new Error("Missing brand_slug");
  if (brandSlug !== "lias" && brandSlug !== "crb") {
    throw new Error("Invalid brand_slug");
  }
  if (!startDate || !endDate) {
    throw new Error("Start date and end date are required");
  }
  if (startDate > endDate) {
    throw new Error("Start date must be on or before end date");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("insert_booking_blackout", {
    p_brand_slug: brandSlug,
    p_start_date: startDate,
    p_end_date: endDate,
    p_label: label,
  });
  if (error) throw new Error(`[addBlackout] ${error.message}`);

  revalidatePath("/dashboard/blackouts");
  revalidatePath("/build");
}

async function removeBlackout(formData: FormData) {
  "use server";
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) throw new Error("Missing id");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("delete_booking_blackout", { p_id: id });
  if (error) throw new Error(`[removeBlackout] ${error.message}`);

  revalidatePath("/dashboard/blackouts");
  revalidatePath("/build");
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500/60 focus:outline-none focus:ring-1 focus:ring-violet-500/40";

const labelClass = "mb-1.5 block text-sm font-semibold text-zinc-300";

function formatDate(iso: string | null | undefined): string {
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

function formatCreatedAt(iso: string | null | undefined): string {
  if (!iso?.trim()) return "—";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlackoutsDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const sp = await searchParams;
  const brandSlug = resolveBrandSlugFromPageSearchParam(sp.brand);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <p className="text-sm text-zinc-400">
        Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
      </p>
    );
  }

  const blackouts = await getBookingBlackouts(brandSlug);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white">Booking Blackouts</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Block all new online reservations for a selected date range. Existing
          bookings are not canceled. Currently managing{" "}
          <span className="font-semibold text-zinc-200">
            {BRANDS[brandSlug].displayName}
          </span>
          .
        </p>
      </div>

      {/* Brand switcher — mirrors /dashboard/site */}
      <div className="flex gap-2">
        {(["lias", "crb"] as const).map((slug) => (
          <Link
            key={slug}
            href={`/dashboard/blackouts?brand=${slug}`}
            className={
              brandSlug === slug
                ? "rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white"
                : "rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-white/10"
            }
          >
            {BRANDS[slug].displayName}
          </Link>
        ))}
      </div>

      {/* Warning / info banner */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-100">
        These dates will be unavailable for new online reservations. Existing
        confirmed bookings will remain unchanged.
      </div>

      {/* Add form */}
      <form
        action={addBlackout}
        className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
      >
        <input type="hidden" name="brand_slug" value={brandSlug} />
        <h2 className="text-sm font-bold text-white">Add blackout range</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="start_date" className={labelClass}>
              Start date
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="end_date" className={labelClass}>
              End date
            </label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              required
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="label" className={labelClass}>
            Label / note (optional)
          </label>
          <input
            type="text"
            id="label"
            name="label"
            placeholder="Vacation, holiday, private event, maintenance, etc."
            className={inputClass}
          />
        </div>
        <div>
          <button
            type="submit"
            className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500 active:scale-[0.98]"
          >
            Add blackout
          </button>
        </div>
      </form>

      {/* List */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          Current blackouts — {BRANDS[brandSlug].displayName}
        </h2>
        {blackouts.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No blackouts set. The calendar is fully open for new reservations.
          </p>
        ) : (
          <ul className="space-y-2">
            {blackouts.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-100">
                    {b.label?.trim() || (
                      <span className="text-zinc-500">(no label)</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {formatDate(b.start_date)} → {formatDate(b.end_date)}
                    {b.created_at
                      ? ` · added ${formatCreatedAt(b.created_at)}`
                      : ""}
                  </p>
                </div>
                <form action={removeBlackout}>
                  <input type="hidden" name="id" value={b.id} />
                  <button
                    type="submit"
                    className="shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:border-red-500/50 hover:bg-red-500/20"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
