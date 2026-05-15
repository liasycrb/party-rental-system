"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { addDaysUTC } from "@/lib/utils/date";

export async function getBookedDates(
  productSlug: string,
  brandSlug: string,
): Promise<string[]> {
  const supabase = await createSupabaseServerClient();

  // Mirror getInventoryAvailability: look up the product so we know its
  // tracked capacity. Skip blocking entirely when inventory isn't tracked.
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

  if (product && product.inventory_tracked === false) {
    return [];
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
    return [];
  }

  // Total booked quantity per event_date.
  const qtyByDate = new Map<string, number>();
  for (const row of data ?? []) {
    const d = (row.event_date as string | null) ?? null;
    if (!d) continue;
    const qty = Number(row.quantity) || 0;
    qtyByDate.set(d, (qtyByDate.get(d) ?? 0) + qty);
  }

  // Candidate dates touched by the 3-day window: each event_date contributes
  // [D-1, D, D+1]. Same windowing used by getInventoryAvailability.
  const candidates = new Set<string>();
  for (const d of qtyByDate.keys()) {
    candidates.add(addDaysUTC(d, -1));
    candidates.add(d);
    candidates.add(addDaysUTC(d, 1));
  }

  // Block D only when summed quantity across [D-1, D, D+1] reaches capacity.
  const blocked: string[] = [];
  for (const d of candidates) {
    const windowSum =
      (qtyByDate.get(addDaysUTC(d, -1)) ?? 0) +
      (qtyByDate.get(d) ?? 0) +
      (qtyByDate.get(addDaysUTC(d, 1)) ?? 0);
    if (windowSum >= quantityAvailable) {
      blocked.push(d);
    }
  }

  return blocked;
}
