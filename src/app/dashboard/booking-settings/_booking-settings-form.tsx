"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { BrandSlug } from "@/lib/brand/config";
import type { BookingSettings } from "@/lib/booking/default-booking-settings";

export type SaveBookingSettingsResult =
  | { ok: true }
  | { ok: false; error: string };

type Props = {
  brandSlug: BrandSlug;
  initial: BookingSettings;
  action: (formData: FormData) => Promise<SaveBookingSettingsResult>;
};

type FormValues = {
  minimumOrderAmount: string;
};

type Toast = { kind: "success" | "error"; message: string } | null;

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500/60 focus:outline-none focus:ring-1 focus:ring-violet-500/40";

const labelClass = "mb-1.5 block text-sm font-semibold text-zinc-300";

const sectionLabelClass =
  "text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500";

function toForm(s: BookingSettings): FormValues {
  return {
    minimumOrderAmount: String(s.minimumOrderAmount),
  };
}

function parseNum(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function validate(v: FormValues): {
  errors: Partial<Record<keyof FormValues, string>>;
  isValid: boolean;
} {
  const e: Partial<Record<keyof FormValues, string>> = {};

  const min = parseNum(v.minimumOrderAmount);
  if (!Number.isFinite(min)) {
    e.minimumOrderAmount = "Required.";
  } else if (min < 0) {
    e.minimumOrderAmount = "Must be zero or positive.";
  }

  return { errors: e, isValid: Object.keys(e).length === 0 };
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function BookingSettingsForm({
  brandSlug,
  initial,
  action,
}: Props) {
  const [values, setValues] = useState<FormValues>(() => toForm(initial));
  const [toast, setToast] = useState<Toast>(null);
  const [isPending, startTransition] = useTransition();
  const [lastSaved, setLastSaved] = useState<string | null>(initial.updatedAt);

  // Reset local state when the server-resolved brand or initial row changes
  // (e.g., user switches brand pills, which navigates and re-renders).
  useEffect(() => {
    setValues(toForm(initial));
    setLastSaved(initial.updatedAt);
  }, [initial, brandSlug]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const { errors, isValid } = useMemo(() => validate(values), [values]);

  function update<K extends keyof FormValues>(key: K, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid || isPending) return;
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await action(fd);
      if (result.ok) {
        setToast({
          kind: "success",
          message: "Booking rules updated successfully.",
        });
        setLastSaved(new Date().toISOString());
      } else {
        setToast({ kind: "error", message: result.error });
      }
    });
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={
            toast.kind === "success"
              ? "rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200"
              : "rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200"
          }
        >
          {toast.message}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
      >
        <input type="hidden" name="brand_slug" value={brandSlug} />

        <header>
          <h2 className="text-sm font-bold text-white">Booking Rules</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Gates the /build flow before customers can continue to checkout.
            Changes apply to new sessions immediately.
          </p>
        </header>

        <section className="space-y-3">
          <p className={sectionLabelClass}>Order Minimum</p>
          <div>
            <label htmlFor="minimum_order_amount" className={labelClass}>
              Minimum order to reserve online ($)
            </label>
            <input
              id="minimum_order_amount"
              name="minimum_order_amount"
              type="number"
              step="0.01"
              min="0"
              value={values.minimumOrderAmount}
              onChange={(e) => update("minimumOrderAmount", e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-zinc-500">
              Customers must meet this item subtotal before continuing to
              checkout.
            </p>
            {errors.minimumOrderAmount && (
              <p className="mt-1 text-xs font-semibold text-red-300">
                {errors.minimumOrderAmount}
              </p>
            )}
          </div>
        </section>

        <div className="flex items-center gap-4 border-t border-white/10 pt-4">
          <button
            type="submit"
            disabled={!isValid || isPending}
            className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-violet-600 disabled:active:scale-100"
          >
            {isPending ? "Saving…" : "Save rules"}
          </button>
          <p className="text-xs text-zinc-500">
            Last updated: {formatTimestamp(lastSaved)}
          </p>
        </div>
      </form>
    </div>
  );
}
