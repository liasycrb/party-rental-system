"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { convertLeadToBooking, type BookingItem } from "@/lib/booking/convert-lead-to-booking";
import type { BrandSlug } from "@/lib/brand/config";

type ItemRow = BookingItem & { _key: number };

type Props = {
  leadId: string;
  brandSlug: BrandSlug;
  categorySlug: string | null;
  productSlug: string | null;
  packageTitle: string | null;
  eventDate: string | null;
  eventCity: string | null;
  customerName: string;
  phone: string;
  notes: string | null;
};

const inputClass =
  "w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-400";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500";

export function ConvertForm(props: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const keyRef = useRef(1);

  const initialLabel =
    props.packageTitle || props.productSlug || "Rental item";

  const [items, setItems] = useState<ItemRow[]>([
    { _key: 0, label: initialLabel, slug: props.productSlug ?? "", qty: 1 },
  ]);

  const [subtotal, setSubtotal] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const balanceDue = Math.max(0, subtotal - depositAmount);

  function addItem() {
    setItems((prev) => [
      ...prev,
      { _key: keyRef.current++, label: "", slug: "", qty: 1 },
    ]);
  }

  function removeItem(key: number) {
    setItems((prev) => prev.filter((r) => r._key !== key));
  }

  function updateItem(key: number, patch: Partial<Omit<ItemRow, "_key">>) {
    setItems((prev) =>
      prev.map((r) => (r._key === key ? { ...r, ...patch } : r)),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validItems = items.filter((r) => r.label.trim());
    if (validItems.length === 0) {
      setError("At least one item with a label is required.");
      return;
    }

    const first = validItems[0];
    const productSlug = first.slug?.trim() || props.productSlug || null;
    const quantity = first.qty ?? 1;

    startTransition(async () => {
      try {
        const bookingId = await convertLeadToBooking({
          brandSlug: props.brandSlug,
          categorySlug: props.categorySlug,
          productSlug,
          eventDate: props.eventDate,
          eventCity: props.eventCity,
          customerName: props.customerName,
          phone: props.phone,
          notes: props.notes,
          quantity,
          subtotal,
          depositAmount,
          balanceDue,
          leadId: props.leadId,
          items: validItems.map(({ label, slug, qty }) => ({
            label: label.trim(),
            slug: slug?.trim() || undefined,
            qty,
          })),
        });
        router.push(`/dashboard/bookings/${bookingId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Item rows */}
      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_160px_60px_32px] gap-2">
          <span className={labelClass}>Item label</span>
          <span className={labelClass}>Slug (optional)</span>
          <span className={labelClass}>Qty</span>
          <span />
        </div>

        {items.map((row, i) => (
          <div key={row._key} className="grid grid-cols-[1fr_160px_60px_32px] gap-2 items-center">
            <input
              value={row.label}
              onChange={(e) => updateItem(row._key, { label: e.target.value })}
              placeholder="e.g. 13x13 Regular Jumper"
              className={inputClass}
            />
            <input
              value={row.slug}
              onChange={(e) => updateItem(row._key, { slug: e.target.value })}
              placeholder="slug"
              className={inputClass}
            />
            <input
              type="number"
              min={1}
              value={row.qty}
              onChange={(e) =>
                updateItem(row._key, { qty: Math.max(1, Number(e.target.value)) })
              }
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => removeItem(row._key)}
              disabled={items.length === 1}
              className="flex h-8 w-8 items-center justify-center rounded text-zinc-500 hover:text-red-400 disabled:opacity-30"
              aria-label={`Remove item ${i + 1}`}
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="mt-1 text-xs font-semibold text-violet-400 hover:text-violet-300"
        >
          + Add item
        </button>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className={labelClass}>Subtotal ($)</label>
          <input
            type="number"
            min={0}
            step={1}
            value={subtotal}
            onChange={(e) => setSubtotal(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Deposit ($)</label>
          <input
            type="number"
            min={0}
            step={1}
            value={depositAmount}
            onChange={(e) => setDepositAmount(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Balance due ($)</label>
          <input
            readOnly
            value={balanceDue}
            className={`${inputClass} opacity-60`}
          />
        </div>
      </div>

      {error && (
        <p className="rounded border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-60"
      >
        {isPending ? "Converting…" : "Convert to Booking"}
      </button>
    </form>
  );
}
