import { BRANDS } from "@/lib/brand/config";
import { resolveBrandSlugFromPageSearchParam } from "@/lib/brand/resolve-brand";
import { CrbHome } from "@/components/home/crb-home";
import { LiasHome } from "@/components/home/lias-home";

type HomePageProps = {
  searchParams: Promise<{ brand?: string | string[] }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const sp = await searchParams;
  const slug = resolveBrandSlugFromPageSearchParam(sp.brand);

  if (slug === "crb") {
    return <CrbHome brand={BRANDS[slug]} />;
  }
  return <LiasHome brand={BRANDS[slug]} />;
}
