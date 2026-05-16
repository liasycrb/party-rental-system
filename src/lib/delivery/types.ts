import type { BrandSlug } from "@/lib/brand/config";

export type DeliveryFeeTier = "free" | "near" | "mid" | "far";

export type CalculateDeliveryFeeInput = {
  brandSlug: BrandSlug;
  customerAddress: string;
  customerCity?: string | null;
};

export type CalculateDeliveryFeeOk = {
  ok: true;
  normalizedAddress: string;
  placeId: string;
  /** Geocoded city (address_components locality), e.g. "Moreno Valley". May be null for addresses without a recognized locality. */
  locality: string | null;
  distanceMiles: number;
  /** Final fee, whole dollars: deliveryFee = round(distanceMiles × ratePerMile). 0 for free city. */
  deliveryFee: number;
  /** Per-mile rate that produced deliveryFee. 0 for free city. */
  ratePerMile: number;
  isFreeCity: boolean;
  tier: DeliveryFeeTier;
};

export type CalculateDeliveryFeeErrorReason =
  | "invalid_input"
  | "invalid_address"
  | "outside_service_area"
  | "google_timeout"
  | "google_error"
  | "config_missing";

export type CalculateDeliveryFeeError = {
  ok: false;
  reason: CalculateDeliveryFeeErrorReason;
  message: string;
};

export type CalculateDeliveryFeeResult =
  | CalculateDeliveryFeeOk
  | CalculateDeliveryFeeError;
