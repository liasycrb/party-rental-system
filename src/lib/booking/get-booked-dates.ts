"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { addDaysUTC } from "@/lib/utils/date";
import {
  enumerateBlackoutDates,
  getBookingBlackouts,
} from "@/lib/booking/get-booking-blackouts";

export async function getBookedDates(
  productSlug: string,
  brandSlug: string,
): Promise<string[]> {
  const supabase = await createSupabaseServerClient();

  // Brand-wide blackouts apply regardless of product, including untracked items.
  // Fetch them up-front so every return path below honors them.
  const blackouts = await getBookingBlackouts(brandSlug);
  const blackoutDates = enumerateBlackoutDates(blackouts);

  const { data: allProducts, error: productError } = await supabase
    .rpc("get_active_rental_products_for_brand", { p_brand_slug: brandSlug });

  if (productError) {
    console.error("[getBookedDates] rental_products rpc", productError.message);
  }

  type ProductRow = {
    slug: string;
    quantity_available: number | null;
    inventory_tracked: boolean | null;
    is_active?: boolean | null;
  };
  const visible = ((allProducts ?? []) as ProductRow[]).filter(
    (p) => p.is_active !== false,
  );
  const product = visible.find((p) => p.slug === productSlug) ?? null;

  // Untracked products skip the quantity rollup but still honor brand blackouts.
  if (product && product.inventory_tracked === false) {
    return blackoutDates;
  }

  const quantityAvailable =
    typeof product?.quantity_available === "number"
      ? product.quantity_available
      : 0;

  const { data, error } = await supabase
    .from("bookings")
    .select("event_date, quantity")
    .eq("brand_slug", brandSlug)
    .eq("product_slug", productSlug)
    .in("status", ["pending_confirmation", "confirmed"]);

  if (error) {
    console.error("[getBookedDates]", error.message);
    // Fail-open for bookings, but blackouts still surface so closed days never leak through.
    return blackoutDates;
  }

  const qtyByDate = new Map<string, number>();
  for (const row of data ?? []) {
    const d = (row.event_date as string | null) ?? null;
    if (!d) continue;
    const qty = Number(row.quantity) || 0;
    qtyByDate.set(d, (qtyByDate.get(d) ?? 0) + qty);
  }

  const candidates = new Set<string>();
  for (const d of qtyByDate.keys()) {
    candidates.add(addDaysUTC(d, -1));
    candidates.add(d);
    candidates.add(addDaysUTC(d, 1));
  }

  // Seed with blackouts so the merged set carries them through.
  // Quantity-aware blocks still use the 3-day window; blackouts do not.
  const blocked = new Set<string>(blackoutDates);
  for (const d of candidates) {
    const windowSum =
      (qtyByDate.get(addDaysUTC(d, -1)) ?? 0) +
      (qtyByDate.get(d) ?? 0) +
      (qtyByDate.get(addDaysUTC(d, 1)) ?? 0);
    if (windowSum >= quantityAvailable) {
      blocked.add(d);
    }
  }

  return Array.from(blocked);
}
