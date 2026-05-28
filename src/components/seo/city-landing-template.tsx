/**
 * Shared SEO city landing template (Phase 3).
 *
 * One server component used by every `/{service}/{city}` route (wired in
 * Phase 4). Takes a precomputed `LandingPageModel` (from `composeLanding`) plus
 * the active brand and the already-filtered catalog rows, and renders the full
 * page — hero, intro, why-us/delivery/safety, featured inventory, FAQs, nearby
 * cities, related services, final CTA — and emits LocalBusiness/Service/
 * FAQPage/BreadcrumbList JSON-LD.
 *
 * Why a server component:
 *   - SEO landings need full HTML on first byte (crawler + LCP).
 *   - Brand theming is already injected via CSS variables by `(site)/layout`.
 *   - Existing `ProductCard` and image components handle their own client-only
 *     islands (lightbox), so we get interactivity without making this template
 *     a client component.
 *
 * Multi-brand: the same template renders for both Lias and CRB. Brand voice is
 * already baked into `model` (via tokens at compose time); brand visuals come
 * through `brand.theme.*` CSS values and `isCrb` light/dark branching.
 */

import Link from "next/link";
import type { Brand } from "@/lib/brand/config";
import type { CatalogProduct } from "@/lib/catalog/get-products";
import { catalogProductToProductCard } from "@/lib/catalog/map-catalog-product";
import { withBrand } from "@/lib/brand/with-brand-href";
import { Container } from "@/components/marketing/container";
import { ProductCard } from "@/components/marketing/product-card";
import { SectionTitle } from "@/components/marketing/section-title";
import {
  buildLandingJsonLd,
  safeJsonLdString,
} from "@/lib/seo/schema";
import type { LandingPageModel } from "@/lib/seo/landing-content";
import { cn } from "@/lib/utils/cn";

export type CityLandingTemplateProps = {
  /** Output of `composeLanding({ service, city, brand })`. */
  model: LandingPageModel;
  /** Active brand — full config so we can use `brand.theme.*`. */
  brand: Brand;
  /** Catalog rows already filtered by `filterServiceProducts`. */
  products: CatalogProduct[];
  /** Cap on featured cards. Remaining are reachable via `/products`. */
  featuredLimit?: number;
};

/** Extract a clickable internal path from an absolute breadcrumb URL. */
function pathFromAbsoluteUrl(absolute: string): string {
  try {
    return new URL(absolute).pathname;
  } catch {
    return absolute;
  }
}

