import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Canonical public URL for `public/products/{category_slug}/{slug}/main.jpg`. */
export function canonicalRentalProductMainImage(
  categorySlug: string | null | undefined,
  productSlug: string | null | undefined,
): string | null {
  const c = typeof categorySlug === "string" ? categorySlug.trim() : "";
  const s = typeof productSlug === "string" ? productSlug.trim() : "";
  if (!c || !s) return null;
  return `/products/${c}/${s}/main.jpg`;
}

export type BuildInventoryOption = {
  id: string;
  name: string;
  category_slug: string | null;
  product_slug: string;
  quantity_active: number;
  image_src: string | null;
  price: number | null;
};

/** Active inventory rows for /build — sourced from rental_products. */
export async function getBuildInventoryOptions(
  brandSlug: string,
): Promise<BuildInventoryOption[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .rpc("get_active_rental_products_for_brand", { p_brand_slug: brandSlug });

  if (error) {
    console.error("[getBuildInventoryOptions]", error.message);
    return [];
  }

  const rows = (data ?? []) as Array<{
    id: string;
    name: string;
    category_slug: string | null;
    slug: string | null;
    quantity_available: number | null;
    image_src: string | null;
    price: number | null;
  }>;

  return rows
    .filter((r) => r.slug != null && String(r.slug).trim() !== "")
    .map((r) => {
      const productSlug = String(r.slug).trim();
      const canonicalImageSrc = canonicalRentalProductMainImage(
        r.category_slug,
        productSlug,
      );
      const legacy =
        typeof r.image_src === "string" && r.image_src.trim() !== ""
          ? r.image_src.trim()
          : null;

      return {
        id: r.id,
        name: r.name,
        category_slug: r.category_slug,
        product_slug: productSlug,
        quantity_active:
          typeof r.quantity_available === "number" ? r.quantity_available : 0,
        image_src: canonicalImageSrc ?? legacy,
        price: typeof r.price === "number" ? r.price : null,
      };
    });
}
