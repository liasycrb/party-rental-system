import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/lib/brand/config";

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
import type { SiteSettings } from "@/lib/site/get-site-settings";
import type { RentalPackage } from "@/lib/marketing/get-rental-packages";
import type { SiteCategoryCarouselItem } from "@/lib/catalog/get-rental-categories";
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
  carouselCategories,
}: {
  brand: Brand;
  siteSettings: SiteSettings | null;
  packages?: RentalPackage[] | null;
  carouselCategories: SiteCategoryCarouselItem[];
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
        mobileLead={<CrbMobileHeroStrip brand={brand} carouselItems={carouselCategories} />}
        carouselCategories={carouselCategories}
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

      <CategoryShowcase isCrb brandSlug={b} items={carouselCategories} />

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
        </Container>
      </section>

      {/* ── Process — how it works ──────────────────────────────── */}
      <section
        className="relative overflow-hidden py-16 sm:py-24"
        aria-labelledby="crb-how"
      >
        <div
          className="absolute inset-0"
          style={{ background: "var(--brand-stripe-feature)" }}
          aria-hidden
        />
        {/* Diamond pattern — CRB brand texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='72' height='72' viewBox='0 0 72 72' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M36 18L54 36 36 54 18 36z' fill='%2322d3ee'/%3E%3C/svg%3E\")",
          }}
          aria-hidden
        />
        {/* Cyan glow — top-left */}
        <div
          className="pointer-events-none absolute -left-32 -top-24 h-80 w-80 rounded-full blur-3xl"
          style={{ background: "rgba(34,211,238,0.10)" }}
          aria-hidden
        />
        {/* Orange glow — bottom-right */}
        <div
          className="pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full blur-3xl"
          style={{ background: "rgba(251,146,60,0.08)" }}
          aria-hidden
        />

        <Container className="relative">
          <SectionTitle
            id="crb-how"
            tone="onDark"
            eyebrow="How it works"
            title={"Three beats. Zero \u201cwe\u2019ll call you back\u201d energy."}
            description="From first click to setup crew — designed to be stupid fast."
          />

          <div className="mt-12 flex gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            {[
              {
                step: "01",
                title: "Choose your inflatable",
                body: "Browse the full lineup and pick the star of the show — classic jumpers to wild waterslides.",
              },
              {
                step: "02",
                title: "Add the essentials",
                body: "Layer on shade, seating, or extra time. Stack the scene so everything's handled before guests arrive.",
              },
              {
                step: "03",
                title: "We deliver the party",
                body: "Setup, safety walkthrough, smiles included. You get to actually host — not babysit equipment.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative min-w-[260px] flex-1 overflow-hidden border border-cyan-400/25 bg-slate-950/70 p-7 shadow-[0_8px_32px_rgba(2,6,23,0.55),inset_0_1px_0_rgba(34,211,238,0.10)] backdrop-blur-md transition-all duration-300 hover:border-cyan-400/50 hover:shadow-[0_12px_48px_rgba(2,6,23,0.65),0_0_36px_rgba(34,211,238,0.10),inset_0_1px_0_rgba(34,211,238,0.18)] md:min-w-0"
                style={{ borderRadius: "var(--brand-radius-lg)" }}
              >
                <span
                  className="block text-[80px] font-black leading-none tracking-tight text-cyan-400/18 transition-colors duration-300 group-hover:text-cyan-400/30"
                  aria-hidden
                >
                  {item.step}
                </span>
                <h3 className="mt-1 text-xl font-black text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-[14px] font-medium leading-relaxed text-slate-300">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href={withBrand("/build", b)}
              className="group relative flex w-full max-w-[520px] flex-col items-center justify-center overflow-hidden rounded-2xl px-10 py-5 text-slate-950 shadow-[0_12px_40px_rgba(6,182,212,0.45)] transition-all duration-300 ease-out hover:scale-[1.025] hover:shadow-[0_22px_58px_rgba(6,182,212,0.65)] active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(110deg, var(--brand-primary) 0%, #a5f3fc 55%, var(--brand-accent) 100%)",
              }}
            >
              <span
                className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20 transition-transform duration-700 ease-out group-hover:translate-x-[150%]"
                aria-hidden
              />
              <span className="relative flex w-full items-center justify-between gap-4">
                <span className="text-[17px] font-black leading-tight tracking-[-0.02em] sm:text-[19px]">
                  Check availability &amp; book your jumper
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="relative mt-1.5 text-[12px] font-medium text-slate-800/70">
                Takes less than 60 seconds&nbsp;&nbsp;·&nbsp;&nbsp;No payment
                required today
              </span>
            </Link>
          </div>
        </Container>
      </section>

      {/* ── Upgrades ─────────────────────────────────────────────── */}
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
                  className="group border border-cyan-400/28 bg-slate-950/75 p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-cyan-400/55 hover:shadow-[0_8px_28px_rgba(34,211,238,0.12)]"
                  style={{ borderRadius: "var(--brand-radius-md)" }}
                >
                  <p className="text-sm font-black text-white">{x.t}</p>
                  <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-400">{x.d}</p>
                  <p className="mt-4 text-base font-black text-orange-300">{x.p}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href={withBrand("/build", b)}
              className="group relative flex w-full max-w-[520px] flex-col items-center justify-center overflow-hidden rounded-2xl px-10 py-5 text-slate-950 shadow-[0_12px_40px_rgba(6,182,212,0.45)] transition-all duration-300 ease-out hover:scale-[1.025] hover:shadow-[0_22px_58px_rgba(6,182,212,0.65)] active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(110deg, var(--brand-primary) 0%, #a5f3fc 55%, var(--brand-accent) 100%)",
              }}
            >
              <span
                className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20 transition-transform duration-700 ease-out group-hover:translate-x-[150%]"
                aria-hidden
              />
              <span className="relative flex w-full items-center justify-between gap-4">
                <span className="text-[17px] font-black leading-tight tracking-[-0.02em] sm:text-[19px]">
                  Check availability &amp; book your party
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="relative mt-1.5 text-[12px] font-medium text-slate-800/70">
                Takes less than 60 seconds&nbsp;&nbsp;·&nbsp;&nbsp;No payment
                required today
              </span>
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
                  Bright setups and punctual crews—built for planners who move fast.
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
                className="group relative mt-8 flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl px-8 py-4 text-slate-950 shadow-[0_10px_32px_rgba(6,182,212,0.4)] transition-all duration-300 ease-out hover:scale-[1.025] hover:shadow-[0_18px_48px_rgba(6,182,212,0.6)] active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(110deg, var(--brand-primary) 0%, #a5f3fc 55%, var(--brand-accent) 100%)",
                }}
              >
                <span
                  className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20 transition-transform duration-700 ease-out group-hover:translate-x-[150%]"
                  aria-hidden
                />
                <span className="relative flex w-full items-center justify-between gap-3">
                  <span className="text-[15px] font-black leading-tight tracking-[-0.01em]">
                    Check availability &amp; book your party
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <span className="relative mt-1 text-[11px] font-medium text-slate-800/65">
                  No payment required today
                </span>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
