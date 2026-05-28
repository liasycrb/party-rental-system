/**
 * SEO route helpers (Phase 2).
 *
 * Single source of truth for:
 *   - the (service × city) Cartesian that powers `generateStaticParams` and the
 *     sitemap,
 *   - the URL path for any landing page (used by canonicals + internal links),
 *   - the resolver every route page calls with raw params.
 *
 * Future-proofing: today every landing lives at `/{service}/{city}` (flat). If
 * a future architecture moves to `/service/{service}/{city}` or layers in a
 * seasonal/audience scope (e.g. `/halloween/{service}/{city}`), changing the
 * single `landingPath()` (and adding scope to `LandingScope`) keeps the
 * sitemap, internal links, canonical URLs, and JSON-LD consistent without
 * touching every page.
 */

import {
  CITY_SLUGS,
  getCitySeo,
  type CitySeo,
} from "./cities";
import {
  SERVICE_SLUGS,
  getService,
  type Service,
  type ServiceSlug,
} from "./services";

// --- Params + resolution ---------------------------------------------------

export type SeoLandingParam = {
  service: ServiceSlug;
  city: string;
};

/**
 * Resolved landing — guaranteed valid (service+city both real) or `null`.
 * Page routes call this with raw `params`; null → `notFound()`.
 */
export type ResolvedLanding = {
  service: Service;
  city: CitySeo;
};

export function resolveLanding(
  serviceSlug: string | null | undefined,
  citySlug: string | null | undefined,
): ResolvedLanding | null {
  const service = getService(serviceSlug);
  const city = getCitySeo(citySlug);
  if (!service || !city) return null;
  return { service, city };
}

/**
 * Every (service × city) combo to render. Powers:
 *   - per-route `generateStaticParams()`
 *   - `sitemap.ts`
 * Today: 8 services × 10 cities = 80 landing URLs per brand (160 total). Adding
 * a city or service updates this automatically.
 */
export function allSeoLandingParams(): SeoLandingParam[] {
  const out: SeoLandingParam[] = [];
  for (const service of SERVICE_SLUGS) {
    for (const city of CITY_SLUGS) {
      out.push({ service, city });
    }
  }
  return out;
}

/** Same as above but scoped to a single service — used by per-route pages. */
export function staticCityParams(): { city: string }[] {
  return CITY_SLUGS.map((city) => ({ city }));
}

// --- URL builders ----------------------------------------------------------

/**
 * The single source of truth for landing URLs. Sitemap, internal links,
 * canonicals, and JSON-LD all call this — never hardcode the path elsewhere.
 *
 * Returns a *relative* path. Combine with `brand.siteUrl` for absolute URLs
 * (e.g. canonicals + sitemap entries).
 */
export function landingPath(service: ServiceSlug, citySlug: string): string {
  return `/${service}/${citySlug}`;
}

/** Absolute canonical URL on a specific brand's domain. */
export function landingCanonicalUrl(
  brandSiteUrl: string,
  service: ServiceSlug,
  citySlug: string,
): string {
  const base = brandSiteUrl.replace(/\/+$/, "");
  return `${base}${landingPath(service, citySlug)}`;
}

// --- Scope (future-proof for seasonal / audience / venue overlays) ---------

/**
 * `LandingScope` is the extensibility seam for seasonal/holiday/audience/venue
 * pages WITHOUT exploding the service/city catalog.
 *
 * Today only `{ kind: "city" }` exists and the URL is `/{service}/{city}`.
 *
 * Future kinds (NOT WIRED YET):
 *   - `{ kind: "seasonal", citySlug, season }` → `/{service}/{city}?for={season}`
 *     or `/{season}/{service}/{city}`
 *   - `{ kind: "audience", citySlug, audience: "school" | "church" | "corporate" }`
 *   - `{ kind: "venue", citySlug, venue: "backyard" | "park" | "school-field" }`
 *
 * Composition (`landing-content.ts`) accepts an optional scope and uses it to
 * tweak angle/CTA/inventory subset — the URL builder is the only seam that
 * needs to change when these go live.
 */
export type LandingScope =
  | { kind: "city"; citySlug: string }
  | { kind: "seasonal"; citySlug: string; season: string }
  | { kind: "audience"; citySlug: string; audience: "school" | "church" | "corporate" }
  | { kind: "venue"; citySlug: string; venue: "backyard" | "park" | "school-field" };

/**
 * URL builder that honors a `LandingScope`. Today every kind collapses to the
 * flat `/{service}/{city}` URL — extend here when overlays go live.
 */
export function scopedLandingPath(
  service: ServiceSlug,
  scope: LandingScope,
): string {
  switch (scope.kind) {
    case "city":
    case "seasonal":
    case "audience":
    case "venue":
      return landingPath(service, scope.citySlug);
  }
}

// --- Cross-link helpers (used by sitemap + footer + nearby sections) -------

/** Same service across all nearby cities for the given (service, city). */
export function nearbyServiceLinks(
  service: ServiceSlug,
  city: CitySeo,
): { href: string; label: string }[] {
  return city.nearbyCitySlugs
    .map((slug) => {
      const c = getCitySeo(slug);
      if (!c) return null;
      return { href: landingPath(service, c.slug), label: c.name };
    })
    .filter((l): l is { href: string; label: string } => l !== null);
}

/** Sibling services in the same city — used by "Related rentals in {city}". */
export function relatedServiceLinks(
  service: Service,
  city: CitySeo,
): { href: string; label: string }[] {
  return service.relatedServiceSlugs
    .map((slug) => {
      const s = getService(slug);
      if (!s) return null;
      return { href: landingPath(s.slug, city.slug), label: s.label };
    })
    .filter((l): l is { href: string; label: string } => l !== null);
}
