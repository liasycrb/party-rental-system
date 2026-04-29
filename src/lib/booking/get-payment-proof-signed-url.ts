"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const BUCKET = "payment-proofs";

export type GetPaymentProofSignedUrlResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function getPaymentProofSignedUrl(
  bookingId: string,
): Promise<GetPaymentProofSignedUrlResult> {
  const id = bookingId?.trim();
  if (!id) {
    return { ok: false, error: "Missing booking." };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { ok: false, error: "Storage is not configured." };
  }

  const supabase = await createSupabaseServerClient();

  const { data: row, error: fetchError } = await supabase
    .from("bookings")
    .select("payment_proof_path")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return { ok: false, error: fetchError.message };
  }
  if (!row?.payment_proof_path?.trim()) {
    return { ok: false, error: "No receipt uploaded for this reservation." };
  }

  const fullPath = row.payment_proof_path.trim();
  const prefix = `${BUCKET}/`;
  if (!fullPath.startsWith(prefix)) {
    return { ok: false, error: "Receipt could not be opened." };
  }
  const objectPath = fullPath.slice(prefix.length);
  if (!objectPath) {
    return { ok: false, error: "Receipt could not be opened." };
  }

  const { data, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(objectPath, 60 * 60);

  if (signError || !data?.signedUrl) {
    return {
      ok: false,
      error: signError?.message ?? "Could not create a secure link to the receipt.",
    };
  }

  return { ok: true, url: data.signedUrl };
}
