/**
 * Guided “What type of rental?” tiles on /build. Each tile matches inventory via `category_slug`.
 */
export type GuidedCategoryDef = {
  label: string;
  image: string;
  /** If set, item `category_slug` must equal one of these (case-insensitive). */
  categorySlugs: string[];
};

export const BUILD_GUIDED_CATEGORIES = [
  {
    label: "Bounce houses & inflatables",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
    categorySlugs: ["bounce-houses", "inflatables", "jumpers", "bounce", "inflatable"],
  },
  {
    label: "Tables, chairs & tents",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80",
    categorySlugs: ["tables-chairs", "tables", "chairs", "canopy", "tents", "seating"],
  },
  {
    label: "Concessions & games",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    categorySlugs: ["concessions", "games", "party-extras"],
  },
  {
    label: "Browse all inventory",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    categorySlugs: ["*"],
  },
] as const satisfies readonly GuidedCategoryDef[];

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

export function guidedCategoryLabelForSlug(slugKey: string | null): string {
  if (slugKey == null || slugKey === "") return "Other";
  const spaced = slugKey.replace(/-/g, " ");
  return spaced.replace(/\b\w/g, (c) => c.toUpperCase());
}
