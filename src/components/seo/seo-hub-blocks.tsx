/**
 * Homepage SEO hub blocks (Phase 6).
 *
 * Server-rendered. Three sections, each a clean chip grid that links into the
 * SEO landings — no UI bloat, no fake testimonials, no keyword stuffing:
 *   1. Popular Rental Categories — service hubs (via home-base city)
 *   2. Popular Cities — every city, party-rentals catch-all
 *   3. Popular Searches — hand-picked high-intent combos
 *
 * Crawl impact: ~24 unique internal links from each homepage in <=1 click
 * to every (service, city) landing in <=3 total clicks (homepage → city → near
 * city). Both brands render the same component; URLs are relative paths so
 * brand-domain canonicalization stays correct on each host.
 */

import Link from "next/link";
import type { Brand } from "@/lib/brand/config";
import { withBrand } from "@/lib/brand/with-brand-href";
import { Container } from "@/components/marketing/container";
import {
  getPopularCategoryLinks,
  getPopularCityLinks,
  getPopularSearchLinks,
  type LinkRef,
} from "@/lib/seo/internal-linking";
import { cn } from "@/lib/utils/cn";

function HubChipList({
  links,
  brand,
  variant,
}: {
  links: LinkRef[];
  brand: Brand;
  variant: "primary" | "neutral" | "outline";
}) {
  const isCrb = brand.slug === "crb";
  const base =
    "inline-flex items-center gap-2 px-4 py-2 text-sm font-bold transition active:scale-[0.99]";
  const styles: Record<typeof variant, string> = {
    primary: isCrb
      ? "bg-cyan-500/15 text-cyan-100 ring-1 ring-cyan-400/35 hover:bg-cyan-500/25 hover:ring-cyan-400/60"
      : "bg-orange-500/12 text-orange-950 ring-1 ring-orange-400/30 hover:bg-orange-500/20 hover:ring-orange-400/55",
    neutral: isCrb
      ? "bg-slate-800/80 text-cyan-100 ring-1 ring-cyan-400/25 hover:bg-slate-800 hover:ring-cyan-400/50"
      : "bg-white/85 text-stone-800 ring-1 ring-orange-400/20 hover:bg-white hover:ring-orange-400/45",
    outline: isCrb
      ? "text-cyan-100 ring-1 ring-cyan-400/35 hover:bg-cyan-500/10 hover:ring-cyan-400/55"
      : "text-stone-800 ring-1 ring-orange-400/30 hover:bg-orange-50 hover:ring-orange-400/55",
  };
  return (
    <ul className="mt-6 flex flex-wrap gap-2">
      {links.map((l) => (
        <li key={l.href}>
          <Link
            href={withBrand(l.href, brand.slug)}
            className={cn(base, styles[variant])}
            style={{ borderRadius: "var(--brand-radius-md)" }}
          >
            {l.label}
            <span aria-hidden className="opacity-60">→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function HubColumn({
  eyebrow,
  title,
  description,
  links,
  brand,
  variant,
}: {
  eyebrow: string;
  title: string;
  description: string;
  links: LinkRef[];
  brand: Brand;
  variant: "primary" | "neutral" | "outline";
}) {
  if (links.length === 0) return null;
  const isCrb = brand.slug === "crb";
  return (
    <div>
      <p
        className={cn(
          "text-[11px] font-bold uppercase tracking-[0.2em]",
          isCrb ? "text-cyan-200/85" : "text-stone-500",
        )}
      >
        {eyebrow}
      </p>
      <h3
        className={cn(
          "mt-2 text-xl font-black tracking-tight sm:text-2xl",
          isCrb ? "text-white" : "text-stone-900",
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "mt-2 max-w-md text-sm leading-relaxed",
          isCrb ? "text-slate-300" : "text-stone-600",
        )}
      >
        {description}
      </p>
      <HubChipList links={links} brand={brand} variant={variant} />
    </div>
  );
}

export function SeoHubBlocks({ brand }: { brand: Brand }) {
  const isCrb = brand.slug === "crb";
  const categories = getPopularCategoryLinks();
  const cities = getPopularCityLinks();
  const searches = getPopularSearchLinks();

  // Defensive: skip the whole section if every list resolves empty (shouldn't
  // happen with the current data, but avoids rendering an empty heading).
  if (categories.length + cities.length + searches.length === 0) return null;

  return (
    <section
      aria-label="Find the right rental"
      className={cn(
        "py-14 sm:py-20",
        isCrb ? "bg-slate-950/55" : "bg-amber-50/45",
      )}
    >
      <Container>
        <div className="max-w-2xl">
          <p
            className={cn(
              "text-[11px] font-bold uppercase tracking-[0.2em]",
              isCrb ? "text-cyan-200/85" : "text-stone-500",
            )}
          >
            Find the right rental
          </p>
          <h2
            className={cn(
              "mt-2 text-3xl font-black tracking-tight sm:text-4xl",
              isCrb ? "text-white" : "text-stone-900",
            )}
          >
            Browse by category, city, or what you searched
          </h2>
          <p
            className={cn(
              "mt-3 text-base leading-relaxed sm:text-lg",
              isCrb ? "text-slate-300" : "text-stone-700",
            )}
          >
            Real local availability, real local delivery — pick whichever path
            gets you to the right page fastest.
          </p>
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-3 lg:gap-10">
          <HubColumn
            brand={brand}
            variant="primary"
            eyebrow="Popular categories"
            title="What kind of rental?"
            description="Jump straight to the right inventory in our home-base city, then check availability for your address."
            links={categories}
          />
          <HubColumn
            brand={brand}
            variant="neutral"
            eyebrow="Popular cities"
            title="Where's the party?"
            description="Every city we deliver to has its own page with local FAQs, delivery notes, and the right inventory for the address."
            links={cities}
          />
          <HubColumn
            brand={brand}
            variant="outline"
            eyebrow="Popular searches"
            title="The combos people actually book"
            description="High-demand service + city pairs — start here if you already know the keyword."
            links={searches}
          />
        </div>
      </Container>
    </section>
  );
}
