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

  const fromSrc = normalizeRawImageSrc(product.image_src);

  // Dashboard-managed uploads land in `image_src` as an absolute URL (e.g. a
  // Supabase Storage public URL). That is the source of truth, so an absolute
  // `image_src` ALWAYS wins over `image_path` — which can still hold a stale
  // local fallback path written before the upload (the cause of saved images
  // not appearing on public cards).
  if (fromSrc && /^https?:\/\//i.test(fromSrc)) return fromSrc;

  // Legacy precedence is preserved for non-absolute values: for older catalog
  // rows `image_path` is the canonical local path and some rows carry a
  // stale/wrong *local* `image_src`, so `image_path` still wins over a local
  // `image_src` to avoid regressing those existing local images.
  const fromPath = normalizeRawImageSrc(product.image_path);
  if (fromPath) return fromPath;

  // Local `image_src` only when there is no `image_path`.
  if (fromSrc) return fromSrc;

  if (!slug) return null;
  return canonicalRentalProductMainImage(product.category_slug, slug);
}
