/**
 * SEO landing composition layer (Phase 2).
 *
 * Pure functions that merge `city × service × brand` into a `LandingPageModel`
 * that the Phase 3 server template will render. **No JSX, no fetch, no I/O** —
 * deterministic compose so the same inputs always produce the same page (good
 * for SSR + dynamic metadata + future caching).
 *
 * Duplicate-content rules enforced here:
 *   1. H1, title, description, hero subtitle, and CTA are pulled from the
 *      service's templates and rendered with city/brand tokens — each
 *      (service, city, brand) combo produces a unique string set.
 *   2. Intro merges the city's localized prose (`city.intro`) with the
 *      service's angle (`service.content.introAngle`). Cities differ from each
 *      other; services differ from each other. So even overlapping intents
 *      (jumper-rentals vs bounce-house-rentals) read distinctly.
 *   3. FAQs combine city + service. We dedupe by lowercased rendered question
 *      so the FAQPage schema never repeats.
 *   4. Inventory is filtered by the service's `productMatcher` — water-slide
 *      pages never list tables, table-and-chair pages never list inflatables.
 *
 * "Brand voice" is applied via the template tokens (`{brand}`, `{brandShort}`,
 * `{brandPhone}`) — city/service data stays brand-neutral so the SAME data
 * powers both brands without duplicate brand-baked copy.
 */

import type { Brand } from "@/lib/brand/config";
import type { CitySeo } from "./cities";
import { cityLabel, getNearbyCities } from "./cities";
import type {
  Service,
  ServiceFaq,
  ServiceProductMatcher,
} from "./services";
import { getRelatedServices } from "./services";
import {
  landingCanonicalUrl,
  landingPath,
  type LandingScope,
} from "./seo-routes";

// --- Public types ----------------------------------------------------------

/** Minimal Brand surface this layer reads — keeps the dependency narrow. */
export type BrandForLanding = Pick<
  Brand,
  "slug" | "displayName" | "shortName" | "siteUrl" | "supportPhoneDisplay" | "seo"
>;

/** Minimal CatalogProduct shape needed for service-aware filtering. */
export type LandingCandidateProduct = {
  slug: string;
  name: string;
  category_slug: string | null;
  use_type?: string | null;
};

/** Schema-builder hints — consumed by `schema.ts` (Phase 3). */
export type LandingSchemaInputs = {
  service: Service;
  city: CitySeo;
  brand: BrandForLanding;
  canonicalUrl: string;
  /** Page meta description — used as the Service schema's `description`. */
  description: string;
  faqs: ReadonlyArray<{ q: string; a: string }>;
  breadcrumb: ReadonlyArray<{ name: string; url: string }>;
};

export type LandingPageModel = {
  // --- Head ---
  title: string;
  description: string;
  canonicalUrl: string;
  /** Open Graph fields are derivable from these; included for completeness. */
  ogTitle: string;
  ogDescription: string;

  // --- Hero ---
  h1: string;
  heroSubtitle: string;
  /** Sentence pulled from the city + delivery model — anchors the hero locally. */
  heroLocalLine: string;
  ctaLabel: string;

  // --- Body sections ---
  /** 3–4 unique localized paragraphs (city intro + service angle). */
  introParagraphs: string[];
  whyUsParagraph: string;
  deliveryParagraph: string;
  safetyParagraph: string;
  inventoryHeading: string;
  /** Shown only when zero products match (service-specific honest fallback). */
  emptyInventoryFallback: string | null;

  // --- FAQ + linking ---
  faqs: { q: string; a: string }[];
  nearbyCities: CitySeo[];
  relatedServices: Service[];
  nearbyServiceLinks: { href: string; label: string }[];
  relatedServiceLinks: { href: string; label: string }[];

  // --- Breadcrumb + schema ---
  breadcrumb: { name: string; url: string }[];
  schemaInputs: LandingSchemaInputs;
};

export type ComposeLandingInput = {
  service: Service;
  city: CitySeo;
  brand: BrandForLanding;
  /** Optional — reserved for future seasonal/audience/venue overlays. */
  scope?: LandingScope;
};

// --- Template rendering ----------------------------------------------------

type TokenContext = {
  city: string; // "Moreno Valley"
  state: string; // "CA"
  county: string;
  brand: string; // "Lias Party Rentals"
  brandShort: string;
  brandPhone: string;
};

const TOKEN_RE = /\{(city|state|county|brand|brandShort|brandPhone)\}/g;

