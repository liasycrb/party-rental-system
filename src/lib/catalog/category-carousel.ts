/**
 * Static category carousel (homepage, nav). Same catalog for both brands — styling differs in UI only.
 */

export type CategoryCarouselItem = {
  slug: string;
  title: string;
  imageSrc: string;
  href: string;
  /** Short benefit line for category grids and marketing. */
  description: string;
  /** High-demand categories for “Most popular” callouts. */
  isPopular?: boolean;
};

/** Category teaser links jump into `/build` with `category` preselected. */
export function categoryBuildHref(slug: string): string {
  return `/build?category=${encodeURIComponent(slug)}`;
}

export const CATEGORY_CAROUSEL_ITEMS: CategoryCarouselItem[] = [
  {
    slug: "regular-jumper-13x13",
    title: "Regular Jumper 13x13",
    imageSrc: "/party-rentals/categories/regular-jumper-13x13.png",
    href: categoryBuildHref("regular-jumper-13x13"),
    description:
      "Simple, fun, and perfect for any backyard party. Easy setup, nonstop jumping.",
  },
  {
    slug: "five-in-one-jumpers",
    title: "5 en 1 Jumpers",
    imageSrc: "/party-rentals/categories/five-in-one-jumpers.png",
    href: categoryBuildHref("five-in-one-jumpers"),
    description:
      "Bounce, slide, climb, shoot, repeat. The all-in-one favorite for bigger parties.",
  },
  {
    slug: "eleven-by-eleven-jumpers",
    title: "11x11 Jumpers",
    imageSrc: "/party-rentals/categories/eleven-by-eleven-jumpers.png",
    href: categoryBuildHref("eleven-by-eleven-jumpers"),
    description:
      "Compact size, full fun. Ideal for smaller spaces without sacrificing the experience.",
  },
  {
    slug: "waterslide",
    title: "Waterslide",
    imageSrc: "/party-rentals/categories/waterslide.png",
    href: categoryBuildHref("waterslide"),
    description:
      "Beat the heat with high-energy water slides. Summer parties solved instantly.",
    isPopular: true,
  },
  {
    slug: "disney-jumpers",
    title: "Disney Jumpers",
    imageSrc: "/party-rentals/categories/disney-jumpers.png",
    href: categoryBuildHref("disney-jumpers"),
    description:
      "Bring their favorite characters to life. Magic, color, and excitement in one setup.",
  },
  {
    slug: "xtreme-disco-dome",
    title: "XTreme Disco Dome",
    imageSrc: "/party-rentals/categories/xtreme-disco-dome.png",
    href: categoryBuildHref("xtreme-disco-dome"),
    description:
      "Lights, music, and bounce. A full party experience inside one inflatable.",
    isPopular: true,
  },
  {
    slug: "tables-and-chairs",
    title: "Tables & Chairs",
    imageSrc: "/party-rentals/categories/tables-and-chairs.png",
    href: categoryBuildHref("tables-and-chairs"),
    description:
      "Seat every guest comfortably — rounds, rectangles, and kid-height options for food, gifts, and cake.",
  },
  {
    slug: "canopies",
    title: "Canopies",
    imageSrc: "/party-rentals/categories/canopies.png",
    href: categoryBuildHref("canopies"),
    description:
      "Shade and shelter for sun or light weather — define your party footprint and protect your spread.",
    isPopular: true,
  },
  {
    slug: "throne-chairs",
    title: "Throne Chairs",
    imageSrc: "/party-rentals/categories/throne-chairs.png",
    href: categoryBuildHref("throne-chairs"),
    description:
      "Make your event feel VIP. Perfect for birthdays, photos, and special moments.",
  },
  {
    slug: "inflatable-games",
    title: "Inflatable Games",
    imageSrc: "/party-rentals/categories/inflatable-games.png",
    href: categoryBuildHref("inflatable-games"),
    description:
      "Interactive fun for all ages. Perfect for groups, competitions, and events.",
  },
  {
    slug: "obstacle-course",
    title: "Obstacle Course",
    imageSrc: "/party-rentals/categories/obstacle-course.png",
    href: categoryBuildHref("obstacle-course"),
    description:
      "Race, climb, and compete. High-energy fun that keeps everyone engaged.",
  },
  {
    slug: "minicombo",
    title: "Minicombo",
    imageSrc: "/party-rentals/categories/minicombo.png",
    href: categoryBuildHref("minicombo"),
    description:
      "Slide + bounce in one compact unit. Perfect balance of fun and space-saving.",
  },
  {
    slug: "combos",
    title: "Combos",
    imageSrc: "/party-rentals/categories/combos.png",
    href: categoryBuildHref("combos"),
    description:
      "More features, more fun. The perfect upgrade for unforgettable parties.",
    isPopular: true,
  },
];

export function getCategoryBySlug(slug: string): CategoryCarouselItem | undefined {
  return CATEGORY_CAROUSEL_ITEMS.find((c) => c.slug === slug);
}
