import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryPageTemplate } from "@/components/categories/category-page-template";
import { getBrandSlug } from "@/lib/brand/get-brand";
import { resolveCategoryPageViewModel } from "@/lib/catalog/category-page-data";

/**
 * Brand resolves from hostname (e.g. `crbjumpers.com` → `crb`); `?brand=` is the dev/preview fallback.
 */

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ brand?: string | string[] }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Pick<Props, "params" | "searchParams">): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const brandSlug = await getBrandSlug(sp.brand);
  const data = await resolveCategoryPageViewModel(slug, brandSlug);
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

  const brandSlug = await getBrandSlug(sp.brand);
  const data = await resolveCategoryPageViewModel(slug, brandSlug);
  if (!data) {
    notFound();
  }

  return <CategoryPageTemplate brand={brandSlug} data={data} />;
}
