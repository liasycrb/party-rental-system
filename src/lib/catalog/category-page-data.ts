import { getCategoryBySlug, type CategoryCarouselItem } from "./category-carousel";

export type CategoryPageProduct = {
  name: string;
  imageSrc: string;
  imageAlt: string;
  /** e.g. "from $225" or "$199" */
  priceLabel: string;
  isPopular?: boolean;
  bookHref: string;
};

export type CategoryPageViewModel = {
  item: CategoryCarouselItem;
  pageTitle: string;
  pageSubtitle: string;
  heroImageSrc: string;
  products: CategoryPageProduct[];
};

const WATERSLIDE_SUBTITLE =
  "Beat the heat with pro delivery, setup, and same-week availability — summer parties, solved in one booking.";

const WATERSLIDE_PRODUCTS: CategoryPageProduct[] = [
  {
    name: "Palm Breeze 16ft slide",
    imageSrc: "/party-rentals/categories/waterslide.png",
    imageAlt: "Palm Breeze 16ft inflatable water slide with splash pool",
    priceLabel: "from $225",
    bookHref: "/build?category=waterslide",
  },
  {
    name: "Tropical Rush — dual lane",
    imageSrc: "/party-rentals/shared/tropical-combo.jpg",
    imageAlt: "Tropical theme inflatable slide and bounce setup outdoors",
    priceLabel: "from $265",
    isPopular: true,
    bookHref: "/build?category=waterslide",
  },
  {
    name: "Canyon Plunge 20ft",
    imageSrc: "/party-rentals/shared/rainbow-castle.jpg",
    imageAlt: "Large inflatable water slide for backyard events",
    priceLabel: "from $245",
    bookHref: "/build?category=waterslide",
  },
  {
    name: "Sunshine splash combo",
    imageSrc: "/party-rentals/shared/experience-moment-03.jpg",
    imageAlt: "Bright inflatable party rental at a home celebration",
    priceLabel: "from $199",
    bookHref: "/build?category=waterslide",
  },
];

const GENERIC_HERO_IMAGES = [
  "/party-rentals/shared/rainbow-castle.jpg",
  "/party-rentals/shared/tropical-combo.jpg",
  "/party-rentals/shared/experience-moment-03.jpg",
] as const;

function buildDefaultPageTitle(item: CategoryCarouselItem): string {
  if (item.slug === "waterslide") {
    return "Waterslides for Rent in Moreno Valley";
  }
  return `${item.title} for Rent in Moreno Valley`;
}

function buildDefaultSubtitle(item: CategoryCarouselItem): string {
  if (item.slug === "waterslide") {
    return WATERSLIDE_SUBTITLE;
  }
  return item.description;
}

function buildDefaultProducts(item: CategoryCarouselItem): CategoryPageProduct[] {
  return [0, 1, 2].map((i) => {
    const n = i + 1;
    return {
      name: `${item.title} — popular pick ${n}`,
      imageSrc: i === 0 ? item.imageSrc : GENERIC_HERO_IMAGES[i % GENERIC_HERO_IMAGES.length]!,
      imageAlt: `${item.title} rental option ${n}`,
      priceLabel: `from $${170 + n * 25}`,
      isPopular: Boolean(item.isPopular) && n === 2,
      bookHref: `/build?category=${encodeURIComponent(item.slug)}`,
    } satisfies CategoryPageProduct;
  });
}

/**
 * Server-side content for `app/(site)/categories/[slug]`.
 * Replace with CMS/API; structure kept stable for migration.
 */
export function getCategoryPageData(slug: string): CategoryPageViewModel | undefined {
  const item = getCategoryBySlug(slug);
  if (!item) {
    return undefined;
  }

  if (item.slug === "waterslide") {
    return {
      item,
      pageTitle: buildDefaultPageTitle(item),
      pageSubtitle: WATERSLIDE_SUBTITLE,
      heroImageSrc: item.imageSrc,
      products: WATERSLIDE_PRODUCTS,
    };
  }

  return {
    item,
    pageTitle: buildDefaultPageTitle(item),
    pageSubtitle: buildDefaultSubtitle(item),
    heroImageSrc: item.imageSrc,
    products: buildDefaultProducts(item),
  };
}

export const CATEGORY_PAGE_BENEFITS = [
  {
    title: "Setup included",
    body: "We deliver, set up, and return for pickup—no heavy equipment on your to-do list.",
  },
  {
    title: "Clean & safe",
    body: "Inspected inflatables, safe anchoring, and professional crews for peace of mind.",
  },
  {
    title: "Fast booking",
    body: "Check availability online and move from browse to date hold in a few minutes.",
  },
] as const;

export const CATEGORY_PAGE_SERVICE_AREA = "Serving Moreno Valley & the Inland Empire";
