import { headers } from "next/headers";
import { BRANDS, DEFAULT_BRAND_SLUG, type BrandSlug, type Brand } from "./config";
import { resolveHomeBrandSlug } from "./resolve-brand";

/**
 * Reads brand from proxy-injected headers (hostname resolution happens in `src/proxy.ts`).
 */
export async function getBrand(): Promise<Brand> {
  const headerList = await headers();
  const slug = headerList.get("x-brand-slug") as BrandSlug | null;
  if (slug === "lias" || slug === "crb") {
    return BRANDS[slug];
  }
  return BRANDS[DEFAULT_BRAND_SLUG];
}

/**
 * Server-side brand slug resolution. Priority:
 *   1. `x-brand-slug` request header (set by the proxy when the request hits a known
 *      production hostname like `crbjumpers.com` or `liaspartyrentals.com`).
 *   2. `?brand=` query value (preserved as a fallback for dev/preview URLs).
 *   3. `NEXT_PUBLIC_DEFAULT_BRAND_SLUG` env, else `DEFAULT_BRAND_SLUG`.
 */
export async function getBrandSlug(
  brandQuery?: string | string[] | undefined,
): Promise<BrandSlug> {
  const headerList = await headers();
  const fromHeader = headerList.get("x-brand-slug");
  if (fromHeader === "lias" || fromHeader === "crb") return fromHeader;
  const raw =
    typeof brandQuery === "string"
      ? brandQuery
      : Array.isArray(brandQuery)
        ? brandQuery[0]
        : undefined;
  return resolveHomeBrandSlug(raw);
}
