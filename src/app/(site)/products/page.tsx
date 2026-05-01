import type { Metadata } from "next";
import Link from "next/link";
import { BRANDS } from "@/lib/brand/config";
import {
  resolveBrandSlugFromPageSearchParam,
  resolveHomeBrandSlug,
} from "@/lib/brand/resolve-brand";
import { withBrand } from "@/lib/brand/with-brand-href";
import { getProducts } from "@/lib/catalog/get-products";
import { getSiteSettings } from "@/lib/site/get-site-settings";
import { formatPhoneDisplay } from "@/lib/utils/format-phone";
import { CatalogImage } from "@/components/media/catalog-image";
import { ProductCard } from "@/components/marketing/product-card";
import { SectionTitle } from "@/components/marketing/section-title";
import { cn } from "@/lib/utils/cn";
import { categoryBuildHref } from "@/lib/catalog/category-carousel";
import { getRentalCategories } from "@/lib/catalog/get-rental-categories";
import { catalogProductToProductCard } from "@/lib/catalog/map-catalog-product";

export async function generateMetadata(): Promise<Metadata> {
  const brand = BRANDS[resolveHomeBrandSlug(null)];
  return {
    title: "Jumpers & party rentals",
    description: `Browse jumpers, combos, and add-ons from ${brand.displayName}. Serving Moreno Valley, Perris, and Riverside — check live availability and pricing online.`,
  };
}
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string | string[] }>;
}) {
  const sp = await searchParams;
  const brandSlug = resolveBrandSlugFromPageSearchParam(sp.brand);
  const brand = BRANDS[brandSlug];
  const isCrb = brandSlug === "crb";
  const [rawProducts, siteSettings, categoryRows] = await Promise.all([
    getProducts(brandSlug),
    getSiteSettings(brandSlug),
    getRentalCategories({ brandSlug }),
  ]);
  const products = rawProducts.map(catalogProductToProductCard);
  const phoneDisplay = siteSettings?.support_phone
    ? formatPhoneDisplay(siteSettings.support_phone)
    : brand.supportPhoneDisplay;
  const bannerSrc = products[0]?.imageSrc || "/images/placeholder-party-rental.jpg";
  const bannerAlt = products[0]?.title ?? "Party rentals";

  return (
    <div className={cn(isCrb && "text-slate-100")}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <CatalogImage
            src={bannerSrc}
            alt={bannerAlt}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div
            className={cn(
              "absolute inset-0",
              isCrb
                ? "bg-gradient-to-r from-slate-950 via-slate-900/95 to-slate-950/92"
                : "bg-gradient-to-r from-yellow-200/95 via-orange-100/92 to-pink-100/90",
            )}
          />
          <div
            className="absolute inset-0 opacity-40 mix-blend-soft-light"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.14'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
            aria-hidden
          />
        </div>

        <div className="relative mx-auto w-full max-w-[1280px] px-6 py-14 sm:py-20">
          <p
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em]",
              isCrb
                ? "bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-400/35"
                : "bg-white/75 text-orange-950 ring-1 ring-orange-400/25 backdrop-blur",
            )}
          >
            {brand.displayName}
          </p>
          <h1
            className={cn(
              "mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl",
              isCrb ? "text-white" : "text-stone-900",
            )}
          >
            The catalog is the confetti cannon.
          </h1>
          <p
            className={cn(
              "mt-5 max-w-2xl text-base font-medium leading-relaxed sm:text-lg",
              isCrb ? "text-cyan-100/90" : "text-orange-950/90",
            )}
          >
            Big imagery, footprint clarity, and transparent starting prices—browse
            with confidence before you jump into checkout.
          </p>

          <nav
            className="mt-10 flex flex-wrap gap-2"
            aria-label="Browse by category"
          >
            <Link
              href={withBrand("/products", brandSlug)}
              className={cn(
                "px-4 py-2.5 text-sm font-black shadow-lg transition-[transform,box-shadow]",
                isCrb
                  ? "text-slate-950 shadow-lg shadow-cyan-500/30"
                  : "text-white shadow-lg",
              )}
              style={{
                borderRadius: "var(--brand-radius-md)",
                background:
                  "linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))",
              }}
            >
              All rentals
            </Link>
            {categoryRows.map((cat) => (
              <Link
                key={cat.slug}
                href={withBrand(
                  categoryBuildHref(cat.slug),
                  brandSlug,
                )}
                className={cn(
                  "px-4 py-2.5 text-sm font-black transition-[transform,box-shadow]",
                  isCrb
                    ? "border border-cyan-400/35 bg-slate-950/45 text-cyan-100 backdrop-blur hover:border-orange-400/55"
                    : "border border-orange-400/22 bg-white/70 text-orange-950/90 backdrop-blur hover:bg-white/90",
                )}
                style={{ borderRadius: "var(--brand-radius-md)" }}
              >
                {cat.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section
        className={cn(
          "relative mt-10 sm:mt-14",
          !isCrb && "border-t border-orange-400/15",
          isCrb && "border-t border-cyan-400/18",
        )}
      >
        <div className="mx-auto w-full max-w-[1280px] px-6 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16">
          <SectionTitle
            tone={isCrb ? "onDark" : "default"}
            eyebrow="Desire-first merchandising"
            title="Pick the unit your guests won’t stop talking about"
            description="Lead with a hero, then wander through mismatched sizes on purpose — it feels like a showroom, not a spreadsheet."
          />
          {products.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard
                  key={p.slug}
                  brand={brand}
                  product={p}
                  visual="catalog"
                />
              ))}
            </div>
          ) : (
            <p
              className={cn(
                "mt-10 text-center text-sm font-semibold",
                isCrb ? "text-slate-400" : "text-stone-600",
              )}
            >
              No active rentals listed for this brand yet — check back soon or call{" "}
              {phoneDisplay}.
            </p>
          )}

        <div
          className={cn(
            "relative mt-16 overflow-hidden border p-8 shadow-2xl sm:flex sm:items-center sm:justify-between sm:gap-10 sm:p-10",
            isCrb
              ? "border-cyan-400/30 bg-slate-950/72 backdrop-blur-md"
              : "border-orange-400/22 bg-white/85 backdrop-blur",
          )}
          style={{ borderRadius: "var(--brand-radius-lg)" }}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-orange-400/40 to-cyan-400/28 blur-3xl"
            aria-hidden
          />
          <div className="relative max-w-xl">
            <p
              className={cn(
                "text-2xl font-black",
                isCrb ? "text-white" : "text-stone-900",
              )}
            >
              Not sure which jumper fits your yard?
            </p>
            <p
              className={cn(
                "mt-2 text-sm font-semibold",
                isCrb ? "text-slate-300" : "text-stone-600",
              )}
            >
              {phoneDisplay} — we&apos;ll match footprint, stakes vs
              sandbags, and gate realities in minutes.
            </p>
          </div>
          <Link
            href={withBrand("/build", brandSlug)}
            className="relative mt-6 inline-flex w-full items-center justify-center px-6 py-3.5 text-sm font-black text-white shadow-xl sm:mt-0 sm:w-auto"
            style={{
              background: isCrb
                ? "linear-gradient(90deg, var(--brand-secondary), #f472b6)"
                : "linear-gradient(90deg, var(--brand-secondary), var(--brand-accent))",
              borderRadius: "var(--brand-radius-md)",
            }}
          >
            Open the builder
          </Link>
        </div>
        </div>
      </section>
    </div>
  );
}
