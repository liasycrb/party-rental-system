"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { addDaysUTC } from "@/lib/utils/date";

export async function getBookedDates(productSlug: string): Promise<string[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("event_date")
    .eq("product_slug", productSlug)
    .in("status", ["pending_confirmation", "confirmed"]);

  if (error) {
    console.error("[getBookedDates]", error.message);
    return [];
  }

  // 3-day window: each booked date D also blocks D-1 and D+1.
  const out: string[] = [];
  for (const row of data ?? []) {
    const d = row.event_date as string | null;
    if (!d) continue;
    out.push(addDaysUTC(d, -1), d, addDaysUTC(d, 1));
  }
  return out;
}
