/**
 * Category-page → city-landing cross-links (Phase 6).
 *
 * Server-rendered. Each `/categories/{slug}` gets a small block linking to the
 * top related service landing across the cities we serve, so categories stop
 * being internal-link dead ends and feed the city mesh.
 *
 * Renders nothing if no service matches the category — never broken links.
 */

import Link from "next/link";
import { Container } from "@/components/marketing/container";
import { withBrand } from "@/lib/brand/with-brand-href";
import type { BrandSlug } from "@/lib/brand/config";
import { getCategoryRelatedLandings } from "@/lib/seo/internal-linking";
import { cn } from "@/lib/utils/cn";

export function CategoryRelatedLandings({
  categorySlug,
  brand,
}: {
  categorySlug: string;
  brand: BrandSlug;
}) {
  const set = getCategoryRelatedLandings(categorySlug);
  if (!set) return null;
  const { service, links } = set;
  const isCrb = brand === "crb";

  return (
    <section
      aria-label={`${service.label} by city`}
      className={cn(
        "border-t py-10 sm:py-14",
        isCrb ? "border-slate-700/50 bg-slate-900/30" : "border-amber-200/30 bg-white/55",
      )}
    >
      <Container>
        <div className="max-w-2xl">
          <p
            className={cn(
              "text-[11px] font-bold uppercase tracking-[0.2em]",
              isCrb ? "text-cyan-200/85" : "text-stone-500",
            )}
          >
            {service.label} · By city
          </p>
          <h2
            className={cn(
              "mt-2 text-xl font-black tracking-tight sm:text-2xl",
              isCrb ? "text-white" : "text-stone-900",
            )}
          >
            {service.label} across the Inland Empire
          </h2>
          <p
            className={cn(
              "mt-2 text-sm leading-relaxed",
              isCrb ? "text-slate-300" : "text-stone-600",
            )}
          >
            City-specific pages with local delivery notes, FAQs, and the right
            inventory for the address.
          </p>
        </div>

        <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={withBrand(l.href, brand)}
                className={cn(
                  "flex items-center justify-between gap-3 px-4 py-3 text-sm font-bold ring-1 transition",
                  isCrb
                    ? "bg-slate-900/65 text-cyan-100 ring-cyan-400/25 hover:bg-slate-900 hover:ring-cyan-400/55"
                    : "bg-white/85 text-stone-800 ring-orange-400/22 hover:bg-white hover:ring-orange-400/50",
                )}
                style={{ borderRadius: "var(--brand-radius-md)" }}
              >
                <span>{l.label}</span>
                <span aria-hidden className="opacity-60">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
