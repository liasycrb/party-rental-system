-- Per-brand delivery pricing settings, editable from the dashboard (UI in a later phase).
-- Replaces hardcoded constants in src/lib/delivery/calculate-delivery-fee.ts.
-- Additive migration: does not modify bookings, booking_leads, site_settings,
-- booking_blackouts, or rental_products.
--
-- Reads: anon + authenticated (helper runs server-side under the anon key).
-- Writes: SECURITY DEFINER RPC only (update_delivery_pricing_settings).

CREATE TABLE IF NOT EXISTS public.delivery_pricing_settings (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_slug          text NOT NULL UNIQUE CHECK (brand_slug IN ('lias', 'crb')),
  free_city           text NOT NULL DEFAULT 'Moreno Valley',
  near_rate_per_mile  numeric(6,2) NOT NULL DEFAULT 5,
  mid_rate_per_mile   numeric(6,2) NOT NULL DEFAULT 8,
  far_rate_per_mile   numeric(6,2) NOT NULL DEFAULT 15,
  near_max_miles      numeric(5,1) NOT NULL DEFAULT 9,
  mid_max_miles       numeric(5,1) NOT NULL DEFAULT 20,
  max_service_miles   numeric(5,1) NOT NULL DEFAULT 40,
  updated_at          timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT delivery_pricing_settings_rates_nonneg_chk CHECK (
    near_rate_per_mile >= 0
    AND mid_rate_per_mile >= 0
    AND far_rate_per_mile >= 0
  ),
  CONSTRAINT delivery_pricing_settings_tier_order_chk CHECK (
    near_max_miles > 0
    AND near_max_miles < mid_max_miles
    AND mid_max_miles <= max_service_miles
  )
);


-- Seed both brands with the current hardcoded defaults so the first read after
-- deploy always returns a row. ON CONFLICT DO NOTHING keeps the migration
-- idempotent if rerun.
INSERT INTO public.delivery_pricing_settings (brand_slug)
VALUES ('lias'), ('crb')
ON CONFLICT (brand_slug) DO NOTHING;


ALTER TABLE public.delivery_pricing_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS delivery_pricing_settings_select ON public.delivery_pricing_settings;
CREATE POLICY delivery_pricing_settings_select
  ON public.delivery_pricing_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);


-- Public read RPC: single row for a brand.
CREATE OR REPLACE FUNCTION public.get_delivery_pricing_settings(p_brand_slug text)
RETURNS TABLE (
  id                  uuid,
  brand_slug          text,
  free_city           text,
  near_rate_per_mile  numeric,
  mid_rate_per_mile   numeric,
  far_rate_per_mile   numeric,
  near_max_miles      numeric,
  mid_max_miles       numeric,
  max_service_miles   numeric,
  updated_at          timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT dps.id,
         dps.brand_slug,
         dps.free_city,
         dps.near_rate_per_mile,
         dps.mid_rate_per_mile,
         dps.far_rate_per_mile,
         dps.near_max_miles,
         dps.mid_max_miles,
         dps.max_service_miles,
         dps.updated_at
  FROM public.delivery_pricing_settings dps
  WHERE dps.brand_slug = p_brand_slug
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_delivery_pricing_settings(text)
  TO anon, authenticated;


-- Staff write RPC: UPSERT pricing for a brand. Validates brand + tier ordering
-- + non-negative rates; mirrors the table CHECK constraints so callers get a
-- clearer error message than the bare constraint violation.
CREATE OR REPLACE FUNCTION public.update_delivery_pricing_settings(
  p_brand_slug   text,
  p_free_city    text,
  p_near_rate    numeric,
  p_mid_rate     numeric,
  p_far_rate     numeric,
  p_near_max     numeric,
  p_mid_max      numeric,
  p_max_service  numeric
)
RETURNS TABLE (
  id                  uuid,
  brand_slug          text,
  free_city           text,
  near_rate_per_mile  numeric,
  mid_rate_per_mile   numeric,
  far_rate_per_mile   numeric,
  near_max_miles      numeric,
  mid_max_miles       numeric,
  max_service_miles   numeric,
  updated_at          timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_free_city text;
BEGIN
  IF p_brand_slug NOT IN ('lias', 'crb') THEN
    RAISE EXCEPTION 'invalid brand_slug: %', p_brand_slug;
  END IF;

  v_free_city := COALESCE(NULLIF(btrim(p_free_city), ''), 'Moreno Valley');

  IF p_near_rate IS NULL OR p_mid_rate IS NULL OR p_far_rate IS NULL THEN
    RAISE EXCEPTION 'rate values are required';
  END IF;
  IF p_near_rate < 0 OR p_mid_rate < 0 OR p_far_rate < 0 THEN
    RAISE EXCEPTION 'rates must be non-negative';
  END IF;

  IF p_near_max IS NULL OR p_mid_max IS NULL OR p_max_service IS NULL THEN
    RAISE EXCEPTION 'mile thresholds are required';
  END IF;
  IF p_near_max <= 0 THEN
    RAISE EXCEPTION 'near_max_miles must be > 0';
  END IF;
  IF p_near_max >= p_mid_max THEN
    RAISE EXCEPTION 'near_max_miles must be < mid_max_miles';
  END IF;
  IF p_mid_max > p_max_service THEN
    RAISE EXCEPTION 'mid_max_miles must be <= max_service_miles';
  END IF;

  INSERT INTO public.delivery_pricing_settings AS dps (
    brand_slug,
    free_city,
    near_rate_per_mile,
    mid_rate_per_mile,
    far_rate_per_mile,
    near_max_miles,
    mid_max_miles,
    max_service_miles,
    updated_at
  )
  VALUES (
    p_brand_slug,
    v_free_city,
    p_near_rate,
    p_mid_rate,
    p_far_rate,
    p_near_max,
    p_mid_max,
    p_max_service,
    now()
  )
  ON CONFLICT (brand_slug) DO UPDATE
    SET free_city          = EXCLUDED.free_city,
        near_rate_per_mile = EXCLUDED.near_rate_per_mile,
        mid_rate_per_mile  = EXCLUDED.mid_rate_per_mile,
        far_rate_per_mile  = EXCLUDED.far_rate_per_mile,
        near_max_miles     = EXCLUDED.near_max_miles,
        mid_max_miles      = EXCLUDED.mid_max_miles,
        max_service_miles  = EXCLUDED.max_service_miles,
        updated_at         = now();

  RETURN QUERY
    SELECT dps.id,
           dps.brand_slug,
           dps.free_city,
           dps.near_rate_per_mile,
           dps.mid_rate_per_mile,
           dps.far_rate_per_mile,
           dps.near_max_miles,
           dps.mid_max_miles,
           dps.max_service_miles,
           dps.updated_at
    FROM public.delivery_pricing_settings dps
    WHERE dps.brand_slug = p_brand_slug;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_delivery_pricing_settings(
  text, text, numeric, numeric, numeric, numeric, numeric, numeric
) TO authenticated;
