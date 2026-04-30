import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import type { Brand } from "@/lib/brand/config";
import type { SiteCategoryCarouselItem } from "@/lib/catalog/get-rental-categories";
import { withBrand } from "@/lib/brand/with-brand-href";
import { HeroDesktopStickerComposition } from "@/components/home/hero-desktop-sticker-composition";
import { cn } from "@/lib/utils/cn";

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function IconMapPin({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function IconTruck({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18h2" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  );
}

function IconZap({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

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

function IconUsers({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconShieldCheck({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

const HERO_TRUST_ITEMS = [
  { label: "REAL CREW", Icon: IconUsers },
  { label: "INSURED SETUPS", Icon: IconShieldCheck },
  { label: "ONE SHARED CALENDAR", Icon: IconCalendar },
  { label: "ON-TIME GUARANTEE", Icon: IconClock },
] as const;

/** Splits Lias title into mockup lines when it ends with "ever." after two phrases. */
function parseLiasHeadlineLines(title: string): {
  line1: string;
  line2: string;
} | null {
  const t = title.trim();
  if (!/\bever\.\s*$/i.test(t)) return null;
  const idx = t.toLowerCase().lastIndexOf(" ever.");
  if (idx === -1) return null;
  const before = t.slice(0, idx).trim();
  const firstBreak = before.indexOf(". ");
  if (firstBreak === -1) return null;
  return {
    line1: before.slice(0, firstBreak + 1).trim(),
    line2: before.slice(firstBreak + 1).trim(),
  };
}

const headlineClassName =
  "max-w-[640px] font-black leading-[0.95] tracking-[-0.04em] text-4xl sm:text-5xl lg:text-[64px] xl:text-[68px]";

function HeroHeadline({
  title,
  isCrb,
  className,
}: {
  title: string;
  isCrb: boolean;
  className?: string;
}) {
  if (!isCrb) {
    const lines = parseLiasHeadlineLines(title);
    if (lines) {
      return (
        <h1
          className={cn(headlineClassName, className, "text-stone-900")}
        >
          <span className="block">{lines.line1}</span>
          <span className="block">{lines.line2}</span>
          <span className="block text-rose-600">ever.</span>
        </h1>
      );
    }
    const m = /\bever\.\s*$/i.exec(title);
    if (m && m.index !== undefined) {
      const before = title.slice(0, m.index);
      return (
        <h1
          className={cn(headlineClassName, className, "text-stone-900")}
        >
          {before}
          <span className="text-rose-600">ever.</span>
        </h1>
      );
    }
  }
  return (
    <h1
      className={cn(
        headlineClassName,
        className,
        isCrb ? "text-white" : "text-stone-900",
      )}
    >
      {title}
    </h1>
  );
}

/** Hero image: vertical card, 4:5 frame, object-cover + center crop; use ≥1200×1500px sources with subject centered. */
export function MarketingHero({
  brand,
  isCrb,
  heroProduct: _heroProduct,
  mobileLead,
  heroTitleOverride,
  heroSubtitleOverride,
  ctaPrimaryOverride,
  carouselCategories,
}: {
  brand: Brand;
  isCrb: boolean;
  /** Reserved for non-hero catalog stills; home heroes use PNG sticker compositions. */
  heroProduct: { imageSrc: string; imageAlt: string };
  /** Mobile-only block (badges, headline, sticker carousel) before the md+ marketing stack. */
  mobileLead?: ReactNode;
  /** CMS overrides — fall back to brand.copy when null/empty. */
  heroTitleOverride?: string | null;
  heroSubtitleOverride?: string | null;
  ctaPrimaryOverride?: string | null;
  carouselCategories: SiteCategoryCarouselItem[];
}) {
  return (
    <section
      className={cn(
        "relative max-md:overflow-hidden lg:overflow-visible",
        isCrb
          ? "pt-16 pb-4 text-white dark-hero max-md:pb-3 md:pb-4 lg:pb-5 lg:min-h-[820px]"
          : "pt-16 pb-4 text-stone-900 max-md:min-h-0 max-md:pt-5 max-md:pb-3 md:pb-4 lg:min-h-[820px] lg:pb-5",
        isCrb && Boolean(mobileLead) && "max-md:min-h-0 max-md:pt-5 max-md:pb-3 md:pb-4 lg:pb-5",
      )}
    >
      <div
        className="absolute inset-0"
        style={{ background: "var(--brand-hero-backdrop)" }}
      />
      <div
        className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 -translate-y-1/2 rounded-full blur-3xl"
        style={{ backgroundColor: "var(--brand-hero-blob-a)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[min(70vh,36rem)] w-[min(70vw,48rem)] translate-x-1/4 translate-y-1/4 rounded-full blur-3xl"
        style={{ backgroundColor: "var(--brand-hero-blob-b)" }}
        aria-hidden
      />
      {isCrb ? (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='72' height='72' viewBox='0 0 72 72' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M36 18L54 36 36 54 18 36z' fill='%23fff' fill-opacity='0.35'/%3E%3C/svg%3E\")",
          }}
          aria-hidden
        />
      ) : null}

      <div
        className={cn(
          "relative z-10 mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-10 px-8 lg:grid-cols-[0.95fr_1.05fr]",
          !isCrb && "max-md:gap-3 max-md:px-4",
        )}
      >
        <div
          className={cn(
            "order-1 min-w-0 max-w-[640px] pt-5",
            !isCrb && "max-md:max-w-full max-md:pt-0",
            isCrb && Boolean(mobileLead) && "max-md:pt-0",
          )}
        >
          {mobileLead}

          {!isCrb && Boolean(mobileLead) ? (
            <div className="md:hidden mx-6 mt-2.5">
              <Link
                href={withBrand("/build", brand.slug)}
                className="group flex h-[58px] w-full items-center justify-center gap-2 rounded-[18px] bg-rose-600 px-4 text-[18px] font-black text-white shadow-[0_10px_25px_rgba(255,0,80,0.25)] transition-all duration-200 motion-reduce:transition-none hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
              >
                Check availability this weekend
                <ArrowRight className="h-5 w-5 transition-transform duration-200 motion-reduce:transition-none group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
              </Link>
            </div>
          ) : null}
          {isCrb && Boolean(mobileLead) ? (
            <div className="md:hidden mx-6 mt-2.5">
              <Link
                href={withBrand("/build", brand.slug)}
                className="group flex h-[58px] w-full items-center justify-center gap-2 rounded-[18px] px-4 text-[18px] font-black text-slate-950 shadow-[0_0_32px_rgba(34,211,238,0.35)] transition-all duration-200 motion-reduce:transition-none hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
                style={{
                  background: "linear-gradient(90deg, var(--brand-primary), #a5f3fc)",
                }}
              >
                Check availability this weekend
                <ArrowRight className="h-5 w-5 transition-transform duration-200 motion-reduce:transition-none group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
              </Link>
            </div>
          ) : null}

          <div
            className={cn((!isCrb || Boolean(mobileLead)) && "max-md:hidden")}
          >
            <div className="mb-4 flex flex-wrap gap-3">
            <span
              className={cn(
                "inline-flex h-[42px] shrink-0 items-center gap-2 rounded-full px-5 text-[13px] font-black uppercase tracking-[0.08em] transition-all duration-300 motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-lg motion-reduce:hover:translate-y-0",
                isCrb
                  ? "bg-orange-500 text-slate-950 shadow-lg"
                  : "min-w-0 bg-rose-600 text-white shadow-md",
              )}
            >
              <IconCalendar
                className={cn("h-4 w-4 shrink-0", isCrb ? "text-slate-950" : "text-white")}
              />
              {isCrb ? "Weekend slots limited" : "Limited weekend slots"}
            </span>
            <span
              className={cn(
                "inline-flex h-[42px] shrink-0 items-center gap-2 rounded-full border-2 px-5 text-[13px] font-black uppercase tracking-[0.08em] transition-all duration-300 motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-lg motion-reduce:hover:translate-y-0",
                isCrb
                  ? "border-cyan-400/55 bg-slate-950/70 text-cyan-50 shadow-[0_6px_22px_rgba(2,6,23,0.45)] backdrop-blur-md"
                  : "min-w-0 border-rose-400 bg-white text-orange-950",
              )}
            >
              <IconMapPin
                className={cn("h-4 w-4 shrink-0", isCrb ? "text-cyan-300" : "text-rose-600")}
              />
              {isCrb ? (
                <>Moreno Valley &amp; I.E. routes</>
              ) : (
                <>Moreno Valley &amp; the I.E.</>
              )}
            </span>
          </div>

          <div
            className={cn(
              "mb-8 flex flex-wrap gap-4",
              isCrb &&
                "max-md:mb-4 max-md:grid max-md:grid-cols-2 max-md:gap-3 md:mb-8 md:flex md:flex-wrap",
            )}
          >
            {(
              isCrb
                ? [
                    { Icon: IconTruck, label: "Setup included" },
                    { Icon: IconShield, label: "Kid-safe checks" },
                    { Icon: IconZap, label: "Book online fast" },
                  ]
                : [
                    { Icon: IconTruck, label: "Setup included" },
                    { Icon: IconShield, label: "Kid-safe process" },
                    { Icon: IconZap, label: "Book in minutes" },
                  ]
            ).map(({ Icon, label }) => (
              <span
                key={label}
                className={cn(
                  "inline-flex h-[40px] shrink-0 items-center gap-2 rounded-full border px-5 text-[14px] font-bold shadow-sm transition-all duration-300 motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-lg motion-reduce:hover:translate-y-0",
                  isCrb
                    ? "border-cyan-400/40 bg-slate-950/70 text-white backdrop-blur-md"
                    : "border-orange-200/90 bg-white text-stone-800",
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isCrb ? "text-cyan-300" : "text-rose-600")} />
                {label}
              </span>
            ))}
          </div>

          <p
            className={cn(
              "mb-4 text-[16px] font-bold uppercase tracking-[0.3em]",
              isCrb ? "text-cyan-200/90" : "text-rose-600",
            )}
          >
            {brand.copy.heroKicker}
          </p>

          <HeroHeadline title={heroTitleOverride || brand.copy.heroTitle} isCrb={isCrb} />

          <p
            className={cn(
              "mt-5 max-w-[520px] text-[20px] font-semibold leading-[1.35]",
              isCrb ? "text-white/90" : "text-stone-800",
            )}
          >
            {heroSubtitleOverride || brand.copy.heroSubtitle}
          </p>

          {/* ── Inline CTA block ───────────────────────────────────── */}
          <div className="mt-8 max-w-[520px]">
            <p
              className={cn(
                "mb-4 text-[11px] font-bold uppercase tracking-[0.22em]",
                isCrb ? "text-white/40" : "text-stone-400",
              )}
            >
              Check availability in seconds
            </p>

            <Link
              href={withBrand("/build", brand.slug)}
              className={cn(
                "hero-cta-btn group relative flex w-full max-w-[480px] flex-col items-start justify-center overflow-hidden rounded-2xl px-8 py-5 transition-all duration-300 ease-out",
                "hover:scale-[1.025] active:scale-[0.98]",
                isCrb
                  ? "text-slate-950 shadow-[0_12px_40px_rgba(6,182,212,0.45),0_2px_8px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_56px_rgba(6,182,212,0.6),0_4px_16px_rgba(0,0,0,0.18)]"
                  : "text-white shadow-[0_12px_40px_rgba(220,38,38,0.4),0_2px_8px_rgba(0,0,0,0.12)] hover:shadow-[0_20px_56px_rgba(220,38,38,0.55),0_4px_16px_rgba(0,0,0,0.15)]",
              )}
              style={
                isCrb
                  ? {
                      background:
                        "linear-gradient(110deg, var(--brand-primary) 0%, #a5f3fc 55%, var(--brand-accent) 100%)",
                    }
                  : {
                      background:
                        "linear-gradient(110deg, #be123c 0%, var(--brand-secondary) 50%, #fb923c 100%)",
                    }
              }
            >
              {/* shine sweep on hover */}
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

              <span
                className={cn(
                  "relative mt-1.5 text-[12px] font-medium leading-none",
                  isCrb ? "text-slate-800/70" : "text-white/70",
                )}
              >
                Takes less than 60 seconds&nbsp;&nbsp;·&nbsp;&nbsp;No payment required today
              </span>
            </Link>
          </div>
          {/* ────────────────────────────────────────────────────────── */}

          </div>
        </div>

        <div
          className={cn(
            "relative order-2 min-w-0",
            (Boolean(mobileLead) || !isCrb) && "max-md:hidden md:block",
          )}
        >
          <div className="relative mt-4 w-full max-w-[680px] sm:mt-6 lg:ml-auto lg:mt-8">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(100%,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-[3rem] blur-2xl"
              style={{
                background: isCrb
                  ? "linear-gradient(to top right, var(--brand-primary), var(--brand-accent), var(--brand-secondary))"
                  : "linear-gradient(to top right, var(--brand-secondary), var(--brand-accent), var(--brand-primary))",
                opacity: isCrb ? 0.45 : 0.9,
              }}
              aria-hidden
            />
            {isCrb ? (
              <div
                className="hero-float-sticker pointer-events-none absolute right-[-24px] top-[100px] z-20 hidden lg:block"
                aria-hidden
              >
                <div className="max-w-[240px] rotate-6 rounded-2xl border border-cyan-400/35 bg-slate-950/80 px-4 py-2 text-xs font-black uppercase tracking-widest text-orange-300 shadow-xl backdrop-blur-md">
                  Main-stage inflatable
                </div>
              </div>
            ) : (
              <div
                className="hero-float-sticker pointer-events-none absolute left-[-42px] top-[90px] z-20 hidden lg:block"
                aria-hidden
              >
                <div className="flex items-center gap-3 rotate-[-6deg] rounded-[22px] border-2 border-white bg-white px-5 py-3 shadow-xl">
                  <span className="text-[36px] leading-none select-none" role="img">
                    ⭐
                  </span>
                  <div className="leading-[0.95] font-black uppercase tracking-[0.04em] text-[17px]">
                    <span className="block text-stone-900">Star of</span>
                    <span className="block text-rose-500">The party</span>
                  </div>
                </div>
              </div>
            )}
            <div className="relative z-10 w-full">
              <HeroDesktopStickerComposition
                isCrb={isCrb}
                brandSlug={brand.slug}
                items={carouselCategories}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "relative z-20 mx-auto mt-3 flex w-full max-w-[1320px] flex-wrap items-center justify-center gap-6 px-8 sm:mt-4 sm:gap-8 lg:absolute lg:bottom-[28px] lg:left-1/2 lg:mt-0 lg:w-[min(1080px,calc(100%-4rem))] lg:max-w-none lg:-translate-x-1/2 lg:gap-10 lg:px-0",
          isCrb
            ? "text-orange-200"
            : "text-orange-950/90 max-md:mt-2 max-md:gap-4 max-md:px-4 max-md:hidden",
        )}
        role="list"
        aria-label="Trust and guarantees"
      >
        {HERO_TRUST_ITEMS.map(({ label, Icon }, i) => (
          <Fragment key={label}>
            {i > 0 ? (
              <span
                className={cn(
                  "hidden h-5 w-px shrink-0 sm:block",
                  isCrb ? "bg-orange-200/35" : "bg-orange-950/25",
                )}
                aria-hidden
              />
            ) : null}
            <span
              role="listitem"
              className="group flex items-center gap-2.5 whitespace-nowrap"
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-300 motion-reduce:transition-none group-hover:scale-110 motion-reduce:group-hover:scale-100 sm:h-[18px] sm:w-[18px]",
                  isCrb ? "text-cyan-200" : "text-rose-600",
                )}
              />
              <span className="text-[11px] font-black uppercase tracking-[0.16em] sm:text-xs sm:tracking-[0.18em]">
                {label}
              </span>
            </span>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
