/**
 * Legacy DB `rental_products.category_slug` → canonical marketing category slug.
 * Used when mapping inventory to carousel / PDP categories.
 */
export type GuidedCategoryDef = {
  slug: string;
  label: string;
  image: string;
  /** canonical slug + legacy DB values so products still match after renames */
  categorySlugs: readonly string[];
};

export const LEGACY_CATEGORY_SLUG_MAP: Record<string, string> = {
  jumpers: "regular-jumper-13x13",
  "bounce-houses": "regular-jumper-13x13",
  bounce: "regular-jumper-13x13",
  "mini-combo": "minicombo",
  "slides-dry-wet": "waterslide",
  inflatables: "inflatable-games",
  inflatable: "inflatable-games",
  games: "inflatable-games",
  concessions: "inflatable-games",
  "party-extras": "inflatable-games",
  "tables-chairs": "tables-and-chairs",
  tables: "tables-and-chairs",
  chairs: "tables-and-chairs",
  seating: "tables-and-chairs",
  "canopies-tent": "canopies",
  canopy: "canopies",
  tents: "canopies",
};

export function inventoryMatchesGuidedCategory(
  categorySlug: string | null,
  def: GuidedCategoryDef,
): boolean {
  if (def.categorySlugs.includes("*")) return true;
  if (def.categorySlugs.length === 0) return false;
  const raw = (categorySlug ?? "").trim().toLowerCase();
  if (!raw) return false;
  return def.categorySlugs.some((s) => s.toLowerCase() === raw);
}

/** Human-readable label derived from a product `category_slug` when needed in UI chips. */
export function formatCategorySlugLabel(slugKey: string | null): string {
  if (slugKey == null || slugKey === "") return "Other";
  if (slugKey.toLowerCase() === "disney-jumpers") return "Character Jumpers";
  const spaced = slugKey.replace(/-/g, " ");
  return spaced.replace(/\b\w/g, (c) => c.toUpperCase());
}
