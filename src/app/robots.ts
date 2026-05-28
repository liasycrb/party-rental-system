/**
 * Per-brand-domain robots.txt (Phase 5).
 *
 * Mirrors `sitemap.ts`: brand resolves from the request `Host` so each domain
 * advertises its own sitemap. Public SEO routes are allowed, only the
 * dashboard is disallowed (it's also Basic-Auth-protected at the proxy, but
 * a `Disallow` keeps crawlers from wasting requests on it).
 *
 * The proxy matcher excludes `/robots.txt`, so this route is reachable
 * without authentication and `x-brand-slug` is not injected — we read `Host`
 * directly, same pattern as `sitemap.ts`.
 */

import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { resolveBrandFromHost } from "@/lib/brand/resolve-brand";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const hostHeader = (await headers()).get("host");
  const brand = resolveBrandFromHost(hostHeader);
  const base = brand.siteUrl.replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        // Everything else (core pages + 80 SEO landings + categories +
        // product details) is allowed by default.
        allow: "/",
        // `/dashboard` covers `/dashboard` and every nested admin route.
        disallow: ["/dashboard"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
