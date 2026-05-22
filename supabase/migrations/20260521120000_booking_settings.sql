-- Per-brand booking rules, editable from the dashboard (UI in a later phase).
-- Replaces the hardcoded MINIMUM_ORDER_AMOUNT in
-- src/components/build/build-booking-start.tsx.
-- Additive migration: does not modify bookings, booking_leads, site_settings,
-- delivery_pricing_settings, booking_blackouts, or rental_products.
--
-- Reads: anon + authenticated (the /build page reads server-side under anon).
-- Writes: SECURITY DEFINER RPC only (update_booking_settings).

CREATE TABLE IF NOT EXISTS public.booking_settings (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_slug            text NOT NULL UNIQUE CHECK (brand_slug IN ('lias', 'crb')),
  minimum_order_amount  numeric(10,2) NOT NULL DEFAULT 80
                        CHECK (minimum_order_amount >= 0),
  updated_at            timestamptz   NOT NULL DEFAULT now()
);


-- Seed both brands with the current hardcoded default so the first read after
-- deploy always returns a row. ON CONFLICT DO NOTHING keeps the migration
-- idempotent if rerun.
INSERT INTO public.booking_settings (brand_slug)
VALUES ('lias'), ('crb')
ON CONFLICT (brand_slug) DO NOTHING;


ALTER TABLE public.booking_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS booking_settings_select ON public.booking_settings;
CREATE POLICY booking_settings_select
  ON public.booking_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);


-- Public read RPC: single row for a brand.
CREATE OR REPLACE FUNCTION public.get_booking_settings(p_brand_slug text)
RETURNS TABLE (
  id                    uuid,
  brand_slug            text,
  minimum_order_amount  numeric,
  updated_at            timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT bs.id,
         bs.brand_slug,
         bs.minimum_order_amount,
         bs.updated_at
  FROM public.booking_settings bs
  WHERE bs.brand_slug = p_brand_slug
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_booking_settings(text)
  TO anon, authenticated;


-- Staff write RPC: UPSERT booking rules for a brand. Validates brand +
-- non-negative amount; mirrors the table CHECK constraints so callers get a
-- clearer error message than the bare constraint violation.
CREATE OR REPLACE FUNCTION public.update_booking_settings(
  p_brand_slug            text,
  p_minimum_order_amount  numeric
)
RETURNS TABLE (
  id                    uuid,
  brand_slug            text,
  minimum_order_amount  numeric,
  updated_at            timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
BEGIN
  IF p_brand_slug NOT IN ('lias', 'crb') THEN
    RAISE EXCEPTION 'invalid brand_slug: %', p_brand_slug;
  END IF;

  IF p_minimum_order_amount IS NULL THEN
    RAISE EXCEPTION 'minimum_order_amount is required';
  END IF;
  IF p_minimum_order_amount < 0 THEN
    RAISE EXCEPTION 'minimum_order_amount must be non-negative';
  END IF;

  INSERT INTO public.booking_settings AS bs (
    brand_slug,
    minimum_order_amount,
    updated_at
  )
  VALUES (
    p_brand_slug,
    p_minimum_order_amount,
    now()
  )
  ON CONFLICT (brand_slug) DO UPDATE
    SET minimum_order_amount = EXCLUDED.minimum_order_amount,
        updated_at           = now();

  RETURN QUERY
    SELECT bs.id,
           bs.brand_slug,
           bs.minimum_order_amount,
           bs.updated_at
    FROM public.booking_settings bs
    WHERE bs.brand_slug = p_brand_slug;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_booking_settings(text, numeric)
  TO authenticated;
