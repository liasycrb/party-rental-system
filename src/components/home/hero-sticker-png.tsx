"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

/** Borderless sticker (CRB mobile, desktop composition). */
const FLOAT_STICKER_SHADOW =
  "shadow-[0_15px_30px_rgba(0,0,0,0.12),0_30px_60px_rgba(0,0,0,0.18)]";

const LIAS_MOBILE_GLASS =
  "rounded-[20px] border border-white/80 bg-white/25 backdrop-blur-md";

type HeroStickerPngProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  /**
   * `lias-mobile`: glass card on gradient, flat — no elevation shadows.
   * `default`: standard float shadow (CRB, desktop art).
   */
  heroVariant?: "default" | "lias-mobile";
};

export function HeroStickerPng({
  src,
  alt,
  className,
  imageClassName,
  sizes = "320px",
  heroVariant = "default",
}: HeroStickerPngProps) {
  const [ok, setOk] = useState(true);

  if (!ok) {
    if (heroVariant === "lias-mobile") {
      return (
        <div
          className={cn(
            "flex h-full w-full min-w-0 items-center justify-center p-2 text-center",
            className,
          )}
        >
          <div
            className={cn(
              "flex min-h-[160px] w-full max-w-full min-w-0 items-center justify-center p-3 text-slate-500",
              LIAS_MOBILE_GLASS,
            )}
          >
            <p className="text-sm font-medium leading-snug">Product image coming soon</p>
          </div>
        </div>
      );
    }
    return (
      <div
        className={cn(
          "flex min-h-0 w-full min-w-0 items-center justify-center rounded-2xl px-2 text-center text-slate-400",
          className,
        )}
      >
        <p className="text-center text-sm font-medium leading-snug">
          Product image coming soon
        </p>
      </div>
    );
  }

  if (heroVariant === "lias-mobile") {
    return (
      <div
        className={cn(
          "relative flex h-full w-full min-w-0 items-center justify-center p-0.5",
          className,
        )}
      >
        <div
          className={cn(
            "flex h-full w-full min-h-0 min-w-0 max-w-full items-center justify-center overflow-hidden p-1.5",
            LIAS_MOBILE_GLASS,
          )}
        >
          <Image
            src={src}
            alt={alt}
            width={640}
            height={360}
            className={cn(
              "h-full w-full max-h-full object-contain",
              imageClassName,
            )}
            sizes={sizes}
            onError={() => setOk(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", FLOAT_STICKER_SHADOW, className)}>
      <Image
        src={src}
        alt={alt}
        width={640}
        height={360}
        className={cn("h-full w-full object-contain", imageClassName)}
        sizes={sizes}
        onError={() => setOk(false)}
      />
    </div>
  );
}
