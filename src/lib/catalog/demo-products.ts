/**
 * Image specs (place files under /public; see `local-image-fallbacks.ts` for local → remote fallback):
 * - `HERO_BOUNCE_HOUSE`: home hero (MarketingHero) only — 4:5, min 1200×1500px.
 * - Product `imageSrc`: cards/PDP — 4:3 or 3:2, min 1200px wide. Separate paths from `EXPERIENCE_MOMENTS`.
 */
export type DemoProduct = {
  slug: string;
  title: string;
  category: string;
  sizeLabel: string;
  setupSpace: string;
  priceFrom: number;
  imageSrc: string;
  /** `object-position` for card/PDP images (e.g. center 40% to bias crop). */
  imagePosition?: string;
  imageAlt: string;
  blurb: string;
  surfaceRequirements: string;
  accessRequirements: string;
  setupNotes: string[];
};

/** Home marketing hero only (`MarketingHero`). Do not use for product cards or PDP — use `DEMO_PRODUCTS[0]`. */
export const HERO_BOUNCE_HOUSE = {
  imageSrc: "/party-rentals/shared/hero-bounce-house.jpg" as const,
  imageAlt:
    "Rainbow inflatable bounce house at a home party" as const,
} as const;

/** Curated placeholder inventory — shared across brands; replace with Supabase later. */
export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    slug: "rainbow-castle-jumper",
    title: "Rainbow Castle Jumper",
    category: "Classic jumpers",
    sizeLabel: '13\' × 13\' jumper',
    setupSpace: '18\' × 16\' level area (stakes or sandbags)',
    priceFrom: 185,
    imageSrc: "/party-rentals/shared/rainbow-castle.jpg",
    imagePosition: "center top",
    imageAlt:
      "Rainbow inflatable bounce house set up for a backyard children’s party",
    blurb:
      "Bright castle profile with tall turrets — a crowd favorite for birthdays and school events in Moreno Valley.",
    surfaceRequirements:
      "Grass preferred. Concrete is OK with sandbags (may apply). Dirt surfaces need photos in advance — we will confirm feasibility.",
    accessRequirements:
      "Path and gate must be at least 3.5 ft wide with a clear walking route. No low branches or tight turns.",
    setupNotes: [
      "Allow ~45 minutes for delivery and setup before guest arrival.",
      "One dedicated outlet within 50 ft (generator add-on available).",
      "Staked installs require permission to penetrate the lawn.",
    ],
  },
  /** Product image: 4:3 or 3:2, min 1200px wide. */
  {
    slug: "tropical-combo-slide",
    title: "Tropical Combo + Slide",
    category: "Combo units",
    sizeLabel: '16\' × 19\' footprint',
    setupSpace: '22\' × 24\' including slide run-out and blower zone',
    priceFrom: 265,
    imageSrc: "/party-rentals/shared/tropical-combo.jpg",
    imagePosition: "center center",
    imageAlt: "Festive outdoor event setup with tables and decorations",
    blurb:
      "Bounce plus slide for bigger energy — ideal when you expect a mix of ages and want more play options.",
    surfaceRequirements:
      "Level grass is best. Sloped yards may require alternate placement — we will advise after intake photos.",
    accessRequirements:
      "Minimum 3.5 ft gate width. Slide lane must remain clear of fences, pools, and sprinklers.",
    setupNotes: [
      "We map blower placement to keep cords tidy and away from walkways.",
      "Adult supervision required whenever the unit is inflated.",
    ],
  },
  /** Product image: 4:3 or 3:2, min 1200px wide. */
  {
    slug: "classic-module-jumper",
    title: "Classic Module Jumper",
    category: "Classic jumpers",
    sizeLabel: '15\' × 15\' jumper',
    setupSpace: '20\' × 18\' clear area',
    priceFrom: 195,
    imageSrc: "/party-rentals/shared/experience-moment-03.jpg",
    imagePosition: "center bottom",
    imageAlt: "Elegant outdoor wedding reception tent and lawn",
    blurb:
      "Versatile neutral panels — great for family reunions, school fairs, and corporate picnics.",
    surfaceRequirements:
      "Grass, concrete, or asphalt acceptable where anchoring is approved. Dirt requires pre-approval.",
    accessRequirements:
      "3.5 ft+ access with no stairs between unload zone and setup spot if possible.",
    setupNotes: [
      "Optional banners/art panels available as add-ons (seasonal availability).",
      "Wind policy may require reschedule — non-refundable deposit except qualifying weather per terms.",
    ],
  },
  /** Product image: 4:3 or 3:2, min 1200px wide. */
  {
    slug: "sports-arena-jumper",
    title: "Sports Arena Jumper",
    category: "Themed jumpers",
    sizeLabel: '14\' × 14\' jumper',
    setupSpace: '19\' × 17\' clear area',
    priceFrom: 205,
    imageSrc:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=900&h=675&fit=crop&q=80",
    imageAlt: "Friends celebrating outdoors with drinks and sunshine",
    blurb:
      "Sporty artwork that photographs well — popular for team parties and backyard tournaments.",
    surfaceRequirements:
      "Grass preferred. Alternate anchoring on hardscape — we confirm during intake.",
    accessRequirements:
      "3.5 ft gate minimum; please note any side-yard gates that are narrower.",
    setupNotes: [
      "Dogs must be secured away from the setup path and play area.",
      "If sprinklers auto-run, tell us the schedule to avoid surprises.",
    ],
  },
];

export function getDemoProductBySlug(slug: string): DemoProduct | undefined {
  return DEMO_PRODUCTS.find((p) => p.slug === slug);
}

/** Lifestyle / storytelling imagery — evokes people, yards, and celebration (replace with client photos). */
export const EXPERIENCE_MOMENTS = [
  {
    src: "/party-rentals/shared/experience-main.jpg",
    alt: "Kids laughing and playing together outdoors at a party",
    headline: "That moment the jumper starts to rise",
    sub: "Squeals, sprinting cousins, phones forgotten in pockets.",
  },
  {
    src: "/party-rentals/shared/experience-side-1.jpg",
    alt: "Friends celebrating outside with sunshine and drinks",
    headline: "Backyard energy you can feel through the fence",
    sub: "Tables, shade, music — the whole scene, not just the bounce.",
  },
  {
    src: "/party-rentals/shared/experience-side-2.jpg",
    alt: "Colorful balloons and festive party decorations",
    headline: "This is what “we went all out” looks like",
    sub: "Your guests won’t talk about the spreadsheet — they’ll talk about the day.",
  },
] as const;
