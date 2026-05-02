import { effectiveListingPrice } from "@/lib/catalog/product-display-helpers";

export type BuildUpsellOption = {
  id: string;
  name: string;
  slug: string;
  category_slug: string | null;
  image_src: string | null;
  price: number | null;
  price_from: number | null;
  short_description: string | null;
};

export function upsellUnitEstimate(
  o: Pick<BuildUpsellOption, "price" | "price_from">,
): number | null {
  const v = effectiveListingPrice({
    price: o.price,
    price_from: o.price_from,
  });
  if (v == null || !Number.isFinite(v) || v <= 0) return null;
  return v;
}
