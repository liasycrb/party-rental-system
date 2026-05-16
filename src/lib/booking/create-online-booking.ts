"use server";

import type { BrandSlug } from "@/lib/brand/config";
import type { UpsellSelection } from "./upsell-selection";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendOwnerSms } from "@/lib/notifications/send-owner-sms";
import { calculateDeliveryFee } from "@/lib/delivery/calculate-delivery-fee";

export type { UpsellSelection } from "./upsell-selection";

export type CreateOnlineBookingAddons = {
  tables: number;
  chairs: number;
  canopy: number;
  generator: number;
  extraJumper: number;
  upsellSelections?: UpsellSelection[];
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
  /** Items-only subtotal (main product + upsells). Server adds delivery_fee on top. */
  subtotal: number;
  /** Customer-entered delivery address. Server re-geocodes for authoritative fee. */
  deliveryAddress: string;
  paymentProofPath: string;
};

export type CreateOnlineBookingResult =
  | { ok: true; bookingId: string | null }
  | { ok: false; error: string };

/** Fixed $50 deposit, capped by total. Mirrors client computeReservationPricing. */
const FIXED_DEPOSIT_AMOUNT = 50;

function emptyToNull(s: string | null | undefined): string | null {
  if (s == null) return null;
  const t = s.trim();
  return t === "" ? null : t;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
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

  const deliveryAddress = input.deliveryAddress.trim();
  if (!deliveryAddress) {
    return { ok: false, error: "Delivery address is required." };
  }

  // Authoritative delivery pricing — never trust client-supplied delivery fee.
  // Block submission on any non-ok outcome so we never commit to inaccurate
  // pricing. The customer is friendlier-served by a clear "please call" than
  // by a silent $0 fee that surfaces at delivery.
  const deliveryQuote = await calculateDeliveryFee({
    brandSlug: input.brandSlug,
    customerAddress: deliveryAddress,
    customerCity: input.eventCity,
  });

  if (!deliveryQuote.ok) {
    if (deliveryQuote.reason === "outside_service_area") {
      return {
        ok: false,
        error:
          "Your address is outside our delivery area. Please call us to discuss options.",
      };
    }
    console.error(
      "[createOnlineBooking] delivery quote failed:",
      deliveryQuote.reason,
      deliveryQuote.message,
    );
    return {
      ok: false,
      error:
        "We couldn't confirm delivery pricing for that address. Please double-check the address or call us to book.",
    };
  }

  // Server-side pricing. Trust the client item subtotal (main product + upsells)
  // — recomputing it server-side would require porting all product/upsell price
  // lookups, which is out of Phase 3 scope. The authoritative number we control
  // is delivery_fee, and balance_due now reflects items + delivery − deposit.
  const itemSubtotal = round2(Number(input.subtotal) || 0);
  const deliveryFee = round2(deliveryQuote.deliveryFee);
  const grandTotal = round2(itemSubtotal + deliveryFee);
  const depositAmount = round2(Math.min(grandTotal, FIXED_DEPOSIT_AMOUNT));
  const balanceDue = round2(grandTotal - depositAmount);

  const supabase = await createSupabaseServerClient();

  // event_city is now authoritative from the geocoder (the customer no longer
  // picks a city). Fall back to the client-provided string only if Google
  // returned no locality, which is rare.
  const eventCity =
    emptyToNull(deliveryQuote.locality ?? undefined) ??
    emptyToNull(input.eventCity ?? undefined);

  const payload = {
    brand_slug: input.brandSlug,
    category_slug: emptyToNull(input.categorySlug ?? undefined),
    product_slug: emptyToNull(input.productSlug ?? undefined),
    event_date: emptyToNull(input.eventDate ?? undefined),
    event_city: eventCity,
    customer_name: customerName,
    phone,
    notes: emptyToNull(input.notes),
    quantity: Math.max(1, Math.floor(Number(input.quantity)) || 1),
    addons: input.addons,
    event_time_window: emptyToNull(input.eventTimeWindow),
    delivery_window: emptyToNull(input.deliveryWindow),
    pickup_window: emptyToNull(input.pickupWindow),
    subtotal: itemSubtotal,
    deposit_amount: depositAmount,
    balance_due: balanceDue,
    delivery_fee: deliveryFee,
    delivery_distance_miles: deliveryQuote.distanceMiles,
    delivery_normalized_address: deliveryQuote.normalizedAddress,
    delivery_place_id: deliveryQuote.placeId,
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
    `City: ${eventCity ?? "—"}`,
    `Delivery: ${deliveryQuote.isFreeCity ? "Free" : `$${deliveryFee} (${deliveryQuote.distanceMiles} mi)`}`,
    `Customer: ${customerName}`,
    `Phone: ${phone}`,
    `Deposit: $${depositAmount}`,
    dashboardLine,
  ].filter(Boolean).join("\n");

  void sendOwnerSms(smsLines);

  return { ok: true, bookingId };
}
