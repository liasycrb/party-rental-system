import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BrandSlug } from "@/lib/brand/config";
import {
  DEFAULT_DELIVERY_PRICING,
  type DeliveryPricingSettings,
} from "./default-delivery-pricing";

type DeliveryPricingRow = {
  id: string;
  brand_slug: string;
  free_city: string | null;
  near_rate_per_mile: number | string | null;
  mid_rate_per_mile: number | string | null;
  far_rate_per_mile: number | string | null;
  near_max_miles: number | string | null;
  mid_max_miles: number | string | null;
  max_service_miles: number | string | null;
  updated_at: string | null;
};

function num(value: number | string | null | undefined, fallback: number): number {
  if (value == null) return fallback;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Read per-brand delivery pricing settings. Never throws — on any RPC error or
 * missing row, returns the hardcoded DEFAULT_DELIVERY_PRICING so booking quotes
 * keep working.
 */
export async function getDeliveryPricingSettings(
  brandSlug: BrandSlug,
): Promise<DeliveryPricingSettings> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return DEFAULT_DELIVERY_PRICING;
  }

  let row: DeliveryPricingRow | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("get_delivery_pricing_settings", {
      p_brand_slug: brandSlug,
    });
    if (error) {
      console.error("[getDeliveryPricingSettings]", error.message);
      return DEFAULT_DELIVERY_PRICING;
    }
    const rows = data as DeliveryPricingRow[] | null;
    row = rows?.[0] ?? null;
  } catch (e) {
    console.error(
      "[getDeliveryPricingSettings] unexpected error:",
      e instanceof Error ? e.message : e,
    );
    return DEFAULT_DELIVERY_PRICING;
  }

  if (!row) return DEFAULT_DELIVERY_PRICING;

  return {
    freeCity:
      (row.free_city ?? "").trim() || DEFAULT_DELIVERY_PRICING.freeCity,
    nearRatePerMile: num(
      row.near_rate_per_mile,
      DEFAULT_DELIVERY_PRICING.nearRatePerMile,
    ),
    midRatePerMile: num(
      row.mid_rate_per_mile,
      DEFAULT_DELIVERY_PRICING.midRatePerMile,
    ),
    farRatePerMile: num(
      row.far_rate_per_mile,
      DEFAULT_DELIVERY_PRICING.farRatePerMile,
    ),
    nearMaxMiles: num(
      row.near_max_miles,
      DEFAULT_DELIVERY_PRICING.nearMaxMiles,
    ),
    midMaxMiles: num(row.mid_max_miles, DEFAULT_DELIVERY_PRICING.midMaxMiles),
    maxServiceMiles: num(
      row.max_service_miles,
      DEFAULT_DELIVERY_PRICING.maxServiceMiles,
    ),
    updatedAt: row.updated_at ?? null,
  };
}
