-- Stabilize upsell ordering by sort_order, then name.
-- Replaces the prior ORDER BY (category_slug, name) so dashboard-controlled
-- sort_order wins, with name as a deterministic tiebreaker when sort_order is 0.
CREATE OR REPLACE FUNCTION public.get_upsell_rental_products_for_brand(p_brand_slug text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  category_slug text,
  image_src text,
  price numeric,
  price_from numeric,
  short_description text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rp.id::uuid,
         rp.name,
         rp.slug,
         rp.category_slug,
         rp.image_src,
         rp.price::numeric,
         rp.price_from::numeric,
         rp.short_description
  FROM public.rental_products rp
  WHERE rp.is_active = true
    AND rp.is_upsell = true
    AND p_brand_slug = ANY(rp.brand_slugs)
  ORDER BY rp.sort_order ASC NULLS LAST, rp.name ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_upsell_rental_products_for_brand(text)
  TO anon, authenticated;
