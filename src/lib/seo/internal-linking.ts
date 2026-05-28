/**
 * Internal-linking mesh (Phase 6).
 *
 * Single source of truth for the cross-page link structures that turn the SEO
 * landings into a real internal mesh instead of orphan pages:
 *   - Footer "Areas We Serve" (every page, both brands)
 *   - Homepage SEO hub blocks (Popular Categories, Popular Cities, Popular Searches)
 *   - Category-page related landings (per category_slug)
 *
 * Everything is pure data — server components consume it and render links.
 * URLs always come from `landingPath()` so:
 *   - canonical URL form stays consistent with sitemap + page canonicals,
 *   - any future move to `/service/{service}/{city}` flips one function,
 *   - cross-brand isolation is preserved (URLs are relative paths; the
 *     page's brand context picks the domain).
 *
 * Guardrails are exposed via `refineLinks()` — dedupe by href + lower-cased
 * anchor text, drop empty entries, and (optionally) drop self-links. Every
 * builder in this file already runs its output through validation against
 * `CITY_SEO` / `SERVICES` so a typo in a hand-picked slug surfaces as a
 * dropped link, not a broken page.
 */

import {
  CITY_SEO_LIST,
  getCitySeo,
  type CitySeo,
} from "./cities";
import {
  SERVICES,
  getService,
  type Service,
  type ServiceSlug,
} from "./services";
import { landingPath } from "./seo-routes";

/** Canonical shape every link block emits. */
export type LinkRef = {
  href: string;
  label: string;
  service?: ServiceSlug;
  city?: string;
};

// --- Footer: Areas We Serve -----------------------------------------------

/**
 * Service groups for the footer mesh — picked so the four columns each pull a
 * distinct intent (general jumper, water, party catch-all, equipment).
 * Adding a service here is safe; `getFooterAreasServed` validates each entry
 * against `SERVICES` and silently drops unknowns.
 */
const FOOTER_SERVICE_SLUGS: readonly ServiceSlug[] = [
  "jumper-rentals",
  "water-slide-rentals",
  "party-rentals",
  "table-and-chair-rentals",
];

export type FooterAreaGroup = {
  service: Service;
  /** All cities (the spec's "10-city mesh"), pre-resolved + deduped. */
  links: LinkRef[];
};

export function getFooterAreasServed(): FooterAreaGroup[] {
  const cities = CITY_SEO_LIST;
  const groups: FooterAreaGroup[] = [];
  for (const slug of FOOTER_SERVICE_SLUGS) {
    const svc = getService(slug);
    if (!svc) continue;
    const raw: LinkRef[] = cities.map((c) => ({
      href: landingPath(svc.slug, c.slug),
      label: c.name,
      service: svc.slug,
      city: c.slug,
    }));
    const links = refineLinks(raw);
    if (links.length === 0) continue; // never render an empty service group
    groups.push({ service: svc, links });
  }
  return groups;
}

// --- Homepage: Popular Categories / Cities / Searches ---------------------

/**
 * "Popular Categories" — top-level service hubs. We don't have service-only
 * pages, so each service points to its landing in the home-base city (where
 * we have free delivery — the strongest conversion city for a generic visit).
 */
const HOMEPAGE_HOME_BASE_CITY = "moreno-valley";

export function getPopularCategoryLinks(): LinkRef[] {
  return refineLinks(
    SERVICES.filter((s) => s.intent !== "specialty").map((s) => ({
      href: landingPath(s.slug, HOMEPAGE_HOME_BASE_CITY),
      label: s.label,
      service: s.slug,
      city: HOMEPAGE_HOME_BASE_CITY,
    })),
  );
}

/** "Popular Cities" — every seeded city, linked via the party-rentals catch-all. */
export function getPopularCityLinks(): LinkRef[] {
  return refineLinks(
    CITY_SEO_LIST.map((c) => ({
      href: landingPath("party-rentals", c.slug),
      label: c.name,
      service: "party-rentals",
      city: c.slug,
    })),
  );
}

/**
 * "Popular Searches" — hand-picked high-intent combos that we know convert.
 * Each entry is validated at runtime; an unknown service or city slug is
 * silently dropped rather than rendered as a broken link.
 */
