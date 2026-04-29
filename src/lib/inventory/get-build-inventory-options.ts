import { createSupabaseServerClient } from "@/lib/supabase/server";

export type BuildInventoryOption = {
  id: string;
  name: string;
  category_slug: string | null;
  product_slug: string;
  quantity_active: number;
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
  }>;

  return rows
    .filter((r) => r.slug != null && String(r.slug).trim() !== "")
    .map((r) => ({
      id: r.id,
      name: r.name,
      category_slug: r.category_slug,
      product_slug: String(r.slug).trim(),
      quantity_active:
        typeof r.quantity_available === "number" ? r.quantity_available : 0,
    }));
}
