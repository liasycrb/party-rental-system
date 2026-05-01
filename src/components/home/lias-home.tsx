import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/lib/brand/config";
import type { RentalPackage } from "@/lib/marketing/get-rental-packages";
import type { SiteSettings } from "@/lib/site/get-site-settings";
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
import { MarketingHero } from "@/components/home/marketing-hero";
import { MobileProductStrip } from "@/components/home/mobile-product-strip";
import { HomeFeaturedProductSection } from "@/components/home/home-featured-product-section";
import { Container } from "@/components/marketing/container";
import { CategoryShowcase } from "@/components/marketing/category-showcase";
import { SectionTitle } from "@/components/marketing/section-title";

export function LiasHome({
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
  const b = brand.slug;

  const tickerText =
    siteSettings?.announcement_text ||
    "This is what your Saturday sounds like · laughter · music · bounce bounce bounce";

  return (
    <>
      <MarketingHero
        brand={brand}
        isCrb={false}
        mobileLead={<MobileProductStrip carouselItems={carouselCategories} />}
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
        className="relative mt-2 max-md:mt-1 border-y py-5 md:mt-2"
        style={{
          background: "var(--brand-stripe-ticker)",
          borderColor: "rgba(161, 98, 7, 0.35)",
        }}
      >
        <Container>
          <p className="text-center text-sm font-black uppercase tracking-[0.2em] text-amber-950/90">
            {tickerText}
          </p>
        </Container>
      </section>

      <CategoryShowcase isCrb={false} brandSlug={b} items={carouselCategories} />

      <PopularPackagesSection brand={brand} packages={packages} />
      <WhyChooseStrip brand={brand} />

      {/* Experience storytelling — break the grid */}
      <section
        className="relative py-16 sm:py-24"
        style={{ background: "var(--brand-stripe-experience)" }}
        aria-labelledby="experience-heading"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "var(--brand-experience-glow)" }}
          aria-hidden
        />
        <Container className="relative">
          <SectionTitle
            id="experience-heading"
            eyebrow="Picture it"
            title="This is what your party will feel like"
            description="Not a spec sheet — the moment your people actually show up."
          />
          <div className="mt-10 grid gap-4 sm:gap-5 lg:grid-cols-12 lg:grid-rows-2">
            <div className="relative min-h-[280px] overflow-hidden shadow-2xl lg:col-span-8 lg:row-span-2 lg:min-h-[520px]">
              <Image
                src={EXPERIENCE_MOMENTS[0]!.src}
                alt={EXPERIENCE_MOMENTS[0]!.alt}
                fill
                className="object-cover transition duration-700 hover:scale-[1.04]"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <p className="text-2xl font-black leading-tight text-white drop-shadow-lg sm:text-3xl">
                  {EXPERIENCE_MOMENTS[0]!.headline}
                </p>
                <p className="mt-2 max-w-lg text-sm font-semibold text-white/85">
                  {EXPERIENCE_MOMENTS[0]!.sub}
                </p>
              </div>
            </div>
            <div className="relative min-h-[220px] overflow-hidden shadow-xl lg:col-span-4 lg:min-h-0">
              <Image
                src={EXPERIENCE_MOMENTS[1]!.src}
                alt={EXPERIENCE_MOMENTS[1]!.alt}
                fill
                className="object-cover transition duration-700 hover:scale-[1.05]"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-lg font-black text-white drop-shadow-md">
                  {EXPERIENCE_MOMENTS[1]!.headline}
                </p>
                <p className="mt-1 text-xs font-semibold text-white/80">
                  {EXPERIENCE_MOMENTS[1]!.sub}
                </p>
              </div>
            </div>
            <div className="relative min-h-[260px] overflow-hidden shadow-xl lg:col-span-4 lg:min-h-0">
              <Image
                src={EXPERIENCE_MOMENTS[2]!.src}
                alt={EXPERIENCE_MOMENTS[2]!.alt}
                fill
                className="object-cover object-top transition duration-700 hover:scale-[1.05]"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rose-950/85 via-transparent to-amber-200/10" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-lg font-black text-white drop-shadow-md">
                  {EXPERIENCE_MOMENTS[2]!.headline}
                </p>
                <p className="mt-1 text-xs font-semibold text-white/80">
                  {EXPERIENCE_MOMENTS[2]!.sub}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container className="relative py-10 sm:py-12">
        <CtaBanner
          isCrb={false}
          brandSlug={b}
          title="Your date. Your yard. Their best day."
          subtitle="Build your party now — we’ll confirm availability, walk safety, and lock delivery windows for Moreno Valley and nearby."
        />
      </Container>

      <HomeFeaturedProductSection
        brand={brand}
        headingId="fleet-heading"
        eyebrow="The fleet"
        title="Fall in love before you check a single box"
        description="One hero moment plus clear choices — see photos, footprints, dimensions, and starting prices without guesswork."
      />

      <section
        className="relative overflow-hidden py-16 sm:py-24"
        aria-labelledby="how-heading"
      >
        <div
          className="absolute inset-0"
          style={{ background: "var(--brand-stripe-feature)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.12' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
          aria-hidden
        />
        <Container className="relative">
          <SectionTitle
            id="how-heading"
            tone="onDark"
            eyebrow="The vibe"
            title="Three beats. Zero boring paperwork energy."
            description="You’re not “submitting a request.” You’re launching a day people replay in stories."
          />
          <div className="mt-12 flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            {[
              {
                step: "01",
                title: "Choose the star",
                body: "The inflatable is the main character — everything else is supporting cast.",
              },
              {
                step: "02",
                title: "Stack the scene",
                body: "Shade, seating, time — upgrades that make the day feel expensive (in the best way).",
              },
              {
                step: "03",
                title: "We deliver the moment",
                body: "Setup, safety, smiles — you get to actually host, not troubleshoot.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="min-w-[260px] flex-1 border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-md md:min-w-0"
                style={{ borderRadius: "var(--brand-radius-lg)" }}
              >
                <span className="text-5xl font-black text-white/20" aria-hidden>
                  {item.step}
                </span>
                <h3 className="mt-2 text-xl font-black text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-emerald-50">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Link
              href={withBrand("/build", b)}
              className="inline-flex items-center justify-center px-10 py-4 text-sm font-black text-orange-950 shadow-xl transition hover:brightness-110"
              style={{
                background:
                  "linear-gradient(90deg, var(--brand-accent), #ffffff)",
                borderRadius: "var(--brand-radius-lg)",
              }}
            >
              Check availability — start now
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24" aria-labelledby="local-heading">
        <Container>
          <div
            className="grid overflow-hidden shadow-2xl lg:grid-cols-5"
            style={{ borderRadius: "var(--brand-radius-lg)" }}
          >
            <div className="relative min-h-[300px] lg:col-span-3">
              <Image
                src={DEMO_PRODUCTS[1]!.imageSrc}
                alt="Outdoor celebration energy"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/75 via-stone-900/15 to-transparent" />
              <p className="absolute bottom-6 left-6 max-w-sm text-2xl font-black leading-tight text-white drop-shadow-lg">
                Your driveway. Their “best party ever.”
              </p>
            </div>
            <div
              className="flex flex-col justify-center p-8 sm:p-10 lg:col-span-2"
              style={{ background: "var(--brand-stripe-local-panel)" }}
            >
              <SectionTitle
                id="local-heading"
                tone="onDark"
                eyebrow="Local love"
                title="Moreno Valley & neighbors"
                description="City pages, FAQs, and reviews plug into this panel later — today it’s pure feeling + trust."
              />
              <ul className="mt-6 space-y-3 text-sm font-bold text-amber-50">
                <li>· Delivery that respects school nights + HOAs</li>
                <li>· Dogs, gates, sprinklers — captured before we roll up</li>
                <li>· One calendar — no double booking between brands</li>
              </ul>
              <Link
                href={withBrand("/build", b)}
                className="mt-8 inline-flex w-fit items-center justify-center px-6 py-3 text-sm font-black text-amber-950 shadow-lg"
                style={{
                  background:
                    "linear-gradient(90deg, var(--brand-accent), var(--brand-secondary))",
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
