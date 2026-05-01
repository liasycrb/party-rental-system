import type { CatalogProduct } from "@/lib/catalog/get-products";
import type { DemoProduct } from "@/lib/catalog/demo-products";
import { canonicalRentalProductMainImage } from "@/lib/inventory/canonical-product-image";
import {
  coalesceSurfacesFromRow,
  coalesceTrimString,
  customerSafeProductNote,
  effectiveListingPrice,
  formatCategoryLabelFromSlug,
  formatSurfacesList,
  formatUseTypeLabel,
  splitRulesToLines,
} from "@/lib/catalog/product-display-helpers";

/** Map RPC / table row → card model (Supabase `name` and fields win). */
export function catalogProductToProductCard(p: CatalogProduct): DemoProduct {
  const row = p as unknown as Record<string, unknown>;
  const legacyImg = (p.image_src ?? "").trim();
  const canonical =
    canonicalRentalProductMainImage(p.category_slug, p.slug) ?? "";
  const resolvedImage =
    canonical || legacyImg || "/images/placeholder-party-rental.jpg";

  const dimStr =
    (p.dimensions ?? "").trim() ||
    coalesceTrimString(row, ["dimensions"]) ||
    "";
  const setupStr =
    (p.required_space ?? "").trim() ||
    coalesceTrimString(row, [
      "required_space",
      "setup_space",
      "setupSpace",
    ]) ||
    "";

  const useRaw =
    (p.use_type != null && String(p.use_type).trim() !== ""
      ? String(p.use_type)
      : null) ?? coalesceTrimString(row, ["use_type", "useType"]);

  const surfacesArr =
    Array.isArray(p.allowed_surfaces) && p.allowed_surfaces.length > 0
      ? p.allowed_surfaces
      : coalesceSurfacesFromRow(row);
  const surfaces = formatSurfacesList(surfacesArr);
  const rulesLines = splitRulesToLines(p.item_rules);
  const safeNote = customerSafeProductNote(p.notes ?? null);

  return {
    slug: p.slug,
    title: p.name,
    category: formatCategoryLabelFromSlug(p.category_slug),
    sizeLabel: dimStr,
    setupSpace: setupStr,
    useType: formatUseTypeLabel(useRaw),
    priceFrom: effectiveListingPrice(p),
    imageSrc: resolvedImage,
    imageAlt: p.name,
    blurb:
      (p.short_description ?? "").trim() ||
      (p.full_description ?? "").trim(),
    surfaceRequirements: surfaces ?? "",
    accessRequirements: "",
    setupNotes:
      rulesLines.length > 0
        ? rulesLines
        : safeNote
          ? [safeNote]
          : [],
  };
}
