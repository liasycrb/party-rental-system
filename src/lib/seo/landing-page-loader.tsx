/**
 * Shared route loader for SEO city landings (Phase 4).
 *
 * Each `/{service}/[city]/page.tsx` route is a 5-line file that re-exports
 * `landingStaticParams`, `makeLandingMetadata(serviceSlug)`, and
 * `makeLandingPage(serviceSlug)`. All data-loading, brand resolution, product
 * filtering, composition, and rendering happen exactly once here — adding a
 * new service means a new folder + 5 lines, never duplicated rendering logic.
 *
 * Why `force-dynamic`:
 *   - Brand resolves from the `x-brand-slug` request header (proxy injects it
 *     per hostname), which already makes these routes dynamically rendered.
 *   - Inventory comes from a live Supabase RPC; force-dynamic guarantees
 *     no-store fetches so dashboard image / pricing edits appear on the next
 *     request — matching the behavior of `/build` and `/products`.
 *   - `generateStaticParams` still serves as the canonical city list (used by
 *     `sitemap.ts` in Phase 5) even though it doesn't trigger SSG with
 *     force-dynamic on.
 *
 * Unknown cities → `notFound()`. The service slug is fixed per route, so any
 * invalid (service, city) combo collapses to "404 city" cleanly.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRANDS } from "@/lib/brand/config";
import { getBrandSlug } from "@/lib/brand/get-brand";
import { getProducts } from "@/lib/catalog/get-products";
import { CityLandingTemplate } from "@/components/seo/city-landing-template";
import { staticCityParams, resolveLanding } from "@/lib/seo/seo-routes";
import {
  applyFeaturedProductOrder,
  composeLanding,
  composeLandingHead,
  filterServiceProducts,
} from "@/lib/seo/landing-content";
import type { ServiceSlug } from "@/lib/seo/services";

type RouteParams = { city: string };
type RouteSearch = { brand?: string | string[] };

/** Cities to expose for this route — used by Next + sitemap. */
export function landingStaticParams(): { city: string }[] {
  return staticCityParams();
}

/** Factory: returns the `generateMetadata` function for a given service. */
export function makeLandingMetadata(serviceSlug: ServiceSlug) {
  return async function generateMetadata({
    params,
    searchParams,
  }: {
    params: Promise<RouteParams>;
    searchParams: Promise<RouteSearch>;
  }): Promise<Metadata> {
    const { city: citySlug } = await params;
    const sp = await searchParams;
    const brandSlug = await getBrandSlug(sp.brand);
    const brand = BRANDS[brandSlug];

    const resolved = resolveLanding(serviceSlug, citySlug);
    // Defer 404 to the page itself; an empty metadata object is fine for now.
    if (!resolved) return {};

    const head = composeLandingHead({
      service: resolved.service,
      city: resolved.city,
      brand,
    });

    return {
      // `absolute: true` bypasses the parent `(site)/layout.tsx` title
      // template (`%s · ${brand.seo.siteName}`). Our service templates already
      // bake in the brand suffix (e.g. " | Lias Party Rentals") in the form we
      // want; without `absolute`, the parent template stacked a second brand
      // suffix on top → `… | Lias Party Rentals · Lias Party Rentals`.
      title: { absolute: head.title },
      description: head.description,
      alternates: {
        // Absolute brand-domain canonical — correct even when dev/preview
        // serves the page from a different host (e.g. localhost, vercel.app).
        canonical: head.canonicalUrl,
      },
      openGraph: {
        title: head.ogTitle,
        description: head.ogDescription,
        url: head.canonicalUrl,
        type: "website",
        siteName: brand.seo.siteName,
      },
      twitter: {
        card: "summary_large_image",
        title: head.ogTitle,
        description: head.ogDescription,
      },
      robots: { index: true, follow: true },
    };
  };
}

/** Factory: returns the page component for a given service. */
export function makeLandingPage(serviceSlug: ServiceSlug) {
  return async function LandingPage({
    params,
    searchParams,
  }: {
    params: Promise<RouteParams>;
    searchParams: Promise<RouteSearch>;
  }) {
    const { city: citySlug } = await params;
    const sp = await searchParams;
    const brandSlug = await getBrandSlug(sp.brand);
    const brand = BRANDS[brandSlug];

    const resolved = resolveLanding(serviceSlug, citySlug);
    if (!resolved) notFound();
    const { service, city } = resolved;

    // Live inventory (force-dynamic ensures no-store) → filter by the
    // service's own matcher so a water-slide page never lists tables, etc.
    // Then optionally float a city's featured products to the top — only
    // those that actually exist in the filtered set, so we never render a
    // broken product reference.
    const allProducts = await getProducts(brandSlug);
    const relevant = filterServiceProducts(allProducts, service.productMatcher);
    const products = applyFeaturedProductOrder(relevant, city.featuredProductSlugs);

    const model = composeLanding({ service, city, brand });

    return (
      <CityLandingTemplate model={model} brand={brand} products={products} />
    );
  };
}
