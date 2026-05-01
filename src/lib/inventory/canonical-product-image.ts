/** Pure path helper — safe to import from Client Components. */
export function canonicalRentalProductMainImage(
  categorySlug: string | null | undefined,
  productSlug: string | null | undefined,
): string | null {
  const c = typeof categorySlug === "string" ? categorySlug.trim() : "";
  const s = typeof productSlug === "string" ? productSlug.trim() : "";
  if (!c || !s) return null;
  return `/products/${c}/${s}/main.jpg`;
}
