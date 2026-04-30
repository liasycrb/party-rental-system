import type { BrandSlug } from "@/lib/brand/config";
import {
  CATEGORY_CAROUSEL_ITEMS,
  categoryBuildHref,
  type CategoryCarouselItem,
} from "@/lib/catalog/category-carousel";
import {
  LEGACY_CATEGORY_SLUG_MAP,
  type GuidedCategoryDef,
} from "@/lib/build/build-guided-categories";

/**
 * Local catalog-driven category models (booking / PDP / marketing).
 * Mirrors `GuidedCategoryDef` plus marketing fields — no DB fetch.
 */
export type RentalCategoryUIModel = GuidedCategoryDef & {
  description: string;
  isPopular: boolean;
};

/** Minimal serializable shape for client carousels + category showcase (from server). */
export type SiteCategoryCarouselItem = {
  slug: string;
  title: string;
  description: string;
  imageSrc: string;
  href: string;
  isPopular: boolean;
};

/** Canonical carousel slug plus legacy DB `rental_products.category_slug` aliases. */
function categorySlugsForCanonical(canonicalSlug: string): readonly string[] {
  const aliases = Object.entries(LEGACY_CATEGORY_SLUG_MAP)
    .filter(([, canonical]) => canonical === canonicalSlug)
    .map(([legacy]) => legacy);
  return [canonicalSlug, ...aliases];
}

function carouselRowToUIModel(row: CategoryCarouselItem): RentalCategoryUIModel {
  const slugs = categorySlugsForCanonical(row.slug);
  return {
    slug: row.slug,
    label: row.title,
    image: row.imageSrc,
    categorySlugs: slugs.length ? slugs : [row.slug],
    description: row.description,
    isPopular: Boolean(row.isPopular),
  };
}

/** Static catalog: same lineup for both brands (pre–Supabase `rental_categories`). */
export async function getRentalCategories(options?: {
  brandSlug?: BrandSlug;
  allBrands?: boolean;
}): Promise<RentalCategoryUIModel[]> {
  void options;
  return CATEGORY_CAROUSEL_ITEMS.map(carouselRowToUIModel);
}

/** Map UI model → client carousel / showcase item (`href` → `/build?category=`). */
export function rentalCategoryToCarouselItem(
  ui: RentalCategoryUIModel,
): SiteCategoryCarouselItem {
  return {
    slug: ui.slug,
    title: ui.label,
    description: ui.description,
    imageSrc: ui.image,
    href: categoryBuildHref(ui.slug),
    isPopular: ui.isPopular,
  };
}

/** Resolve `category` URL param / deep-link slug to a catalog category (+ legacy aliases). */
export function resolveRentalCategoryForLookup(
  slug: string | null | undefined,
  list: RentalCategoryUIModel[],
): RentalCategoryUIModel | undefined {
  if (slug == null || slug.trim() === "" || slug === "*") return undefined;
  const lower = slug.trim().toLowerCase();
  return list.find(
    (c) =>
      c.slug.toLowerCase() === lower ||
      c.categorySlugs.some((s) => s !== "*" && s.toLowerCase() === lower),
  );
}
