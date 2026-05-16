/**
 * Hardcoded delivery pricing defaults. Used as a safety fallback when the
 * delivery_pricing_settings RPC fails or returns no row. Keep these in sync
 * with the migration defaults (20260516120000_delivery_pricing_settings.sql).
 */

export type DeliveryPricingSettings = {
  freeCity: string;
  nearRatePerMile: number;
  midRatePerMile: number;
  farRatePerMile: number;
  nearMaxMiles: number;
  midMaxMiles: number;
  maxServiceMiles: number;
  /** ISO timestamp of the last dashboard save, or null when serving hardcoded defaults. */
  updatedAt: string | null;
};

export const DEFAULT_DELIVERY_PRICING: DeliveryPricingSettings = {
  freeCity: "Moreno Valley",
  nearRatePerMile: 5,
  midRatePerMile: 8,
  farRatePerMile: 15,
  nearMaxMiles: 9,
  midMaxMiles: 20,
  maxServiceMiles: 40,
  updatedAt: null,
};
