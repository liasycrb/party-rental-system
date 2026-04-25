import { cn } from "@/lib/utils/cn";

type CategoryHeroCtaPillProps = {
  title: string;
  /** e.g. max width override for very narrow carousels */
  className?: string;
};

/**
 * Premium floating CTA over hero category art (parent `<Link className="group">` required).
 * Neutral: no in-pill gradients; `bg-white/95` for read-anywhere contrast; full `bg-white` on hover.
 * Shared: mobile + desktop carousels.
 */
export function CategoryHeroCtaPill({ title, className }: CategoryHeroCtaPillProps) {
  return (
    <span
      className={cn(
        "absolute bottom-6 left-1/2 z-10 flex w-max -translate-x-1/2 justify-center",
        "max-w-[min(calc(100%-1.5rem),20rem)]",
        className,
      )}
      aria-hidden
    >
      <span
        className={cn(
          "relative inline-flex max-w-full",
          "before:pointer-events-none before:absolute before:inset-0 before:-z-10",
          "before:scale-[1.12] before:rounded-full",
          "before:bg-white/20",
          "before:opacity-50",
          "before:blur-md",
          "before:content-['']",
        )}
      >
        <span
          className={cn(
            "relative z-0 flex min-w-0 max-w-full items-center gap-2 rounded-full",
            "border border-white/70",
            "bg-white/95",
            "px-5 py-2.5",
            "text-sm font-semibold text-black",
            "shadow-[0_10px_25px_rgba(0,0,0,0.18)]",
            "backdrop-blur-md",
            "transition-all duration-200",
            "group-hover:scale-105",
            "group-hover:bg-white",
            "group-hover:shadow-[0_14px_30px_rgba(0,0,0,0.25)]",
            "group-active:scale-95",
            "motion-reduce:transition-none motion-reduce:group-hover:scale-100",
          )}
        >
          <span className="shrink-0 text-[15px] leading-none" aria-hidden>
            ⭐
          </span>
          <span className="min-w-0 flex-1 truncate text-center">{title}</span>
          <span
            className="shrink-0 font-normal leading-none text-black/80 opacity-70"
            aria-hidden
          >
            →
          </span>
        </span>
      </span>
    </span>
  );
}
