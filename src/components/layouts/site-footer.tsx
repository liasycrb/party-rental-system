import Link from "next/link";
import type { Brand } from "@/lib/brand/config";
import { withBrand } from "@/lib/brand/with-brand-href";
import { cn } from "@/lib/utils/cn";

export function SiteFooter({ brand }: { brand: Brand }) {
  const year = new Date().getFullYear();
  const isCrb = brand.slug === "crb";

  return (
    <footer
      className={cn(
        "relative mt-auto overflow-hidden border-t text-white",
        !isCrb && "border-white/10",
      )}
      style={{
        background: "var(--brand-footer-backdrop)",
        borderColor: "var(--brand-border)",
      }}
    >
      <div
        className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="text-lg font-bold tracking-tight">{brand.displayName}</p>
            <p className="mt-3 text-sm leading-relaxed text-white/85">
              {brand.copy.trustLine}. Serving Moreno Valley, Riverside, and
              neighbors with one shared, real-time inventory calendar.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
              Get started
            </p>
            <ul className="mt-4 space-y-3 text-sm font-semibold">
              <li>
                <Link
                  href={withBrand("/products", brand.slug)}
                  className="text-white hover:underline hover:decoration-2 hover:decoration-amber-300"
                >
                  Browse inflatables
                </Link>
              </li>
              <li>
                <Link
                  href={withBrand("/build", brand.slug)}
                  className="text-white hover:underline hover:decoration-2 hover:decoration-amber-300"
                >
                  Build your event
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
              Call the crew
            </p>
            <p className="mt-4 text-sm">
              <a
                href={`tel:${brand.supportPhone}`}
                className="text-lg font-bold hover:underline"
              >
                {brand.supportPhoneDisplay}
              </a>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/75">
              Footer blocks stay link-rich for local SEO: service cities,
              FAQs, and reviews plug in here without changing layout.
            </p>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-white/15 pt-8 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {brand.displayName}. All rights reserved.
          </p>
          <p>Deposits non-refundable except qualifying weather — shown at booking.</p>
        </div>
      </div>
    </footer>
  );
}
