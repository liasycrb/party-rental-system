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

/**
 * Temporary priority overlay (stabilization). These canonical slugs surface
 * first in catalog/build/footer; everything else keeps its existing order.
 */
const CATEGORY_PRIORITY: Record<string, number> = {
  waterslide: 1,
  "obstacle-course": 2,
  "five-in-one-jumpers": 3,
};

function categoryPriority(slug: string): number {
  return CATEGORY_PRIORITY[slug] ?? Number.POSITIVE_INFINITY;
}

/**
 * Resolve a product's `category_slug` (which may use legacy values) to the
 * canonical priority bucket. Unprioritized categories sort to the bottom.
 */
export function categoryPriorityForProduct(
  categorySlug: string | null | undefined,
): number {
  if (categorySlug == null) return Number.POSITIVE_INFINITY;
  const raw = categorySlug.trim().toLowerCase();
  if (!raw) return Number.POSITIVE_INFINITY;
  const canonical = LEGACY_CATEGORY_SLUG_MAP[raw] ?? raw;
  return categoryPriority(canonical);
}

function sortOrderKey(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v)
    ? v
    : Number.POSITIVE_INFINITY;
}

export type CatalogSortable = {
  category_slug?: string | null;
  sort_order?: number | null;
  name?: string | null;
};

/**
 * Shared product comparator: priority category → category_slug grouping →
 * `sort_order` ASC (nulls last) → name ASC. Used by catalog and build flows.
 */
export function compareCatalogProduct<T extends CatalogSortable>(
  a: T,
  b: T,
): number {
  const pa = categoryPriorityForProduct(a.category_slug ?? null);
  const pb = categoryPriorityForProduct(b.category_slug ?? null);
  if (pa !== pb) return pa - pb;

  const cat = (a.category_slug ?? "").localeCompare(b.category_slug ?? "");
  if (cat !== 0) return cat;

  const sa = sortOrderKey(a.sort_order);
  const sb = sortOrderKey(b.sort_order);
  if (sa !== sb) return sa - sb;

  return (a.name ?? "").localeCompare(b.name ?? "");
}

/** Static catalog: same lineup for both brands (pre–Supabase `rental_categories`). */
export async function getRentalCategories(options?: {
  brandSlug?: BrandSlug;
  allBrands?: boolean;
}): Promise<RentalCategoryUIModel[]> {
  void options;
  return CATEGORY_CAROUSEL_ITEMS.map(carouselRowToUIModel).sort(
    (a, b) => categoryPriority(a.slug) - categoryPriority(b.slug),
  );
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
