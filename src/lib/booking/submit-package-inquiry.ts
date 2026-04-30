"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BrandSlug } from "@/lib/brand/config";

export type SubmitPackageInquiryResult =
  | { ok: true }
  | { ok: false; error: string };

type SubmitPackageInquiryInput = {
  brandSlug: BrandSlug;
  packageId: string | null;
  packageTitle: string | null;
  productSlug: string | null;
  eventDate: string | null;
  customerName: string;
  phone: string;
  eventCity: string | null;
  notes: string | null;
};

function emptyToNull(s: string | null | undefined): string | null {
  if (s == null) return null;
  const t = s.trim();
  return t === "" ? null : t;
}

export async function submitPackageInquiry(
  input: SubmitPackageInquiryInput,
): Promise<SubmitPackageInquiryResult> {
  const customerName = input.customerName.trim();
  const phone = input.phone.trim();

  if (!customerName) return { ok: false, error: "Name is required." };
  if (!phone) return { ok: false, error: "Phone is required." };

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.rpc("insert_package_inquiry", {
    p_brand_slug: input.brandSlug,
    p_package_id: emptyToNull(input.packageId),
    p_package_title: emptyToNull(input.packageTitle),
    p_product_slug: emptyToNull(input.productSlug),
    p_event_date: emptyToNull(input.eventDate),
    p_customer_name: customerName,
    p_phone: phone,
    p_event_city: emptyToNull(input.eventCity),
    p_notes: emptyToNull(input.notes),
  });

  if (error) {
    console.error("[submitPackageInquiry]", error.message);
    return {
      ok: false,
      error: "Could not save your request. Please try again or call us.",
    };
  }

  return { ok: true };
}
