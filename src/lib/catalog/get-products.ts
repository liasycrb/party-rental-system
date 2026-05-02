import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeProductImageSrc } from "@/lib/catalog/rental-products";

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  category_slug: string | null;
  image_src: string | null;
  /** Supabase `rental_products.image_path`. */
  image_path?: string | null;
  gallery_images: string[] | null;
  short_description: string | null;
  full_description?: string | null;
  required_space: string | null;
  dimensions: string | null;
  /** Preferred listing column when present (falls back to `price`). */
  price_from?: number | null;
  price: number | null;
  is_active: boolean;
  /** When true, also offered in /build add-ons (main catalog still includes the row when active). */
  is_upsell?: boolean | null;
  brand_slugs: string[];
  use_type?: string | null;
  allowed_surfaces?: string[] | null;
  quantity_available?: number | null;
  delivery_fee?: number | null;
  delivery_included?: boolean | null;
  item_rules?: string | null;
  /** Shown only when `customerSafeProductNote` accepts it. */
  notes?: string | null;
};

const FALLBACK_BRAND = "lias";

export async function getProducts(brandSlug?: string): Promise<CatalogProduct[]> {
  const supabase = await createSupabaseServerClient();
  const resolvedBrand =
    brandSlug?.trim() ||
    process.env.NEXT_PUBLIC_DEFAULT_BRAND_SLUG ||
    FALLBACK_BRAND;

  const { data, error } = await supabase.rpc(
    "get_active_rental_products_for_brand",
    { p_brand_slug: resolvedBrand },
  );

  if (error) {
    console.error("[getProducts]", error.message);
    return [];
  }

  const rows = (data ?? []) as CatalogProduct[];

  const visible = rows.filter((p) => p.is_active !== false);

  if (process.env.NODE_ENV === "development") {
    const products = visible;
    console.log("[products-debug]", {
      total: rows.length,
      active: products.filter((p) => p.is_active).length,
      upsells: products.filter((p) => p.is_active && p.is_upsell === true).length,
      missingImagePath: products
        .filter((p) => !p.image_path && !p.image_src)
        .map((p) => p.slug),
    });
    for (const p of products.filter((x) => !x.image_path && !x.image_src)) {
      const normalizedImageSrc = normalizeProductImageSrc({
        slug: p.slug,
        category_slug: p.category_slug,
        image_path: p.image_path,
        image_src: p.image_src,
      });
      console.log("[image-debug]", p.slug, normalizedImageSrc);
    }
  }

  return visible.slice().sort((a, b) => {
    const cat = (a.category_slug ?? "").localeCompare(b.category_slug ?? "");
    if (cat !== 0) return cat;
    return a.name.localeCompare(b.name);
  });
}
