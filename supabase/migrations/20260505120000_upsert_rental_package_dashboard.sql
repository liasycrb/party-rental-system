-- Dashboard RPC: insert (p_id IS NULL) or update (p_id set) a row in public.rental_packages.
-- Prerequisite: public.rental_packages must exist with columns matching app usage
-- (see RentalPackage in src/lib/marketing/get-rental-packages.ts). This repo has no
-- historical migration creating rental_packages; apply only if that table is present.

CREATE OR REPLACE FUNCTION public.upsert_rental_package_dashboard(
  p_id uuid,
  p_title text,
  p_tagline text,
  p_badge text,
  p_from_price numeric,
  p_image_src text,
  p_primary_product_slug text,
  p_includes text[],
  p_brand_slugs text[],
  p_sort_order integer,
  p_is_active boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF p_id IS NULL THEN
    INSERT INTO public.rental_packages (
      title,
      tagline,
      badge,
      from_price,
      image_src,
      primary_product_slug,
      includes,
      brand_slugs,
      sort_order,
      is_active
    )
    VALUES (
      p_title,
      p_tagline,
      p_badge,
      p_from_price,
      p_image_src,
      p_primary_product_slug,
      p_includes,
      p_brand_slugs,
      p_sort_order,
      p_is_active
    )
    RETURNING id INTO v_id;

    RETURN v_id;
  END IF;

  UPDATE public.rental_packages
  SET
    title = p_title,
    tagline = p_tagline,
    badge = p_badge,
    from_price = p_from_price,
    image_src = p_image_src,
    primary_product_slug = p_primary_product_slug,
    includes = p_includes,
    brand_slugs = p_brand_slugs,
    sort_order = p_sort_order,
    is_active = p_is_active
  WHERE id = p_id
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'rental_packages row not found for id %', p_id;
  END IF;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_rental_package_dashboard(
  uuid,
  text,
  text,
  text,
  numeric,
  text,
  text,
  text[],
  text[],
  integer,
  boolean
) TO authenticated;
