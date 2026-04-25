import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/marketing/container";
import { CatalogImage } from "@/components/media/catalog-image";
import {
  type CategoryPageViewModel,
  type CategoryPageProduct,
  CATEGORY_PAGE_BENEFITS,
  CATEGORY_PAGE_SERVICE_AREA,
} from "@/lib/catalog/category-page-data";
import { withBrand } from "@/lib/brand/with-brand-href";
import { cn } from "@/lib/utils/cn";

type CategoryBrand = "crb" | "lias";

function getCategoryPageBrandTokens(brand: CategoryBrand) {
  const isCrb = brand === "crb";
  return {
    isCrb,
    sectionBg: isCrb ? "bg-slate-900" : "bg-transparent",
    cardBg: isCrb
      ? "bg-slate-800/70 backdrop-blur-md"
      : "bg-white/60 backdrop-blur-md",
    textPrimary: isCrb ? "text-white" : "text-black",
    textSecondary: isCrb ? "text-white/70" : "text-black/70",
    ctaButton: isCrb ? "bg-cyan-500 text-black" : "bg-rose-500 text-white",
    ctaButtonHover: isCrb ? "hover:bg-cyan-400" : "hover:bg-rose-600",
    /** Subtle link / nav accent (e.g. back link) */
    linkNav: isCrb ? "text-cyan-400 hover:text-cyan-300" : "text-rose-600 hover:text-rose-700",
    /** Price callout in product cards */
    priceAccent: isCrb ? "text-cyan-300" : "text-rose-500",
    /** Page shell (full-bleed) */
    pageRoot: isCrb
      ? "min-h-screen bg-slate-900 text-white"
      : "min-h-screen bg-gradient-to-b from-amber-50/80 via-stone-50 to-white",
    /** Hero / media frame (not a content card) */
    heroImagePanel: isCrb ? "bg-slate-800/50" : "bg-stone-100/50",
    heroImageRing: isCrb ? "ring-1 ring-cyan-500/30" : "ring-1 ring-stone-200/60",
    /** Image well behind catalog photos */
    productImageWell: isCrb ? "bg-slate-900/50" : "bg-stone-200/30",
  };
}

const benefitIcon = {
  setup: (
    <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        className="stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  clean: (
    <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 12.75 11.25 15 15 9.75M12 1l8.25 3.75V12c0 4.2-2.5 6.3-6.2 6.7-.4.1-.6.1-1 0-3.7-.4-6.2-2.5-6.2-6.7V4.75L12 1Z"
        className="stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  fast: (
    <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="8.25"
        className="stroke-current"
        strokeWidth="1.5"
      />
      <path
        d="M12 7.5V12l2.5 1.5"
        className="stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
} as const;

const benefitOrder = [
  { key: "setup" as const, ...CATEGORY_PAGE_BENEFITS[0]! },
  { key: "clean" as const, ...CATEGORY_PAGE_BENEFITS[1]! },
  { key: "fast" as const, ...CATEGORY_PAGE_BENEFITS[2]! },
];

function CategoryProductGridCard({
  product,
  t,
  brand,
}: {
  product: CategoryPageProduct;
  t: ReturnType<typeof getCategoryPageBrandTokens>;
  brand: CategoryBrand;
}) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl text-left transition-[transform,box-shadow] duration-300 md:hover:-translate-y-0.5",
        t.cardBg,
        t.isCrb
          ? "ring-1 ring-cyan-500/25 shadow-[0_16px_40px_rgba(0,0,0,0.45)] md:hover:shadow-[0_22px_50px_rgba(0,0,0,0.55)]"
          : "ring-1 ring-stone-200/80 shadow-[0_12px_32px_rgba(120,53,15,0.1)] md:hover:shadow-[0_20px_44px_rgba(120,53,15,0.14)]",
      )}
      style={{ borderRadius: "var(--brand-radius-lg)" }}
    >
      <div
        className={cn(
          "relative aspect-[4/3] w-full overflow-hidden",
          t.productImageWell,
        )}
      >
        <CatalogImage
          src={product.imageSrc}
          alt={product.imageAlt}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 1024px) 50vw, 33vw"
        />
        {product.isPopular ? (
          <span
            className="absolute right-2 top-2 z-10 rounded-full bg-yellow-400 px-2 py-1 text-xs font-semibold text-black"
          >
            Most popular
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3
          className={cn(
            "line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-tight sm:min-h-0 sm:text-base",
            t.textPrimary,
          )}
        >
          {product.name}
        </h3>
        <p
          className={cn(
            "mt-2 text-base font-black tabular-nums sm:text-lg",
            t.priceAccent,
          )}
        >
          {product.priceLabel}
        </p>
        <div className="mt-3 flex-1" />
        <Link
          href={withBrand(product.bookHref, brand)}
          className={cn(
            "inline-flex h-10 w-full items-center justify-center rounded-xl text-center text-sm font-bold transition active:scale-[0.99]",
            t.ctaButton,
            t.ctaButtonHover,
          )}
          style={{ borderRadius: "var(--brand-radius-md)" }}
        >
          Check availability
        </Link>
      </div>
    </article>
  );
}

