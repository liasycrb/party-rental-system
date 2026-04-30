import { BRANDS } from "@/lib/brand/config";
import { resolveBrandSlugFromPageSearchParam } from "@/lib/brand/resolve-brand";
import { getSiteSettings } from "@/lib/site/get-site-settings";
import { getRentalPackages } from "@/lib/marketing/get-rental-packages";
import { CrbHome } from "@/components/home/crb-home";
import { LiasHome } from "@/components/home/lias-home";

type HomePageProps = {
  searchParams: Promise<{ brand?: string | string[] }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const sp = await searchParams;
  const slug = resolveBrandSlugFromPageSearchParam(sp.brand);

  const [siteSettings, packages] = await Promise.all([
    getSiteSettings(slug),
    getRentalPackages(slug),
  ]);

  if (slug === "crb") {
    return <CrbHome brand={BRANDS[slug]} siteSettings={siteSettings} packages={packages} />;
  }
  return <LiasHome brand={BRANDS[slug]} siteSettings={siteSettings} packages={packages} />;
}
