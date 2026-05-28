/**
 * Canonical `rental_products.category_slug` values used by the SEO layer.
 *
 * Audited against the live catalog (2026-05-27) — these are the *active*
 * category slugs. Keep this file the single source of truth for
 * service→category mapping so a renamed or added category surfaces as a single
 * compile error here instead of silently breaking landing pages.
 */
export const CATEGORY_SLUGS = {
  waterslide: "waterslide",
  disneyJumpers: "disney-jumpers",
  regularJumper: "regular-jumper-13x13",
  obstacleCourse: "obstacle-course",
  tablesAndChairs: "tables-and-chairs",
  canopies: "canopies",
  inflatableGames: "inflatable-games",
  fiveInOneJumpers: "five-in-one-jumpers",
  combos: "combos",
  miniCombo: "minicombo",
  throneChairs: "throne-chairs",
  elevenByElevenJumpers: "eleven-by-eleven-jumpers",
  xtremeDiscoDome: "xtreme-disco-dome",
} as const;

export type KnownCategorySlug =
  (typeof CATEGORY_SLUGS)[keyof typeof CATEGORY_SLUGS];
