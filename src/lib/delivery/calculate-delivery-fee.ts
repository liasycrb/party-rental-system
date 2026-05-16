/**
 * Server-only delivery fee helper.
 *
 * Reads non-NEXT_PUBLIC env (GOOGLE_MAPS_API_KEY, BUSINESS_ORIGIN_ADDRESS,
 * DELIVERY_MAX_MILES) — Next will refuse to bundle this for the client.
 * Do not import from a Client Component.
 *
 * Tier rates, free-city name, and the service-area cap are loaded per-brand
 * from delivery_pricing_settings (RPC get_delivery_pricing_settings), with
 * DEFAULT_DELIVERY_PRICING as a safety fallback. DELIVERY_MAX_MILES env is
 * honored only when settings/defaults would yield no value.
 */

import type {
  CalculateDeliveryFeeInput,
  CalculateDeliveryFeeResult,
  DeliveryFeeTier,
} from "./types";
import { getDeliveryPricingSettings } from "./get-delivery-pricing-settings";
import {
  DEFAULT_DELIVERY_PRICING,
  type DeliveryPricingSettings,
} from "./default-delivery-pricing";

const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const DISTANCE_MATRIX_URL =
  "https://maps.googleapis.com/maps/api/distancematrix/json";
const REQUEST_TIMEOUT_MS = 5000;
const METERS_PER_MILE = 1609.344;

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type GeocodeApiResult = {
  formatted_address: string;
  place_id: string;
  address_components: AddressComponent[];
};

type GeocodeApiResponse = {
  status: string;
  results: GeocodeApiResult[];
  error_message?: string;
};

type DistanceMatrixApiResponse = {
  status: string;
  error_message?: string;
  rows?: Array<{
    elements: Array<{
      status: string;
      distance?: { value: number; text: string };
      duration?: { value: number; text: string };
    }>;
  }>;
};

function feeForMiles(
  miles: number,
  pricing: DeliveryPricingSettings,
): { fee: number; tier: DeliveryFeeTier; ratePerMile: number } {
  // Per-mile rate by total-distance tier. Thresholds and rates are
  // dashboard-configurable per brand; defaults preserve the original spec
  // (9 / 20 / 40 mi at $5 / $8 / $15 per mile). Final fee = round(miles × rate).
  let ratePerMile: number;
  let tier: DeliveryFeeTier;
  if (miles <= pricing.nearMaxMiles) {
    ratePerMile = pricing.nearRatePerMile;
    tier = "near";
  } else if (miles <= pricing.midMaxMiles) {
    ratePerMile = pricing.midRatePerMile;
    tier = "mid";
  } else {
    ratePerMile = pricing.farRatePerMile;
    tier = "far";
  }
  const fee = Math.round(miles * ratePerMile);
  return { fee, tier, ratePerMile };
}

type LocalityInfo = {
  locality: string | null;
  state: string;
  isFreeCity: boolean;
};

function extractLocality(
  components: AddressComponent[],
  freeCity: string,
): LocalityInfo {
  let localityLong = "";
  let state = "";
  for (const c of components) {
    if (c.types.includes("locality")) localityLong = c.long_name;
    if (c.types.includes("administrative_area_level_1")) state = c.short_name;
  }
  const normalizedFreeCity = freeCity.trim().toLowerCase();
  return {
    locality: localityLong ? localityLong : null,
    state,
    isFreeCity:
      normalizedFreeCity.length > 0 &&
      localityLong.toLowerCase() === normalizedFreeCity &&
      state === "CA",
  };
}

function isAbortError(e: unknown): boolean {
  if (e instanceof Error) {
    if (e.name === "AbortError" || e.name === "TimeoutError") return true;
    if (/timeout|aborted/i.test(e.message)) return true;
  }
  return false;
}

