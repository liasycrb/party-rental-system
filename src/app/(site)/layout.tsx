import type { Metadata } from "next";
import { getBrand } from "@/lib/brand/get-brand";
import { getSiteSettings } from "@/lib/site/get-site-settings";
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
  // Fetch both brands in parallel so the client-side ?brand= switcher gets
  // the correct phone for whichever brand it activates.
  const [liasSettings, crbSettings] = await Promise.all([
    getSiteSettings("lias"),
    getSiteSettings("crb"),
  ]);
  const phoneOverrides: Record<string, string | null> = {
    lias: liasSettings?.support_phone || null,
    crb: crbSettings?.support_phone || null,
  };
  return (
    <SiteLayoutBrand serverBrand={serverBrand} phoneOverrides={phoneOverrides}>
      {children}
    </SiteLayoutBrand>
  );
}
