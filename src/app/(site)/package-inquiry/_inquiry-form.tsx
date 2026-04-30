"use client";

import { useState, useTransition } from "react";
import { submitPackageInquiry } from "@/lib/booking/submit-package-inquiry";
import type { BrandSlug } from "@/lib/brand/config";

type Props = {
  brandSlug: BrandSlug;
  packageId: string | null;
  packageTitle: string | null;
  productSlug: string | null;
};

export function InquiryForm({ brandSlug, packageId, packageTitle, productSlug }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (submitted) {
    return (
      <p className="rounded border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
        We received your request. We&apos;ll contact you shortly.
      </p>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await submitPackageInquiry({
        brandSlug,
        packageId,
        packageTitle,
        productSlug,
        eventDate: (fd.get("event_date") as string | null)?.trim() || null,
        customerName: (fd.get("customer_name") as string) ?? "",
        phone: (fd.get("phone") as string) ?? "",
        eventCity: (fd.get("event_city") as string | null)?.trim() || null,
        notes: null,
      });

      if (result.ok) {
        setSubmitted(true);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Event date
        </label>
        <input
          name="event_date"
          type="date"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Your name <span className="text-red-500">*</span>
        </label>
        <input
          name="customer_name"
          required
          type="text"
          placeholder="Full name"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Phone <span className="text-red-500">*</span>
        </label>
        <input
          name="phone"
          required
          type="tel"
          placeholder="(951) 555-0100"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          City (optional)
        </label>
        <input
          name="event_city"
          type="text"
          placeholder="e.g. Moreno Valley"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