export async function calculateDeliveryFee(
  input: CalculateDeliveryFeeInput,
): Promise<CalculateDeliveryFeeResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const origin = process.env.BUSINESS_ORIGIN_ADDRESS;

  // Per-brand pricing from the dashboard (with hardcoded fallback baked in).
  // Loaded once up front so geocoding and distance lookups share a single
  // snapshot of the rate table.
  const pricing = await getDeliveryPricingSettings(input.brandSlug);

  // Env override is honored only if the resolved settings would yield no cap
  // (kept for backwards compat with deployments that still set this var).
  const maxMilesRaw = Number(process.env.DELIVERY_MAX_MILES);
  const settingsMaxMiles =
    Number.isFinite(pricing.maxServiceMiles) && pricing.maxServiceMiles > 0
      ? pricing.maxServiceMiles
      : Number.isFinite(maxMilesRaw) && maxMilesRaw > 0
        ? maxMilesRaw
        : DEFAULT_DELIVERY_PRICING.maxServiceMiles;
  const maxMiles = settingsMaxMiles;

  if (!apiKey || !origin) {
    return {
      ok: false,
      reason: "config_missing",
      message: "Delivery pricing is not configured on the server.",
    };
  }

  const address = (input.customerAddress ?? "").trim();
  if (!address) {
    return {
      ok: false,
      reason: "invalid_input",
      message: "Delivery address is required.",
    };
  }

  const cityHint = (input.customerCity ?? "").trim();
  const geocodeQuery = cityHint ? `${address}, ${cityHint}` : address;

  const geocodeUrl = new URL(GEOCODE_URL);
  geocodeUrl.searchParams.set("address", geocodeQuery);
  geocodeUrl.searchParams.set("region", "us");
  geocodeUrl.searchParams.set(
    "components",
    "country:US|administrative_area:CA",
  );
  geocodeUrl.searchParams.set("key", apiKey);

  let geocodeData: GeocodeApiResponse;
  try {
    const res = await fetch(geocodeUrl, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
    geocodeData = (await res.json()) as GeocodeApiResponse;
  } catch (e) {
    return {
      ok: false,
      reason: isAbortError(e) ? "google_timeout" : "google_error",
      message: isAbortError(e)
        ? "Address lookup timed out. Please try again or call us."
        : "Address lookup failed. Please call us to confirm delivery.",
    };
  }

  if (geocodeData.status === "ZERO_RESULTS") {
    return {
      ok: false,
      reason: "invalid_address",
      message: "We couldn't find that address. Please check and try again.",
    };
  }
  if (geocodeData.status !== "OK" || !geocodeData.results?.[0]) {
    console.error(
      "[calculateDeliveryFee] geocoding failed:",
      geocodeData.status,
      geocodeData.error_message,
    );
    return {
      ok: false,
      reason: "google_error",
      message: "Address lookup failed. Please call us to confirm delivery.",
    };
  }

  const top = geocodeData.results[0];
  const normalizedAddress = top.formatted_address;
  const placeId = top.place_id;

  const localityInfo = extractLocality(top.address_components, pricing.freeCity);

  if (localityInfo.isFreeCity) {
    return {
      ok: true,
      normalizedAddress,
      placeId,
      locality: localityInfo.locality ?? pricing.freeCity,
      distanceMiles: 0,
      deliveryFee: 0,
      ratePerMile: 0,
      isFreeCity: true,
      tier: "free",
    };
  }

  const dmUrl = new URL(DISTANCE_MATRIX_URL);
  dmUrl.searchParams.set("origins", origin);
  dmUrl.searchParams.set("destinations", `place_id:${placeId}`);
  dmUrl.searchParams.set("mode", "driving");
  dmUrl.searchParams.set("units", "imperial");
  dmUrl.searchParams.set("key", apiKey);

  let dmData: DistanceMatrixApiResponse;
  try {
    const res = await fetch(dmUrl, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
    dmData = (await res.json()) as DistanceMatrixApiResponse;
  } catch (e) {
    return {
      ok: false,
      reason: isAbortError(e) ? "google_timeout" : "google_error",
      message: isAbortError(e)
        ? "Delivery distance lookup timed out. Please try again or call us."
        : "Distance lookup failed. Please call us to confirm delivery.",
    };
  }

  if (dmData.status !== "OK") {
    console.error(
      "[calculateDeliveryFee] distance matrix failed:",
      dmData.status,
      dmData.error_message,
    );
    return {
      ok: false,
      reason: "google_error",
      message: "Distance lookup failed. Please call us to confirm delivery.",
    };
  }

  const element = dmData.rows?.[0]?.elements?.[0];
  if (!element || element.status !== "OK" || !element.distance) {
    return {
      ok: false,
      reason: "invalid_address",
      message: "We couldn't find a driving route to that address.",
    };
  }

  const distanceMiles =
    Math.round((element.distance.value / METERS_PER_MILE) * 10) / 10;

  if (distanceMiles > maxMiles) {
    return {
      ok: false,
      reason: "outside_service_area",
      message: `Sorry, ${distanceMiles} miles is outside our service area. Please call us.`,
    };
  }

  const { fee, tier, ratePerMile } = feeForMiles(distanceMiles, pricing);

  return {
    ok: true,
    normalizedAddress,
    placeId,
    locality: localityInfo.locality,
    distanceMiles,
    deliveryFee: fee,
    ratePerMile,
    isFreeCity: false,
    tier,
  };
}
