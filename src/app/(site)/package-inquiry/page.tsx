import type { Metadata } from "next";
import { BRANDS } from "@/lib/brand/config";
import { resolveBrandSlugFromPageSearchParam } from "@/lib/brand/resolve-brand";
import { getRentalPackageById } from "@/lib/marketing/get-rental-packages";
import { InquiryForm } from "./_inquiry-form";

export const metadata: Metadata = { title: "Package Inquiry" };

type Props = {
  searchParams: Promise<{
    brand?: string | string[];
    package?: string | string[];
  }>;
};

function firstParam(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v[0]) return v[0];
  return undefined;
}

export default async function PackageInquiryPage({ searchParams }: Props) {
  const sp = await searchParams;
  const brandSlug = resolveBrandSlugFromPageSearchParam(sp.brand);
  const packageId = firstParam(sp.package) ?? null;

  const pkg = packageId ? await getRentalPackageById(packageId) : null;

  const packageTitle = pkg?.title ?? null;
  const productSlug = pkg?.primary_product_slug ?? null;

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-1 text-xl font-bold text-gray-900">
        {packageTitle ? `Inquire: ${packageTitle}` : "Package Inquiry"}
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Fill in your details and we&apos;ll reach out to confirm availability and answer any questions.
      </p>

      <InquiryForm
        brandSlug={brandSlug}
        packageId={packageId}
        packageTitle={packageTitle}
        productSlug={productSlug}
      />
    </main>
  );
}
