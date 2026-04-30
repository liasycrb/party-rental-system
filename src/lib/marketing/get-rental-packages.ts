import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RentalPackage = {
  id: string;
  brand_slugs: string[];
  title: string;
  tagline: string | null;
  badge: string | null;
  includes: string[];
  from_price: number;
  primary_product_slug: string | null;
  image_src: string | null;
  is_active: boolean;
  sort_order: number;
};

/** Public — active packages only, sorted by sort_order. */
export async function getRentalPackages(
  brandSlug: string,
): Promise<RentalPackage[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc(
    "get_rental_packages_for_brand",
    { p_brand_slug: brandSlug },
  );
  if (error) {
    console.error("[getRentalPackages]", error.message);
    return [];
  }
  return (data ?? []) as RentalPackage[];
}

/** Fetch a single package by id (public, no RLS issue since SECURITY DEFINER). */
export async function getRentalPackageById(
  id: string,
): Promise<RentalPackage | null> {
  const supabase = await createSupabaseServerClient();
  // Use the public read RPC — filter client-side since we only need one row.
  // Avoids needing a separate single-row RPC for now.
  const { data, error } = await supabase.rpc(
    "get_rental_packages_for_brand",
    { p_brand_slug: "lias" },
  );
  if (error) {
    console.error("[getRentalPackageById]", error.message);
    return null;
  }
  const all = (data ?? []) as RentalPackage[];
  // Also try "crb" in case the package is crb-only — merge and dedupe.
  const { data: crbData } = await supabase.rpc("get_rental_packages_for_brand", {
    p_brand_slug: "crb",
  });
  const merged = [
    ...all,
    ...((crbData ?? []) as RentalPackage[]).filter(
      (c) => !all.some((l) => l.id === c.id),
    ),
  ];
  return merged.find((p) => p.id === id) ?? null;
}

/** Dashboard — all packages (active + draft). */
export async function getAllRentalPackagesDashboard(
  brandSlug: string,
): Promise<RentalPackage[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc(
    "get_all_rental_packages_for_dashboard",
    { p_brand_slug: brandSlug },
  );
  if (error) {
    console.error("[getAllRentalPackagesDashboard]", error.message);
    return [];
  }
  return (data ?? []) as RentalPackage[];
}
