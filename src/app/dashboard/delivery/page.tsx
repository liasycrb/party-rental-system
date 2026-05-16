import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BRANDS } from "@/lib/brand/config";
import { resolveBrandSlugFromPageSearchParam } from "@/lib/brand/resolve-brand";
import { getDeliveryPricingSettings } from "@/lib/delivery/get-delivery-pricing-settings";
import DeliveryPricingForm, {
  type SaveDeliveryPricingResult,
} from "./_delivery-pricing-form";

export const metadata: Metadata = { title: "Delivery Pricing — Dashboard" };

async function saveDeliveryPricing(
  formData: FormData,
): Promise<SaveDeliveryPricingResult> {
  "use server";

  const brandSlug = (formData.get("brand_slug") as string | null)?.trim();
  if (brandSlug !== "lias" && brandSlug !== "crb") {
    return { ok: false, error: "Invalid brand." };
  }

  const freeCity =
    ((formData.get("free_city") as string | null) ?? "").trim() ||
    "Moreno Valley";

  const num = (key: string): number => Number(formData.get(key));
  const nearRate = num("near_rate_per_mile");
  const midRate = num("mid_rate_per_mile");
  const farRate = num("far_rate_per_mile");
  const nearMax = num("near_max_miles");
  const midMax = num("mid_max_miles");
  const maxService = num("max_service_miles");

  for (const [label, v] of [
    ["near rate", nearRate],
    ["mid rate", midRate],
    ["far rate", farRate],
    ["near max miles", nearMax],
    ["mid max miles", midMax],
    ["max service miles", maxService],
  ] as const) {
    if (!Number.isFinite(v)) {
      return { ok: false, error: `${label} must be a number.` };
    }
  }

  if (nearRate < 0 || midRate < 0 || farRate < 0) {
    return { ok: false, error: "Rates must be zero or positive." };
  }
  if (nearMax <= 0) {
    return { ok: false, error: "Near max miles must be greater than 0." };
  }
  if (nearMax >= midMax) {
    return { ok: false, error: "Near max miles must be less than mid max miles." };
  }
  if (midMax > maxService) {
    return {
      ok: false,
      error: "Mid max miles must be less than or equal to max service miles.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("update_delivery_pricing_settings", {
    p_brand_slug: brandSlug,
    p_free_city: freeCity,
    p_near_rate: nearRate,
    p_mid_rate: midRate,
    p_far_rate: farRate,
    p_near_max: nearMax,
    p_mid_max: midMax,
    p_max_service: maxService,
  });

  if (error) {
    console.error("[saveDeliveryPricing]", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/delivery");
  return { ok: true };
}

export default async function DeliveryDashboardPage({
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

  const pricing = await getDeliveryPricingSettings(brandSlug);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white">Delivery Pricing</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Tune per-mile rates, free delivery area, and service radius for{" "}
          <span className="font-semibold text-zinc-200">
            {BRANDS[brandSlug].displayName}
          </span>
          . Changes apply to new quotes immediately.
        </p>
      </div>

      {/* Brand switcher — mirrors /dashboard/site and /dashboard/blackouts */}
      <div className="flex gap-2">
        {(["lias", "crb"] as const).map((slug) => (
          <Link
            key={slug}
            href={`/dashboard/delivery?brand=${slug}`}
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

      <DeliveryPricingForm
        brandSlug={brandSlug}
        initial={pricing}
        action={saveDeliveryPricing}
      />
    </div>
  );
}
