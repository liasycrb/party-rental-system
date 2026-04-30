/**
 * Individual rental-category tiles on /build — one per canonical category.
 * Images are shared with the public catalog (CATEGORY_CAROUSEL_ITEMS).
 *
 * `categorySlugs` includes the canonical slug plus any legacy DB values so
 * existing products still appear after a category rename.
 */
export type GuidedCategoryDef = {
  slug: string;
  label: string;
  image: string;
  /** readonly to satisfy `as const` — includes canonical + legacy aliases. */
  categorySlugs: readonly string[];
};

/**
 * Legacy DB slug → canonical category slug.
 * Reference only; the actual matching lives in `inventoryMatchesGuidedCategory`.
 */
export const LEGACY_CATEGORY_SLUG_MAP: Record<string, string> = {
  jumpers:          "regular-jumper-13x13",
  "bounce-houses":  "regular-jumper-13x13",
  bounce:           "regular-jumper-13x13",
  "mini-combo":     "minicombo",
  "slides-dry-wet": "waterslide",
  inflatables:      "inflatable-games",
  inflatable:       "inflatable-games",
  games:            "inflatable-games",
  concessions:      "inflatable-games",
  "party-extras":   "inflatable-games",
  "tables-chairs":  "throne-chairs",
  "canopies-tent":  "throne-chairs",
  tables:           "throne-chairs",
  chairs:           "throne-chairs",
  canopy:           "throne-chairs",
  tents:            "throne-chairs",
  seating:          "throne-chairs",
};

export const BUILD_GUIDED_CATEGORIES = [
  {
    slug: "regular-jumper-13x13",
    label: "Regular Jumper 13x13",
    image: "/party-rentals/categories/regular-jumper-13x13.png",
    categorySlugs: ["regular-jumper-13x13", "jumpers", "bounce-houses", "bounce"],
  },
  {
    slug: "five-in-one-jumpers",
    label: "5 en 1 Jumpers",
    image: "/party-rentals/categories/five-in-one-jumpers.png",
    categorySlugs: ["five-in-one-jumpers"],
  },
  {
    slug: "eleven-by-eleven-jumpers",
    label: "11x11 Jumpers",
    image: "/party-rentals/categories/eleven-by-eleven-jumpers.png",
    categorySlugs: ["eleven-by-eleven-jumpers"],
  },
  {
    slug: "waterslide",
    label: "Waterslide",
    image: "/party-rentals/categories/waterslide.png",
    categorySlugs: ["waterslide", "slides-dry-wet"],
  },
  {
    slug: "disney-jumpers",
    label: "Disney Jumpers",
    image: "/party-rentals/categories/disney-jumpers.png",
    categorySlugs: ["disney-jumpers"],
  },
  {
    slug: "xtreme-disco-dome",
    label: "XTreme Disco Dome",
    image: "/party-rentals/categories/xtreme-disco-dome.png",
    categorySlugs: ["xtreme-disco-dome"],
  },
  {
    slug: "throne-chairs",
    label: "Throne Chairs",
    image: "/party-rentals/categories/throne-chairs.png",
    categorySlugs: [
      "throne-chairs",
      "tables-chairs",
      "canopies-tent",
      "tables",
      "chairs",
      "canopy",
      "tents",
      "seating",
    ],
  },
  {
    slug: "inflatable-games",
    label: "Inflatable Games",
    image: "/party-rentals/categories/inflatable-games.png",
    categorySlugs: [
      "inflatable-games",
      "inflatables",
      "inflatable",
      "games",
      "concessions",
      "party-extras",
    ],
  },
  {
    slug: "obstacle-course",
    label: "Obstacle Course",
    image: "/party-rentals/categories/obstacle-course.png",
    categorySlugs: ["obstacle-course"],
  },
  {
    slug: "minicombo",
    label: "Minicombo",
    image: "/party-rentals/categories/minicombo.png",
    categorySlugs: ["minicombo", "mini-combo"],
  },
  {
    slug: "combos",
    label: "Combos",
    image: "/party-rentals/categories/combos.png",
    categorySlugs: ["combos"],
  },
  {
    slug: "*",
    label: "Browse all inventory",
    image: "/party-rentals/categories/regular-jumper-13x13.png",
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
