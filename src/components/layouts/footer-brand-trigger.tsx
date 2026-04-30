"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function FooterBrandTrigger({
  brandSlug,
  displayName,
}: {
  brandSlug: string;
  displayName: string;
}) {
  const router = useRouter();
  const countRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  function handleClick() {
    countRef.current += 1;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countRef.current >= 5) {
      countRef.current = 0;
      router.push("/dashboard");
      return;
    }
    timerRef.current = setTimeout(() => {
      countRef.current = 0;
    }, 2500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="cursor-default select-none text-left"
      aria-label={displayName}
    >
      {!imgFailed ? (
        <span className="mb-2 inline-flex items-center justify-center rounded-xl bg-white/[0.08] px-3 py-2 ring-1 ring-white/15">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/brands/${brandSlug}/logo.png`}
            alt={displayName}
            height={48}
            className="h-12 w-auto opacity-95 drop-shadow-sm"
            onError={() => setImgFailed(true)}
          />
        </span>
      ) : (
        <p className="text-lg font-bold tracking-tight">{displayName}</p>
      )}
    </button>
  );
}
