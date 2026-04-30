import Link from "next/link";
import type { Brand } from "@/lib/brand/config";
import { withBrand } from "@/lib/brand/with-brand-href";
import { cn } from "@/lib/utils/cn";
import { formatPhoneDisplay, formatPhoneTel } from "@/lib/utils/format-phone";
import { FooterBrandTrigger } from "@/components/layouts/footer-brand-trigger";

export type FooterOverride = {
  headline: string | null;
  phone: string | null;
  email: string | null;
  serviceArea: string | null;
  copyright: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
};

export function SiteFooter({
  brand,
  phoneOverride,
  footerOverride,
}: {
  brand: Brand;
  phoneOverride?: string | null;
  footerOverride?: FooterOverride | null;
}) {
  const year = new Date().getFullYear();
  const isCrb = brand.slug === "crb";

  // Phone: footer-specific phone > header phone override > brand default
  const activePhone = footerOverride?.phone || phoneOverride;
  const phoneTel = activePhone ? formatPhoneTel(activePhone) : brand.supportPhone;
  const phoneDisplay = activePhone
    ? formatPhoneDisplay(activePhone)
    : brand.supportPhoneDisplay;

  const headline =
    footerOverride?.headline ||
    `${brand.copy.trustLine}. Serving Moreno Valley, Riverside, and neighbors with one shared, real-time inventory calendar.`;

  const copyrightLine =
    footerOverride?.copyright || `© ${year} ${brand.displayName}. All rights reserved.`;

  const serviceAreaLine =
    footerOverride?.serviceArea ||
    "Deposits non-refundable except qualifying weather — shown at booking.";

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
          {/* Column 1 – brand description */}
          <div>
            <FooterBrandTrigger
              brandSlug={brand.slug}
              displayName={brand.displayName}
            />
            <p className="mt-3 text-sm leading-relaxed text-white/85">{headline}</p>
          </div>

          {/* Column 2 – navigation */}
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

          {/* Column 3 – contact */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
              Call the crew
            </p>
            <p className="mt-4 text-sm">
              <a href={`tel:${phoneTel}`} className="text-lg font-bold hover:underline">
                {phoneDisplay}
              </a>
            </p>
            {footerOverride?.email && (
              <p className="mt-2 text-sm">
                <a
                  href={`mailto:${footerOverride.email}`}
                  className="text-white/80 hover:text-white hover:underline"
                >
                  {footerOverride.email}
                </a>
              </p>
            )}
            {(footerOverride?.facebookUrl || footerOverride?.instagramUrl) && (
              <div className="mt-4 flex gap-4 text-sm font-semibold text-white/70">
                {footerOverride.facebookUrl && (
                  <a
                    href={footerOverride.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white hover:underline"
                  >
                    Facebook
                  </a>
                )}
                {footerOverride.instagramUrl && (
                  <a
                    href={footerOverride.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white hover:underline"
                  >
                    Instagram
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-white/15 pt-8 text-xs text-white/70">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>{copyrightLine}</p>
            <p>{serviceAreaLine}</p>
          </div>
          <p className="mt-3 text-[11px] text-white/40">
            Built by{" "}
            <a
              href="https://growthosystems.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity duration-200 hover:text-white/90 hover:underline"
            >
              GrowthOS Systems
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
