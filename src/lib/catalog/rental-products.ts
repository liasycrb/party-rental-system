import { canonicalRentalProductMainImage } from "@/lib/inventory/canonical-product-image";

/** Minimal product shape needed to resolve `<img>` / catalog `src` from `rental_products`. */
export type NormalizeProductImageInput = {
  slug: string | null | undefined;
  category_slug?: string | null | undefined;
  image_path?: string | null | undefined;
  image_src?: string | null | undefined;
};

/**
 * Normalizes a single DB/external path for the browser — never emits `/public/...`.
 */
export function normalizeRawImageSrc(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  let t = raw.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;

  while (true) {
    if (t.startsWith("/public/")) {
      t = t.slice("/public/".length);
      t = t.startsWith("/") ? t : `/${t}`;
      continue;
    }
    if (t.startsWith("public/")) {
      t = `/${t.slice("public/".length)}`;
      continue;
    }
    break;
  }

  if (t.startsWith("products/")) t = `/${t}`;

  if (!/^https?:\/\//i.test(t) && t.startsWith("//")) return `https:${t}`;

  return t.startsWith("/") ? t : `/${t}`;
}

/** Priority: image_path → image_src → /products/{category}/{slug}/main.jpg */
export function normalizeProductImageSrc(
  product: NormalizeProductImageInput,
): string | null {
  const slug =
    typeof product.slug === "string" && product.slug.trim() !== ""
      ? product.slug.trim()
      : "";

  const fromPath = normalizeRawImageSrc(product.image_path);
  if (fromPath) return fromPath;

  const fromLegacy = normalizeRawImageSrc(product.image_src);
  if (fromLegacy) return fromLegacy;

  if (!slug) return null;
  return canonicalRentalProductMainImage(product.category_slug, slug);
}
