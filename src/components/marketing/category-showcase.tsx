import Image from "next/image";
import Link from "next/link";
import type { BrandSlug } from "@/lib/brand/config";
import type { SiteCategoryCarouselItem } from "@/lib/catalog/get-rental-categories";
import { withBrand } from "@/lib/brand/with-brand-href";
import { cn } from "@/lib/utils/cn";
import { Container } from "./container";

type CategoryShowcaseProps = {
  isCrb: boolean;
  brandSlug: BrandSlug;
  items: SiteCategoryCarouselItem[];
};

export function CategoryShowcase({ isCrb, brandSlug, items }: CategoryShowcaseProps) {
  return (
    <section
      aria-labelledby="category-showcase-heading"
      className={cn(
        "relative overflow-hidden py-12 md:py-16",
        isCrb
          ? "bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-950"
          : "bg-gradient-to-b from-amber-50/90 via-stone-50/50 to-amber-100/40",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-white/10" aria-hidden />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 opacity-60",
          isCrb
            ? "bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.12),transparent)]"
            : "bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(251,191,36,0.12),transparent)]",
        )}
        aria-hidden
      />
      <Container className="relative">
        <div
          className={cn(
            "mb-8 h-px bg-gradient-to-r from-transparent to-transparent",
            isCrb ? "via-cyan-200/30" : "via-amber-900/20",
          )}
          aria-hidden
        />
        <header className="mx-auto max-w-[600px] text-center">
          <h2
            id="category-showcase-heading"
            className={cn(
              "text-2xl font-bold tracking-tight sm:text-3xl",
              isCrb ? "text-white" : "text-stone-900",
            )}
          >
            Choose your perfect setup
          </h2>
          <p
            className={cn(
              "mt-2 text-base sm:mt-3 sm:text-lg",
              isCrb ? "text-cyan-100/80" : "text-stone-600",
            )}
          >
            From classic jumpers to full party experiences
          </p>
        </header>

        {items.length === 0 ? (
          <p
            className={cn(
              "mt-10 text-center text-sm font-semibold",
              isCrb ? "text-cyan-100/70" : "text-stone-600",
            )}
          >
            Categories are loading soon —{" "}
            <Link
              href={withBrand("/products", brandSlug)}
              className={cn("underline", isCrb ? "decoration-cyan-300" : "decoration-rose-500")}
            >
              browse rentals
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-10 grid list-none grid-cols-2 gap-4 p-0 md:mt-12 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
            {items.map((item) => (
              <li key={item.slug} className="min-w-0">
                <Link
                  href={withBrand(item.href, brandSlug)}
                  className={cn(
                    "group relative z-0 block cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 md:hover:z-20",
                    isCrb
                      ? "focus-visible:outline-cyan-400"
                      : "focus-visible:outline-amber-600",
                  )}
                >
                  <div
                    className={cn(
                      "relative origin-center transform-gpu rounded-2xl p-4 text-center",
                      "transition-all duration-300 ease-out",
                      "md:group-hover:scale-105",
                      "md:group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)]",
                      "md:group-hover:rotate-[1deg]",
                      "bg-white/60 backdrop-blur-md",
                      isCrb && "ring-1 ring-cyan-400/20 md:group-hover:ring-cyan-300/30",
                      !isCrb && "ring-1 ring-amber-900/10 md:group-hover:ring-amber-800/20",
                    )}
                  >
                    {item.isPopular ? (
                      <span className="absolute top-2 right-2 z-10 whitespace-nowrap rounded-full bg-yellow-400 px-2 py-1 text-xs font-semibold text-black">
                        Most Popular
                      </span>
                    ) : null}
                    <div className="relative mx-auto mb-3 h-[120px] w-full max-w-[180px] md:h-[140px]">
                      <Image
                        src={item.imageSrc}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 45vw, 200px"
                        className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out md:group-hover:scale-110"
                      />
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-black/90 transition-colors duration-300 ease-out md:group-hover:text-black md:text-base">
                      {item.title}
                    </h3>
                    <p className="line-clamp-2 text-xs leading-snug text-black/70 transition-colors duration-300 ease-out md:group-hover:text-black md:text-sm">
                      {item.description}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
