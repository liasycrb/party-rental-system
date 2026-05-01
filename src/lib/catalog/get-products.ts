import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  category_slug: string | null;
  image_src: string | null;
  gallery_images: string[] | null;
  short_description: string | null;
  full_description?: string | null;
  required_space: string | null;
  dimensions: string | null;
  /** Preferred listing column when present (falls back to `price`). */
  price_from?: number | null;
  price: number | null;
  is_active: boolean;
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

  return visible.slice().sort((a, b) => {
    const cat = (a.category_slug ?? "").localeCompare(b.category_slug ?? "");
    if (cat !== 0) return cat;
    return a.name.localeCompare(b.name);
  });
}