export function CategoryPageTemplate({
  brand,
  data,
}: {
  brand: CategoryBrand;
  data: CategoryPageViewModel;
}) {
  const t = getCategoryPageBrandTokens(brand);
  const { item, pageTitle, pageSubtitle, heroImageSrc, products } = data;
  const primaryCta = withBrand(
    `/build?category=${encodeURIComponent(item.slug)}`,
    brand,
  );

  return (
    <div className={cn(t.pageRoot)}>
      <div className={cn("py-6 sm:py-8", t.sectionBg)}>
        <Container>
          <Link
            href={withBrand("/products", brand)}
            className={cn(
              "mb-4 inline-block text-sm font-semibold underline-offset-4 transition hover:underline",
              t.linkNav,
            )}
          >
            ← All rentals
          </Link>
        </Container>

        <Container className="max-w-5xl">
          <header className="text-center sm:text-left">
            <h1
              className={cn(
                "text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl",
                t.textPrimary,
              )}
            >
              {pageTitle}
            </h1>
            <p
              className={cn(
                "mx-auto mt-3 max-w-2xl text-base leading-relaxed sm:mx-0 sm:text-lg",
                t.textSecondary,
              )}
            >
              {pageSubtitle}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={primaryCta}
                className={cn(
                  "inline-flex h-12 min-w-[200px] items-center justify-center rounded-2xl px-8 text-sm font-black transition active:scale-[0.99]",
                  t.ctaButton,
                  t.ctaButtonHover,
                )}
                style={{ borderRadius: "var(--brand-radius-md)" }}
              >
                Check availability
              </Link>
            </div>
          </header>

          <div
            className={cn(
              "relative mt-8 aspect-[4/3] w-full max-h-[min(70vh,520px)] overflow-hidden sm:mt-10 sm:aspect-video sm:max-h-[min(60vh,480px)] lg:rounded-3xl",
              t.heroImagePanel,
              t.heroImageRing,
            )}
            style={{ borderRadius: "var(--brand-radius-lg)" }}
          >
            <Image
              src={heroImageSrc}
              alt={item.title}
              fill
              className="object-contain object-center"
              sizes="(max-width: 640px) 100vw, 960px"
              priority
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent sm:from-black/20"
              aria-hidden
            />
          </div>
        </Container>
      </div>

      <section
        className={cn("py-8 sm:py-12", t.sectionBg)}
        aria-labelledby="category-product-grid"
      >
        <Container>
          <h2
            id="category-product-grid"
            className={cn("text-center text-lg font-bold sm:text-xl", t.textPrimary)}
          >
            Popular picks in this category
          </h2>
          <ul className="mt-6 grid list-none grid-cols-2 gap-3 p-0 sm:gap-4 md:grid-cols-3 md:gap-6">
            {products.map((product) => (
              <li key={product.name} className="min-w-0">
                <CategoryProductGridCard
                  product={product}
                  t={t}
                  brand={brand}
                />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section
        className={cn(
          "border-t py-10 sm:py-14",
          t.isCrb
            ? "border-slate-700/50 bg-slate-800/25"
            : "border-amber-200/30 bg-amber-50/40",
        )}
        aria-labelledby="category-benefits"
      >
        <Container>
          <h2
            id="category-benefits"
            className={cn("text-center text-lg font-bold sm:text-xl", t.textPrimary)}
          >
            Why book with us
          </h2>
          <ul className="mt-8 grid list-none gap-6 p-0 sm:grid-cols-3 sm:gap-8">
            {benefitOrder.map((b) => (
              <li
                key={b.key}
                className={cn(
                  "flex gap-3 rounded-2xl p-4 sm:flex-col sm:items-center sm:text-center",
                  t.cardBg,
                  t.isCrb ? "ring-1 ring-cyan-500/20" : "ring-1 ring-orange-200/40",
                )}
                style={{ borderRadius: "var(--brand-radius-lg)" }}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    t.isCrb ? "bg-cyan-500/20 text-cyan-200" : "bg-amber-100 text-amber-800",
                  )}
                >
                  {b.key === "setup"
                    ? benefitIcon.setup
                    : b.key === "clean"
                      ? benefitIcon.clean
                      : benefitIcon.fast}
                </div>
                <div>
                  <p className={cn("font-bold", t.textPrimary)}>{b.title}</p>
                  <p className={cn("mt-1 text-sm leading-relaxed", t.textSecondary)}>
                    {b.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <div
        className={cn("py-4 text-center text-sm font-semibold", t.textSecondary, t.sectionBg)}
      >
        <Container>
          <p>{CATEGORY_PAGE_SERVICE_AREA}</p>
        </Container>
      </div>

      <section className="pb-14 pt-2 sm:pb-20" aria-label="Book this category">
        <Container className="max-w-2xl text-center">
          <Link
            href={primaryCta}
            className={cn(
              "inline-flex h-14 w-full max-w-md items-center justify-center rounded-2xl text-base font-black transition active:scale-[0.99] sm:text-lg",
              t.ctaButton,
              t.ctaButtonHover,
            )}
            style={{ borderRadius: "var(--brand-radius-md)" }}
          >
            Check availability
          </Link>
        </Container>
      </section>
    </div>
  );
}
