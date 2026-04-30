"use client";

import { useState } from "react";
import {
  ProductImageLightboxModal,
  PRODUCT_CARD_HERO_FRAME_CLASS,
  PRODUCT_CARD_HERO_IMG_CLASS,
} from "@/components/marketing/product-image-preview";
import { cn } from "@/lib/utils/cn";

export function BuildInventoryCardImage({
  imageSrc,
  imageAlt,
  productName,
  isCrb,
}: {
  imageSrc: string | null | undefined;
  imageAlt: string;
  productName: string;
  isCrb: boolean;
}) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);
  const trimmed = typeof imageSrc === "string" ? imageSrc.trim() : "";
  const canShow = trimmed.length > 0 && !broken;

  return (
    <>
      <div className={cn("group/cardimg shrink-0", PRODUCT_CARD_HERO_FRAME_CLASS)}>
        {!canShow ? (
          <div
            className={cn(
              "flex h-full w-full flex-col items-center justify-center gap-1.5 px-3",
              isCrb ? "text-slate-600" : "text-stone-400",
            )}
          >
            <svg
              className="h-7 w-7 opacity-40"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 20.25h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12.75c0 .828.672 1.5 1.5 1.5z"
              />
            </svg>
            <span className="text-[11px] font-medium">Photo coming soon</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- remote inventory URLs / dynamic Supabase imagery
          <img
            src={trimmed}
            alt={imageAlt}
            className={PRODUCT_CARD_HERO_IMG_CLASS}
            onClick={(e) => {
              e.stopPropagation();
              setActiveImage(trimmed);
            }}
            onError={() => setBroken(true)}
          />
        )}
      </div>

      <ProductImageLightboxModal
        activeImage={activeImage}
        onClose={() => setActiveImage(null)}
        alt={imageAlt || productName}
        caption={productName}
      />
    </>
  );
}
