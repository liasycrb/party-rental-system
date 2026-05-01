"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import type { Brand } from "@/lib/brand/config";
import {
  DEMO_PRODUCTS,
  getDemoProductBySlug,
  type DemoProduct,
} from "@/lib/catalog/demo-products";
import { getPopularPackage } from "@/lib/marketing/popular-packages";
import { Container } from "@/components/marketing/container";
import { cn } from "@/lib/utils/cn";

const STEPS = [
  { id: "date", label: "Date & unit" },
  { id: "availability", label: "Availability" },
  { id: "setup", label: "Setup details" },
  { id: "extras", label: "Add-ons" },
  { id: "review", label: "Review" },
  { id: "reserve", label: "Reservation" },
] as const;

const EXTRAS = [
  {
    id: "tables",
    name: "Round tables",
    hint: "Seating for buffet or gifts",
    price: 8,
    unit: "table",
  },
  {
    id: "chairs",
    name: "Folding chairs",
    hint: "Qty bundles in 10",
    price: 2,
    unit: "chair",
  },
  {
    id: "canopy",
    name: "10×10 canopy",
    hint: "Shade + rain backup",
    price: 45,
    unit: "each",
  },
  {
    id: "generator",
    name: "Quiet generator",
    hint: "When outlets are far",
    price: 65,
    unit: "each",
  },
  {
    id: "time",
    name: "Extra play time",
    hint: "+1 hour pickup window",
    price: 35,
    unit: "block",
  },
] as const;

function parseIsoDate(value: string | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}

