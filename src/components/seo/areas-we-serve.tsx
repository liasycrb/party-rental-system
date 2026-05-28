/**
 * Footer "Areas We Serve" mesh (Phase 6).
 *
 * Server-rendered list of every (top-service × city) link grouped by service.
 * Rendered inside `SiteFooter`, so the mesh ships on every page of both brand
 * domains — including the homepage, build, products, and SEO landings — with
 * URLs that always come from `landingPath()` (no cross-brand contamination).
 *
 * Visual approach: compact, brand-aware, mobile-friendly. Matches the
 * neighbour footer columns (small caps section title + tight link list).
 */

import Link from "next/link";
import type { Brand } from "@/lib/brand/config";
import { withBrand } from "@/lib/brand/with-brand-href";
import { getFooterAreasServed } from "@/lib/seo/internal-linking";
import { cn } from "@/lib/utils/cn";

export function AreasWeServeFooter({ brand }: { brand: Brand }) {
  const groups = getFooterAreasServed();
  if (groups.length === 0) return null;
  const isCrb = brand.slug === "crb";

  const linkClass = cn(
    "text-[13px] font-semibold text-white/85 transition-colors hover:text-white hover:underline hover:decoration-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    isCrb ? "hover:decoration-cyan-300" : "hover:decoration-amber-300",
  );

  return (
    <section
      aria-label="Areas we serve"
      className="mt-12 border-t border-white/14 pt-10"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/72">
        Areas we serve
      </p>
      <div className="mt-5 grid gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((g) => (
          <div key={g.service.slug}>
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-white/55">
              {g.service.label}
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-1 sm:gap-y-2.5">
              {g.links.map((l) => (
                <li key={`${g.service.slug}:${l.href}`}>
                  <Link href={withBrand(l.href, brand.slug)} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
