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

  const { data: allProducts, error: productError } = await supabase
    .rpc("get_active_rental_products_for_brand", { p_brand_slug: brandSlug });

  if (productError) {
    console.error("[getInventoryAvailability] rental_products rpc", productError.message);
  }

  type ProductRow = {
    slug: string;
    quantity_available: number | null;
    inventory_tracked: boolean | null;
    is_active?: boolean | null;
  };
  const visible = ((allProducts ?? []) as ProductRow[]).filter((p) => p.is_active !== false);
  const product = visible.find((p) => p.slug === productSlug) ?? null;

  // If inventory is not tracked for this product, always report available.
  if (product && product.inventory_tracked === false) {
    return {
      available: true,
      quantityActive: 0,
      bookedCount: 0,
      availableQuantity: 0,
    };
  }

  const quantityActive = typeof product?.quantity_available === "number"
    ? product.quantity_available
    : 0;

  const { data: bookingRows, error: bookingsError } = await supabase
    .from("bookings")
    .select("quantity, status")
    .eq("brand_slug", brandSlug)
    .eq("product_slug", productSlug)
    .eq("event_date", eventDate);

  if (bookingsError) {
    console.error("[getInventoryAvailability] bookings", bookingsError.message);
  }

  const countableStatuses = new Set(["pending_confirmation", "confirmed"]);
  const bookedQty = (bookingRows ?? []).reduce((sum, b) => {
    if (!countableStatuses.has(String(b.status))) {
      return sum;
    }
    return sum + (Number(b.quantity) || 0);
  }, 0);

  const availableQuantity = Math.max(0, quantityActive - bookedQty);
  const available = availableQuantity > 0;

  return {
    available,
    quantityActive,
    bookedCount: bookedQty,
    availableQuantity,
  };
}
