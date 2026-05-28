/**
 * JSON-LD schema builders (Phase 3).
 *
 * Pure functions — given the `LandingSchemaInputs` carried by every
 * `LandingPageModel`, produce schema.org objects ready to be serialized into
 * `<script type="application/ld+json">` tags.
 *
 * Why each schema:
 *   - **LocalBusiness** — anchors the brand entity (NAP, areaServed). Linked
 *     by `@id` from the per-page Service schema below so Google can connect
 *     this page's service to the same business across the site.
 *   - **Service** — declares "this page is about `{service}` offered to `{city}`".
 *     Rich-result eligible.
 *   - **FAQPage** — surfaces the page's FAQs in search.
 *   - **BreadcrumbList** — signals page hierarchy and powers the breadcrumb
 *     rich result.
 *
 * All builders are pure / synchronous / side-effect free. The template renders
 * each returned object into its own `<script>` tag, escaping `<` to avoid
 * `</script>` breakouts via `safeJsonLdString`.
 */

import type { CitySeo } from "./cities";
import type { Service } from "./services";
import type {
  BrandForLanding,
  LandingSchemaInputs,
} from "./landing-content";

export type JsonLdObject = Record<string, unknown>;

/** All builders link the Service to this stable LocalBusiness `@id`. */
function localBusinessId(brand: BrandForLanding): string {
  return `${brand.siteUrl.replace(/\/+$/, "")}/#business`;
}

function cityAddress(city: CitySeo): JsonLdObject {
  return {
    "@type": "PostalAddress",
    addressLocality: city.name,
    addressRegion: city.stateAbbr,
    addressCountry: "US",
  };
}

export function buildLocalBusinessSchema(
  brand: BrandForLanding,
  city: CitySeo,
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": localBusinessId(brand),
    name: brand.displayName,
    url: brand.siteUrl,
    telephone: brand.supportPhoneDisplay,
    description: brand.seo.defaultDescription,
    priceRange: "$$",
    areaServed: {
      "@type": "City",
      name: city.name,
      address: cityAddress(city),
    },
  };
}

export function buildServiceSchema(input: {
  service: Service;
  city: CitySeo;
  brand: BrandForLanding;
  canonicalUrl: string;
  description: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: input.service.schemaServiceType,
    name: `${input.service.label} in ${input.city.name}, ${input.city.stateAbbr}`,
    description: input.description,
    provider: { "@id": localBusinessId(input.brand) },
    areaServed: {
      "@type": "City",
      name: input.city.name,
      address: cityAddress(input.city),
    },
    url: input.canonicalUrl,
  };
}

export function buildFaqSchema(
  faqs: ReadonlyArray<{ q: string; a: string }>,
): JsonLdObject | null {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function buildBreadcrumbSchema(
  items: ReadonlyArray<{ name: string; url: string }>,
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * One-call builder: returns every JSON-LD object the landing template should
 * emit, in the order they should appear. Excludes FAQPage when there are no
 * FAQs so we never serialize an empty `mainEntity`.
 */
export function buildLandingJsonLd(
  inputs: LandingSchemaInputs,
): JsonLdObject[] {
  const out: JsonLdObject[] = [
    buildLocalBusinessSchema(inputs.brand, inputs.city),
    buildServiceSchema({
      service: inputs.service,
      city: inputs.city,
      brand: inputs.brand,
      canonicalUrl: inputs.canonicalUrl,
      description: inputs.description,
    }),
    buildBreadcrumbSchema(inputs.breadcrumb),
  ];
  const faq = buildFaqSchema(inputs.faqs);
  if (faq) out.push(faq);
  return out;
}

/**
 * Serialize a JSON-LD object for inline `<script>` embedding. Escapes `<` so a
 * `</script>` substring in user content (e.g. an FAQ answer) cannot break out
 * of the script tag.
 */
export function safeJsonLdString(obj: JsonLdObject): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}