export function BuildEventFlow({
  brand,
  initialProductSlug,
  initialDate,
  initialPackageId,
}: {
  brand: Brand;
  initialProductSlug?: string;
  initialDate?: string;
  initialPackageId?: string;
}) {
  const isCrb = brand.slug === "crb";

  const initialProduct = useMemo(() => {
    const fromSlug = initialProductSlug
      ? getDemoProductBySlug(initialProductSlug)
      : undefined;
    if (fromSlug) return fromSlug;
    const pkg = initialPackageId
      ? getPopularPackage(initialPackageId)
      : undefined;
    if (pkg) {
      const fromPkg = getDemoProductBySlug(pkg.primaryProductSlug);
      if (fromPkg) return fromPkg;
    }
    return DEMO_PRODUCTS[0]!;
  }, [initialProductSlug, initialPackageId]);

  const starterPackage = useMemo(
    () => (initialPackageId ? getPopularPackage(initialPackageId) : undefined),
    [initialPackageId],
  );

  const [step, setStep] = useState(0);
  const [product, setProduct] = useState<DemoProduct>(initialProduct);
  const [eventDate, setEventDate] = useState<string | null>(
    () => parseIsoDate(initialDate) ?? "2026-05-17",
  );
  const [surface, setSurface] = useState<"grass" | "dirt" | "concrete">(
    "grass",
  );
  const [dogs, setDogs] = useState<"none" | "small" | "large">("none");
  const [gateOk, setGateOk] = useState(true);
  const [extras, setExtras] = useState<Record<string, number>>({
    tables: 0,
    chairs: 0,
    canopy: 0,
    generator: 0,
    time: 0,
  });

  const canAdvance =
    step === 0
      ? Boolean(eventDate && product)
      : step === 1
        ? true
        : step === 2
          ? gateOk
          : true;

  function next() {
    if (step < STEPS.length - 1 && canAdvance) setStep((s) => s + 1);
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  return (
    <div
      className={cn("pb-20 sm:pb-24", isCrb ? "text-slate-100" : "text-stone-900")}
    >
      <div
        className={cn(
          "relative overflow-hidden border-b",
          isCrb
            ? "border-cyan-400/25 bg-slate-950/75"
            : "border-orange-400/18 bg-white/70",
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage: isCrb
              ? "radial-gradient(600px 240px at 10% 0%, rgba(34,211,238,0.32), transparent 60%), radial-gradient(500px 200px at 90% 20%, rgba(251,146,60,0.25), transparent 55%)"
              : "radial-gradient(600px 240px at 15% 0%, rgba(251,113,133,0.35), transparent 60%), radial-gradient(500px 200px at 85% 10%, rgba(45,212,191,0.3), transparent 55%)",
          }}
          aria-hidden
        />
        <Container className="relative py-6 sm:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]",
                  isCrb
                    ? "bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-400/35"
                    : "bg-white/80 text-orange-950 ring-1 ring-orange-400/25",
                )}
              >
                {brand.displayName}
              </p>
              <h1
                className={cn(
                  "mt-3 text-3xl font-black tracking-tight sm:text-4xl",
                  isCrb ? "text-white" : "text-stone-900",
                )}
              >
                Start your party — we’ll nail the details
              </h1>
              {starterPackage ? (
                <p
                  className={cn(
                    "mt-3 inline-flex flex-wrap items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-widest ring-1",
                    isCrb
                      ? "bg-orange-500/15 text-orange-100 ring-orange-400/40"
                      : "bg-rose-500/10 text-rose-800 ring-rose-300/50",
                  )}
                >
                  Starting setup: {starterPackage.title}
                </p>
              ) : null}
              <p
                className={cn(
                  "mt-2 max-w-xl text-sm font-semibold",
                  isCrb ? "text-cyan-100/85" : "text-stone-700",
                )}
              >
                Pick your date, lock your jumper, add upgrades — most hosts finish
                this in under two minutes. (Preview flow — deposits come next.)
              </p>
            </div>
            <Link
              href="/products"
              className={cn(
                "text-sm font-black hover:underline",
                isCrb ? "text-cyan-200" : "text-orange-900",
              )}
            >
              ← Back to catalog
            </Link>
          </div>

          <div className="mt-8 overflow-x-auto pb-1">
            <ol className="flex min-w-[640px] gap-2">
              {STEPS.map((s, i) => {
                const active = i === step;
                const done = i < step;
                return (
                  <li key={s.id} className="flex flex-1 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(i)}
                      className={cn(
                        "flex w-full flex-col items-start gap-1 border px-3 py-2.5 text-left text-xs font-bold transition-[transform,box-shadow] sm:text-sm",
                        active &&
                          (isCrb
                            ? "party-step-active border-cyan-300/60 bg-slate-900/80 text-white shadow-[0_0_24px_rgba(34,211,238,0.28)]"
                            : "party-step-active border-orange-500/45 bg-white text-stone-900 shadow-lg"),
                        done &&
                          !active &&
                          (isCrb
                            ? "border-cyan-400/20 bg-slate-900/40 text-cyan-100/80"
                            : "border-stone-200 bg-white/70 text-stone-700"),
                        !active &&
                          !done &&
                          (isCrb
                            ? "border-dashed border-cyan-500/25 bg-slate-950/30 text-slate-500"
                            : "border-dashed border-stone-300/80 bg-white/40 text-stone-400"),
                      )}
                      style={{
                        borderRadius: "var(--brand-radius-md)",
                      }}
                    >
                      <span
                        className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          active && (isCrb ? "text-orange-300" : "text-rose-600"),
                          !active && "opacity-80",
                        )}
                      >
                        Step {i + 1}
                      </span>
                      <span className="leading-tight">{s.label}</span>
                    </button>
                    {i < STEPS.length - 1 ? (
                      <span
                        className={cn(
                          "hidden sm:block",
                          isCrb ? "text-cyan-500/50" : "text-amber-600/40",
                        )}
                        aria-hidden
                      >
                        →
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>

          <div
            className={cn(
              "mt-5 h-2 w-full overflow-hidden rounded-full",
              isCrb ? "bg-slate-800" : "bg-stone-200",
            )}
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r transition-all duration-300"
              style={{
                width: `${((step + 1) / STEPS.length) * 100}%`,
                background: isCrb
                  ? "linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))"
                  : "linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))",
              }}
            />
          </div>
        </Container>
      </div>

      <Container className="relative mt-10">
        <div
          className={cn(
            "pointer-events-none absolute -inset-x-10 -top-10 h-64 opacity-70",
            isCrb
              ? "bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.22),transparent_60%)]"
              : "bg-[radial-gradient(circle_at_50%_0%,rgba(251,113,133,0.18),transparent_60%)]",
          )}
          aria-hidden
        />
        {step === 0 ? (
          <StepPanel isCrb={isCrb} title="Choose your date & jumper">
            <div className="grid gap-8 lg:grid-cols-2">
              <div
                className={cn(
                  "border p-5 shadow-xl backdrop-blur-md",
                  isCrb
                    ? "border-cyan-400/25 bg-slate-900/55"
                    : "border-orange-400/18 bg-white/80",
                )}
                style={{ borderRadius: "var(--brand-radius-lg)" }}
              >
                <p
                  className={cn(
                    "text-sm font-black uppercase tracking-wide",
                    isCrb ? "text-orange-200" : "text-rose-600",
                  )}
                >
                  Event date
                </p>
                <p
                  className={cn(
                    "mt-1 text-xs font-semibold",
                    isCrb ? "text-slate-400" : "text-stone-600",
                  )}
                >
                  Tap an open day — mock calendar for now.
                </p>
                <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                    <div
                      key={d}
                      className={cn(
                        "py-2 font-black",
                        isCrb ? "text-cyan-300/70" : "text-stone-400",
                      )}
                    >
                      {d}
                    </div>
                  ))}
                  {Array.from({ length: 28 }, (_, i) => {
                    const day = i + 1;
                    const iso = `2026-05-${String(day).padStart(2, "0")}`;
                    const selected = eventDate === iso;
                    const open = day % 3 !== 0;
                    return (
                      <button
                        key={iso}
                        type="button"
                        disabled={!open}
                        onClick={() => open && setEventDate(iso)}
                        className={cn(
                          "rounded-lg py-2 text-sm font-bold transition-[transform,box-shadow]",
                          selected &&
                            "party-select-pop text-white shadow-lg scale-[1.02]",
                          !selected &&
                            open &&
                            (isCrb
                              ? "bg-slate-950/40 text-cyan-50 ring-1 ring-cyan-400/30 hover:ring-orange-400/60"
                              : "bg-white text-stone-900 ring-1 ring-stone-200 hover:ring-pink-400/55"),
                          !open &&
                            (isCrb
                              ? "cursor-not-allowed text-slate-600"
                              : "cursor-not-allowed text-stone-300"),
                        )}
                        style={
                          selected
                            ? {
                                background: isCrb
                                  ? "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))"
                                  : "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))",
                              }
                            : undefined
                        }
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-3">
                <p
                  className={cn(
                    "text-sm font-black uppercase tracking-wide",
                    isCrb ? "text-orange-200" : "text-rose-600",
                  )}
                >
                  Pick your inflatable
                </p>
                <div className="space-y-3">
                  {DEMO_PRODUCTS.map((p) => (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => setProduct(p)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 border p-4 text-left transition-[transform,box-shadow]",
                        product.slug === p.slug &&
                          (isCrb
                            ? "party-select-pop border-cyan-300/60 bg-slate-900/70 shadow-[0_0_28px_rgba(34,211,238,0.22)] ring-2 ring-orange-400/60"
                            : "party-select-pop border-pink-500/40 bg-white shadow-xl ring-2 ring-rose-400/55"),
                      )}
                      style={{
                        borderRadius: "var(--brand-radius-md)",
                        backgroundColor:
                          product.slug === p.slug
                            ? undefined
                            : isCrb
                              ? "rgba(2,6,23,0.35)"
                              : "rgba(255,255,255,0.55)",
                        borderColor:
                          product.slug === p.slug
                            ? undefined
                            : isCrb
                              ? "rgba(34,211,238,0.22)"
                              : "rgba(120,53,15,0.12)",
                      }}
                    >
                      <span>
                        <span
                          className={cn(
                            "block font-bold",
                            isCrb ? "text-white" : "text-stone-900",
                          )}
                        >
                          {p.title}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 block text-xs font-semibold",
                            isCrb ? "text-slate-400" : "text-stone-600",
                          )}
                        >
                          {p.sizeLabel}
                          {p.priceFrom != null && p.priceFrom > 0
                            ? ` · from $${Math.round(p.priceFrom)}`
                            : " · Pricing on request"}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          isCrb ? "text-cyan-200" : "text-orange-800",
                        )}
                        aria-hidden
                      >
                        {product.slug === p.slug ? "Locked" : "Tap"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </StepPanel>
        ) : null}

        {step === 1 ? (
          <StepPanel isCrb={isCrb} title="Confirm availability">
            <div
              className={cn(
                "relative overflow-hidden border p-8 shadow-2xl",
                isCrb
                  ? "border-cyan-400/30 bg-gradient-to-br from-slate-900/85 to-slate-950/90"
                  : "border-orange-400/18 bg-gradient-to-br from-white to-amber-50/90",
              )}
              style={{ borderRadius: "var(--brand-radius-lg)" }}
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/25 blur-3xl"
                aria-hidden
              />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p
                    className={cn(
                      "text-lg font-black",
                      isCrb ? "text-emerald-300" : "text-emerald-700",
                    )}
                  >
                    You’re in — on our preview calendar
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-sm font-semibold",
                      isCrb ? "text-slate-300" : "text-stone-700",
                    )}
                  >
                    {product.title} · {eventDate} · Moreno Valley, Perris & Riverside
                  </p>
                </div>
                <span
                  className="inline-flex w-fit items-center px-4 py-2 text-[11px] font-black uppercase tracking-widest text-emerald-950 shadow-lg"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(52,211,153,0.95), rgba(110,231,183,0.95))",
                    borderRadius: "var(--brand-radius-md)",
                  }}
                >
                  Soft hold · UI only
                </span>
              </div>
              <p
                className={cn(
                  "relative mt-4 text-xs font-semibold",
                  isCrb ? "text-slate-400" : "text-stone-600",
                )}
              >
                Production will persist holds in Supabase so availability stays accurate for every booking.
              </p>
            </div>
          </StepPanel>
        ) : null}

        {step === 2 ? (
          <StepPanel isCrb={isCrb} title="Setup & safety intake">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block">
                <span
                  className={cn(
                    "text-sm font-black uppercase tracking-wide",
                    isCrb ? "text-orange-200" : "text-orange-900",
                  )}
                >
                  Surface type
                </span>
                <select
                  className={cn(
                    "mt-2 w-full border px-3 py-3 text-sm font-semibold",
                    isCrb
                      ? "border-cyan-400/30 bg-slate-950/50 text-white"
                      : "border-stone-200 bg-white text-stone-900",
                  )}
                  style={{ borderRadius: "var(--brand-radius-md)" }}
                  value={surface}
                  onChange={(e) =>
                    setSurface(e.target.value as typeof surface)
                  }
                >
                  <option value="grass">Grass (preferred)</option>
                  <option value="dirt">Dirt / uneven</option>
                  <option value="concrete">Concrete / asphalt</option>
                </select>
              </label>
              <label className="block">
                <span
                  className={cn(
                    "text-sm font-black uppercase tracking-wide",
                    isCrb ? "text-orange-200" : "text-orange-900",
                  )}
                >
                  Dogs on site?
                </span>
                <select
                  className={cn(
                    "mt-2 w-full border px-3 py-3 text-sm font-semibold",
                    isCrb
                      ? "border-cyan-400/30 bg-slate-950/50 text-white"
                      : "border-stone-200 bg-white text-stone-900",
                  )}
                  style={{ borderRadius: "var(--brand-radius-md)" }}
                  value={dogs}
                  onChange={(e) => setDogs(e.target.value as typeof dogs)}
                >
                  <option value="none">No dogs</option>
                  <option value="small">Small dogs</option>
                  <option value="large">Large dogs</option>
                </select>
              </label>
            </div>
            <label
              className={cn(
                "mt-6 flex cursor-pointer items-start gap-3 border p-5 shadow-lg",
                isCrb
                  ? "border-cyan-400/25 bg-slate-900/55"
                  : "border-orange-400/18 bg-white/85",
              )}
              style={{ borderRadius: "var(--brand-radius-md)" }}
            >
              <input
                type="checkbox"
                className={cn(
                  "mt-1 h-4 w-4 rounded",
                  isCrb
                    ? "border-cyan-400/50 bg-slate-950"
                    : "border-stone-300",
                )}
                checked={gateOk}
                onChange={(e) => setGateOk(e.target.checked)}
              />
              <span>
                <span
                  className={cn(
                    "block text-sm font-bold",
                    isCrb ? "text-white" : "text-stone-900",
                  )}
                >
                  Access path is at least 3.5 ft wide
                </span>
                <span
                  className={cn(
                    "mt-1 block text-sm font-medium",
                    isCrb ? "text-slate-400" : "text-stone-600",
                  )}
                >
                  Gate, side yard, or walkway — confirm a clear path from the
                  street to the setup area.
                </span>
              </span>
            </label>
          </StepPanel>
        ) : null}

        {step === 3 ? (
          <StepPanel isCrb={isCrb} title="Party upgrades (the fun stuff)">
            <p
              className={cn(
                "text-sm font-semibold",
                isCrb ? "text-cyan-100/85" : "text-stone-700",
              )}
            >
              Treat these like VIP add-ons at a festival — shade, seating, power,
              and extra bounce time. Tap + and watch your party level up (local
              preview only for now).
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {EXTRAS.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "relative overflow-hidden border p-5 shadow-xl transition hover:-translate-y-0.5",
                    isCrb
                      ? "border-cyan-400/25 bg-slate-900/65 hover:border-orange-400/45"
                      : "border-orange-400/20 bg-white/90 hover:border-pink-500/40",
                  )}
                  style={{ borderRadius: "var(--brand-radius-md)" }}
                >
                  <div
                    className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-gradient-to-br from-orange-400/40 to-cyan-400/28 blur-2xl"
                    aria-hidden
                  />
                  <div className="relative flex items-start justify-between gap-2">
                    <div>
                      <p
                        className={cn(
                          "font-black",
                          isCrb ? "text-white" : "text-stone-900",
                        )}
                      >
                        {item.name}
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-xs font-semibold",
                          isCrb ? "text-slate-400" : "text-stone-600",
                        )}
                      >
                        {item.hint}
                      </p>
                    </div>
                    <p
                      className={cn(
                        "text-sm font-black",
                        isCrb ? "text-orange-300" : "text-pink-700",
                      )}
                    >
                      ${item.price}/{item.unit}
                    </p>
                  </div>
                  <div className="relative mt-5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      className={cn(
                        "rounded-lg px-4 py-2 text-lg font-black transition",
                        isCrb
                          ? "border border-cyan-400/30 bg-slate-950/60 text-white hover:bg-slate-900"
                          : "border border-stone-200 bg-white text-stone-900 hover:bg-stone-50",
                      )}
                      onClick={() =>
                        setExtras((e) => ({
                          ...e,
                          [item.id]: Math.max(0, (e[item.id] ?? 0) - 1),
                        }))
                      }
                    >
                      −
                    </button>
                    <span
                      className={cn(
                        "text-lg font-black tabular-nums",
                        isCrb ? "text-white" : "text-stone-900",
                      )}
                    >
                      {extras[item.id] ?? 0}
                    </span>
                    <button
                      type="button"
                      className={cn(
                        "rounded-lg px-4 py-2 text-lg font-black text-white shadow-lg transition hover:brightness-110",
                      )}
                      style={{
                        background: isCrb
                          ? "linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))"
                          : "linear-gradient(90deg, var(--brand-secondary), var(--brand-accent))",
                      }}
                      onClick={() =>
                        setExtras((e) => ({
                          ...e,
                          [item.id]: (e[item.id] ?? 0) + 1,
                        }))
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </StepPanel>
        ) : null}

        {step === 4 ? (
          <StepPanel isCrb={isCrb} title="Review your setup">
            <div
              className={cn(
                "grid gap-6 border p-6 shadow-2xl backdrop-blur-md lg:grid-cols-2",
                isCrb
                  ? "border-cyan-400/25 bg-slate-900/60"
                  : "border-orange-400/18 bg-white/85",
              )}
              style={{ borderRadius: "var(--brand-radius-lg)" }}
            >
              <div>
                <h3
                  className={cn(
                    "text-xs font-black uppercase tracking-widest",
                    isCrb ? "text-orange-200" : "text-rose-600",
                  )}
                >
                  Event
                </h3>
                <dl
                  className={cn(
                    "mt-3 space-y-2 text-sm font-semibold",
                    isCrb ? "text-slate-300" : "text-stone-700",
                  )}
                >
                  <div className="flex justify-between gap-4">
                    <dt>Date</dt>
                    <dd
                      className={cn(
                        "font-bold",
                        isCrb ? "text-white" : "text-stone-900",
                      )}
                    >
                      {eventDate}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Jumper</dt>
                    <dd
                      className={cn(
                        "max-w-[55%] text-right font-bold",
                        isCrb ? "text-white" : "text-stone-900",
                      )}
                    >
                      {product.title}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Surface</dt>
                    <dd
                      className={cn(
                        "font-bold capitalize",
                        isCrb ? "text-white" : "text-stone-900",
                      )}
                    >
                      {surface}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Dogs</dt>
                    <dd
                      className={cn(
                        "font-bold capitalize",
                        isCrb ? "text-white" : "text-stone-900",
                      )}
                    >
                      {dogs}
                    </dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3
                  className={cn(
                    "text-xs font-black uppercase tracking-widest",
                    isCrb ? "text-orange-200" : "text-rose-600",
                  )}
                >
                  Add-ons
                </h3>
                <ul
                  className={cn(
                    "mt-3 space-y-2 text-sm font-semibold",
                    isCrb ? "text-slate-300" : "text-stone-700",
                  )}
                >
                  {EXTRAS.map((e) =>
                    (extras[e.id] ?? 0) > 0 ? (
                      <li key={e.id} className="flex justify-between gap-4">
                        <span>
                          {e.name}{" "}
                          <span className={isCrb ? "text-slate-500" : "text-stone-500"}>
                            ×{extras[e.id]}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "font-bold",
                            isCrb ? "text-white" : "text-stone-900",
                          )}
                        >
                          ${e.price * (extras[e.id] ?? 0)}
                        </span>
                      </li>
                    ) : null,
                  )}
                  {EXTRAS.every((e) => (extras[e.id] ?? 0) === 0) ? (
                    <li className={isCrb ? "text-slate-500" : "text-stone-500"}>
                      No add-ons yet — go wild on the previous step.
                    </li>
                  ) : null}
                </ul>
              </div>
            </div>
          </StepPanel>
        ) : null}

        {step === 5 ? (
          <StepPanel isCrb={isCrb} title="Continue to reservation">
            <div
              className={cn(
                "relative overflow-hidden border-2 border-dashed p-10 text-center shadow-2xl",
                isCrb
                  ? "border-cyan-400/35 bg-slate-950/60"
                  : "border-amber-700/25 bg-gradient-to-br from-white to-amber-50/90",
              )}
              style={{ borderRadius: "var(--brand-radius-lg)" }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-50"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 20%, rgba(251,146,60,0.25), transparent 45%), radial-gradient(circle at 80% 60%, rgba(34,211,238,0.22), transparent 40%)",
                }}
                aria-hidden
              />
              <div className="relative">
                <p
                  className={cn(
                    "text-xl font-black",
                    isCrb ? "text-white" : "text-stone-900",
                  )}
                >
                  Next beat: terms, deposit, SMS magic
                </p>
                <p
                  className={cn(
                    "mt-2 text-sm font-semibold",
                    isCrb ? "text-slate-400" : "text-stone-600",
                  )}
                >
                  Payments + contracts land here soon — the stage is intentionally
                  loud so stakeholders feel the momentum.
                </p>
                <button
                  type="button"
                  disabled
                  className="mt-8 inline-flex cursor-not-allowed items-center justify-center px-8 py-3 text-sm font-black opacity-55"
                  style={{
                    background: isCrb ? "#334155" : "#a8a29e",
                    color: "white",
                    borderRadius: "var(--brand-radius-md)",
                  }}
                >
                  Complete reservation (coming soon)
                </button>
              </div>
            </div>
          </StepPanel>
        ) : null}

        <div
          className={cn(
            "relative mt-12 flex flex-col-reverse gap-3 border-t pt-10 sm:flex-row sm:justify-between",
            isCrb ? "border-cyan-400/20" : "border-stone-200",
          )}
        >
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className={cn(
              "inline-flex items-center justify-center px-6 py-3 text-sm font-black",
              step === 0
                ? isCrb
                  ? "cursor-not-allowed text-slate-600"
                  : "cursor-not-allowed text-stone-400"
                : isCrb
                  ? "text-white"
                  : "text-stone-900",
            )}
            style={{
              borderRadius: "var(--brand-radius-md)",
              border:
                step === 0
                  ? isCrb
                    ? "1px solid rgba(34,211,238,0.22)"
                    : "1px solid #e7e5e4"
                  : isCrb
                    ? "1px solid rgba(34, 211, 238, 0.35)"
                    : "1px solid rgba(120,53,15,0.2)",
              background: step === 0
                ? isCrb
                  ? "rgba(2,6,23,0.35)"
                  : "rgba(255,255,255,0.5)"
                : isCrb
                  ? "rgba(15,23,42,0.55)"
                  : "rgba(255,255,255,0.75)",
            }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={step === STEPS.length - 1 || !canAdvance}
            className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-black text-white shadow-2xl transition-[transform,filter] hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
            style={{
              background: isCrb
                ? "linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))"
                : "linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))",
              borderRadius: "var(--brand-radius-md)",
            }}
          >
            {step === STEPS.length - 1 ? "Finished" : "Continue"}
          </button>
        </div>
      </Container>
    </div>
  );
}

function StepPanel({
  title,
  children,
  isCrb,
}: {
  title: string;
  children: React.ReactNode;
  isCrb: boolean;
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId}>
      <h2
        id={headingId}
        className={cn(
          "text-2xl font-black tracking-tight sm:text-3xl",
          isCrb ? "text-white" : "text-stone-900",
        )}
      >
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}
