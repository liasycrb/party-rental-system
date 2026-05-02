import { createSupabaseServerClient } from "@/lib/supabase/server";
import { canonicalRentalProductMainImage } from "@/lib/inventory/canonical-product-image";
import type { BuildUpsellOption } from "@/lib/inventory/build-upsell-shared";

function asFiniteNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return null;
}

function asTrimString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

/** Active `is_upsell` rows for /build add-ons step (requires deployed RPC). */
export async function getBuildUpsellOptions(brandSlug: string): Promise<BuildUpsellOption[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_upsell_rental_products_for_brand", {
    p_brand_slug: brandSlug,
  });

  if (error) {
    console.error("[getBuildUpsellOptions]", error.message);
    return [];
  }

  const rows = (data ?? []) as Record<string, unknown>[];

  return rows
    .filter((r) => {
      const slug = r.slug;
      return slug != null && String(slug).trim() !== "";
    })
    .map((r) => {
      const productSlug = String(r.slug).trim();
      const categorySlug =
        typeof r.category_slug === "string" ? r.category_slug : null;
      const canonicalImageSrc = canonicalRentalProductMainImage(
        categorySlug,
        productSlug,
      );
      const legacy =
        typeof r.image_src === "string" && r.image_src.trim() !== ""
          ? r.image_src.trim()
          : null;

      return {
        id: String(r.id ?? ""),
        name: String(r.name ?? ""),
        slug: productSlug,
        category_slug: categorySlug,
        image_src: canonicalImageSrc ?? legacy,
        price: asFiniteNumber(r.price),
        price_from: asFiniteNumber(r.price_from),
        short_description: asTrimString(r.short_description),
      };
    });
}
