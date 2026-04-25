"use client";

import { useId, useState } from "react";
import { Container } from "@/components/marketing/container";
import { cn } from "@/lib/utils/cn";

type BuildBookingStartProps = {
  isCrb: boolean;
  /** When set, category was resolved from catalog. */
  categoryLine: string | null;
};

function inputClass(isCrb: boolean) {
  return cn(
    "w-full rounded-xl border px-4 py-3.5 text-base outline-none transition ring-0",
    "focus:ring-2 focus:ring-offset-0",
    isCrb
      ? "border-slate-600/80 bg-slate-800/60 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/40"
      : "border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus:border-rose-400 focus:ring-rose-200",
  );
}

const labelClass = (isCrb: boolean) =>
  cn("mb-1.5 block text-sm font-semibold", isCrb ? "text-cyan-100/90" : "text-stone-700");

export function BuildBookingStart({ isCrb, categoryLine }: BuildBookingStartProps) {
  const [submitted, setSubmitted] = useState(false);
  const formId = useId();
  const idDate = `${formId}-date`;
  const idName = `${formId}-name`;
  const idPhone = `${formId}-phone`;
  const idCity = `${formId}-city`;
  const idNotes = `${formId}-notes`;

  if (submitted) {
    return (
      <div
        className={cn(
          "min-h-[60vh] py-10 sm:py-14",
          isCrb ? "bg-slate-900 text-slate-100" : "bg-amber-50/50 text-stone-900",
        )}
      >
        <Container className="max-w-lg text-center">
          <div
            className={cn(
              "rounded-2xl p-8 shadow-lg ring-1 sm:p-10",
              isCrb ? "bg-slate-800/80 ring-cyan-500/25" : "bg-white/90 ring-stone-200/80",
            )}
            style={{ borderRadius: "var(--brand-radius-lg)" }}
          >
            <p className="text-lg font-bold leading-relaxed sm:text-xl">
              Thanks — we’ll contact you shortly to confirm availability.
            </p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-[60vh] py-8 sm:py-12",
        isCrb ? "bg-slate-900 text-slate-100" : "bg-gradient-to-b from-amber-50/80 via-stone-50 to-white text-stone-900",
      )}
    >
      <Container className="max-w-lg">
        <header className="text-center sm:text-left">
          <h1
            className={cn("text-3xl font-black tracking-tight sm:text-4xl", isCrb ? "text-white" : "text-stone-900")}
          >
            Let’s build your party
          </h1>
          <p
            className={cn("mt-3 text-base leading-relaxed sm:text-lg", isCrb ? "text-cyan-100/85" : "text-stone-600")}
          >
            Choose your date and tell us what you’re looking for. We’ll confirm availability fast.
          </p>
        </header>

        {categoryLine ? (
          <p
            className={cn(
              "mt-6 rounded-xl px-4 py-3 text-center text-sm font-semibold sm:px-5 sm:text-left",
              isCrb ? "bg-cyan-500/15 text-cyan-100 ring-1 ring-cyan-500/30" : "bg-rose-50 text-rose-900 ring-1 ring-rose-200/60",
            )}
          >
            {categoryLine}
          </p>
        ) : null}

        <form
          className={cn(
            "mt-8 space-y-5 rounded-2xl p-5 shadow-xl ring-1 sm:p-7",
            isCrb ? "bg-slate-800/70 ring-cyan-500/20 backdrop-blur-md" : "bg-white/80 ring-stone-200/90 backdrop-blur-sm",
          )}
          style={{ borderRadius: "var(--brand-radius-lg)" }}
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <div>
            <label htmlFor={idDate} className={labelClass(isCrb)}>
              Event date
            </label>
            <input
              id={idDate}
              name="date"
              type="date"
              className={inputClass(isCrb)}
              required
            />
          </div>
          <div>
            <label htmlFor={idName} className={labelClass(isCrb)}>
              Name
            </label>
            <input
              id={idName}
              name="name"
              type="text"
              autoComplete="name"
              className={inputClass(isCrb)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor={idPhone} className={labelClass(isCrb)}>
              Phone
            </label>
            <input
              id={idPhone}
              name="phone"
              type="tel"
              autoComplete="tel"
              className={inputClass(isCrb)}
              placeholder="(555) 000-0000"
            />
          </div>
          <div>
            <label htmlFor={idCity} className={labelClass(isCrb)}>
              Event city
            </label>
            <input
              id={idCity}
              name="city"
              type="text"
              className={inputClass(isCrb)}
              placeholder="e.g. Moreno Valley"
            />
          </div>
          <div>
            <label htmlFor={idNotes} className={labelClass(isCrb)}>
              Notes / what are you looking for?
            </label>
            <textarea
              id={idNotes}
              name="notes"
              rows={4}
              className={cn(inputClass(isCrb), "min-h-[120px] resize-y")}
              placeholder="Jumper size, water slide, tables & chairs, timing…"
            />
          </div>
          <button
            type="submit"
            className={cn(
              "h-12 w-full rounded-xl text-base font-black transition active:scale-[0.99]",
              isCrb ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-rose-600 text-white shadow-lg shadow-rose-900/15 hover:bg-rose-700",
            )}
            style={{ borderRadius: "var(--brand-radius-md)" }}
          >
            Check availability
          </button>
        </form>
      </Container>
    </div>
  );
}
