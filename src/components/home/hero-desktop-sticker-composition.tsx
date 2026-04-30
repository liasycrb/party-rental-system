"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { BrandSlug } from "@/lib/brand/config";
import { withBrand } from "@/lib/brand/with-brand-href";
import { CategoryHeroCtaPill } from "@/components/home/category-hero-cta-pill";
import type { SiteCategoryCarouselItem } from "@/lib/catalog/get-rental-categories";
import { cn } from "@/lib/utils/cn";

const INTERVAL_MS = 3000;
const FADE_MS = 500;

/**
 * Rotating category spotlight (md+ right column).
 */
export function HeroDesktopStickerComposition({
  isCrb,
  brandSlug,
  items,
}: {
  isCrb: boolean;
  brandSlug: BrandSlug;
  items: SiteCategoryCarouselItem[];
}) {
  const n = items.length;

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [imageOk, setImageOk] = useState(true);

  useEffect(() => {
    if (n === 0) {
      setIndex(0);
      return;
    }
    setIndex((i) => Math.min(i, n - 1));
  }, [n]);

  useEffect(() => {
    setImageOk(true);
  }, [index]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) setVisible(true);
  }, [reducedMotion]);

  useEffect(() => {
    if (n <= 1) return;

    if (reducedMotion) {
      const intervalId = window.setInterval(() => {
        setIndex((prev) => (prev + 1) % n);
      }, INTERVAL_MS);
      return () => clearInterval(intervalId);
    }

    const pendingFade: { id: number | null } = { id: null };
    const intervalId = window.setInterval(() => {
      setVisible(false);
      pendingFade.id = window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % n);
        setVisible(true);
        pendingFade.id = null;
      }, FADE_MS);
    }, INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      if (pendingFade.id != null) window.clearTimeout(pendingFade.id);
    };
  }, [n, reducedMotion]);

  if (n === 0) {
    return (
      <div
        className={cn(
          "relative mx-auto flex h-[min(480px,60vh)] w-full min-h-[260px] max-w-[560px] items-center justify-center rounded-3xl border p-10 text-center",
          isCrb
            ? "border-cyan-400/30 bg-slate-950/50 text-cyan-100"
            : "border-stone-200 bg-white/80 text-stone-700",
        )}
      >
        <Link
          href={withBrand("/products", brandSlug)}
          className={cn(
            "text-sm font-black underline decoration-2 underline-offset-4",
            isCrb ? "decoration-cyan-300 hover:text-white" : "decoration-rose-400 hover:text-stone-900",
          )}
        >
          Browse party rentals →
        </Link>
      </div>
    );
  }

  const current = items[index]!;

  return (
    <div className="relative mx-auto flex h-[min(600px,78vh)] w-full min-h-[320px] max-w-[640px] flex-col items-center justify-center">
      <div
        className={cn(
          "flex w-full max-w-[600px] flex-col items-center justify-center p-1 transition-opacity ease-in-out",
          reducedMotion ? "duration-0" : "duration-500",
          visible || reducedMotion ? "opacity-100" : "opacity-0",
        )}
      >
        <Link
          href={withBrand(current.href, brandSlug)}
          aria-label={`${current.title} — view category`}
          className={cn(
            "group flex w-full max-w-[560px] flex-col items-stretch focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            isCrb
              ? "focus-visible:ring-cyan-400/70 focus-visible:ring-offset-slate-900"
              : "focus-visible:ring-pink-500/60 focus-visible:ring-offset-amber-50",
          )}
        >
          <div className="relative w-full max-w-[560px]">
            {imageOk ? (
              <Image
                src={current.imageSrc}
                alt=""
                width={560}
                height={560}
                className="mx-auto h-auto w-full max-w-[560px] origin-center object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] motion-reduce:scale-100 md:scale-110 lg:scale-125"
                sizes="(max-width:1280px) 50vw, 560px"
                onError={() => setImageOk(false)}
              />
            ) : (
              <div
                className={cn(
                  "mx-auto flex aspect-square w-full max-w-[560px] items-center justify-center rounded-2xl border text-sm font-medium",
                  isCrb
                    ? "border-cyan-400/30 bg-slate-950/60 text-cyan-200/80"
                    : "border-stone-200 bg-white/80 text-stone-500",
                )}
              >
                Image coming soon
              </div>
            )}
            <CategoryHeroCtaPill title={current.title} />
          </div>
        </Link>
      </div>
    </div>
  );
}
