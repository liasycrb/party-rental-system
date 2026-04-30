"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { BrandSlug } from "@/lib/brand/config";
import { withBrand } from "@/lib/brand/with-brand-href";
import type { SiteCategoryCarouselItem } from "@/lib/catalog/get-rental-categories";
import { CategoryHeroCtaPill } from "@/components/home/category-hero-cta-pill";
import { cn } from "@/lib/utils/cn";
import { HeroStickerPng } from "@/components/home/hero-sticker-png";

const AUTOPLAY_MS = 2700;

/**
 * Center a slide in the horizontal strip using only the scroller's scrollLeft.
 * Avoids `scrollIntoView`, which can scroll the document and yank the viewport
 * back to the hero when the user has scrolled down the page.
 */
function scrollChildIntoCenterHorizontally(
  scroller: HTMLDivElement,
  child: HTMLElement,
  behavior: ScrollBehavior,
): void {
  const cr = child.getBoundingClientRect();
  const sr = scroller.getBoundingClientRect();
  const childLeftRelative = cr.left - sr.left + scroller.scrollLeft;
  const desired =
    childLeftRelative - scroller.clientWidth / 2 + cr.width / 2;
  const maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
  const next = Math.max(0, Math.min(desired, maxScroll));
  scroller.scrollTo({ left: next, behavior });
}

export type HeroStickerCarouselVariant = "lias" | "crb";

export function HeroMobileStickerCarousel({
  variant,
  items,
}: {
  variant: HeroStickerCarouselVariant;
  items: SiteCategoryCarouselItem[];
}) {
  const brandSlug: BrandSlug = variant === "lias" ? "lias" : "crb";
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef(0);
  const pauseAutoplayRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const N = items.length;

  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const activeDot =
    variant === "lias"
      ? "h-2.5 w-2.5 bg-pink-600"
      : "h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.55)]";
  const inactiveDot = "h-2 w-2 bg-black/20";

  const setSlideIndex = useCallback(
    (i: number, opts?: { behavior?: ScrollBehavior }) => {
      if (N === 0) return;
      const iClamped = (i + N) % N;
      indexRef.current = iClamped;
      setIndex(iClamped);
      const el = scrollerRef.current;
      if (!el) return;
      const child = el.children[iClamped] as HTMLElement | undefined;
      if (!child) return;
      scrollChildIntoCenterHorizontally(
        el,
        child,
        opts?.behavior ?? (reducedMotion ? "auto" : "smooth"),
      );
    },
    [N, reducedMotion],
  );

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || N === 0) return;
    if (rafRef.current != null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const children = Array.from(el.children) as HTMLElement[];
      let best = indexRef.current;
      let min = Infinity;
      const viewportMid = el.getBoundingClientRect().left + el.clientWidth * 0.5;
      for (let j = 0; j < children.length; j++) {
        const rect = children[j].getBoundingClientRect();
        const cMid = rect.left + rect.width * 0.5;
        const d = Math.abs(cMid - viewportMid);
        if (d < min) {
          min = d;
          best = j;
        }
      }
      if (best !== indexRef.current) {
        indexRef.current = best;
        setIndex(best);
      }
    });
  }, [N]);

  useEffect(() => {
    indexRef.current = N === 0 ? 0 : Math.min(indexRef.current, N - 1);
    setIndex(indexRef.current);
  }, [N]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (N <= 1 || reducedMotion) return;
    const id = window.setInterval(() => {
      if (pauseAutoplayRef.current) return;
      setSlideIndex(indexRef.current + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [N, reducedMotion, setSlideIndex]);

  const onPointerDown = useCallback(() => {
    pauseAutoplayRef.current = true;
  }, []);

  const onPointerUp = useCallback(() => {
    window.setTimeout(() => {
      pauseAutoplayRef.current = false;
    }, 500);
  }, []);

  if (N === 0) {
    return (
      <div className="mt-6 flex justify-center px-6">
        <Link
          href={withBrand("/products", brandSlug)}
          className={cn(
            "rounded-full px-6 py-3 text-[13px] font-black underline decoration-2",
            variant === "lias"
              ? "bg-white/85 text-stone-800 underline-rose-500"
              : "bg-slate-900/85 text-cyan-100 underline-cyan-300",
          )}
        >
          Browse party rentals →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div
        ref={scrollerRef}
        className={cn(
          "mt-0 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 [-ms-overflow-style:none] [scrollbar-width:none] touch-pan-x [&::-webkit-scrollbar]:hidden",
          variant === "lias" ? "pb-0" : "pb-0.5",
        )}
        role="list"
        aria-label="Product categories"
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {items.map((item) => {
          const isLias = variant === "lias";
          return (
            <Link
              key={item.slug}
              href={withBrand(item.href, brandSlug)}
              role="listitem"
              aria-label={`${item.title} — view category`}
              className={cn(
                "group block min-w-[86%] shrink-0 snap-center rounded-lg outline-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2",
                isLias
                  ? "focus-visible:ring-pink-500/60 focus-visible:ring-offset-amber-50"
                  : "focus-visible:ring-cyan-400/50 focus-visible:ring-offset-slate-900",
              )}
            >
              <div
                className={cn(
                  "relative flex min-h-0 w-full items-center justify-center overflow-visible",
                  isLias
                    ? "h-[300px] max-[380px]:h-[270px]"
                    : "h-[320px] max-[380px]:h-[290px]",
                )}
              >
                <HeroStickerPng
                  src={item.imageSrc}
                  alt=""
                  heroVariant={isLias ? "lias-mobile" : "default"}
                  className="flex h-full w-full max-w-[min(100%,420px)] min-w-0 items-center justify-center"
                  imageClassName={
                    isLias
                      ? "max-h-[min(100%,348px)] max-w-full object-contain max-[380px]:max-h-[min(100%,315px)]"
                      : "max-h-[310px] max-w-full object-contain max-[380px]:max-h-[280px]"
                  }
                />
                <CategoryHeroCtaPill
                  title={item.title}
                  className="max-w-[min(calc(100%-1.5rem),18rem)]"
                />
              </div>
            </Link>
          );
        })}
      </div>
      <div
        className={cn(
          "flex justify-center gap-2",
          variant === "lias" ? "mt-0.5" : "mt-1",
        )}
        role="tablist"
        aria-label="Category slide indicators"
      >
        {items.map((item, i) => (
          <button
            key={item.slug}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`${item.title}, slide ${i + 1} of ${N}`}
            className={cn(
              "rounded-full transition-colors",
              i === index ? activeDot : inactiveDot,
            )}
            onClick={() => setSlideIndex(i, { behavior: "smooth" })}
          />
        ))}
      </div>
    </div>
  );
}
