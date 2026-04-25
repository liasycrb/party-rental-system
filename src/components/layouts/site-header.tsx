import Link from "next/link";
import type { Brand } from "@/lib/brand/config";
import { withBrand } from "@/lib/brand/with-brand-href";
import { cn } from "@/lib/utils/cn";

export function SiteHeader({ brand }: { brand: Brand }) {
  const isCrb = brand.slug === "crb";

  const navLinkClass = cn(
    "text-sm font-semibold transition-colors",
    isCrb
      ? "text-cyan-100/90 hover:text-white"
      : "text-orange-950/90 hover:text-[var(--brand-secondary)]",
  );

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{
        backgroundColor: "var(--brand-header-bg)",
        borderColor: "var(--brand-header-border)",
        boxShadow: isCrb
          ? "0 12px 40px rgba(2, 6, 23, 0.65), 0 0 0 1px rgba(34, 211, 238, 0.08)"
          : "0 10px 36px rgba(234, 88, 12, 0.1)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link
          href={withBrand("/", brand.slug)}
          className={cn(
            "group min-w-0 text-sm font-bold tracking-tight sm:text-base",
              isCrb &&
              "bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent",
          )}
          style={!isCrb ? { color: "var(--brand-primary)" } : undefined}
        >
          <span className="truncate sm:group-hover:underline sm:group-hover:decoration-[var(--brand-secondary)] sm:group-hover:decoration-2">
            {brand.displayName}
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href={`tel:${brand.supportPhone}`}
            className={cn(
              "hidden text-sm font-bold md:inline",
              isCrb ? "text-cyan-100" : "text-orange-950",
            )}
          >
            {brand.supportPhoneDisplay}
          </a>
          <nav
            className="flex items-center gap-2 sm:gap-3"
            aria-label="Primary"
          >
            <Link href={withBrand("/products", brand.slug)} className={cn(navLinkClass, "hidden sm:inline")}>
              Catalog
            </Link>
            <Link
              href={withBrand("/products", brand.slug)}
              className={cn(navLinkClass, "sm:hidden")}
              aria-label="Catalog"
            >
              Shop
            </Link>
            <Link
              href={withBrand("/build", brand.slug)}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold shadow-lg transition-[transform,box-shadow,filter] hover:brightness-110 active:scale-[0.98]"
              style={{
                background: isCrb
                  ? "linear-gradient(90deg, var(--brand-secondary), #f472b6)"
                  : "linear-gradient(90deg, var(--brand-accent), var(--brand-secondary))",
                color: isCrb ? "var(--brand-on-secondary)" : "#1c1917",
                borderRadius: "var(--brand-radius-md)",
                boxShadow: isCrb
                  ? "0 8px 28px rgba(251, 146, 60, 0.4), 0 0 24px rgba(34, 211, 238, 0.12)"
                  : "0 8px 28px rgba(236, 72, 153, 0.28)",
              }}
            >
              Check availability
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
