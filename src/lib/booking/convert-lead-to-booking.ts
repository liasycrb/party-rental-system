"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BrandSlug } from "@/lib/brand/config";

export type BookingItem = {
  label: string;
  slug?: string;
  qty: number;
};

export type ConvertLeadInput = {
  brandSlug: BrandSlug;
  categorySlug: string | null;
  productSlug: string | null;
  eventDate: string | null;
  eventCity: string | null;
  customerName: string;
  phone: string;
  notes: string | null;
  quantity: number;
  subtotal: number;
  depositAmount: number;
  balanceDue: number;
  leadId: string;
  items: BookingItem[];
};

export async function convertLeadToBooking(input: ConvertLeadInput): Promise<string> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc("insert_staff_booking", {
    p_brand_slug:     input.brandSlug,
    p_category_slug:  input.categorySlug ?? null,
    p_product_slug:   input.productSlug ?? null,
    p_event_date:     input.eventDate ?? null,
    p_event_city:     input.eventCity ?? null,
    p_customer_name:  input.customerName,
    p_phone:          input.phone,
    p_notes:          input.notes ?? null,
    p_quantity:       Math.max(1, Math.floor(input.quantity) || 1),
    p_subtotal:       input.subtotal,
    p_deposit_amount: input.depositAmount,
    p_balance_due:    input.balanceDue,
    p_lead_id:        input.leadId,
    p_items:          input.items.length > 0 ? input.items : null,
  });

  if (error) {
    throw new Error(`[convertLeadToBooking] ${error.message}`);
  }

  const bookingId = data as string | null;
  if (!bookingId) {
    throw new Error("[convertLeadToBooking] RPC returned no booking id.");
  }

  return bookingId;
}
