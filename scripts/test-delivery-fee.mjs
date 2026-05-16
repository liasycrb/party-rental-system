/**
 * Dev-only smoke test for the Google Maps delivery flow.
 *
 *   node scripts/test-delivery-fee.mjs
 *   node scripts/test-delivery-fee.mjs "456 Some St" "Perris"
 *
 * Reads GOOGLE_MAPS_API_KEY, BUSINESS_ORIGIN_ADDRESS, and DELIVERY_MAX_MILES
 * from .env.local (or process env). Mirrors the network flow of
 * src/lib/delivery/calculate-delivery-fee.ts so you can validate API keys and
 * tier math without booting Next.js. Update the helper, not this script, for
 * real behavior changes.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const REQUEST_TIMEOUT_MS = 5000;
const METERS_PER_MILE = 1609.344;
const DEFAULT_MAX_MILES = 40;

function loadEnvLocal() {
  const candidates = [".env.local", ".env"];
  for (const file of candidates) {
    try {
      const text = readFileSync(resolve(process.cwd(), file), "utf8");
      for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;
        const eq = line.indexOf("=");
        if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        let value = line.slice(eq + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (!(key in process.env)) process.env[key] = value;
      }
    } catch {
      /* file missing — fine */
    }
  }
}

function feeForMiles(miles) {
  // Per-mile rate by total-distance tier. Whole-dollar fee.
  let ratePerMile;
  let tier;
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
  return { fee: Math.round(miles * ratePerMile), tier, ratePerMile };
}

function extractLocality(components) {
  let localityLong = "";
  let state = "";
  for (const c of components) {
    if (c.types.includes("locality")) localityLong = c.long_name;
    if (c.types.includes("administrative_area_level_1")) state = c.short_name;
  }
  return {
    locality: localityLong || null,
    isMorenoValleyCA:
      localityLong.toLowerCase() === "moreno valley" && state === "CA",
  };
}

async function calc({ customerAddress, customerCity }) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const origin = process.env.BUSINESS_ORIGIN_ADDRESS;
  const maxMilesRaw = Number(process.env.DELIVERY_MAX_MILES);
  const maxMiles =
    Number.isFinite(maxMilesRaw) && maxMilesRaw > 0
      ? maxMilesRaw
      : DEFAULT_MAX_MILES;

  if (!apiKey || !origin) {
    return { ok: false, reason: "config_missing", message: "missing env" };
  }

  const query = customerCity
    ? `${customerAddress}, ${customerCity}`
    : customerAddress;

  const geocodeUrl = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  geocodeUrl.searchParams.set("address", query);
  geocodeUrl.searchParams.set("region", "us");
  geocodeUrl.searchParams.set(
    "components",
    "country:US|administrative_area:CA",
  );
  geocodeUrl.searchParams.set("key", apiKey);

  const gRes = await fetch(geocodeUrl, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const gData = await gRes.json();
  if (gData.status !== "OK" || !gData.results?.[0]) {
    return {
      ok: false,
      reason: gData.status === "ZERO_RESULTS" ? "invalid_address" : "google_error",
      message: gData.error_message || gData.status,
    };
  }

  const top = gData.results[0];
  const localityInfo = extractLocality(top.address_components);
  if (localityInfo.isMorenoValleyCA) {
    return {
      ok: true,
      normalizedAddress: top.formatted_address,
      placeId: top.place_id,
      locality: localityInfo.locality ?? "Moreno Valley",
      distanceMiles: 0,
      deliveryFee: 0,
      ratePerMile: 0,
      isFreeCity: true,
      tier: "free",
    };
  }

  const dmUrl = new URL(
    "https://maps.googleapis.com/maps/api/distancematrix/json",
  );
  dmUrl.searchParams.set("origins", origin);
  dmUrl.searchParams.set("destinations", `place_id:${top.place_id}`);
  dmUrl.searchParams.set("mode", "driving");
  dmUrl.searchParams.set("units", "imperial");
  dmUrl.searchParams.set("key", apiKey);

  const dmRes = await fetch(dmUrl, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const dm = await dmRes.json();
  const el = dm.rows?.[0]?.elements?.[0];
  if (dm.status !== "OK" || !el || el.status !== "OK" || !el.distance) {
    return {
      ok: false,
      reason: "google_error",
      message: dm.error_message || el?.status || dm.status,
    };
  }

  const distanceMiles =
    Math.round((el.distance.value / METERS_PER_MILE) * 10) / 10;
  if (distanceMiles > maxMiles) {
    return { ok: false, reason: "outside_service_area", distanceMiles };
  }
  const { fee, tier, ratePerMile } = feeForMiles(distanceMiles);
  return {
    ok: true,
    normalizedAddress: top.formatted_address,
    placeId: top.place_id,
    locality: localityInfo.locality,
    distanceMiles,
    deliveryFee: fee,
    ratePerMile,
    isFreeCity: false,
    tier,
  };
}

const SAMPLES = [
  { label: "Moreno Valley (free)", customerAddress: "14075 Frederick St", customerCity: "Moreno Valley, CA" },
  { label: "Perris", customerAddress: "Downtown", customerCity: "Perris, CA" },
  { label: "Riverside", customerAddress: "Mission Inn Ave", customerCity: "Riverside, CA" },
  { label: "Corona", customerAddress: "City Hall", customerCity: "Corona, CA" },
];

async function main() {
  loadEnvLocal();

  const args = process.argv.slice(2);
  const cases =
    args.length >= 1
      ? [{ label: "custom", customerAddress: args[0], customerCity: args[1] ?? null }]
      : SAMPLES;

  for (const c of cases) {
    process.stdout.write(`\n— ${c.label} (${c.customerAddress}${c.customerCity ? ", " + c.customerCity : ""})\n`);
    try {
      const result = await calc(c);
      process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    } catch (e) {
      process.stdout.write(`ERROR: ${e instanceof Error ? e.message : String(e)}\n`);
    }
  }
}

main().catch((e) => {
  process.stderr.write(`fatal: ${e instanceof Error ? e.stack : String(e)}\n`);
  process.exit(1);
});
