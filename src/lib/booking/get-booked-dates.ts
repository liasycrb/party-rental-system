"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  return (data ?? [])
    .map((r) => r.event_date as string | null)
    .filter((d): d is string => Boolean(d));
}
