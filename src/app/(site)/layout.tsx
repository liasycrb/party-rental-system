import type { Metadata } from "next";
import { getBrand } from "@/lib/brand/get-brand";
import { SiteLayoutBrand } from "@/components/layouts/site-layout-brand";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return {
    title: {
      default: brand.seo.siteName,
      template: `%s · ${brand.seo.siteName}`,
    },
    description: brand.seo.defaultDescription,
    metadataBase: new URL(brand.siteUrl),
    openGraph: {
      siteName: brand.seo.siteName,
      type: "website",
    },
  };
}

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const serverBrand = await getBrand();
  return (
    <SiteLayoutBrand serverBrand={serverBrand}>{children}</SiteLayoutBrand>
  );
}
