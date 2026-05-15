-- Brand-scoped vacation / blackout date ranges that block ALL new online bookings.
-- Read by anon (customer-facing /build calendar) and authenticated (dashboard).
-- Writes go through SECURITY DEFINER RPCs only (insert_booking_blackout, delete_booking_blackout).
-- Additive migration: does NOT touch bookings, booking_leads, site_settings, or rental_products.

CREATE TABLE IF NOT EXISTS public.booking_blackouts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_slug  text NOT NULL CHECK (brand_slug IN ('lias', 'crb')),
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  label       text,
  created_by  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  CONSTRAINT booking_blackouts_date_order_chk CHECK (start_date <= end_date)
);

-- Partial index supports the hot path: read active ranges for a brand.
CREATE INDEX IF NOT EXISTS booking_blackouts_brand_active_idx
  ON public.booking_blackouts (brand_slug, start_date, end_date)
  WHERE deleted_at IS NULL;


ALTER TABLE public.booking_blackouts ENABLE ROW LEVEL SECURITY;

-- SELECT policy: anon + authenticated can read only non-deleted rows directly.
-- The customer-facing /build calendar reads through the RPC below, but allowing
-- direct PostgREST reads keeps the table flexible for future dashboard listings.
DROP POLICY IF EXISTS booking_blackouts_select ON public.booking_blackouts;
CREATE POLICY booking_blackouts_select
  ON public.booking_blackouts
  FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL);

-- INSERT policy: authenticated only. (Belt-and-suspenders with the SECURITY DEFINER RPC.)
DROP POLICY IF EXISTS booking_blackouts_insert ON public.booking_blackouts;
CREATE POLICY booking_blackouts_insert
  ON public.booking_blackouts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- No direct UPDATE / DELETE policies. Soft-delete is performed exclusively
-- through the public.delete_booking_blackout RPC defined below.


-- Public read RPC: active blackout ranges for a brand, ordered by start_date.
CREATE OR REPLACE FUNCTION public.get_booking_blackouts(p_brand_slug text)
RETURNS TABLE (
  id          uuid,
  brand_slug  text,
  start_date  date,
  end_date    date,
  label       text,
  created_at  timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT bb.id,
         bb.brand_slug,
         bb.start_date,
         bb.end_date,
         bb.label,
         bb.created_at
  FROM public.booking_blackouts bb
  WHERE bb.brand_slug = p_brand_slug
    AND bb.deleted_at IS NULL
  ORDER BY bb.start_date ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_booking_blackouts(text)
  TO anon, authenticated;


-- Staff write RPC: insert a new blackout. Validates brand + date order; returns the new row.
CREATE OR REPLACE FUNCTION public.insert_booking_blackout(
  p_brand_slug text,
  p_start_date date,
  p_end_date   date,
  p_label      text DEFAULT NULL
)
RETURNS TABLE (
  id          uuid,
  brand_slug  text,
  start_date  date,
  end_date    date,
  label       text,
  created_at  timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF p_brand_slug NOT IN ('lias', 'crb') THEN
    RAISE EXCEPTION 'invalid brand_slug: %', p_brand_slug;
  END IF;

  IF p_start_date IS NULL OR p_end_date IS NULL THEN
    RAISE EXCEPTION 'start_date and end_date are required';
  END IF;

  IF p_start_date > p_end_date THEN
    RAISE EXCEPTION 'start_date must be on or before end_date';
  END IF;

  INSERT INTO public.booking_blackouts (
    brand_slug,
    start_date,
    end_date,
    label
  )
  VALUES (
    p_brand_slug,
    p_start_date,
    p_end_date,
    p_label
  )
  RETURNING booking_blackouts.id INTO v_id;

  RETURN QUERY
    SELECT bb.id,
           bb.brand_slug,
           bb.start_date,
           bb.end_date,
           bb.label,
           bb.created_at
    FROM public.booking_blackouts bb
    WHERE bb.id = v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.insert_booking_blackout(text, date, date, text)
  TO authenticated;


-- Staff write RPC: soft-delete by setting deleted_at. Returns true if a row was updated.
CREATE OR REPLACE FUNCTION public.delete_booking_blackout(p_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.booking_blackouts
  SET deleted_at = now()
  WHERE id = p_id
    AND deleted_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_booking_blackout(uuid)
  TO authenticated;
