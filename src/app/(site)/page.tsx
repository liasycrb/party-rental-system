import { getBrand } from "@/lib/brand/get-brand";
import { HomeView } from "@/components/home/home-view";

export default async function HomePage() {
  const brand = await getBrand();
  return <HomeView brand={brand} />;
}
