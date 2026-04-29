import { createSupabaseServerClient } from "@/lib/supabase/server";

export type InventoryAvailabilityResult =
  | { available: null; reason: "missing_product_or_date" }
  | {
      available: boolean;
      quantityActive: number;
      bookedCount: number;
      availableQuantity: number;
    };

export async function getInventoryAvailability(params: {
  brandSlug: string;
  productSlug: string | null;
  eventDate: string | null;
}): Promise<InventoryAvailabilityResult> {
  const brandSlug = params.brandSlug.trim();
  const productSlug = params.productSlug?.trim() || null;
  const eventDate = params.eventDate?.trim() || null;

  if (!productSlug || !eventDate) {
    return { available: null, reason: "missing_product_or_date" };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      available: false,
      quantityActive: 0,
      bookedCount: 0,
      availableQuantity: 0,
    };
  }

  const supabase = await createSupabaseServerClient();

  const { data: items, error: itemsError } = await supabase
    .from("inventory_items")
    .select("quantity_active")
    .eq("brand_slug", brandSlug)
    .eq("product_slug", productSlug)
    .eq("status", "active");

  if (itemsError) {
    console.error("[getInventoryAvailability] inventory_items", itemsError.message);
  }

  const quantityActive = (items ?? []).reduce(
    (sum, row) => sum + (Number(row.quantity_active) || 0),
    0,
  );

  const { data: bookingRows, error: bookingsError } = await supabase
    .from("bookings")
    .select("id")
    .eq("brand_slug", brandSlug)
    .eq("product_slug", productSlug)
    .eq("event_date", eventDate)
    .neq("status", "cancelled");

  if (bookingsError) {
    console.error("[getInventoryAvailability] bookings", bookingsError.message);
  }

  const bookedCount = bookingRows?.length ?? 0;
  const availableQuantity = quantityActive - bookedCount;
  const available = availableQuantity > 0;

  return {
    available,
    quantityActive,
    bookedCount,
    availableQuantity,
  };
}
