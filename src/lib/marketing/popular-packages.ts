export type PopularPackage = {
  id: string;
  title: string;
  tagline: string;
  includes: string[];
  fromPrice: number;
  badge?: string;
  /** Primary jumper to pre-select in build flow */
  primaryProductSlug: string;
};

export const POPULAR_PACKAGES: PopularPackage[] = [
  {
    id: "kids-party-combo",
    title: "Kids Party Combo",
    tagline: "The “everyone shows up smiling” setup",
    includes: [
      "Hero jumper + room for presents",
      "Stack tables & chairs in the builder",
      "Delivery & pro setup included",
    ],
    fromPrice: 249,
    badge: "Most booked",
    primaryProductSlug: "rainbow-castle-jumper",
  },
  {
    id: "backyard-party-setup",
    title: "Backyard Party Setup",
    tagline: "Shade, seating, bounce — the full scene",
    includes: [
      "Versatile jumper footprint",
      "Add canopy + seating for adults",
      "Kid-safe process we walk you through",
    ],
    fromPrice: 289,
    badge: "Weekend favorite",
    primaryProductSlug: "classic-module-jumper",
  },
  {
    id: "slide-tables-bundle",
    title: "Slide + Tables Bundle",
    tagline: "Big energy + a place to eat cake",
    includes: [
      "Combo slide unit for mixed ages",
      "Merch tables/chairs at checkout",
      "Moreno Valley area — we know the yards",
    ],
    fromPrice: 329,
    badge: "High wow factor",
    primaryProductSlug: "tropical-combo-slide",
  },
];

export function getPopularPackage(id: string): PopularPackage | undefined {
  return POPULAR_PACKAGES.find((p) => p.id === id);
}
