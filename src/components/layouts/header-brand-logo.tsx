"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export function HeaderBrandLogo({
  href,
  brandSlug,
  displayName,
  isCrb,
}: {
  href: string;
  brandSlug: string;
  displayName: string;
  isCrb: boolean;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Link
      href={href}
      className="group flex min-w-0 shrink-0 items-center"
      aria-label={displayName}
    >
      {!imgFailed ? (
        <span
          className={cn(
            "inline-flex items-center justify-center overflow-visible rounded-xl px-2 py-1 ring-1",
            isCrb
              ? "bg-white/10 ring-white/15 backdrop-blur-sm"
              : "bg-black/5 ring-black/8",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/brands/${brandSlug}/logo.png`}
            alt={displayName}
            className={cn(
              "h-10 w-auto object-contain sm:h-12",
              "drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]",
              "contrast-[1.05] brightness-[1.02]",
            )}
            onError={() => setImgFailed(true)}
          />
        </span>
      ) : (
        <span
          className={cn(
            "truncate text-sm font-bold tracking-tight sm:text-base sm:group-hover:underline sm:group-hover:decoration-2",
            isCrb
              ? "bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent decoration-cyan-200"
              : "decoration-[var(--brand-secondary)]",
          )}
          style={!isCrb ? { color: "var(--brand-primary)" } : undefined}
        >
          {displayName}
        </span>
      )}
    </Link>
  );
}
