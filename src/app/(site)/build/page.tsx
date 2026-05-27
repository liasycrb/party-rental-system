import type { Metadata } from "next";
import { BuildBookingStart } from "@/components/build/build-booking-start";
import { BRANDS, type BrandSlug } from "@/lib/brand/config";
import { getBrandSlug } from "@/lib/brand/get-brand";
import {
  getRentalCategories,
  resolveRentalCategoryForLookup,
  type RentalCategoryUIModel,
} from "@/lib/catalog/get-rental-categories";
import { getBuildInventoryOptions } from "@/lib/inventory/get-build-inventory-options";
import { getBuildUpsellOptions } from "@/lib/inventory/get-build-upsell-options";
import { getBookingSettings } from "@/lib/booking/get-booking-settings";

// /build reads live per-brand data (inventory, blackouts via category load,
// upsells, booking_settings). Force dynamic rendering so every fetch in this
// route uses { cache: "no-store" } and dashboard edits to booking_settings,
// delivery pricing, blackouts, or inventory show up on the next request
// without waiting for a cache to expire.
// (Per node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md
//  line 98: "force-dynamic" is equivalent to setting cache:"no-store",
//  next:{revalidate:0} on every fetch in the route.)
export const dynamic = "force-dynamic";

type BuildPageProps = {
  searchParams: Promise<{
    brand?: string | string[];
    category?: string | string[];
    product?: string | string[];
    date?: string | string[];
    package?: string | string[];
  }>;
};

function firstParam(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v[0]) return v[0];
  return undefined;
}

/**
 * /build is reached from every brand's internal nav via `withBrand("/build", brandSlug)`,
 * so an explicit `?brand=lias|crb` in the URL must win over the proxy-injected
 * `x-brand-slug` header. On production hostnames the proxy pins that header to
 * the hostname's brand, which would otherwise silently override the URL and make
 * every per-brand read (inventory, upsells, booking_settings) follow the host
 * rather than the link the user clicked.
 *
 * Scoped to /build only — other public routes still defer to `getBrandSlug`'s
 * header-first resolution, which is correct for hostname-bound pages.
 */
async function resolveBuildBrandSlug(
  brandQuery: string | string[] | undefined,
): Promise<BrandSlug> {
  const explicit = firstParam(brandQuery);
  if (explicit === "lias" || explicit === "crb") return explicit;
  return getBrandSlug(brandQuery);
}

export async function generateMetadata({ searchParams }: BuildPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const brandSlug = await resolveBuildBrandSlug(sp.brand);
  const brand = BRANDS[brandSlug];
  return {
    title: "Build your event",
    description: `Start your party booking and check availability with ${brand.displayName}.`,
  };
}

const BROWSE_ALL: RentalCategoryUIModel = {
  slug: "*",
  label: "Browse all inventory",
  image: "/party-rentals/categories/regular-jumper-13x13.png",
  categorySlugs: ["*"],
  description: "",
  isPopular: false,
};

export default async function BuildPage({ searchParams }: BuildPageProps) {
  const sp = await searchParams;
  const brandSlug = await resolveBuildBrandSlug(sp.brand);
  const isCrb = brandSlug === "crb";

  const categorySlug = firstParam(sp.category) ?? null;
  const productSlug = firstParam(sp.product) ?? null;

  const [inventoryOptions, canonicalCategories, upsellOptions, bookingSettings] =
    await Promise.all([
      getBuildInventoryOptions(brandSlug),
      getRentalCategories({ brandSlug }),
      getBuildUpsellOptions(brandSlug),
      getBookingSettings(brandSlug),
    ]);

  // Dev-only confirmation that the server resolved the live brand + RPC row.
  // Remove together with the visible "Online reservation minimum" line in
  // BuildBookingStart once dashboard-driven minimums are verified.
  if (process.env.NODE_ENV !== "production") {
    console.log("[build/page] brandSlug", brandSlug, "bookingSettings", bookingSettings);
  }

  const matched = resolveRentalCategoryForLookup(categorySlug, canonicalCategories);
  const categoryLine = matched ? `You're booking: ${matched.label}` : null;

  const guidedCategories: RentalCategoryUIModel[] = [
    ...canonicalCategories,
    BROWSE_ALL,
  ];

  return (
    <BuildBookingStart
      isCrb={isCrb}
      brandSlug={brandSlug}
      categorySlug={categorySlug}
      productSlug={productSlug}
      categoryLine={categoryLine}
      inventoryOptions={inventoryOptions}
      guidedCategories={guidedCategories}
      upsellOptions={upsellOptions}
      minimumOrderAmount={bookingSettings.minimumOrderAmount}
    />
  );
}
