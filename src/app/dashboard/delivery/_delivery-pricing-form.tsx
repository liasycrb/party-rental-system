"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { BrandSlug } from "@/lib/brand/config";
import type { DeliveryPricingSettings } from "@/lib/delivery/default-delivery-pricing";

export type SaveDeliveryPricingResult =
  | { ok: true }
  | { ok: false; error: string };

type Props = {
  brandSlug: BrandSlug;
  initial: DeliveryPricingSettings;
  action: (formData: FormData) => Promise<SaveDeliveryPricingResult>;
};

type FormValues = {
  freeCity: string;
  nearMaxMiles: string;
  nearRatePerMile: string;
  midMaxMiles: string;
  midRatePerMile: string;
  farRatePerMile: string;
  maxServiceMiles: string;
};

type Toast = { kind: "success" | "error"; message: string } | null;

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500/60 focus:outline-none focus:ring-1 focus:ring-violet-500/40";

const labelClass = "mb-1.5 block text-sm font-semibold text-zinc-300";

const sectionLabelClass =
  "text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500";

function toForm(s: DeliveryPricingSettings): FormValues {
  return {
    freeCity: s.freeCity,
    nearMaxMiles: String(s.nearMaxMiles),
    nearRatePerMile: String(s.nearRatePerMile),
    midMaxMiles: String(s.midMaxMiles),
    midRatePerMile: String(s.midRatePerMile),
    farRatePerMile: String(s.farRatePerMile),
    maxServiceMiles: String(s.maxServiceMiles),
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

  if (!v.freeCity.trim()) e.freeCity = "Free city is required.";

  const nearMax = parseNum(v.nearMaxMiles);
  const midMax = parseNum(v.midMaxMiles);
  const maxService = parseNum(v.maxServiceMiles);
  const nearRate = parseNum(v.nearRatePerMile);
  const midRate = parseNum(v.midRatePerMile);
  const farRate = parseNum(v.farRatePerMile);

  if (!Number.isFinite(nearMax) || nearMax <= 0)
    e.nearMaxMiles = "Must be greater than 0.";
  if (!Number.isFinite(midMax)) e.midMaxMiles = "Required.";
  if (!Number.isFinite(maxService)) e.maxServiceMiles = "Required.";

  if (
    Number.isFinite(nearMax) &&
    Number.isFinite(midMax) &&
    nearMax >= midMax
  ) {
    e.nearMaxMiles ??= "Must be less than mid max.";
    e.midMaxMiles ??= "Must be greater than near max.";
  }
  if (
    Number.isFinite(midMax) &&
    Number.isFinite(maxService) &&
    midMax > maxService
  ) {
    e.midMaxMiles ??= "Cannot exceed service limit.";
    e.maxServiceMiles ??= "Must be at least mid max.";
  }

  if (!Number.isFinite(nearRate) || nearRate < 0)
    e.nearRatePerMile = "Must be zero or positive.";
  if (!Number.isFinite(midRate) || midRate < 0)
    e.midRatePerMile = "Must be zero or positive.";
  if (!Number.isFinite(farRate) || farRate < 0)
    e.farRatePerMile = "Must be zero or positive.";

  return { errors: e, isValid: Object.keys(e).length === 0 };
}

function feeForMiles(
  miles: number,
  v: FormValues,
): { fee: number; tierLabel: string; rate: number } | null {
  const nearMax = parseNum(v.nearMaxMiles);
  const midMax = parseNum(v.midMaxMiles);
  const nearRate = parseNum(v.nearRatePerMile);
  const midRate = parseNum(v.midRatePerMile);
  const farRate = parseNum(v.farRatePerMile);
  if (
    ![nearMax, midMax, nearRate, midRate, farRate].every((n) =>
      Number.isFinite(n),
    )
  ) {
    return null;
  }
  let rate: number;
  let tierLabel: string;
  if (miles <= nearMax) {
    rate = nearRate;
    tierLabel = "near";
  } else if (miles <= midMax) {
    rate = midRate;
    tierLabel = "mid";
  } else {
    rate = farRate;
    tierLabel = "far";
  }
  return { fee: Math.round(miles * rate), tierLabel, rate };
}

const EXAMPLE_MILES = [7, 12, 30] as const;

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

export default function DeliveryPricingForm({
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

  const previews = useMemo(
    () => EXAMPLE_MILES.map((m) => ({ miles: m, calc: feeForMiles(m, values) })),
    [values],
  );

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
          message: "Delivery pricing updated successfully.",
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
          <h2 className="text-sm font-bold text-white">
            Delivery Pricing Settings
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Final fee = round(miles × tier rate). Free city is matched against
            the Google-geocoded city name.
          </p>
        </header>

        {/* FREE DELIVERY */}
        <section className="space-y-3">
          <p className={sectionLabelClass}>Free Delivery</p>
          <div>
            <label htmlFor="free_city" className={labelClass}>
              Free delivery city
            </label>
            <input
              id="free_city"
              name="free_city"
              type="text"
              value={values.freeCity}
              onChange={(e) => update("freeCity", e.target.value)}
              placeholder="Moreno Valley"
              className={inputClass}
            />
            {errors.freeCity && (
              <p className="mt-1 text-xs font-semibold text-red-300">
                {errors.freeCity}
              </p>
            )}
          </div>
        </section>

        {/* NEAR TIER */}
        <section className="space-y-3 border-t border-white/5 pt-5">
          <p className={sectionLabelClass}>Near Tier</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="near_max_miles" className={labelClass}>
                Near max miles
              </label>
              <input
                id="near_max_miles"
                name="near_max_miles"
                type="number"
                step="0.1"
                min="0"
                value={values.nearMaxMiles}
                onChange={(e) => update("nearMaxMiles", e.target.value)}
                className={inputClass}
              />
              {errors.nearMaxMiles && (
                <p className="mt-1 text-xs font-semibold text-red-300">
                  {errors.nearMaxMiles}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="near_rate_per_mile" className={labelClass}>
                Near rate per mile ($)
              </label>
              <input
                id="near_rate_per_mile"
                name="near_rate_per_mile"
                type="number"
                step="0.01"
                min="0"
                value={values.nearRatePerMile}
                onChange={(e) => update("nearRatePerMile", e.target.value)}
                className={inputClass}
              />
              {errors.nearRatePerMile && (
                <p className="mt-1 text-xs font-semibold text-red-300">
                  {errors.nearRatePerMile}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* MID TIER */}
        <section className="space-y-3 border-t border-white/5 pt-5">
          <p className={sectionLabelClass}>Mid Tier</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="mid_max_miles" className={labelClass}>
                Mid max miles
              </label>
              <input
                id="mid_max_miles"
                name="mid_max_miles"
                type="number"
                step="0.1"
                min="0"
                value={values.midMaxMiles}
                onChange={(e) => update("midMaxMiles", e.target.value)}
                className={inputClass}
              />
              {errors.midMaxMiles && (
                <p className="mt-1 text-xs font-semibold text-red-300">
                  {errors.midMaxMiles}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="mid_rate_per_mile" className={labelClass}>
                Mid rate per mile ($)
              </label>
              <input
                id="mid_rate_per_mile"
                name="mid_rate_per_mile"
                type="number"
                step="0.01"
                min="0"
                value={values.midRatePerMile}
                onChange={(e) => update("midRatePerMile", e.target.value)}
                className={inputClass}
              />
              {errors.midRatePerMile && (
                <p className="mt-1 text-xs font-semibold text-red-300">
                  {errors.midRatePerMile}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* FAR TIER */}
        <section className="space-y-3 border-t border-white/5 pt-5">
          <p className={sectionLabelClass}>Far Tier</p>
          <div>
            <label htmlFor="far_rate_per_mile" className={labelClass}>
              Far rate per mile ($)
            </label>
            <input
              id="far_rate_per_mile"
              name="far_rate_per_mile"
              type="number"
              step="0.01"
              min="0"
              value={values.farRatePerMile}
              onChange={(e) => update("farRatePerMile", e.target.value)}
              className={inputClass}
            />
            {errors.farRatePerMile && (
              <p className="mt-1 text-xs font-semibold text-red-300">
                {errors.farRatePerMile}
              </p>
            )}
          </div>
        </section>

        {/* SERVICE LIMIT */}
        <section className="space-y-3 border-t border-white/5 pt-5">
          <p className={sectionLabelClass}>Service Limit</p>
          <div>
            <label htmlFor="max_service_miles" className={labelClass}>
              Maximum service miles
            </label>
            <input
              id="max_service_miles"
              name="max_service_miles"
              type="number"
              step="0.1"
              min="0"
              value={values.maxServiceMiles}
              onChange={(e) => update("maxServiceMiles", e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-zinc-500">
              Addresses farther than this are rejected with “outside service
              area.”
            </p>
            {errors.maxServiceMiles && (
              <p className="mt-1 text-xs font-semibold text-red-300">
                {errors.maxServiceMiles}
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
            {isPending ? "Saving…" : "Save pricing"}
          </button>
          <p className="text-xs text-zinc-500">
            Last updated: {formatTimestamp(lastSaved)}
          </p>
        </div>
      </form>

      {/* LIVE EXAMPLES */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className={sectionLabelClass}>Live Examples</p>
          <p className="text-[11px] text-zinc-500">
            Updates as you edit the form
          </p>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {previews.map(({ miles, calc }) => (
            <div
              key={miles}
              className="rounded-xl border border-white/10 bg-zinc-950/60 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {miles} mi
              </p>
              {calc ? (
                <>
                  <p className="mt-1.5 text-2xl font-extrabold text-white">
                    ${calc.fee}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    <span className="font-semibold uppercase text-violet-300">
                      {calc.tierLabel}
                    </span>
                    {" · "}${calc.rate}/mi
                  </p>
                </>
              ) : (
                <p className="mt-1.5 text-sm text-zinc-500">—</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
