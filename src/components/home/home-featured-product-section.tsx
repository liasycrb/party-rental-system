import type { Brand } from "@/lib/brand/config";
import { HOME_PAGE_FEATURED_PRODUCTS } from "@/lib/catalog/demo-products";
import { ProductCard } from "@/components/marketing/product-card";
import { Container } from "@/components/marketing/container";
import { SectionTitle } from "@/components/marketing/section-title";
import { cn } from "@/lib/utils/cn";

type HomeFeaturedProductSectionProps = {
  brand: Brand;
  headingId: string;
  eyebrow: string;
  title: string;
  description?: string;
  tone?: "default" | "onDark";
};

/**
 * Shared homepage featured products: three curated demo slots only (not live inventory).
 * Desktop: one row × three columns, equal stretched heights.
 * Mobile: horizontal scroll + snap (~one card per scrollport width), no JS, no fragment/hash.
 */
export function HomeFeaturedProductSection({
  brand,
  headingId,
  eyebrow,
  title,
  description,
  tone = "default",
}: HomeFeaturedProductSectionProps) {
  const featured = HOME_PAGE_FEATURED_PRODUCTS;
  const slideBasisPct = 100 / featured.length;

  return (
    <section
      className="relative py-16 sm:py-24"
      style={{ background: "var(--brand-stripe-fleet)" }}
      aria-labelledby={headingId}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 sm:h-80"
        style={{ background: "var(--brand-fleet-ambient)" }}
        aria-hidden
      />
      <Container className="relative">
        <SectionTitle
          id={headingId}
          tone={tone}
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        {/* Mobile: swipe / snap (~one card per view); track width scaled so flex % = viewport */}
        <div
          role="region"
          aria-label="Featured rentals"
          className={cn(
            "mt-10 lg:hidden",
            "overflow-x-auto overflow-y-hidden overscroll-x-contain",
            "snap-x snap-mandatory [-webkit-overflow-scrolling:touch]",
            "scroll-smooth pb-2",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          <div className="flex" style={{ width: `${featured.length * 100}%` }}>
            {featured.map((product) => (
              <div
                key={product.slug}
                style={{ flex: `0 0 ${slideBasisPct}%` }}
                className="box-border min-h-0 shrink-0 snap-center px-1.5 sm:px-2"
              >
                <div className="flex h-full min-h-[380px] flex-col sm:min-h-[420px]">
                  <ProductCard
                    brand={brand}
                    product={product}
                    visual="catalog"
                    className="h-full min-h-0 w-full flex-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: single row of three */}
        <div className="mt-10 hidden min-h-[420px] grid-cols-3 gap-6 items-stretch lg:grid">
          {featured.map((product) => (
            <div key={product.slug} className="flex min-h-0 h-full flex-col">
              <ProductCard
                brand={brand}
                product={product}
                visual="catalog"
                className="min-h-0 h-full w-full flex-1"
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
