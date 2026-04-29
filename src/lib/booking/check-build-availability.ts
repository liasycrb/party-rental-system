"use server";

import type { BrandSlug } from "@/lib/brand/config";
import {
  getInventoryAvailability,
  type InventoryAvailabilityResult,
} from "@/lib/inventory/get-inventory-availability";

export async function checkBuildAvailability(input: {
  brandSlug: BrandSlug;
  productSlug: string | null;
  eventDate: string | null;
}): Promise<InventoryAvailabilityResult> {
  return getInventoryAvailability({
    brandSlug: input.brandSlug,
    productSlug: input.productSlug,
    eventDate: input.eventDate,
  });
}
