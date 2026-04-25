import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryPageTemplate } from "@/components/categories/category-page-template";
import { resolveBrandSlugFromPageSearchParam } from "@/lib/brand/resolve-brand";
import { getCategoryPageData } from "@/lib/catalog/category-page-data";

/**
 * `app/(site)/categories/[slug]/page.tsx`
 * Brand: `?brand=lias` | `?brand=crb` (else `NEXT_PUBLIC_DEFAULT_BRAND_SLUG` or default).
 * Header/footer: `SiteLayoutBrand` applies the same query on `/categories/*` (see site-layout-brand.tsx).
 */

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ brand?: string | string[] }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { slug } = await params;
  const data = getCategoryPageData(slug);
  if (!data) {
    return { title: "Category" };
  }
  return {
    title: data.pageTitle,
    description: data.pageSubtitle.slice(0, 160),
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const data = getCategoryPageData(slug);
  if (!data) {
    notFound();
  }

  const brandSlug = resolveBrandSlugFromPageSearchParam(sp.brand);

  return <CategoryPageTemplate brand={brandSlug} data={data} />;
}
