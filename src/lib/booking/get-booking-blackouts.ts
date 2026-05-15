import { createSupabaseServerClient } from "@/lib/supabase/server";
import { addDaysUTC } from "@/lib/utils/date";

export type BookingBlackoutRange = {
  id: string;
  brand_slug: string;
  start_date: string;
  end_date: string;
  label: string | null;
  created_at: string | null;
};

/** Active (non-deleted) blackout ranges for a brand, ordered by start_date asc. */
export async function getBookingBlackouts(
  brandSlug: string,
): Promise<BookingBlackoutRange[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_booking_blackouts", {
    p_brand_slug: brandSlug,
  });

  if (error) {
    console.error("[getBookingBlackouts]", error.message);
    return [];
  }

  return (data ?? []) as BookingBlackoutRange[];
}

/** True if the given ISO YYYY-MM-DD falls within any blackout range (inclusive on both ends). */
export function isDateInBlackout(
  eventDate: string,
  ranges: BookingBlackoutRange[],
): boolean {
  if (!eventDate || !ranges?.length) return false;
  for (const r of ranges) {
    if (!r.start_date || !r.end_date) continue;
    if (eventDate >= r.start_date && eventDate <= r.end_date) return true;
  }
  return false;
}

/**
 * Expand each blackout range into its constituent ISO dates (inclusive).
 * No 3-day buffer is applied — blackouts are absolute closed-business dates.
 */
export function enumerateBlackoutDates(
  ranges: BookingBlackoutRange[],
): string[] {
  const out: string[] = [];
  for (const r of ranges) {
    if (!r.start_date || !r.end_date) continue;
    if (r.start_date > r.end_date) continue;
    let d = r.start_date;
    while (d <= r.end_date) {
      out.push(d);
      d = addDaysUTC(d, 1);
    }
  }
  return out;
}
