import type { ReactNode } from "react";
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

export type FooterCategoryLink = Readonly<{ label: string; href: string }>;

const TRUST_TAGLINE =
  "Clean, fun, and reliable party rentals for birthdays, school events, family gatherings, and community celebrations.";

function FooterSectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/72">
      {children}
    </p>
  );
}

export function SiteFooter({
  brand,
  phoneOverride,
  footerOverride,
  footerCategoryLinks,
}: {
  brand: Brand;
  phoneOverride?: string | null;
  footerOverride?: FooterOverride | null;
  /** Footer category links from static catalog — keyed per brand by layout caller */
  footerCategoryLinks?: readonly FooterCategoryLink[];
}) {
  const year = new Date().getFullYear();
  const isCrb = brand.slug === "crb";

  const rentalCategoryFooterLinks: readonly FooterCategoryLink[] =
    footerCategoryLinks && footerCategoryLinks.length > 0
      ? footerCategoryLinks
      : [{ label: "Browse rentals", href: "/products" }];

  const activePhone = footerOverride?.phone || phoneOverride;
  const phoneTel = activePhone ? formatPhoneTel(activePhone) : brand.supportPhone;
  const phoneDisplay = activePhone
    ? formatPhoneDisplay(activePhone)
    : brand.supportPhoneDisplay;

  const serviceAreaPrimary =
    (footerOverride?.serviceArea ?? "").trim() ||
    "Serving Moreno Valley and nearby communities.";

  const attribution =
    footerOverride?.copyright?.trim() ||
    `© ${year} ${brand.displayName}. All rentals subject to availability.`;

  const sectionLinkClass = cn(
    "text-sm font-semibold text-white transition-colors hover:text-white hover:underline hover:decoration-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    isCrb ? "hover:decoration-cyan-300" : "hover:decoration-amber-300",
  );

  const hrefFor = (path: string) => withBrand(path, brand.slug);

  return (
    <footer
      id="contact"
      className={cn(
        "relative mt-auto overflow-hidden border-t text-white",
        !isCrb && "border-white/12",
      )}
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.22) 0%, transparent 32%), var(--brand-footer-backdrop)",
        borderColor: "var(--brand-border)",
      }}
    >
      <div className="pointer-events-none absolute -right-28 top-0 h-72 w-72 rounded-full bg-white/[0.06] blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-52 w-52 rounded-full bg-black/35 blur-3xl sm:opacity-80" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pb-11 sm:pt-14 lg:pb-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-12">
          {/* A – Brand */}
          <div className="lg:col-span-4">
            <FooterBrandTrigger
              brandSlug={brand.slug}
              displayName={brand.displayName}
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/88">{TRUST_TAGLINE}</p>
          </div>

          {/* B – Quick links */}
          <div className="lg:col-span-2">
            <FooterSectionTitle>Quick links</FooterSectionTitle>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href={hrefFor("/products")} className={sectionLinkClass}>
                  Browse Rentals
                </Link>
              </li>
              <li>
                <Link href={hrefFor("/build")} className={sectionLinkClass}>
                  Check Availability
                </Link>
              </li>
              <li>
                <a href={`tel:${phoneTel}`} className={sectionLinkClass}>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* C – Rental categories */}
          <div className="lg:col-span-3">
            <FooterSectionTitle>Rental categories</FooterSectionTitle>
            <ul className="mt-4 grid gap-3 sm:max-lg:grid-cols-2">
              {rentalCategoryFooterLinks.map((row) => (
                <li key={`${row.href}-${row.label}`}>
                  <Link href={hrefFor(row.href)} className={sectionLinkClass}>
                    {row.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* D – Contact */}
          <div className="lg:col-span-3">
            <FooterSectionTitle>Contact</FooterSectionTitle>
            <p className="mt-4">
              <a
                href={`tel:${phoneTel}`}
                className={cn(
                  "inline-block text-lg font-bold hover:underline",
                  isCrb ? "text-cyan-100" : "text-amber-100",
                )}
              >
                {phoneDisplay}
              </a>
            </p>
            <p className="mt-3 text-sm font-medium leading-relaxed text-white/78">
              {serviceAreaPrimary}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/62">
              Availability is confirmed after your request is reviewed.
            </p>
            {footerOverride?.email && (
              <p className="mt-3 text-sm font-medium">
                <a href={`mailto:${footerOverride.email}`} className="text-white/90 hover:text-white hover:underline">
                  {footerOverride.email}
                </a>
              </p>
            )}
            {(footerOverride?.facebookUrl || footerOverride?.instagramUrl) ? (
              <div className="mt-5 flex gap-5 text-xs font-semibold text-white/70">
                {footerOverride.facebookUrl ? (
                  <a
                    href={footerOverride.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white hover:underline"
                  >
                    Facebook
                  </a>
                ) : null}
                {footerOverride.instagramUrl ? (
                  <a
                    href={footerOverride.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white hover:underline"
                  >
                    Instagram
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-12 border-t border-white/14 pt-7 text-xs text-white/68">
          <p className="text-center leading-relaxed sm:text-left">{attribution}</p>
        </div>
      </div>
    </footer>
  );
}
