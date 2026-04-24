"use client";

import { HERO_PNG } from "@/components/home/hero-sticker-constants";
import { HeroStickerPng } from "@/components/home/hero-sticker-png";

const IMG =
  "max-h-full w-full object-contain select-none";

/**
 * Layered product stickers for md+ hero right column (Lias vs CRB mapping).
 * Borderless stickers so PNG cutout edge is not doubled.
 */
export function HeroDesktopStickerComposition({ isCrb }: { isCrb: boolean }) {
  return (
    <div
      className="relative mx-auto flex h-[min(520px,72vh)] w-full min-h-[300px] max-w-[580px] items-center justify-center"
      aria-hidden
    >
      {!isCrb ? (
        <>
          <div className="absolute bottom-[8%] left-[2%] z-[1] w-[min(44%,240px)] -rotate-[7deg] motion-reduce:transform-none">
            <HeroStickerPng
              src={HERO_PNG.combo}
              alt="Combo slide inflatable"
              sizes="(max-width:1280px) 38vw, 280px"
              className="flex items-center justify-center"
              imageClassName={IMG}
            />
          </div>
          <div className="hero-float-sticker absolute left-1/2 top-1/2 z-[3] w-[min(58%,320px)] -translate-x-1/2 -translate-y-1/2 motion-reduce:transform-none">
            <HeroStickerPng
              src={HERO_PNG.castle}
              alt="Castle jumper inflatable"
              sizes="(max-width:1280px) 48vw, 360px"
              className="flex items-center justify-center"
              imageClassName={IMG}
            />
          </div>
          <div className="absolute bottom-[6%] right-[4%] z-[2] w-[min(32%,200px)] rotate-[5deg] motion-reduce:transform-none">
            <HeroStickerPng
              src={HERO_PNG.theme}
              alt="Theme jumper inflatable"
              sizes="(max-width:1280px) 28vw, 200px"
              className="flex items-center justify-center"
              imageClassName={IMG}
            />
          </div>
        </>
      ) : (
        <>
          <div className="absolute right-[0%] top-[10%] z-[1] w-[min(40%,230px)] -rotate-[5deg] motion-reduce:transform-none">
            <HeroStickerPng
              src={HERO_PNG.castle}
              alt="Castle jumper inflatable"
              sizes="(max-width:1280px) 34vw, 240px"
              className="flex items-center justify-center"
              imageClassName={IMG}
            />
          </div>
          <div className="hero-float-sticker absolute left-1/2 top-1/2 z-[3] w-[min(60%,330px)] -translate-x-1/2 -translate-y-1/2 motion-reduce:transform-none">
            <HeroStickerPng
              src={HERO_PNG.combo}
              alt="Combo slide inflatable"
              sizes="(max-width:1280px) 50vw, 360px"
              className="flex items-center justify-center"
              imageClassName={IMG}
            />
          </div>
          <div className="absolute bottom-[8%] left-[2%] z-[2] w-[min(30%,190px)] rotate-[4deg] motion-reduce:transform-none">
            <HeroStickerPng
              src={HERO_PNG.toddler}
              alt="Toddler unit inflatable"
              sizes="(max-width:1280px) 26vw, 180px"
              className="flex items-center justify-center"
              imageClassName={IMG}
            />
          </div>
        </>
      )}
    </div>
  );
}
