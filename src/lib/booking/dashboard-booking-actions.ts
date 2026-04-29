"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DashboardBookingActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function confirmBooking(id: string): Promise<DashboardBookingActionResult> {
  const bookingId = id?.trim();
  if (!bookingId) {
    return { ok: false, error: "Missing booking id." };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const supabase = await createSupabaseServerClient();

  const { data: row, error: fetchError } = await supabase
    .from("bookings")
    .select("id, status, source")
    .eq("id", bookingId)
    .maybeSingle();

  if (fetchError) {
    console.error("[confirmBooking]", fetchError.message);
    return { ok: false, error: fetchError.message };
  }
  if (!row) {
    return { ok: false, error: "Booking not found." };
  }
  if (row.source !== "online_reservation") {
    return { ok: false, error: "This action only applies to online reservations." };
  }
  if (row.status !== "pending_confirmation") {
    return { ok: false, error: "Only pending reservations can be confirmed." };
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", bookingId);

  if (updateError) {
    console.error("[confirmBooking] update", updateError.message);
    return { ok: false, error: updateError.message };
  }

  return { ok: true };
}

export async function cancelBooking(id: string): Promise<DashboardBookingActionResult> {
  const bookingId = id?.trim();
  if (!bookingId) {
    return { ok: false, error: "Missing booking id." };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const supabase = await createSupabaseServerClient();

  const { data: row, error: fetchError } = await supabase
    .from("bookings")
    .select("id, status, source")
    .eq("id", bookingId)
    .maybeSingle();

  if (fetchError) {
    console.error("[cancelBooking]", fetchError.message);
    return { ok: false, error: fetchError.message };
  }
  if (!row) {
    return { ok: false, error: "Booking not found." };
  }
  if (row.source !== "online_reservation") {
    return { ok: false, error: "This action only applies to online reservations." };
  }
  if (row.status !== "pending_confirmation" && row.status !== "confirmed") {
    return { ok: false, error: "Only pending or confirmed reservations can be cancelled." };
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);

  if (updateError) {
    console.error("[cancelBooking] update", updateError.message);
    return { ok: false, error: updateError.message };
  }

  return { ok: true };
}
