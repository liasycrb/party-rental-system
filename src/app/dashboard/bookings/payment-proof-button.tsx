"use client";

import { useState } from "react";
import { getPaymentProofSignedUrl } from "@/lib/booking/get-payment-proof-signed-url";

type PaymentProofButtonProps = {
  bookingId: string;
};

export function PaymentProofButton({ bookingId }: PaymentProofButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onViewReceipt() {
    setErrorMessage(null);
    setLoading(true);
    try {
      const result = await getPaymentProofSignedUrl(bookingId);
      if (!result.ok) {
        setErrorMessage(result.error);
        return;
      }
      window.open(result.url, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {errorMessage ? (
        <p className="text-sm text-red-300">{errorMessage}</p>
      ) : null}
      <button
        type="button"
        disabled={loading}
        onClick={() => void onViewReceipt()}
        className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:pointer-events-none disabled:opacity-60"
      >
        {loading ? "Opening…" : "View receipt"}
      </button>
    </div>
  );
}
