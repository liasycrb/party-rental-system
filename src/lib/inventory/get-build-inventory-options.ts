import { createSupabaseServerClient } from "@/lib/supabase/server";
import { canonicalRentalProductMainImage } from "@/lib/inventory/canonical-product-image";
import {
  coalesceSurfacesFromRow,
  coalesceTrimString,
} from "@/lib/catalog/product-display-helpers";

export { canonicalRentalProductMainImage };

export type BuildInventoryOption = {
  id: string;
  name: string;
  category_slug: string | null;
  product_slug: string;
  quantity_active: number;
  image_src: string | null;
  price: number | null;
  price_from?: number | null;
  short_description?: string | null;
  dimensions?: string | null;
  required_space?: string | null;
  use_type?: string | null;
  allowed_surfaces?: string[] | null;
  delivery_fee?: number | null;
  delivery_included?: boolean | null;
  item_rules?: string | null;
  notes?: string | null;
};

function asFiniteNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return null;
}

function asBool(v: unknown): boolean | null {
  if (typeof v === "boolean") return v;
  return null;
}

function asTrimString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

function asStringArray(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  const parts = v.map((x) => String(x).trim()).filter(Boolean);
  return parts.length ? parts : null;
}

/** Active inventory rows for /build — sourced from rental_products. */
export async function getBuildInventoryOptions(
  brandSlug: string,
): Promise<BuildInventoryOption[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .rpc("get_active_rental_products_for_brand", { p_brand_slug: brandSlug });

  if (error) {
    console.error("[getBuildInventoryOptions]", error.message);
    return [];
  }

  const rows = (data ?? []) as Record<string, unknown>[];

  return rows
    .filter((r) => {
      if (r.is_active === false) return false;
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
        category_slug: categorySlug,
        product_slug: productSlug,
        quantity_active:
          asFiniteNumber(r.quantity_available) ??
          asFiniteNumber(r.quantity_active) ??
          0,
        image_src: canonicalImageSrc ?? legacy,
        price: asFiniteNumber(r.price),
        price_from: asFiniteNumber(r.price_from),
        short_description: asTrimString(r.short_description),
        dimensions:
          coalesceTrimString(r, ["dimensions"]) ?? asTrimString(r.dimensions),
        required_space:
          coalesceTrimString(r, [
            "required_space",
            "setup_space",
            "setupSpace",
          ]) ?? asTrimString(r.required_space),
        use_type:
          coalesceTrimString(r, ["use_type", "useType"]) ??
          asTrimString(r.use_type),
        allowed_surfaces:
          coalesceSurfacesFromRow(r) ??
          asStringArray(r.allowed_surfaces) ??
          asStringArray(r.allowedSurfaces),
        delivery_fee: asFiniteNumber(r.delivery_fee),
        delivery_included: asBool(r.delivery_included),
        item_rules: asTrimString(r.item_rules),
        notes: asTrimString(r.notes),
      };
    });
}
