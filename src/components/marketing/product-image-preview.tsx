"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

function hasRenderableImageSrc(imageSrc?: string): boolean {
  return typeof imageSrc === "string" && imageSrc.trim().length > 0;
}

const CARD_IMG_FRAME =
  "relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-slate-950/40 flex items-center justify-center";

const CATALOG_IMG_FRAME =
  "relative h-[240px] w-full shrink-0 overflow-hidden rounded-t-2xl bg-slate-950/40";

/** Thumbnail frame + img classes (marketing + /build inventory cards). */
export const PRODUCT_CARD_HERO_FRAME_CLASS = CARD_IMG_FRAME;

const CARD_IMG_CLASS =
  "h-full w-full cursor-zoom-in object-contain motion-reduce:transition-none transition-transform duration-300 ease-out group-hover/cardimg:scale-[1.02] motion-reduce:group-hover/cardimg:scale-100";

const CATALOG_IMG_CLASS =
  "h-full w-full cursor-zoom-in object-cover motion-reduce:transition-none transition-transform duration-300 ease-out group-hover/cardimg:scale-[1.02] motion-reduce:group-hover/cardimg:scale-100";

export const PRODUCT_CARD_HERO_IMG_CLASS = CARD_IMG_CLASS;

/** Shared fullscreen image preview (marketing + build inventory cards). Portal keeps it outside Tailwind parent `group` and stops thumbnail hover-zoom bleeding. */
export function ProductImageLightboxModal({
  activeImage,
  onClose,
  alt,
  caption,
}: {
  activeImage: string | null;
  onClose: () => void;
  alt: string;
  caption: string;
}) {
  const [mounted, setMounted] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!activeImage) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // Omit onClose from deps — inline handlers from parents would thrash overflow lock otherwise.
  }, [activeImage]);

  if (!mounted || !activeImage) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={caption}
      className="fixed inset-0 z-50 bg-black/85"
      onClick={() => onCloseRef.current()}
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute right-5 top-5 z-[1] rounded-full bg-white/12 px-3 py-2 text-lg font-semibold leading-none text-white backdrop-blur-sm hover:bg-white/20"
        onClick={(e) => {
          e.stopPropagation();
          onCloseRef.current();
        }}
      >
        ×
      </button>
      <div
        className="flex min-h-full w-full items-center justify-center p-6 pt-16 sm:p-10 sm:pt-20"
        onClick={() => onCloseRef.current()}
      >
        <figure
          className="max-w-[92vw] rounded-xl bg-black/40 px-4 py-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-sm sm:px-6 sm:py-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeImage}
            alt={alt}
            className="pointer-events-none max-h-[88vh] max-w-[92vw] select-none object-contain"
            draggable={false}
          />
          <figcaption className="mt-3 max-w-[92vw] text-sm font-semibold leading-snug text-zinc-200">
            {caption}
          </figcaption>
        </figure>
      </div>
    </div>,
    document.body,
  );
}

type CardHeroImageProps = {
  imageSrc: string;
  imageAlt: string;
  title: string;
  objectPosition?: string;
  /** Public catalog listing: fixed height + cover crop */
  layout?: "standard" | "catalog";
  /** Shelf: category + price chips on the image */
  shelfOverlays?: {
    category: string;
    priceFrom: number;
    isCrb: boolean;
  };
};

function ProductCardHeroImage({
  imageSrc,
  imageAlt,
  title,
  objectPosition,
  layout = "standard",
  shelfOverlays,
}: CardHeroImageProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);
  const canShow = hasRenderableImageSrc(imageSrc) && !broken;

  const imgFrame =
    layout === "catalog"
      ? CATALOG_IMG_FRAME
      : CARD_IMG_FRAME;
  const imgClass = layout === "catalog" ? CATALOG_IMG_CLASS : CARD_IMG_CLASS;

  return (
    <>
      <div className={cn("group/cardimg", imgFrame)}>
        {canShow ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={imageAlt}
              className={imgClass}
              style={
                objectPosition
                  ? { objectPosition }
                  : undefined
              }
              onClick={() => setActiveImage(imageSrc)}
              onError={() => setBroken(true)}
            />

            {/* subtle vignette — does not crop image */}
            <div
              className={cn(
                "pointer-events-none absolute inset-0 rounded-t-2xl bg-gradient-to-t via-transparent to-transparent",
                layout === "catalog"
                  ? "from-black/35"
                  : "from-black/55",
              )}
              aria-hidden
            />

            {shelfOverlays ? (
              <>
                <span
                  className="pointer-events-none absolute left-3 top-3 z-[2] inline-flex px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-md"
                  style={{
                    background: shelfOverlays.isCrb
                      ? "linear-gradient(90deg, var(--brand-accent), var(--brand-primary))"
                      : "linear-gradient(90deg, var(--brand-accent), #fb7185)",
                    color: shelfOverlays.isCrb
                      ? "var(--brand-on-primary)"
                      : "var(--brand-on-accent)",
                    borderRadius: "var(--brand-radius-md)",
                  }}
                >
                  {shelfOverlays.category}
                </span>
                <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-[2] flex items-end justify-between gap-2">
                  <p
                    className={cn(
                      "text-2xl font-black tabular-nums drop-shadow-md",
                      shelfOverlays.isCrb ? "text-white" : "text-amber-100",
                    )}
                  >
                    <span className="text-sm font-bold opacity-90">
                      from{" "}
                    </span>
                    ${shelfOverlays.priceFrom}
                  </p>
                </div>
              </>
            ) : null}
          </>
        ) : (
          <div
            className={cn(
              "flex h-full w-full flex-col items-center justify-center px-4 text-center font-medium text-zinc-500",
              layout === "catalog"
                ? "py-8 text-[11px] uppercase tracking-[0.12em]"
                : "py-12 text-sm",
            )}
          >
            Photo coming soon
          </div>
        )}
      </div>

      <ProductImageLightboxModal
        activeImage={activeImage}
        onClose={() => setActiveImage(null)}
        alt={imageAlt}
        caption={title}
      />
    </>
  );
}

/** Shelf layout: fixed 4:3 hero + overlays */
export function ProductShelfImagePanel({
  imageSrc,
  imageAlt,
  imagePosition,
  title,
  isCrb,
  category,
  priceFrom,
}: {
  imageSrc: string;
  imageAlt: string;
  imagePosition?: string;
  title: string;
  isCrb: boolean;
  category: string;
  priceFrom: number;
}) {
  return (
    <ProductCardHeroImage
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      title={title}
      objectPosition={imagePosition}
      shelfOverlays={{ category, priceFrom, isCrb }}
    />
  );
}

/** Showcase: same 4:3 tile; no shelf overlays */
export function ProductShowcaseImagePanel({
  imageSrc,
  imageAlt,
  imagePosition,
  title,
  layout,
}: {
  imageSrc: string;
  imageAlt: string;
  imagePosition?: string;
  title: string;
  isCrb: boolean;
  layout?: "standard" | "catalog";
}) {
  return (
    <ProductCardHeroImage
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      title={title}
      objectPosition={imagePosition}
      layout={layout}
    />
  );
}
