import type { Brand } from "@/lib/brand/config";
import { CrbHome } from "./crb-home";
import { LiasHome } from "./lias-home";

export function HomeView({ brand }: { brand: Brand }) {
  if (brand.slug === "crb") {
    return <CrbHome brand={brand} />;
  }
  return <LiasHome brand={brand} />;
}