const POPULAR_SEARCH_COMBOS: ReadonlyArray<{
  service: ServiceSlug;
  city: string;
  phrase: string;
}> = [
  { service: "jumper-rentals",          city: "moreno-valley",  phrase: "Jumper rentals · Moreno Valley" },
  { service: "water-slide-rentals",     city: "perris",         phrase: "Water slide rentals · Perris" },
  { service: "bounce-house-rentals",    city: "riverside",      phrase: "Bounce house rentals · Riverside" },
  { service: "party-rentals",           city: "fontana",        phrase: "Party rentals · Fontana" },
  { service: "obstacle-course-rentals", city: "menifee",        phrase: "Obstacle course rentals · Menifee" },
  { service: "table-and-chair-rentals", city: "corona",         phrase: "Table & chair rentals · Corona" },
  { service: "jumper-rentals",          city: "perris",         phrase: "Jumper rentals · Perris" },
  { service: "water-slide-rentals",     city: "san-bernardino", phrase: "Water slide rentals · San Bernardino" },
  // Surfaces the dunk-tank intent directly from the homepage so those pages
  // aren't only reachable via reciprocal related-service links.
  { service: "dunk-tank-rentals",       city: "san-bernardino", phrase: "Dunk tank rentals · San Bernardino" },
];

export function getPopularSearchLinks(): LinkRef[] {
  const out: LinkRef[] = [];
  for (const p of POPULAR_SEARCH_COMBOS) {
    if (!getService(p.service) || !getCitySeo(p.city)) continue;
    out.push({
      href: landingPath(p.service, p.city),
      label: p.phrase,
      service: p.service,
      city: p.city,
    });
  }
  return refineLinks(out);
}

// --- Category pages: related city + service landings -----------------------

/**
 * Returns the services whose `productMatcher` overlaps a category slug — i.e.
 * the SEO landings that should be cross-linked from `/categories/{slug}`.
 * Used both for "related landings" and as a relevance filter.
 */
export function getCategoryRelatedServices(categorySlug: string): Service[] {
  const matches: Service[] = [];
  for (const s of SERVICES) {
    const m = s.productMatcher;
    if (m.mode === "categoryWhitelist" || m.mode === "categoryWhitelistOrUseType") {
      if (m.categorySlugs.includes(categorySlug)) matches.push(s);
    }
  }
  // `party-rentals` (mode: "all") always serves every category; surface it at
  // the end so primary/category-specific intents are listed first.
  const partyRentals = SERVICES.find((s) => s.slug === "party-rentals");
  if (partyRentals && !matches.includes(partyRentals)) matches.push(partyRentals);
  return matches;
}

/**
 * Category page link set: the most-relevant primary service paired with every
 * city. Skips when no service matches the category (no broken links).
 */
export function getCategoryRelatedLandings(
  categorySlug: string,
  cityLimit = 8,
): { service: Service; links: LinkRef[] } | null {
  const services = getCategoryRelatedServices(categorySlug);
  // Prefer "primary", then "synonym", then "category" — never "specialty"
  // (those have niche inventory and don't cross-link cleanly from a category).
  const primary =
    services.find((s) => s.intent === "primary") ??
    services.find((s) => s.intent === "synonym") ??
    services.find((s) => s.intent === "category");
  if (!primary) return null;

  const cities = CITY_SEO_LIST.slice(0, cityLimit);
  const raw: LinkRef[] = cities.map((c) => ({
    href: landingPath(primary.slug, c.slug),
    label: `${primary.label} in ${c.name}`,
    service: primary.slug,
    city: c.slug,
  }));
  const links = refineLinks(raw);
  if (links.length === 0) return null;
  return { service: primary, links };
}

// --- Guardrails ------------------------------------------------------------

/**
 * Dedupe link arrays and optionally drop the current page's own URL.
 *  - dedupe by `href`
 *  - dedupe by lower-cased `label` (avoids duplicate anchor text for SEO)
 *  - drop empty href/label entries
 *  - drop self-links when `currentPath` is provided
 */
export function refineLinks(links: LinkRef[], currentPath?: string): LinkRef[] {
  const seenHref = new Set<string>();
  const seenLabel = new Set<string>();
  const out: LinkRef[] = [];
  for (const l of links) {
    if (!l.href || !l.label) continue;
    if (currentPath && l.href === currentPath) continue;
    const labelKey = l.label.toLowerCase().replace(/\s+/g, " ").trim();
    if (seenHref.has(l.href) || seenLabel.has(labelKey)) continue;
    seenHref.add(l.href);
    seenLabel.add(labelKey);
    out.push(l);
  }
  return out;
}
