import { createSupabaseServerClient } from "@/lib/supabase/server";

export type BuildInventoryOption = {
  id: string;
  name: string;
  category_slug: string | null;
  product_slug: string;
  quantity_active: number;
};

/** Active inventory rows for /build (requires `product_slug`). */
export async function getBuildInventoryOptions(
  brandSlug: string,
): Promise<BuildInventoryOption[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("inventory_items")
    .select("id, name, category_slug, product_slug, quantity_active")
    .eq("brand_slug", brandSlug)
    .eq("status", "active")
    .not("product_slug", "is", null)
    .order("category_slug", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) {
    console.error("[getBuildInventoryOptions]", error.message);
    return [];
  }

  const rows = (data ?? []) as Array<{
    id: string;
    name: string;
    category_slug: string | null;
    product_slug: string | null;
    quantity_active: number | null;
  }>;

  return rows
    .filter((r) => r.product_slug != null && String(r.product_slug).trim() !== "")
    .map((r) => ({
      id: r.id,
      name: r.name,
      category_slug: r.category_slug,
      product_slug: String(r.product_slug).trim(),
      quantity_active:
        typeof r.quantity_active === "number" ? r.quantity_active : 0,
    }));
}
