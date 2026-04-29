"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DashboardBookingActionResult =
  | { ok: true }
  | { ok: false; error: string };

const VALID_OPERATIONAL_STATUSES = [
  "needs_review",
  "ready_for_delivery",
  "out_for_delivery",
  "delivered",
  "picked_up",
  "completed",
] as const;

export async function updateOperationalStatus(
  id: string,
  operationalStatus: string,
): Promise<DashboardBookingActionResult> {
  const bookingId = id?.trim();
  if (!bookingId) {
    return { ok: false, error: "Missing booking id." };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const normalized = operationalStatus?.trim() ?? "";
  if (normalized && !(VALID_OPERATIONAL_STATUSES as readonly string[]).includes(normalized)) {
    return { ok: false, error: "Invalid operational status value." };
  }

  const supabase = await createSupabaseServerClient();

  const { data: row, error: fetchError } = await supabase
    .from("bookings")
    .select("id, status, source")
    .eq("id", bookingId)
    .maybeSingle();

  if (fetchError) {
    console.error("[updateOperationalStatus]", fetchError.message);
    return { ok: false, error: fetchError.message };
  }
  if (!row) {
    return { ok: false, error: "Booking not found." };
  }
  if (row.source !== "online_reservation") {
    return { ok: false, error: "This action only applies to online reservations." };
  }
  if (row.status === "cancelled") {
    return { ok: false, error: "Cannot update operational status of a cancelled booking." };
  }

  const { error: rpcError } = await supabase.rpc("update_booking_operational_status", {
    p_booking_id: bookingId,
    p_status: normalized || null,
  });

  if (rpcError) {
    console.error("[updateOperationalStatus] rpc", rpcError.message);
    return { ok: false, error: rpcError.message };
  }

  return { ok: true };
}

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
