import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/lib/brand/config";
import type { SiteSettings } from "@/lib/site/get-site-settings";
import type { RentalPackage } from "@/lib/marketing/get-rental-packages";
import { withBrand } from "@/lib/brand/with-brand-href";
import {
  DEMO_PRODUCTS,
  EXPERIENCE_MOMENTS,
  HERO_BOUNCE_HOUSE,
} from "@/lib/catalog/demo-products";
import { CtaBanner } from "@/components/conversion/cta-banner";
import { PopularPackagesSection } from "@/components/conversion/popular-packages";
import { WhyChooseStrip } from "@/components/conversion/why-choose-strip";
import { CrbMobileHeroStrip } from "@/components/home/crb-mobile-hero-strip";
import { MarketingHero } from "@/components/home/marketing-hero";
import { Container } from "@/components/marketing/container";
import { ProductCard } from "@/components/marketing/product-card";
import { CategoryShowcase } from "@/components/marketing/category-showcase";
import { SectionTitle } from "@/components/marketing/section-title";

export function CrbHome({
  brand,
  siteSettings,
  packages,
}: {
  brand: Brand;
  siteSettings: SiteSettings | null;
  packages?: RentalPackage[] | null;
}) {
  const [p1, p2, p3] = DEMO_PRODUCTS;
  const b = brand.slug;

  const tickerText =
    siteSettings?.announcement_text ||
    "Hear the blower hum · smell the grass · watch the kids lose their minds";

  return (
    <>
      <MarketingHero
        brand={brand}
        isCrb
        mobileLead={<CrbMobileHeroStrip brand={brand} />}
        heroProduct={{
          imageSrc: HERO_BOUNCE_HOUSE.imageSrc,
          imageAlt: HERO_BOUNCE_HOUSE.imageAlt,
        }}
        heroTitleOverride={siteSettings?.hero_headline}
        heroSubtitleOverride={siteSettings?.hero_subheadline}
        ctaPrimaryOverride={siteSettings?.hero_cta_primary}
      />

      <section
        className="mt-2 max-md:mt-1 border-y py-5 backdrop-blur-md md:mt-2"
        style={{
          background: "var(--brand-stripe-ticker)",
          borderColor: "rgba(34, 211, 238, 0.28)",
        }}
      >
        <Container>
          <p className="text-center text-xs font-black uppercase tracking-[0.28em] text-cyan-100/92">
            {tickerText}
          </p>
        </Container>
      </section>

      <CategoryShowcase isCrb brandSlug={b} />

      <PopularPackagesSection brand={brand} packages={packages} />
      <WhyChooseStrip brand={brand} />

      <section
        className="relative py-16 sm:py-24"
        style={{ background: "var(--brand-stripe-experience)" }}
        aria-labelledby="crb-experience"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "var(--brand-experience-glow)" }}
          aria-hidden
        />
        <Container className="relative">
          <SectionTitle
            id="crb-experience"
            tone="onDark"
            eyebrow="Feel it"
            title="This is the party they’ll replay in their heads"
            description="We’re not selling nylon and fans. We’re selling the moment the yard becomes an amusement park."
          />
          <div className="mt-10 grid gap-4 sm:gap-5 lg:grid-cols-12">
            <div className="relative min-h-[260px] overflow-hidden shadow-2xl lg:col-span-5">
              <Image
                src={EXPERIENCE_MOMENTS[1]!.src}
                alt={EXPERIENCE_MOMENTS[1]!.alt}
                fill
                className="object-cover transition duration-700 hover:scale-[1.06]"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 to-transparent" />
              <div className="absolute bottom-0 p-6">
                <p className="text-xl font-black text-white">
                  {EXPERIENCE_MOMENTS[1]!.headline}
                </p>
                <p className="mt-1 text-xs font-semibold text-cyan-100/88">
                  {EXPERIENCE_MOMENTS[1]!.sub}
                </p>
              </div>
            </div>
            <div className="relative min-h-[320px] overflow-hidden shadow-2xl lg:col-span-7 lg:min-h-[420px]">
              <Image
                src={EXPERIENCE_MOMENTS[0]!.src}
                alt={EXPERIENCE_MOMENTS[0]!.alt}
                fill
                className="object-cover transition duration-700 hover:scale-[1.04]"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-transparent to-orange-500/15" />
              <div className="absolute bottom-0 p-8">
                <p className="max-w-lg text-3xl font-black leading-tight text-white drop-shadow-xl">
                  {EXPERIENCE_MOMENTS[0]!.headline}
                </p>
                <p className="mt-3 max-w-md text-sm font-semibold text-white/90">
                  {EXPERIENCE_MOMENTS[0]!.sub}
                </p>
              </div>
            </div>
            <div className="relative min-h-[300px] overflow-hidden shadow-2xl lg:col-span-12 lg:min-h-[340px]">
              <Image
                src={EXPERIENCE_MOMENTS[2]!.src}
                alt={EXPERIENCE_MOMENTS[2]!.alt}
                fill
                className="object-cover object-center transition duration-700 hover:scale-[1.03]"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/35 to-orange-500/25" />
              <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-8 sm:flex-row sm:items-end sm:justify-between">
                <p className="max-w-xl text-2xl font-black text-white sm:text-3xl">
                  {EXPERIENCE_MOMENTS[2]!.headline}
                </p>
                <p className="max-w-sm text-sm font-semibold text-white/85">
                  {EXPERIENCE_MOMENTS[2]!.sub}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container className="relative py-10 sm:py-12">
        <CtaBanner
          isCrb
          brandSlug={b}
          title="Don’t lose your weekend to “we’ll call you back.”"
          subtitle="Reserve the unit, lock the date, and let us handle delivery and setup across the I.E. — most hosts finish in a few minutes."
        />
      </Container>

      <section
        className="relative py-16 sm:py-24"
        style={{ background: "var(--brand-stripe-fleet)" }}
        aria-labelledby="crb-fleet"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-80"
          style={{ background: "var(--brand-fleet-ambient)" }}
          aria-hidden
        />
        <Container className="relative">
          <SectionTitle
            id="crb-fleet"
            tone="onDark"
            eyebrow="Featured drops"
            title="Premium units. Zero “rental catalog” energy."
            description="Asymmetric layout on purpose — your eye lands where we want the desire to start."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:grid-rows-2">
            {p2 ? (
              <div className="lg:col-span-5 lg:row-span-2">
                <ProductCard
                  brand={brand}
                  product={p2}
                  visual="showcase"
                  className="min-h-[400px] lg:min-h-full"
                />
              </div>
            ) : null}
            {p1 ? (
              <div className="lg:col-span-7">
                <ProductCard
                  brand={brand}
                  product={p1}
                  visual="showcase"
                  className="min-h-[300px]"
                />
              </div>
            ) : null}
            {p3 ? (
              <div className="lg:col-span-7">
                <ProductCard
                  brand={brand}
                  product={p3}
                  visual="showcase"
                  className="min-h-[300px]"
                />
              </div>
            ) : null}
          </div>
          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href={withBrand("/build", b)}
              className="inline-flex w-full items-center justify-center px-10 py-4 text-sm font-black text-slate-950 shadow-xl transition hover:brightness-110 sm:w-auto"
              style={{
                background:
                  "linear-gradient(90deg, var(--brand-secondary), #f472b6)",
                borderRadius: "var(--brand-radius-md)",
              }}
            >
              Build your party now
            </Link>
            <Link
              href={withBrand("/products", b)}
              className="inline-flex w-full items-center justify-center border-2 border-cyan-400/40 bg-slate-950/55 px-10 py-4 text-sm font-black text-white backdrop-blur transition hover:bg-slate-900/75 sm:w-auto"
              style={{ borderRadius: "var(--brand-radius-md)" }}
            >
              Browse catalog
            </Link>
          </div>
        </Container>
      </section>

      <section
        className="relative overflow-hidden py-16 sm:py-24"
        style={{ background: "var(--brand-stripe-upgrades)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(34, 211, 238, 0.08), transparent 45%)",
          }}
          aria-hidden
        />
        <Container className="relative">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <SectionTitle
              tone="onDark"
              eyebrow="Upgrades"
              title="Party boosts, not boring add-ons"
              description="Every tile is written like a merch drop — because that’s how people actually get excited to spend more."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { t: "Shade + storytime corner", d: "Canopy for cake, gifts, elders.", p: "from $45" },
                { t: "Seating that scales", d: "Tables + chairs for the whole list.", p: "from $8 / table" },
                { t: "Quiet power", d: "Generator when outlets are mean.", p: "from $65" },
                { t: "Stretch the bounce", d: "More minutes, more memories.", p: "from $35" },
              ].map((x) => (
                <div
                  key={x.t}
                  className="border border-cyan-400/28 bg-slate-950/75 p-4 shadow-xl backdrop-blur-md"
                  style={{ borderRadius: "var(--brand-radius-md)" }}
                >
                  <p className="text-sm font-black text-white">{x.t}</p>
                  <p className="mt-1 text-xs font-medium text-slate-400">{x.d}</p>
                  <p className="mt-3 text-sm font-black text-orange-300">{x.p}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              href={withBrand("/build", b)}
              className="inline-flex items-center justify-center px-10 py-4 text-sm font-black text-slate-950 shadow-xl transition hover:brightness-110"
              style={{
                background:
                  "linear-gradient(90deg, var(--brand-primary), #a5f3fc)",
                borderRadius: "var(--brand-radius-md)",
              }}
            >
              Check availability — start now
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24" aria-labelledby="crb-local">
        <Container>
          <div
            className="grid overflow-hidden shadow-[0_40px_100px_rgba(2,6,23,0.8)] lg:grid-cols-2"
            style={{ borderRadius: "var(--brand-radius-lg)" }}
          >
            <div className="relative min-h-[320px]">
              <Image
                src="/party-rentals/shared/experience-side-1.jpg"
                alt="Party energy"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-3xl font-black text-white drop-shadow-xl">
                  I.E. knows how to weekend.
                </p>
                <p className="mt-2 text-sm font-semibold text-cyan-100/90">
                  CRB brings the visual volume — ops stay shared with Lias.
                </p>
              </div>
            </div>
            <div
              className="flex flex-col justify-center p-8 sm:p-12"
              style={{ background: "var(--brand-stripe-local-panel)" }}
              id="crb-local"
            >
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Ready for the stories you’ll tell Monday?
              </h2>
              <p className="mt-4 text-sm font-medium leading-relaxed text-cyan-100/90">
                Plug neighborhood SEO, FAQs, and reviews into this panel later —
                for now it’s pure adrenaline + trust.
              </p>
              <Link
                href={withBrand("/build", b)}
                className="mt-8 inline-flex w-fit items-center justify-center px-6 py-3 text-sm font-black text-slate-950 shadow-xl"
                style={{
                  background:
                    "linear-gradient(90deg, var(--brand-secondary), #f472b6)",
                  borderRadius: "var(--brand-radius-md)",
                }}
              >
                Book your date
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
