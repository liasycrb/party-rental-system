/**
 * Server-only delivery fee helper.
 *
 * Reads non-NEXT_PUBLIC env (GOOGLE_MAPS_API_KEY, BUSINESS_ORIGIN_ADDRESS,
 * DELIVERY_MAX_MILES) — Next will refuse to bundle this for the client.
 * Do not import from a Client Component.
 */

import type {
  CalculateDeliveryFeeInput,
  CalculateDeliveryFeeResult,
  DeliveryFeeTier,
} from "./types";

const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const DISTANCE_MATRIX_URL =
  "https://maps.googleapis.com/maps/api/distancematrix/json";
const REQUEST_TIMEOUT_MS = 5000;
const METERS_PER_MILE = 1609.344;
const DEFAULT_MAX_MILES = 40;

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
): { fee: number; tier: DeliveryFeeTier; ratePerMile: number } {
  // Per-mile rate by total-distance tier. Spec:
  //   1–9 miles  → $5/mi
  //   10–20 miles → $8/mi
  //   21+ miles   → $15/mi
  // Final fee = round(miles × rate). Whole dollars.
  let ratePerMile: number;
  let tier: DeliveryFeeTier;
  if (miles <= 9) {
    ratePerMile = 5;
    tier = "near";
  } else if (miles <= 20) {
    ratePerMile = 8;
    tier = "mid";
  } else {
    ratePerMile = 15;
    tier = "far";
  }
  const fee = Math.round(miles * ratePerMile);
  return { fee, tier, ratePerMile };
}

type LocalityInfo = {
  locality: string | null;
  state: string;
  isMorenoValleyCA: boolean;
};

function extractLocality(components: AddressComponent[]): LocalityInfo {
  let localityLong = "";
  let state = "";
  for (const c of components) {
    if (c.types.includes("locality")) localityLong = c.long_name;
    if (c.types.includes("administrative_area_level_1")) state = c.short_name;
  }
  return {
    locality: localityLong ? localityLong : null,
    state,
    isMorenoValleyCA:
      localityLong.toLowerCase() === "moreno valley" && state === "CA",
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
  const maxMilesRaw = Number(process.env.DELIVERY_MAX_MILES);
  const maxMiles =
    Number.isFinite(maxMilesRaw) && maxMilesRaw > 0
      ? maxMilesRaw
      : DEFAULT_MAX_MILES;

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

  const localityInfo = extractLocality(top.address_components);

  if (localityInfo.isMorenoValleyCA) {
    return {
      ok: true,
      normalizedAddress,
      placeId,
      locality: localityInfo.locality ?? "Moreno Valley",
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

  const { fee, tier, ratePerMile } = feeForMiles(distanceMiles);

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
