"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils/cn";
import { HERO_CAROUSEL_STICKERS } from "@/components/home/hero-sticker-constants";
import { HeroStickerPng } from "@/components/home/hero-sticker-png";

const AUTOPLAY_MS = 2700;
const N = HERO_CAROUSEL_STICKERS.length;

export type HeroStickerCarouselVariant = "lias" | "crb";

export function HeroMobileStickerCarousel({
  variant,
}: {
  variant: HeroStickerCarouselVariant;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef(0);
  const pauseAutoplayRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const activeDot =
    variant === "lias"
      ? "h-2.5 w-2.5 bg-pink-600"
      : "h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.55)]";
  const inactiveDot = "h-2 w-2 bg-black/20";
  const labelClass =
    variant === "lias"
      ? "text-stone-800"
      : "text-cyan-50/95";

  const setSlideIndex = useCallback(
    (i: number, opts?: { behavior?: ScrollBehavior }) => {
      const iClamped = (i + N) % N;
      indexRef.current = iClamped;
      setIndex(iClamped);
      const el = scrollerRef.current;
      if (!el) return;
      const child = el.children[iClamped] as HTMLElement | undefined;
      if (!child) return;
      const behavior: ScrollBehavior =
        reducedMotion || opts?.behavior === "auto" ? "auto" : (opts?.behavior ?? "smooth");
      el.scrollTo({ left: child.offsetLeft, behavior });
    },
    [reducedMotion],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      if (pauseAutoplayRef.current) return;
      const next = (indexRef.current + 1) % N;
      setSlideIndex(next, { behavior: "smooth" });
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [reducedMotion, setSlideIndex]);

  const onScroll = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const el = scrollerRef.current;
      if (!el) return;
      const left = el.scrollLeft;
      const w = el.clientWidth;
      const center = left + w / 2;
      const children = el.children;
      let best = 0;
      let min = Infinity;
      for (let j = 0; j < children.length; j++) {
        const c = children[j] as HTMLElement;
        const mid = c.offsetLeft + c.offsetWidth / 2;
        const d = Math.abs(mid - center);
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
  }, []);

  const onPointerDown = useCallback(() => {
    pauseAutoplayRef.current = true;
  }, []);

  const onPointerUp = useCallback(() => {
    window.setTimeout(() => {
      pauseAutoplayRef.current = false;
    }, 500);
  }, []);

  return (
    <div>
      <div
        ref={scrollerRef}
        className={cn(
          "mt-0 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 [-ms-overflow-style:none] [scrollbar-width:none] touch-pan-x [&::-webkit-scrollbar]:hidden",
          variant === "lias" ? "pb-0" : "pb-0.5",
        )}
        role="list"
        aria-label="Product stickers"
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {HERO_CAROUSEL_STICKERS.map((s) => {
          const isLias = variant === "lias";
          return (
            <div
              key={s.src}
              role="listitem"
              className="min-w-[86%] shrink-0 snap-center"
            >
              <div
                className={cn(
                  "flex min-h-0 w-full items-center justify-center",
                  isLias
                    ? "h-[300px] max-[380px]:h-[270px]"
                    : "h-[320px] max-[380px]:h-[290px]",
                )}
              >
                <HeroStickerPng
                  src={s.src}
                  alt={s.alt}
                  heroVariant={isLias ? "lias-mobile" : "default"}
                  className="flex h-full w-full max-w-[min(100%,420px)] min-w-0 items-center justify-center"
                  imageClassName={
                    isLias
                      ? "max-h-[min(100%,348px)] max-w-full object-contain max-[380px]:max-h-[min(100%,315px)]"
                      : "max-h-[310px] max-w-full object-contain max-[380px]:max-h-[280px]"
                  }
                />
              </div>
              <p
                className={cn(
                  "text-center text-[13px] font-bold",
                  isLias ? "mt-1" : "mt-1.5",
                  labelClass,
                )}
              >
                {s.label}
              </p>
            </div>
          );
        })}
      </div>
      <div
        className={cn(
          "flex justify-center gap-2",
          variant === "lias" ? "mt-0.5" : "mt-1",
        )}
        role="tablist"
        aria-label="Slide indicators"
      >
        {HERO_CAROUSEL_STICKERS.map((s, i) => (
          <button
            key={s.src}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`${s.label}, slide ${i + 1} of ${N}`}
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
