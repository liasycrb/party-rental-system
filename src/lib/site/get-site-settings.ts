import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SiteSettings = {
  id: string;
  brand_slug: string;
  business_name: string | null;
  support_phone: string | null;
  hero_headline: string | null;
  hero_subheadline: string | null;
  hero_cta_primary: string | null;
  announcement_text: string | null;
  service_areas_text: string | null;
  footer_headline: string | null;
  footer_phone: string | null;
  footer_email: string | null;
  footer_service_area: string | null;
  footer_copyright: string | null;
  footer_facebook_url: string | null;
  footer_instagram_url: string | null;
  updated_at: string | null;
};

export async function getSiteSettings(
  brandSlug: string,
): Promise<SiteSettings | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_site_settings", {
    p_brand_slug: brandSlug,
  });

  if (error) {
    console.error("[getSiteSettings]", error.message);
    return null;
  }

  // RPC returns an array; grab the first row
  const rows = data as SiteSettings[] | null;
  return rows?.[0] ?? null;
}