/** Token substitution. Unknown tokens are left untouched — no silent dropouts. */
function renderTemplate(template: string, ctx: TokenContext): string {
  return template.replace(TOKEN_RE, (_, key: keyof TokenContext) => ctx[key]);
}

function buildTokenContext(city: CitySeo, brand: BrandForLanding): TokenContext {
  return {
    city: city.name,
    state: city.stateAbbr,
    county: city.county,
    brand: brand.displayName,
    brandShort: brand.shortName,
    brandPhone: brand.supportPhoneDisplay,
  };
}

// --- Inventory filtering ---------------------------------------------------

/**
 * Returns products that belong on this service's page. Powers requirement #5
 * ("Do NOT show irrelevant inventory") — water-slide page never lists tables,
 * table-and-chair page never lists inflatables, etc.
 */
export function filterServiceProducts<T extends LandingCandidateProduct>(
  products: readonly T[],
  matcher: ServiceProductMatcher,
): T[] {
  switch (matcher.mode) {
    case "all":
      return products.slice();
    case "none":
      return [];
    case "categoryWhitelist": {
      const allow = new Set(matcher.categorySlugs);
      return products.filter((p) => p.category_slug != null && allow.has(p.category_slug));
    }
    case "categoryWhitelistOrUseType": {
      const allow = new Set(matcher.categorySlugs);
      const useTypes = new Set<string>(matcher.useTypes);
      return products.filter((p) => {
        const inCat = p.category_slug != null && allow.has(p.category_slug);
        const ut = typeof p.use_type === "string" ? p.use_type.toLowerCase() : null;
        const matchesUse = ut !== null && useTypes.has(ut);
        return inCat || matchesUse;
      });
    }
    case "nameContains": {
      const needles = matcher.needles.map((n) => n.toLowerCase());
      return products.filter((p) => {
        const n = p.name.toLowerCase();
        return needles.some((needle) => n.includes(needle));
      });
    }
  }
}

/**
 * Reorder products so a city's `featuredProductSlugs` come first — but ONLY
 * the slugs that actually exist in the filtered product list. Unknown slugs
 * are silently dropped so a typo never injects a broken product reference,
 * and the original `filterServiceProducts` relevance set is fully preserved.
 *
 * `featuredProductSlugs` is undefined for every seeded city today, so this is
 * effectively a no-op until a city opts in.
 */
export function applyFeaturedProductOrder<T extends { slug: string }>(
  products: readonly T[],
  featuredSlugs?: readonly string[],
): T[] {
  if (!featuredSlugs || featuredSlugs.length === 0) {
    return products.slice();
  }
  const featuredSet = new Set(featuredSlugs);
  const featured: T[] = [];
  const rest: T[] = [];
  for (const p of products) {
    if (featuredSet.has(p.slug)) featured.push(p);
    else rest.push(p);
  }
  // Preserve the explicit featured-slug order; drop slugs that didn't match.
  const ordered: T[] = [];
  for (const slug of featuredSlugs) {
    const match = featured.find((p) => p.slug === slug);
    if (match) ordered.push(match);
  }
  return [...ordered, ...rest];
}

// --- FAQ merge + dedup -----------------------------------------------------

function renderFaqs(
  faqs: readonly ServiceFaq[] | readonly { q: string; a: string }[],
  ctx: TokenContext,
): { q: string; a: string }[] {
  return faqs.map((f) => ({
    q: renderTemplate(f.q, ctx),
    a: renderTemplate(f.a, ctx),
  }));
}

function dedupeFaqs(faqs: { q: string; a: string }[]): { q: string; a: string }[] {
  const seen = new Set<string>();
  const out: { q: string; a: string }[] = [];
  for (const f of faqs) {
    const key = f.q.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }
  return out;
}

// --- Section helpers -------------------------------------------------------

function buildHeroLocalLine(city: CitySeo): string {
  const top = city.neighborhoods.slice(0, 2).join(" and ");
  if (city.delivery.includedFree) {
    return `Delivery and setup are included across ${city.name}${top ? ` — from ${top} on out` : ""}.`;
  }
  return `${city.delivery.note}${top ? ` Serving ${top} and the rest of ${city.name}.` : ""}`;
}

function buildDeliveryParagraph(city: CitySeo, brand: BrandForLanding): string {
  if (city.delivery.includedFree) {
    return `${city.name} is ${brand.shortName}'s home base, so delivery and setup are included at no extra charge across the city — from ${city.neighborhoods[0]} to ${city.neighborhoods[city.neighborhoods.length - 1]}. Our crew arrives during your window, anchors the unit safely, and returns for pickup.`;
  }
  return `${city.delivery.note} You'll see the exact delivery fee for your ${city.name} address before you confirm the booking — no surprises at drop-off.`;
}

