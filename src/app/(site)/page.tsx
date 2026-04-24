import { getBrandForHomePage } from "@/lib/brand/get-brand";
import { HomeView } from "@/components/home/home-view";

type HomePageProps = {
  searchParams: Promise<{ brand?: string | string[] }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const sp = await searchParams;
  const raw = sp.brand;
  const brandParam =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  const brand = getBrandForHomePage(brandParam);
  return <HomeView brand={brand} />;
}
