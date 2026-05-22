import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BRANDS } from "@/lib/brand/config";
import { resolveBrandSlugFromPageSearchParam } from "@/lib/brand/resolve-brand";
import { getBookingSettings } from "@/lib/booking/get-booking-settings";
import BookingSettingsForm, {
  type SaveBookingSettingsResult,
} from "./_booking-settings-form";

export const metadata: Metadata = { title: "Booking Rules — Dashboard" };

async function saveBookingSettings(
  formData: FormData,
): Promise<SaveBookingSettingsResult> {
  "use server";

  const brandSlug = (formData.get("brand_slug") as string | null)?.trim();
  if (brandSlug !== "lias" && brandSlug !== "crb") {
    return { ok: false, error: "Invalid brand." };
  }

  const minimum = Number(formData.get("minimum_order_amount"));
  if (!Number.isFinite(minimum)) {
    return { ok: false, error: "Minimum order must be a number." };
  }
  if (minimum < 0) {
    return { ok: false, error: "Minimum order must be zero or positive." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("update_booking_settings", {
    p_brand_slug: brandSlug,
    p_minimum_order_amount: minimum,
  });

  if (error) {
    console.error("[saveBookingSettings]", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/booking-settings");
  return { ok: true };
}

export default async function BookingSettingsDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const sp = await searchParams;
  const brandSlug = resolveBrandSlugFromPageSearchParam(sp.brand);

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <p className="text-sm text-zinc-400">
        Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and
        NEXT_PUBLIC_SUPABASE_ANON_KEY.
      </p>
    );
  }

  const settings = await getBookingSettings(brandSlug);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white">Booking Rules</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Edit the gates that apply to online reservations for{" "}
          <span className="font-semibold text-zinc-200">
            {BRANDS[brandSlug].displayName}
          </span>
          . Changes apply to new /build sessions immediately.
        </p>
      </div>

      {/* Brand switcher — mirrors /dashboard/delivery, /dashboard/site, /dashboard/blackouts */}
      <div className="flex gap-2">
        {(["lias", "crb"] as const).map((slug) => (
          <Link
            key={slug}
            href={`/dashboard/booking-settings?brand=${slug}`}
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

      <BookingSettingsForm
        brandSlug={brandSlug}
        initial={settings}
        action={saveBookingSettings}
      />
    </div>
  );
}
