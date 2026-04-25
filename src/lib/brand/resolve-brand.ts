import {
  BRANDS,
  DEFAULT_BRAND_SLUG,
  type BrandSlug,
  type Brand,
} from "./config";

function normalizeHost(host: string): string {
  return host.split(":")[0]?.toLowerCase() ?? "";
}

function slugFromEnv(value: string | undefined): BrandSlug | null {
  if (value === "lias" || value === "crb") return value;
  return null;
}

/**
 * Maps the incoming Host header to a brand. Localhost uses NEXT_PUBLIC_DEFAULT_BRAND_SLUG
 * when set; otherwise DEFAULT_BRAND_SLUG.
 */
export function resolveBrandFromHost(hostHeader: string | null): Brand {
  const host = normalizeHost(hostHeader ?? "");

  if (host === "localhost" || host === "127.0.0.1") {
    const devSlug =
      slugFromEnv(process.env.NEXT_PUBLIC_DEFAULT_BRAND_SLUG) ??
      DEFAULT_BRAND_SLUG;
    return BRANDS[devSlug];
  }

  for (const brand of Object.values(BRANDS)) {
    for (const hostname of brand.hostnames) {
      if (hostname === host) {
        return brand;
      }
    }
  }

  return BRANDS[DEFAULT_BRAND_SLUG];
}

/**
 * Home `?brand=` (lias | crb), else `NEXT_PUBLIC_DEFAULT_BRAND_SLUG` or `DEFAULT_BRAND_SLUG`.
 * Safe to import from client components.
 */
export function resolveHomeBrandSlug(brandQuery: string | null | undefined): BrandSlug {
  if (brandQuery === "lias" || brandQuery === "crb") {
    return brandQuery;
  }
  return (
    slugFromEnv(process.env.NEXT_PUBLIC_DEFAULT_BRAND_SLUG) ?? DEFAULT_BRAND_SLUG
  );
}

/**
 * `?brand=` on server `page.tsx` searchParams: field may be `string | string[] | undefined`.
 * Validates `lias` | `crb`, else `NEXT_PUBLIC_DEFAULT_BRAND_SLUG` or default.
 */
export function resolveBrandSlugFromPageSearchParam(
  brand: string | string[] | undefined,
): BrandSlug {
  const raw = typeof brand === "string" ? brand : Array.isArray(brand) ? brand[0] : undefined;
  return resolveHomeBrandSlug(raw);
}
