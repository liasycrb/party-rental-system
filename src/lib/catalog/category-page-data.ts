import type { BrandSlug } from "@/lib/brand/config";
import type { CatalogProduct } from "@/lib/catalog/get-products";
import { getProducts } from "@/lib/catalog/get-products";
import type { CategoryCarouselItem } from "@/lib/catalog/category-carousel";
import {
  getRentalCategories,
  resolveRentalCategoryForLookup,
  type RentalCategoryUIModel,
} from "@/lib/catalog/get-rental-categories";
import { inventoryMatchesGuidedCategory } from "@/lib/build/build-guided-categories";
import { canonicalRentalProductMainImage } from "@/lib/inventory/get-build-inventory-options";

export type { CategoryCarouselItem } from "@/lib/catalog/category-carousel";

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

function uiModelToCarouselItem(ui: RentalCategoryUIModel): CategoryCarouselItem {
  return {
    slug: ui.slug,
    title: ui.label,
    imageSrc: ui.image,
    href: `/categories/${encodeURIComponent(ui.slug)}`,
    description: ui.description,
    isPopular: ui.isPopular,
  };
}

function catalogProductToPageProduct(p: CatalogProduct): CategoryPageProduct {
  const legacyImg = (p.image_src ?? "").trim();
  const canonical =
    canonicalRentalProductMainImage(p.category_slug, p.slug) ?? "";
  const imageSrc =
    canonical || legacyImg || "/images/placeholder-party-rental.jpg";

  const priceNum =
    typeof p.price === "number" && Number.isFinite(p.price) ? p.price : null;
  const priceLabel =
    priceNum != null && priceNum > 0
      ? `from $${priceNum}`
      : "Pricing on request";

  return {
    name: p.name,
    imageSrc,
    imageAlt: p.name,
    priceLabel,
    bookHref: `/build?product=${encodeURIComponent(p.slug)}`,
    isPopular: false,
  };
}

function fallbackProducts(item: CategoryCarouselItem): CategoryPageProduct[] {
  return [
    {
      name: `Browse ${item.title}`,
      imageSrc: item.imageSrc,
      imageAlt: item.title,
      priceLabel: "Check availability",
      bookHref: `/build?category=${encodeURIComponent(item.slug)}`,
    },
  ];
}

/**
 * Hydrate `/categories/[slug]` from static catalog + matching `rental_products`.
 */
export async function resolveCategoryPageViewModel(
  slug: string,
  brandSlug: BrandSlug,
): Promise<CategoryPageViewModel | null> {
  const [categories, products] = await Promise.all([
    getRentalCategories({ brandSlug }),
    getProducts(brandSlug),
  ]);

  const def = resolveRentalCategoryForLookup(slug, categories);
  if (!def) return null;

  const item = uiModelToCarouselItem(def);
  const inCategory = products.filter((p) =>
    inventoryMatchesGuidedCategory(p.category_slug, def),
  );

  const mapped =
    inCategory.length > 0
      ? inCategory.map(catalogProductToPageProduct)
      : fallbackProducts(item);

  return {
    item,
    pageTitle: `${def.label} for Rent in Moreno Valley`,
    pageSubtitle: def.description,
    heroImageSrc: def.image,
    products: mapped.slice(0, 48),
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
