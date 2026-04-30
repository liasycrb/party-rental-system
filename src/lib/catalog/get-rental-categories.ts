import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CATEGORY_CAROUSEL_ITEMS } from "./category-carousel";
import {
  LEGACY_CATEGORY_SLUG_MAP,
  type GuidedCategoryDef,
} from "@/lib/build/build-guided-categories";

type RentalCategoryRow = {
  slug: string;
  name: string;
  description: string | null;
  image_src: string | null;
  sort_order: number;
};

function rowToGuidedDef(row: RentalCategoryRow): GuidedCategoryDef {
  const legacySlugs = Object.entries(LEGACY_CATEGORY_SLUG_MAP)
    .filter(([, canonical]) => canonical === row.slug)
    .map(([legacy]) => legacy);
  return {
    slug: row.slug,
    label: row.name,
    image: row.image_src ?? `/party-rentals/categories/${row.slug}.png`,
    categorySlugs: [row.slug, ...legacySlugs],
  };
}

/**
 * Hardcoded fallback — mirrors CATEGORY_CAROUSEL_ITEMS with legacy slug aliases.
 * Used when the Supabase `rental_categories` table is unreachable or empty.
 */
export const HARDCODED_CATEGORIES: GuidedCategoryDef[] = CATEGORY_CAROUSEL_ITEMS.map(
  (item) => {
    const legacySlugs = Object.entries(LEGACY_CATEGORY_SLUG_MAP)
      .filter(([, canonical]) => canonical === item.slug)
      .map(([legacy]) => legacy);
    return {
      slug: item.slug,
      label: item.title,
      image: item.imageSrc,
      categorySlugs: [item.slug, ...legacySlugs],
    };
  },
);

/**
 * Fetch active categories ordered by sort_order.
 * Falls back to HARDCODED_CATEGORIES if the table doesn't exist or RLS blocks access.
 */
export async function getRentalCategories(): Promise<GuidedCategoryDef[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("rental_categories")
      .select("slug, name, description, image_src, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return HARDCODED_CATEGORIES;
    }

    return (data as RentalCategoryRow[]).map(rowToGuidedDef);
  } catch {
    return HARDCODED_CATEGORIES;
  }
}
