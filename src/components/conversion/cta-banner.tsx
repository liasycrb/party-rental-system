import Link from "next/link";
import type { BrandSlug } from "@/lib/brand/config";
import { withBrand } from "@/lib/brand/with-brand-href";
import { cn } from "@/lib/utils/cn";

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
        "relative overflow-hidden border px-6 py-8 shadow-2xl sm:px-10 sm:py-10",
        isCrb ? "border-cyan-400/30" : "border-orange-400/25",
      )}
      style={{
        borderRadius: "var(--brand-radius-lg)",
        background: "var(--brand-cta-banner-bg)",
      }}
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-2xl font-black text-white sm:text-3xl">{title}</p>
          <p className="mt-2 max-w-xl text-sm font-semibold text-white/85">
            {subtitle}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href={withBrand("/build", brandSlug)}
            className="inline-flex items-center justify-center px-8 py-4 text-center text-sm font-black text-slate-950 shadow-xl transition hover:brightness-110"
            style={{
              background: isCrb
                ? "linear-gradient(90deg, var(--brand-primary), #a5f3fc)"
                : "linear-gradient(90deg, var(--brand-accent), #ffffff)",
              borderRadius: "var(--brand-radius-md)",
              color: isCrb ? "var(--brand-on-primary)" : "#1c1917",
            }}
          >
            Build your party now
          </Link>
          <Link
            href={withBrand("/products", brandSlug)}
            className="inline-flex items-center justify-center px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-white/90 underline-offset-4 hover:underline"
          >
            Browse catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
