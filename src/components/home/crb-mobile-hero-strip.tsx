import type { Brand } from "@/lib/brand/config";
import { cn } from "@/lib/utils/cn";
import { HeroMobileStickerCarousel } from "@/components/home/hero-mobile-sticker-carousel";

const VALUE_BADGES: {
  id: string;
  label: string;
  type: "calendar" | "pin";
}[] = [
  { id: "slots", label: "Weekend slots tight", type: "calendar" },
  { id: "ie", label: "I.E. delivery routes", type: "pin" },
];

function SmallIcon({ type }: { type: "calendar" | "pin" }) {
  if (type === "calendar")
    return (
      <svg
        className="h-4 w-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    );
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

/** CRB-only `md:hidden` mobile hero: badges, copy, social proof, sticker carousel, urgency. CTA is in `MarketingHero` (match Lias). */
export function CrbMobileHeroStrip({ brand }: { brand: Brand }) {
  const title = brand.copy.heroTitle.trim();
  const dot = title.indexOf(". ");
  const line1 = dot === -1 ? title : title.slice(0, dot + 1).trim();
  const line2 = dot === -1 ? "" : title.slice(dot + 2).trim();

  return (
    <div className="md:hidden w-full min-w-0">
      <div
        className="grid w-full min-w-0 grid-cols-2 gap-2 px-4"
        role="list"
        aria-label="Key benefits"
      >
        {VALUE_BADGES.map((b) => (
          <span
            key={b.id}
            role="listitem"
            className="inline-flex h-10 min-w-0 items-center gap-1.5 overflow-hidden rounded-full border border-cyan-400/35 bg-slate-950/60 pl-2.5 pr-2 text-[11px] font-bold text-cyan-50 shadow-[0_6px_20px_rgba(2,6,23,0.45)] backdrop-blur-md"
          >
            <span className="shrink-0 text-cyan-300">
              <SmallIcon type={b.type} />
            </span>
            <span className="min-w-0 flex-1 truncate text-left leading-tight">
              {b.label}
            </span>
          </span>
        ))}
      </div>

      <div className="mx-auto mt-5 max-w-[390px] text-center">
        <h1
          className={cn(
            "text-[44px] font-black leading-[0.9] tracking-[-0.02em] text-white",
            "drop-shadow-[0_2px_12px_rgba(2,6,23,0.75)]",
          )}
        >
          <span className="block">{line1}</span>
          {line2 ? (
            <span className="mt-0.5 block text-cyan-200">{line2}</span>
          ) : null}
        </h1>
        <p className="mx-auto mt-2 max-w-[320px] text-[18px] font-medium leading-[1.3] text-cyan-100/90">
          {brand.copy.heroSubtitle}
        </p>
        <p className="mx-auto mt-3 mb-3 max-w-[280px] text-center text-sm font-medium text-cyan-50/90">
          ⭐ Rated 4.9 by 100+ local families
        </p>
      </div>

      <HeroMobileStickerCarousel variant="crb" />
      <p className="mt-2 mb-2 text-center text-[12px] font-semibold text-orange-200/90">
        🔥 Only a few spots left this weekend
      </p>
    </div>
  );
}
