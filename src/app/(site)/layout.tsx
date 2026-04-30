import type { Metadata } from "next";
import type { BrandSlug } from "@/lib/brand/config";
import { getBrand } from "@/lib/brand/get-brand";
import { getRentalCategories } from "@/lib/catalog/get-rental-categories";
import { getSiteSettings } from "@/lib/site/get-site-settings";
import { SiteLayoutBrand } from "@/components/layouts/site-layout-brand";
import type { FooterCategoryLink, FooterOverride } from "@/components/layouts/site-footer";

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

  function toFooterLinks(
    cats: Awaited<ReturnType<typeof getRentalCategories>>,
  ): FooterCategoryLink[] {
    return cats.map((c) => ({
      label: c.label,
      href: `/categories/${encodeURIComponent(c.slug)}`,
    }));
  }

  const [liasSettings, crbSettings, liasCats, crbCats] = await Promise.all([
    getSiteSettings("lias"),
    getSiteSettings("crb"),
    getRentalCategories({ brandSlug: "lias" }),
    getRentalCategories({ brandSlug: "crb" }),
  ]);
  const phoneOverrides: Record<string, string | null> = {
    lias: liasSettings?.support_phone || null,
    crb: crbSettings?.support_phone || null,
  };

  const toFooterOverride = (s: typeof liasSettings): FooterOverride | null =>
    s
      ? {
          headline: s.footer_headline || null,
          phone: s.footer_phone || null,
          email: s.footer_email || null,
          serviceArea: s.footer_service_area || null,
          copyright: s.footer_copyright || null,
          facebookUrl: s.footer_facebook_url || null,
          instagramUrl: s.footer_instagram_url || null,
        }
      : null;

  const footerOverrides: Record<string, FooterOverride | null> = {
    lias: toFooterOverride(liasSettings),
    crb: toFooterOverride(crbSettings),
  };

  const footerCategoryLinksByBrand: Partial<
    Record<BrandSlug, readonly FooterCategoryLink[]>
  > = {
    lias: toFooterLinks(liasCats),
    crb: toFooterLinks(crbCats),
  };

  return (
    <SiteLayoutBrand
      serverBrand={serverBrand}
      phoneOverrides={phoneOverrides}
      footerOverrides={footerOverrides}
      footerCategoryLinksByBrand={footerCategoryLinksByBrand}
    >
      {children}
    </SiteLayoutBrand>
  );
}
