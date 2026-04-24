"use client";

import Image from "next/image";
import { useState } from "react";

const ITEMS: {
  primarySrc: string;
  fallbackSrc: string;
  label: string;
  alt: string;
}[] = [
  {
    primarySrc: "/party-rentals/shared/rainbow-castle.png",
    fallbackSrc: "/party-rentals/shared/rainbow-castle.jpg",
    label: "Castle Jumper",
    alt: "Castle jumper inflatable for rent",
  },
  {
    primarySrc: "/party-rentals/shared/tropical-combo.png",
    fallbackSrc: "/party-rentals/shared/tropical-combo.jpg",
    label: "Combo Slide",
    alt: "Combo slide inflatable for rent",
  },
  {
    primarySrc: "/party-rentals/shared/classic-module.png",
    fallbackSrc: "/party-rentals/shared/classic-module.jpg",
    label: "Theme Jumper",
    alt: "Themed inflatable jumper for rent",
  },
];

function ProductImage({
  primarySrc,
  fallbackSrc,
  alt,
}: {
  primarySrc: string;
  fallbackSrc: string;
  alt: string;
}) {
  const [src, setSrc] = useState(primarySrc);

  return (
    <Image
      src={src}
      alt={alt}
      width={200}
      height={140}
      className="h-[130px] w-auto max-w-full object-contain drop-shadow-[0_6px_20px_rgba(15,23,42,0.12)]"
      sizes="(max-width: 768px) 140px, 0"
      onError={() => {
        if (src !== fallbackSrc) setSrc(fallbackSrc);
      }}
    />
  );
}

/**
 * Lias mobile-only: horizontal product cutouts above the hero headline.
 * Prefers transparent PNG; falls back to JPG when PNG is not present.
 */
export function MobileProductStrip() {
  return (
    <div
      className="md:hidden"
      role="list"
      aria-label="Popular rental styles"
    >
      <p className="sr-only">Scroll horizontally to see jumpers, slides, and themes.</p>
      <div className="flex gap-4 overflow-x-auto px-4 py-4">
        {ITEMS.map((item) => (
          <div
            key={item.primarySrc}
            role="listitem"
            className="flex min-w-[120px] shrink-0 flex-col items-center justify-center gap-2"
          >
            <ProductImage
              primarySrc={item.primarySrc}
              fallbackSrc={item.fallbackSrc}
              alt={item.alt}
            />
            <p className="text-center text-[13px] font-semibold text-stone-800">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
