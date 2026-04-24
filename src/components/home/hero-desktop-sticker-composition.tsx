"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  HERO_DESKTOP_ROTATE_CRB,
  HERO_DESKTOP_ROTATE_LIAS,
} from "@/components/home/hero-sticker-constants";
import { cn } from "@/lib/utils/cn";

const INTERVAL_MS = 3000;
const FADE_MS = 500;

/**
 * Single centered hero image (md+ right column) with auto-rotation.
 * Same outer container as before; no stacked/rotated layers.
 */
export function HeroDesktopStickerComposition({ isCrb }: { isCrb: boolean }) {
  const heroImages = isCrb ? HERO_DESKTOP_ROTATE_CRB : HERO_DESKTOP_ROTATE_LIAS;
  const n = heroImages.length;

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

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

  const current = heroImages[index]!;

  return (
    <div
      className="relative mx-auto flex h-[min(520px,72vh)] w-full min-h-[300px] max-w-[580px] items-center justify-center"
      aria-hidden
    >
      <div
        className={cn(
          "flex w-full max-w-[420px] items-center justify-center transition-opacity ease-in-out",
          reducedMotion ? "duration-0" : "duration-500",
          visible || reducedMotion ? "opacity-100" : "opacity-0",
        )}
      >
        <Image
          src={current.src}
          alt={current.alt}
          width={420}
          height={420}
          className="mx-auto h-auto w-full max-w-[420px] object-contain"
          sizes="(max-width:1280px) 42vw, 420px"
        />
      </div>
    </div>
  );
}
