import { headers } from "next/headers";
import { BRANDS, DEFAULT_BRAND_SLUG, type BrandSlug, type Brand } from "./config";

function defaultSlugFromEnv(): BrandSlug {
  const v = process.env.NEXT_PUBLIC_DEFAULT_BRAND_SLUG;
  if (v === "lias" || v === "crb") return v;
  return DEFAULT_BRAND_SLUG;
}

/**
 * Reads brand from middleware-injected headers (Edge-safe resolution happens in middleware).
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
 * Home page: `?brand=lias` | `?brand=crb` when valid; otherwise
 * `NEXT_PUBLIC_DEFAULT_BRAND_SLUG` when set to a valid slug, else `DEFAULT_BRAND_SLUG`.
 */
export function getBrandForHomePage(brandQuery: string | undefined): Brand {
  if (brandQuery === "lias" || brandQuery === "crb") {
    return BRANDS[brandQuery];
  }
  return BRANDS[defaultSlugFromEnv()];
}