function buildIntroParagraphs(
  service: Service,
  city: CitySeo,
  ctx: TokenContext,
): string[] {
  // Two city-specific paragraphs (already unique per city) + one service-angle
  // paragraph (unique per service) → combined uniqueness per (city × service).
  return [
    city.intro[0],
    renderTemplate(service.content.introAngle, ctx),
    city.intro[1],
  ];
}

// --- Main compose ----------------------------------------------------------

export function composeLanding(input: ComposeLandingInput): LandingPageModel {
  const { service, city, brand } = input;
  const ctx = buildTokenContext(city, brand);

  const title = renderTemplate(service.templates.title, ctx);
  const description = renderTemplate(service.templates.description, ctx);
  const h1 = renderTemplate(service.templates.h1, ctx);
  const heroSubtitle = renderTemplate(service.templates.heroSubtitle, ctx);
  const ctaLabel = renderTemplate(service.templates.ctaPrimary, ctx);
  const inventoryHeading = renderTemplate(service.content.inventoryHeading, ctx);

  const introParagraphs = buildIntroParagraphs(service, city, ctx);
  const whyUsParagraph = renderTemplate(service.content.whyUsAngle, ctx);
  const safetyParagraph = renderTemplate(service.content.safetyAngle, ctx);
  const deliveryParagraph = buildDeliveryParagraph(city, brand);
  const heroLocalLine = buildHeroLocalLine(city);

  const emptyInventoryFallback = service.content.emptyInventoryFallback
    ? renderTemplate(service.content.emptyInventoryFallback, ctx)
    : null;

  // FAQs: service-level (general intent FAQs) + city-level (geo FAQs) → dedup.
  const faqs = dedupeFaqs([
    ...renderFaqs(service.faqs, ctx),
    ...renderFaqs(city.faqs, ctx),
  ]);

  const nearbyCities = getNearbyCities(city.slug);
  const relatedServices = getRelatedServices(service.slug);

  const nearbyServiceLinks = nearbyCities.map((c) => ({
    href: landingPath(service.slug, c.slug),
    label: c.name,
  }));
  const relatedServiceLinks = relatedServices.map((s) => ({
    href: landingPath(s.slug, city.slug),
    label: s.label,
  }));

  const canonicalUrl = landingCanonicalUrl(brand.siteUrl, service.slug, city.slug);

  // Breadcrumb (used by BreadcrumbList JSON-LD + visual breadcrumb).
  // Three distinct URLs by design: brand home → catalog hub → current page.
  // (An earlier draft pointed levels 2 and 3 at the same URL, which produces
  // an invalid BreadcrumbList — Google expects distinct `item` values.)
  const baseUrl = brand.siteUrl.replace(/\/+$/, "");
  const breadcrumb: { name: string; url: string }[] = [
    { name: brand.shortName, url: `${baseUrl}/` },
    { name: "Rentals", url: `${baseUrl}/products` },
    {
      name: `${service.label} in ${cityLabel(city)}`,
      url: canonicalUrl,
    },
  ];

  return {
    title,
    description,
    canonicalUrl,
    ogTitle: title,
    ogDescription: description,
    h1,
    heroSubtitle,
    heroLocalLine,
    ctaLabel,
    introParagraphs,
    whyUsParagraph,
    deliveryParagraph,
    safetyParagraph,
    inventoryHeading,
    emptyInventoryFallback,
    faqs,
    nearbyCities,
    relatedServices,
    nearbyServiceLinks,
    relatedServiceLinks,
    breadcrumb,
    schemaInputs: {
      service,
      city,
      brand,
      canonicalUrl,
      description,
      faqs,
      breadcrumb,
    },
  };
}

// --- Convenience: head-only compose (for fast generateMetadata) ------------

/**
 * Lightweight subset for `generateMetadata` — avoids running full compose just
 * to read the head. Returned values are identical to `composeLanding`'s head
 * fields (title/description/canonical).
 */
export function composeLandingHead(input: ComposeLandingInput): {
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
} {
  const ctx = buildTokenContext(input.city, input.brand);
  const title = renderTemplate(input.service.templates.title, ctx);
  const description = renderTemplate(input.service.templates.description, ctx);
  const canonicalUrl = landingCanonicalUrl(
    input.brand.siteUrl,
    input.service.slug,
    input.city.slug,
  );
  return {
    title,
    description,
    canonicalUrl,
    ogTitle: title,
    ogDescription: description,
  };
}
