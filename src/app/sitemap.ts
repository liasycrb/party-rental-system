/**
 * Per-brand-domain sitemap (Phase 5).
 *
 * One `sitemap.ts` serves BOTH brands by resolving the active brand from the
 * request `Host` header and emitting only that brand's absolute production
 * URLs. Search engines fetch `https://www.liaspartyrentals.com/sitemap.xml`
 * and `https://www.crbjumpers.com/sitemap.xml` independently — each returns
 * its own URL set. We never cross-emit one brand's URLs on the other's domain.
 *
 * Sources (all already brand-aware):
 *   - core pages: `/`, `/build`, `/products`, `/package-inquiry`
 *   - SEO landings: `allSeoLandingParams()` × `landingPath()` = 80 per brand
 *   - categories: `getRentalCategories({ brandSlug })` (brand-visible only)
 *   - product details: `getProducts(brandSlug)` (active rows for this brand)
 *
 * `force-dynamic` so:
 *   1. `headers()` is available (per-request brand resolution).
 *   2. New cities/services/products appear in the sitemap on the next fetch
 *      without a redeploy.
 *
 * The proxy matcher already excludes `/sitemap.xml` and `/robots.txt`, so
 * dashboard Basic Auth doesn't gate them and `x-brand-slug` isn't injected —
 * we read `Host` directly here, which works on any deploy environment.
 */

import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { resolveBrandFromHost } from "@/lib/brand/resolve-brand";
import { getProducts } from "@/lib/catalog/get-products";
import { getRentalCategories } from "@/lib/catalog/get-rental-categories";
import {
  allSeoLandingParams,
  landingPath,
} from "@/lib/seo/seo-routes";

export const dynamic = "force-dynamic";

type SitemapEntry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hostHeader = (await headers()).get("host");
  const brand = resolveBrandFromHost(hostHeader);
  const base = brand.siteUrl.replace(/\/+$/, "");
  const now = new Date();

  // 1. Core marketing/booking pages
  const core: SitemapEntry[] = [
    { url: `${base}/`,                lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/build`,           lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/products`,        lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/package-inquiry`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // 2. SEO landings — every (service × city) combo on this brand's domain.
  const landings: SitemapEntry[] = allSeoLandingParams().map(({ service, city }) => ({
    url: `${base}${landingPath(service, city)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 3. Brand-visible category pages. Wrap in try/catch so a transient Supabase
  //    blip never empties the sitemap entirely — we'd rather index the static
  //    routes than 500 the sitemap.
  let categoryEntries: SitemapEntry[] = [];
  try {
    const cats = await getRentalCategories({ brandSlug: brand.slug });
    categoryEntries = cats.map((c) => ({
      url: `${base}/categories/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (err) {
    console.error("[sitemap] category fetch failed:", (err as Error).message);
  }

  // 4. Brand-visible product detail pages (active only — `getProducts` already
  //    filters `is_active`).
  let productEntries: SitemapEntry[] = [];
  try {
    const products = await getProducts(brand.slug);
    productEntries = products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch (err) {
    console.error("[sitemap] product fetch failed:", (err as Error).message);
  }

  // 5. Dedupe by URL (defensive — namespaces are already disjoint, but a
  //    future change that adds e.g. a featured-category landing under
  //    `/categories/{slug}` should not silently duplicate entries).
  const all = [...core, ...landings, ...categoryEntries, ...productEntries];
  const seen = new Set<string>();
  const out: SitemapEntry[] = [];
  for (const e of all) {
    if (seen.has(e.url)) continue;
    seen.add(e.url);
    out.push(e);
  }
  return out;
}
