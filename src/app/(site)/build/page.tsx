import type { Metadata } from "next";
import { BuildBookingStart } from "@/components/build/build-booking-start";
import { BRANDS } from "@/lib/brand/config";
import { resolveBrandSlugFromPageSearchParam } from "@/lib/brand/resolve-brand";
import { getCategoryBySlug } from "@/lib/catalog/category-carousel";
import { getBuildInventoryOptions } from "@/lib/inventory/get-build-inventory-options";

type BuildPageProps = {
  searchParams: Promise<{
    brand?: string | string[];
    category?: string | string[];
    product?: string | string[];
    date?: string | string[];
    package?: string | string[];
  }>;
};

function firstParam(
  v: string | string[] | undefined,
): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v[0]) return v[0];
  return undefined;
}

export async function generateMetadata({ searchParams }: BuildPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const brandSlug = resolveBrandSlugFromPageSearchParam(sp.brand);
  const brand = BRANDS[brandSlug];
  return {
    title: "Build your event",
    description: `Start your party booking and check availability with ${brand.displayName}.`,
  };
}

export default async function BuildPage({ searchParams }: BuildPageProps) {
  const sp = await searchParams;
  const brandSlug = resolveBrandSlugFromPageSearchParam(sp.brand);
  const isCrb = brandSlug === "crb";

  const categorySlug = firstParam(sp.category) ?? null;
  const productSlug = firstParam(sp.product) ?? null;
  const category = categorySlug ? getCategoryBySlug(categorySlug) : undefined;
  const categoryLine = category ? `You're booking: ${category.title}` : null;

  const inventoryOptions = await getBuildInventoryOptions(brandSlug);

  return (
    <BuildBookingStart
      isCrb={isCrb}
      brandSlug={brandSlug}
      categorySlug={categorySlug}
      productSlug={productSlug}
      categoryLine={categoryLine}
      inventoryOptions={inventoryOptions}
    />
  );
}
