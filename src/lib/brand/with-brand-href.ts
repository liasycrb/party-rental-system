import type { BrandSlug } from "./config";

/**
 * Appends or updates `?brand=` on same-origin paths so navigation preserves the active brand.
 * Skips `http(s)://`, `tel:`, `mailto:`, and hash-only anchors (`#…`).
 */
export function withBrand(href: string, brand: BrandSlug): string {
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("tel:") ||
    href.startsWith("mailto:")
  ) {
    return href;
  }
  if (href.startsWith("#") || href === "" || !href.startsWith("/")) {
    return href;
  }
  const hashIndex = href.indexOf("#");
  const pathWithQuery = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : href.slice(hashIndex);
  const q = pathWithQuery.indexOf("?");
  const path = q === -1 ? pathWithQuery : pathWithQuery.slice(0, q);
  const search = q === -1 ? "" : pathWithQuery.slice(q + 1);
  const params = new URLSearchParams(search);
  params.set("brand", brand);
  return `${path}?${params.toString()}${hash}`;
}
