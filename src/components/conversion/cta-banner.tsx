import Link from "next/link";
import type { BrandSlug } from "@/lib/brand/config";
import { withBrand } from "@/lib/brand/with-brand-href";
import { cn } from "@/lib/utils/cn";

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function CtaBanner({
  isCrb,
  brandSlug,
  title,
  subtitle,
}: {
  isCrb: boolean;
  brandSlug: BrandSlug;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border px-8 py-12 shadow-2xl sm:px-12 sm:py-16",
        isCrb ? "border-cyan-400/30" : "border-orange-400/25",
      )}
      style={{
        borderRadius: "var(--brand-radius-lg)",
        background: "var(--brand-cta-banner-bg)",
      }}
    >
      {/* decorative blobs */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-white/[0.06] blur-2xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[700px] text-center">
        <p className="text-3xl font-black leading-tight tracking-[-0.025em] text-white sm:text-[2.6rem]">
          {title}
        </p>
        <p className="mx-auto mt-4 max-w-[520px] text-[15px] font-semibold leading-relaxed text-white/70">
          {subtitle}
        </p>

        <div className="mt-9">
          <Link
            href={withBrand("/build", brandSlug)}
            className={cn(
              "group relative mx-auto flex w-full max-w-[560px] flex-col items-center justify-center overflow-hidden rounded-2xl px-10 py-5 transition-all duration-300 ease-out",
              "hover:scale-[1.025] active:scale-[0.98]",
              isCrb
                ? "text-slate-950 shadow-[0_12px_40px_rgba(6,182,212,0.45)] hover:shadow-[0_22px_58px_rgba(6,182,212,0.65)]"
                : "text-white shadow-[0_12px_40px_rgba(220,38,38,0.42)] hover:shadow-[0_22px_58px_rgba(220,38,38,0.6)]",
            )}
            style={
              isCrb
                ? {
                    background:
                      "linear-gradient(110deg, var(--brand-primary) 0%, #a5f3fc 55%, var(--brand-accent) 100%)",
                  }
                : {
                    background:
                      "linear-gradient(110deg, #be123c 0%, var(--brand-secondary) 50%, #fb923c 100%)",
                  }
            }
          >
            {/* shine sweep on hover */}
            <span
              className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20 transition-transform duration-700 ease-out group-hover:translate-x-[150%]"
              aria-hidden
            />

            <span className="relative flex w-full items-center justify-between gap-4">
              <span className="text-[17px] font-black leading-tight tracking-[-0.02em] sm:text-[20px]">
                Check availability &amp; book your party
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
            </span>

            <span
              className={cn(
                "relative mt-1.5 text-[12px] font-medium",
                isCrb ? "text-slate-800/70" : "text-white/70",
              )}
            >
              Takes less than 60 seconds&nbsp;&nbsp;·&nbsp;&nbsp;No payment
              required
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
