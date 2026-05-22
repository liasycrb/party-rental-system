import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BrandSlug } from "@/lib/brand/config";
import {
  DEFAULT_BOOKING_SETTINGS,
  type BookingSettings,
} from "./default-booking-settings";

type BookingSettingsRow = {
  id: string;
  brand_slug: string;
  minimum_order_amount: number | string | null;
  updated_at: string | null;
};

function num(value: number | string | null | undefined, fallback: number): number {
  if (value == null) return fallback;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Read per-brand booking rules. Never throws — on any RPC error or missing row,
 * returns the hardcoded DEFAULT_BOOKING_SETTINGS so the /build flow keeps
 * working.
 */
export async function getBookingSettings(
  brandSlug: BrandSlug,
): Promise<BookingSettings> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return DEFAULT_BOOKING_SETTINGS;
  }

  let row: BookingSettingsRow | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("get_booking_settings", {
      p_brand_slug: brandSlug,
    });
    if (error) {
      console.error("[getBookingSettings]", error.message);
      return DEFAULT_BOOKING_SETTINGS;
    }
    const rows = data as BookingSettingsRow[] | null;
    row = rows?.[0] ?? null;
  } catch (e) {
    console.error(
      "[getBookingSettings] unexpected error:",
      e instanceof Error ? e.message : e,
    );
    return DEFAULT_BOOKING_SETTINGS;
  }

  if (!row) return DEFAULT_BOOKING_SETTINGS;

  return {
    minimumOrderAmount: num(
      row.minimum_order_amount,
      DEFAULT_BOOKING_SETTINGS.minimumOrderAmount,
    ),
    updatedAt: row.updated_at ?? null,
  };
}
