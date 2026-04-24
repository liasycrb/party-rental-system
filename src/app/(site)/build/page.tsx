import type { Metadata } from "next";
import { getBrand } from "@/lib/brand/get-brand";
import { BuildEventFlow } from "@/components/build/build-event-flow";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return {
    title: "Build your event",
    description: `Configure your rental and check availability with ${brand.displayName}.`,
  };
}

export default async function BuildPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; date?: string; package?: string }>;
}) {
  const brand = await getBrand();
  const { product: productSlug, date, package: packageId } = await searchParams;

  return (
    <BuildEventFlow
      brand={brand}
      initialProductSlug={productSlug}
      initialDate={date}
      initialPackageId={packageId}
    />
  );
}
