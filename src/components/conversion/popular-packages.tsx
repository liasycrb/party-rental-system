import Link from "next/link";
import type { Brand } from "@/lib/brand/config";
import { POPULAR_PACKAGES } from "@/lib/marketing/popular-packages";
import type { RentalPackage } from "@/lib/marketing/get-rental-packages";
import { Container } from "@/components/marketing/container";
import { SectionTitle } from "@/components/marketing/section-title";
import { cn } from "@/lib/utils/cn";

/** Normalised shape used for rendering — works for both DB and hardcoded sources. */
type DisplayPackage = {
  id: string;
  title: string;
  tagline: string | null;
  includes: string[];
  fromPrice: number;
  badge?: string | null;
  primaryProductSlug: string | null;
};

function fromRentalPackage(p: RentalPackage): DisplayPackage {
  return {
    id: p.id,
    title: p.title,
    tagline: p.tagline,
    includes: p.includes,
    fromPrice: p.from_price,
    badge: p.badge,
    primaryProductSlug: p.primary_product_slug,
  };
}

export function PopularPackagesSection({
  brand,
  packages: dbPackages,
  id = "packages-heading",
}: {
  brand: Brand;
  /** DB packages from rental_packages table. Falls back to hardcoded list when empty/null. */
  packages?: RentalPackage[] | null;
  id?: string;
}) {
  const isCrb = brand.slug === "crb";
  const b = brand.slug;

  const displayPackages: DisplayPackage[] =
    dbPackages && dbPackages.length > 0
      ? dbPackages.map(fromRentalPackage)
      : POPULAR_PACKAGES.map((p) => ({
          id: p.id,
          title: p.title,
          tagline: p.tagline,
          includes: p.includes,
          fromPrice: p.fromPrice,
          badge: p.badge ?? null,
          primaryProductSlug: p.primaryProductSlug,
        }));

  return (
    <section
      className="relative py-14 sm:py-20"
      aria-labelledby={id}
      style={{ background: "var(--brand-stripe-packages)" }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-80"
        style={{
          backgroundImage: "var(--brand-packages-glow)",
        }}
        aria-hidden
      />
      <Container className="relative">
        <SectionTitle
          id={id}
          tone={isCrb ? "onDark" : "default"}
          eyebrow="Popular setups"
          title="Pick a package. Personalize in 60 seconds."
          description="Real bundles your customers actually book — each jumps into the builder with the right starter jumper."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {displayPackages.map((pkg, i) => (
            <div
              key={pkg.id}
              className={cn(
                "relative flex flex-col overflow-hidden border shadow-2xl transition hover:-translate-y-1",
                isCrb
                  ? "border-cyan-400/28 bg-slate-950/72 backdrop-blur-md"
                  : "border-orange-400/22 bg-white/92 backdrop-blur",
                i === 0 &&
                  (isCrb
                    ? "ring-2 ring-orange-400/55 lg:scale-[1.02]"
                    : "ring-2 ring-pink-400/50 lg:scale-[1.02]"),
              )}
              style={{ borderRadius: "var(--brand-radius-lg)" }}
            >
              {pkg.badge ? (
                <span
                  className={cn(
                    "absolute right-4 top-4 z-10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg",
                  )}
                  style={{
                    background: isCrb
                      ? "linear-gradient(90deg, var(--brand-secondary), #f472b6)"
                      : "linear-gradient(90deg, var(--brand-secondary), var(--brand-accent))",
                    borderRadius: "var(--brand-radius-md)",
                  }}
                >
                  {pkg.badge}
                </span>
              ) : null}
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <p
                  className={cn(
                    "text-[11px] font-black uppercase tracking-[0.22em]",
                    isCrb ? "text-cyan-200/85" : "text-pink-600",
                  )}
                >
                  From ${pkg.fromPrice}
                </p>
                <h3
                  className={cn(
                    "mt-2 text-xl font-black leading-tight sm:text-2xl",
                    isCrb ? "text-white" : "text-stone-900",
                  )}
                >
                  {pkg.title}
                </h3>
                <p
                  className={cn(
                    "mt-2 text-sm font-semibold",
                    isCrb ? "text-slate-300" : "text-stone-600",
                  )}
                >
                  {pkg.tagline}
                </p>
                <ul
                  className={cn(
                    "mt-4 space-y-2 text-sm font-semibold",
                    isCrb ? "text-slate-200" : "text-stone-700",
                  )}
                >
                  {pkg.includes.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span
                        className={isCrb ? "text-cyan-400" : "text-teal-500"}
                        aria-hidden
                      >
                        ✓
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link
                    href={`/package-inquiry?package=${pkg.id}&brand=${b}`}
                    className="inline-flex w-full items-center justify-center px-5 py-3 text-center text-sm font-black text-white shadow-lg transition hover:brightness-110"
                    style={{
                      background: isCrb
                        ? "linear-gradient(90deg, var(--brand-primary), #22d3ee)"
                        : "linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))",
                      borderRadius: "var(--brand-radius-md)",
                    }}
                  >
                    Book this setup
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
