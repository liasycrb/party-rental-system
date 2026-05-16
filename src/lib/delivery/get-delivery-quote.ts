"use server";

/**
 * Server action wrapper around calculateDeliveryFee for client components.
 * Keeps GOOGLE_MAPS_API_KEY on the server — never imported from a client file.
 */

import { calculateDeliveryFee } from "./calculate-delivery-fee";
import type { CalculateDeliveryFeeResult } from "./types";

export async function getDeliveryQuote(input: {
  customerAddress: string;
  customerCity?: string | null;
}): Promise<CalculateDeliveryFeeResult> {
  const address = (input?.customerAddress ?? "").trim();
  if (!address) {
    return {
      ok: false,
      reason: "invalid_input",
      message: "Please enter a delivery address.",
    };
  }
  const city = (input?.customerCity ?? "").trim() || null;
  return calculateDeliveryFee({
    customerAddress: address,
    customerCity: city,
  });
}
