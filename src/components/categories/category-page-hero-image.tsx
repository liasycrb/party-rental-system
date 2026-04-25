"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export function CategoryPageHeroImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [ok, setOk] = useState(true);

  if (!ok) {
    return (
      <div
        className={cn(
          "flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-stone-200 bg-stone-100 text-sm font-medium text-stone-500",
          className,
        )}
      >
        Image coming soon
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-stone-100", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain"
        sizes="(max-width:1024px) 100vw, 720px"
        onError={() => setOk(false)}
        priority
      />
    </div>
  );
}
