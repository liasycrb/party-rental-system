"use server";

import type { BrandSlug } from "@/lib/brand/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendOwnerSms } from "@/lib/notifications/send-owner-sms";

export type CreateOnlineBookingAddons = {
  tables: number;
  chairs: number;
  canopy: number;
  generator: number;
  extraJumper: number;
};

export type CreateOnlineBookingInput = {
  brandSlug: BrandSlug;
  categorySlug: string | null;
  productSlug: string | null;
  eventDate: string | null;
  eventCity: string | null;
  customerName: string;
  phone: string;
  notes: string | null;
  quantity: number;
  addons: CreateOnlineBookingAddons;
  eventTimeWindow: string;
  deliveryWindow: string;
  pickupWindow: string;
  subtotal: number;
  depositAmount: number;
  balanceDue: number;
  paymentProofPath: string;
};

export type CreateOnlineBookingResult =
  | { ok: true; bookingId: string | null }
  | { ok: false; error: string };

function emptyToNull(s: string | null | undefined): string | null {
  if (s == null) return null;
  const t = s.trim();
  return t === "" ? null : t;
}

export async function createOnlineBooking(
  input: CreateOnlineBookingInput,
): Promise<CreateOnlineBookingResult> {
  if (input.brandSlug !== "lias" && input.brandSlug !== "crb") {
    return { ok: false, error: "Invalid request." };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      ok: false,
      error:
        "We can't complete your booking online right now. Please call us to book.",
    };
  }

  const customerName = input.customerName.trim();
  const phone = input.phone.trim();
  if (!customerName) {
    return { ok: false, error: "Name is required." };
  }
  if (!phone) {
    return { ok: false, error: "Phone is required." };
  }

  const paymentProofPath = input.paymentProofPath.trim();
  if (!paymentProofPath) {
    return { ok: false, error: "Payment proof path is required." };
  }

  const supabase = await createSupabaseServerClient();

  const payload = {
    brand_slug: input.brandSlug,
    category_slug: emptyToNull(input.categorySlug ?? undefined),
    product_slug: emptyToNull(input.productSlug ?? undefined),
    event_date: emptyToNull(input.eventDate ?? undefined),
    event_city: emptyToNull(input.eventCity ?? undefined),
    customer_name: customerName,
    phone,
    notes: emptyToNull(input.notes),
    quantity: Math.max(1, Math.floor(Number(input.quantity)) || 1),
    addons: input.addons,
    event_time_window: emptyToNull(input.eventTimeWindow),
    delivery_window: emptyToNull(input.deliveryWindow),
    pickup_window: emptyToNull(input.pickupWindow),
    subtotal: input.subtotal,
    deposit_amount: input.depositAmount,
    balance_due: input.balanceDue,
    payment_proof_path: paymentProofPath,
    status: "pending_confirmation" as const,
    payment_status: "deposit_paid" as const,
    source: "online_reservation" as const,
  };

  const { data: inserted, error } = await supabase
    .from("bookings")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    console.error("[createOnlineBooking]", error.message);
    return { ok: false, error: error.message };
  }

  const bookingId: string | null = inserted?.id ?? null;

  const dashboardLine = bookingId
    ? `Dashboard: ${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/dashboard/bookings/${bookingId}`
    : "";

  const smsLines = [
    `🎉 New reservation — ${input.brandSlug.toUpperCase()}`,
    `Product: ${input.productSlug ?? "—"}`,
    `Date: ${input.eventDate ?? "—"}`,
    `City: ${input.eventCity ?? "—"}`,
    `Customer: ${customerName}`,
    `Phone: ${phone}`,
    `Deposit: $${input.depositAmount}`,
    dashboardLine,
  ].filter(Boolean).join("\n");

  void sendOwnerSms(smsLines);

  return { ok: true, bookingId };
}
