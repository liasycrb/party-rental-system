-- Server-authoritative delivery pricing fields.
-- Additive only: no drops/renames. Backfill-safe — delivery_fee defaults to 0 so
-- the new NOT NULL constraint applies cleanly to existing rows. The other three
-- columns are nullable because historical bookings do not have a normalized
-- address or geocoded distance.
--
-- booking_leads gets the same shape (all nullable) for forward compatibility.
-- The current submitBookingLead() does not populate these fields; future phases
-- may. Adding the columns now keeps the two tables in lockstep.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_distance_miles numeric(6,2),
  ADD COLUMN IF NOT EXISTS delivery_normalized_address text,
  ADD COLUMN IF NOT EXISTS delivery_place_id text;

ALTER TABLE public.booking_leads
  ADD COLUMN IF NOT EXISTS delivery_fee numeric(10,2),
  ADD COLUMN IF NOT EXISTS delivery_distance_miles numeric(6,2),
  ADD COLUMN IF NOT EXISTS delivery_normalized_address text,
  ADD COLUMN IF NOT EXISTS delivery_place_id text;