export function CityLandingTemplate({
  model,
  brand,
  products,
  featuredLimit = 8,
}: CityLandingTemplateProps) {
  const isCrb = brand.slug === "crb";
  const cards = products.slice(0, featuredLimit).map(catalogProductToProductCard);
  const jsonLd = buildLandingJsonLd(model.schemaInputs);
  const buildHref = withBrand("/build", brand.slug);
  const productsHref = withBrand("/products", brand.slug);
  const telHref = `tel:${brand.supportPhone}`;
  const { service, city } = model.schemaInputs;
  const hasInventory = cards.length > 0;

  return (
    <article className={cn(isCrb && "text-slate-100")}>
      {/* JSON-LD: LocalBusiness, Service, BreadcrumbList, FAQPage (when present) */}
      {jsonLd.map((obj, i) => (
        <script
          // eslint-disable-next-line react/no-array-index-key -- order is deterministic per build
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLdString(obj) }}
        />
      ))}

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: brand.theme.heroBackdrop }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 18% 18%, ${brand.theme.heroBlobA}, transparent 55%), radial-gradient(circle at 82% 12%, ${brand.theme.heroBlobB}, transparent 50%)`,
          }}
          aria-hidden
        />
        <Container className="relative py-14 sm:py-20">
          {/* Visual breadcrumb (the JSON-LD version is emitted above). */}
          <nav
            aria-label="Breadcrumb"
            className={cn(
              "mb-5 text-[11px] font-bold uppercase tracking-[0.18em]",
              isCrb ? "text-cyan-200/85" : "text-orange-950/80",
            )}
          >
            <ol className="flex flex-wrap items-center gap-x-2">
              {model.breadcrumb.map((b, i) => {
                const isLast = i === model.breadcrumb.length - 1;
                return (
                  <li key={b.url} className="flex items-center gap-x-2">
                    {i > 0 ? <span aria-hidden className="opacity-50">/</span> : null}
                    {isLast ? (
                      <span aria-current="page" className="opacity-90">
                        {b.name}
                      </span>
                    ) : (
                      <Link
                        href={withBrand(pathFromAbsoluteUrl(b.url), brand.slug)}
                        className="hover:underline"
                      >
                        {b.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <p
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em]",
              isCrb
                ? "bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-400/35"
                : "bg-white/80 text-orange-950 ring-1 ring-orange-400/30 backdrop-blur",
            )}
          >
            {service.label} · {city.name}, {city.stateAbbr}
          </p>

          <h1
            className={cn(
              "mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl",
              isCrb ? "text-white" : "text-stone-900",
            )}
          >
            {model.h1}
          </h1>

          <p
            className={cn(
              "mt-5 max-w-2xl text-base font-semibold leading-relaxed sm:text-lg",
              isCrb ? "text-cyan-100/90" : "text-orange-950/90",
            )}
          >
            {model.heroSubtitle}
          </p>
          <p
            className={cn(
              "mt-3 max-w-2xl text-sm leading-relaxed",
              isCrb ? "text-slate-300" : "text-orange-950/75",
            )}
          >
            {model.heroLocalLine}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={buildHref}
              className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-black text-white shadow-xl transition hover:brightness-110 active:scale-[0.98]"
              style={{
                background: isCrb
                  ? "linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))"
                  : "linear-gradient(90deg, var(--brand-secondary), var(--brand-accent))",
                borderRadius: "var(--brand-radius-md)",
              }}
            >
              {model.ctaLabel} →
            </Link>
            <a
              href={telHref}
              className={cn(
                "inline-flex items-center justify-center px-5 py-3.5 text-sm font-black transition active:scale-[0.98]",
                isCrb
                  ? "bg-slate-900/80 text-cyan-100 ring-1 ring-cyan-400/40 hover:bg-slate-900"
                  : "bg-white/90 text-stone-900 ring-1 ring-orange-400/30 hover:bg-white",
              )}
              style={{ borderRadius: "var(--brand-radius-md)" }}
            >
              Call {brand.supportPhoneDisplay}
            </a>
          </div>
        </Container>
      </section>

      {/* INTRO */}
      <section className="py-12 sm:py-16">
        <Container className="max-w-3xl">
          {model.introParagraphs.map((p, i) => (
            <p
              // eslint-disable-next-line react/no-array-index-key -- intros are short, stable
              key={i}
              className={cn(
                "mb-5 text-base leading-relaxed last:mb-0 sm:text-lg",
                isCrb ? "text-slate-300" : "text-stone-700",
              )}
            >
              {p}
            </p>
          ))}
        </Container>
      </section>

      {/* WHY US + DELIVERY + SAFETY */}
      <section
        className={cn(
          "py-12 sm:py-16",
          isCrb ? "bg-slate-900/40" : "bg-amber-50/50",
        )}
      >
        <Container>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                title: `Why families in ${city.name} choose us`,
                body: model.whyUsParagraph,
              },
              { title: "Delivery & setup", body: model.deliveryParagraph },
              {
                title: "Safety we don't shortcut",
                body: model.safetyParagraph,
              },
            ].map((card) => (
              <div
                key={card.title}
                className={cn(
                  "flex flex-col gap-3 p-6 shadow-lg",
                  isCrb
                    ? "bg-slate-900/80 ring-1 ring-cyan-400/25"
                    : "bg-white/85 ring-1 ring-orange-400/20",
                )}
                style={{ borderRadius: "var(--brand-radius-lg)" }}
              >
                <h3
                  className={cn(
                    "text-lg font-black tracking-tight",
                    isCrb ? "text-white" : "text-stone-900",
                  )}
                >
                  {card.title}
                </h3>
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    isCrb ? "text-slate-300" : "text-stone-600",
                  )}
                >
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FEATURED INVENTORY */}
      <section className="py-12 sm:py-16">
        <Container>
          <SectionTitle
            eyebrow={`${service.label} · ${city.name}, ${city.stateAbbr}`}
            title={model.inventoryHeading}
            tone={isCrb ? "onDark" : "default"}
          />
          {hasInventory ? (
            <>
              <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cards.map((c) => (
                  <ProductCard
                    key={c.slug}
                    brand={brand}
                    product={c}
                    visual="catalog"
                  />
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link
                  href={productsHref}
                  className={cn(
                    "inline-flex items-center text-sm font-bold hover:underline",
                    isCrb ? "text-cyan-300" : "text-pink-600",
                  )}
                >
                  See the full catalog →
                </Link>
              </div>
            </>
          ) : (
            <div
              className={cn(
                "mt-8 p-6 ring-1 sm:p-8",
                isCrb
                  ? "bg-slate-900/60 text-slate-200 ring-cyan-400/30"
                  : "bg-amber-50 text-stone-700 ring-orange-400/25",
              )}
              style={{ borderRadius: "var(--brand-radius-lg)" }}
            >
              <p className="text-base leading-relaxed">
                {model.emptyInventoryFallback ??
                  `Inventory is updating — call ${brand.supportPhoneDisplay} for current ${service.phrase} availability in ${city.name}.`}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={telHref}
                  className="inline-flex items-center justify-center px-5 py-3 text-sm font-black text-white shadow-md"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))",
                    borderRadius: "var(--brand-radius-md)",
                  }}
                >
                  Call {brand.supportPhoneDisplay}
                </a>
                <Link
                  href={productsHref}
                  className={cn(
                    "inline-flex items-center justify-center px-5 py-3 text-sm font-bold ring-1",
                    isCrb
                      ? "bg-slate-900/80 text-cyan-100 ring-cyan-400/40"
                      : "bg-white text-stone-900 ring-orange-400/30",
                  )}
                  style={{ borderRadius: "var(--brand-radius-md)" }}
                >
                  See full catalog
                </Link>
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* FAQ */}
      {model.faqs.length > 0 ? (
        <section
          className={cn(
            "py-12 sm:py-16",
            isCrb ? "bg-slate-900/40" : "bg-white",
          )}
        >
          <Container className="max-w-3xl">
            <SectionTitle
              eyebrow="Questions, answered"
              title={`${service.label} in ${city.name} — FAQs`}
              tone={isCrb ? "onDark" : "default"}
            />
            <div className="mt-8 space-y-3">
              {model.faqs.map((f) => (
                <details
                  key={f.q}
                  className={cn(
                    "group px-5 py-4 ring-1 transition",
                    isCrb
                      ? "bg-slate-900/70 ring-cyan-400/25 open:ring-cyan-400/55"
                      : "bg-amber-50/60 ring-orange-400/22 open:ring-orange-400/50",
                  )}
                  style={{ borderRadius: "var(--brand-radius-lg)" }}
                >
                  <summary
                    className={cn(
                      "flex cursor-pointer list-none items-center justify-between gap-3 text-base font-bold",
                      isCrb ? "text-white" : "text-stone-900",
                    )}
                  >
                    <span>{f.q}</span>
                    <span
                      aria-hidden
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black transition group-open:rotate-45",
                        isCrb
                          ? "bg-cyan-400/15 text-cyan-200"
                          : "bg-orange-400/15 text-orange-800",
                      )}
                    >
                      +
                    </span>
                  </summary>
                  <p
                    className={cn(
                      "mt-3 text-sm leading-relaxed",
                      isCrb ? "text-slate-300" : "text-stone-700",
                    )}
                  >
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* NEARBY CITIES + RELATED SERVICES */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            {model.nearbyServiceLinks.length > 0 ? (
              <div>
                <SectionTitle
                  eyebrow="Areas we serve"
                  title={`${service.label} near ${city.name}`}
                  tone={isCrb ? "onDark" : "default"}
                />
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {model.nearbyServiceLinks.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={withBrand(l.href, brand.slug)}
                        className={cn(
                          "flex items-center justify-between gap-3 px-4 py-3 text-sm font-bold ring-1 transition",
                          isCrb
                            ? "bg-slate-900/65 text-cyan-100 ring-cyan-400/25 hover:bg-slate-900 hover:ring-cyan-400/55"
                            : "bg-white/85 text-stone-800 ring-orange-400/22 hover:bg-white hover:ring-orange-400/50",
                        )}
                        style={{ borderRadius: "var(--brand-radius-md)" }}
                      >
                        <span>{service.label} in {l.label}</span>
                        <span aria-hidden className="opacity-60">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {model.relatedServiceLinks.length > 0 ? (
              <div>
                <SectionTitle
                  eyebrow="Related rentals"
                  title={`Other ${city.name} rentals`}
                  tone={isCrb ? "onDark" : "default"}
                />
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {model.relatedServiceLinks.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={withBrand(l.href, brand.slug)}
                        className={cn(
                          "flex items-center justify-between gap-3 px-4 py-3 text-sm font-bold ring-1 transition",
                          isCrb
                            ? "bg-slate-900/65 text-cyan-100 ring-cyan-400/25 hover:bg-slate-900 hover:ring-cyan-400/55"
                            : "bg-white/85 text-stone-800 ring-orange-400/22 hover:bg-white hover:ring-orange-400/50",
                        )}
                        style={{ borderRadius: "var(--brand-radius-md)" }}
                      >
                        <span>{l.label} in {city.name}</span>
                        <span aria-hidden className="opacity-60">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden py-14 sm:py-20">
        <div
          className="absolute inset-0"
          style={{ background: brand.theme.ctaBannerBg }}
          aria-hidden
        />
        <Container className="relative text-center">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Ready to book {service.phrase} in {city.name}?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base font-semibold text-white/90">
            Live availability, no surprises at drop-off. Our crew handles
            delivery, setup, and pickup so the day stays about your guests.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={buildHref}
              className="inline-flex items-center justify-center bg-white px-6 py-3.5 text-sm font-black text-stone-900 shadow-xl transition hover:brightness-110 active:scale-[0.98]"
              style={{ borderRadius: "var(--brand-radius-md)" }}
            >
              {model.ctaLabel} →
            </Link>
            <a
              href={telHref}
              className="inline-flex items-center justify-center px-5 py-3.5 text-sm font-black text-white ring-1 ring-white/30 transition hover:bg-white/10 active:scale-[0.98]"
              style={{ borderRadius: "var(--brand-radius-md)" }}
            >
              Call {brand.supportPhoneDisplay}
            </a>
          </div>
        </Container>
      </section>
    </article>
  );
}
