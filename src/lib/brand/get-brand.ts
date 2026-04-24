import { headers } from "next/headers";
import { BRANDS, DEFAULT_BRAND_SLUG, type BrandSlug, type Brand } from "./config";

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
