"use server";

import { headers } from "next/headers";
import type { BrandSlug } from "@/lib/brand/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const BOOKING_LEAD_TERMS_VERSION = "v1.0";

async function clientIpFromHeaders(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = h.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

function buildAgreementLogNotes(input: {
  signature: string;
  ip: string;
  at: string;
  termsVersion: string;
}): string {
  return [
    "Agreement:",
    "Accepted: Yes",
    `Accepted by: ${input.signature}`,
    `Timestamp: ${input.at}`,
    `IP: ${input.ip}`,
    `Terms version: ${input.termsVersion}`,
  ].join("\n");
}

export type SubmitBookingLeadResult =
  | { ok: true }
  | { ok: false; error: string };

type SubmitBookingLeadInput = {
  brandSlug: BrandSlug;
  categorySlug: string | null;
  productSlug: string | null;
  eventDate: string | null;
  customerName: string;
  phone: string;
  eventCity: string | null;
  notes: string | null;
  agreementSignature: string;
};

function emptyToNull(s: string | null | undefined): string | null {
  if (s == null) return null;
  const t = s.trim();
  return t === "" ? null : t;
}

export async function submitBookingLead(
  input: SubmitBookingLeadInput,
): Promise<SubmitBookingLeadResult> {
  if (input.brandSlug !== "lias" && input.brandSlug !== "crb") {
    return { ok: false, error: "Invalid request." };
  }

  const customerName = input.customerName.trim();
  const phone = input.phone.trim();
  if (!customerName) {
    return { ok: false, error: "Name is required." };
  }
  if (!phone) {
    return { ok: false, error: "Phone is required." };
  }

  const agreementSignature = input.agreementSignature.trim();
  if (!agreementSignature) {
    return {
      ok: false,
      error: "Please type your full name to accept the rental agreement.",
    };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      ok: false,
      error:
        "We can’t save your request online right now. Please call us to book.",
    };
  }

  const supabase = await createSupabaseServerClient();

  const loggedAt = new Date().toISOString();
  const requestIp = await clientIpFromHeaders();
  const agreementAppendix = buildAgreementLogNotes({
    signature: agreementSignature,
    ip: requestIp,
    at: loggedAt,
    termsVersion: BOOKING_LEAD_TERMS_VERSION,
  });
  const baseNotes = emptyToNull(input.notes);
  const notesForInsert =
    baseNotes == null ? agreementAppendix : `${baseNotes}\n\n${agreementAppendix}`;

  const payload = {
    brand_slug: input.brandSlug,
    category_slug: emptyToNull(input.categorySlug ?? undefined),
    product_slug: emptyToNull(input.productSlug ?? undefined),
    event_date: emptyToNull(input.eventDate ?? undefined),
    customer_name: customerName,
    phone,
    event_city: emptyToNull(input.eventCity ?? undefined),
    notes: notesForInsert,
    status: "new" as const,
    source: "website" as const,
  };

  const { error } = await supabase.from("booking_leads").insert(payload);

  if (error) {
    console.error("[submitBookingLead]", error.message);
    return {
      ok: false,
      error: "We couldn’t save your request. Please try again or call us.",
    };
  }

  return { ok: true };
}
