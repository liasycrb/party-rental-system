import type { CatalogProduct } from "@/lib/catalog/get-products";
import type { DemoProduct } from "@/lib/catalog/demo-products";
import { normalizeProductImageSrc } from "@/lib/catalog/rental-products";
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
  const imagePath =
    (typeof p.image_path === "string" && p.image_path.trim() !== ""
      ? p.image_path.trim()
      : coalesceTrimString(row, ["image_path", "imagePath"])) ?? null;

  const resolvedImage =
    normalizeProductImageSrc({
      slug: p.slug,
      category_slug: p.category_slug ?? null,
      image_path: imagePath,
      image_src: p.image_src,
    }) ?? "";

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
