-- Upsell/add-on SKUs flagged in dashboard; surfaced only in /build add-ons step.
ALTER TABLE public.rental_products
ADD COLUMN IF NOT EXISTS is_upsell boolean NOT NULL DEFAULT false;

-- Public RPC: active upsell SKUs visible to anon (matching brand_slugs).
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
  ORDER BY rp.category_slug ASC NULLS LAST, rp.name ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_upsell_rental_products_for_brand(text)
  TO anon, authenticated;
