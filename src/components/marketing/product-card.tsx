import Link from "next/link";
import type { Brand } from "@/lib/brand/config";
import { withBrand } from "@/lib/brand/with-brand-href";
import type { DemoProduct } from "@/lib/catalog/demo-products";
import {
  ProductShelfImagePanel,
  ProductShowcaseImagePanel,
} from "@/components/marketing/product-image-preview";
import { cn } from "@/lib/utils/cn";

export function ProductCard({
  brand,
  product,
  visual = "shelf",
  className,
}: {
  brand: Brand;
  product: DemoProduct;
  /** `catalog` — public listing: uniform grid-friendly cards */
  visual?: "shelf" | "showcase" | "catalog";
  className?: string;
}) {
  const isCrb = brand.slug === "crb";
  const b = brand.slug;
  const objectPosition = product.imagePosition ?? "center center";

  if (visual === "catalog") {
    return (
      <article
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
          className,
        )}
      >
        <ProductShowcaseImagePanel
          layout="catalog"
          imageSrc={product.imageSrc}
          imageAlt={product.imageAlt}
          imagePosition={objectPosition}
          title={product.title}
          isCrb={isCrb}
        />

        <div className="relative flex flex-1 flex-col p-5">
          <span
            className={cn(
              "w-fit max-w-full rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
              isCrb
                ? "bg-white/10 text-slate-200 ring-white/15"
                : "bg-white/10 text-amber-100/95 ring-orange-400/25",
            )}
          >
            {product.category}
          </span>
          <h3 className="mt-3 text-xl font-black leading-snug tracking-tight text-white sm:text-2xl">
            <Link
              href={withBrand(`/products/${product.slug}`, b)}
              className={cn(
                "hover:underline hover:decoration-2",
                isCrb
                  ? "hover:decoration-cyan-300"
                  : "hover:decoration-amber-300",
              )}
            >
              {product.title}
            </Link>
          </h3>
          <p className="mt-2 line-clamp-2 min-h-[2.75rem] flex-1 text-sm font-medium leading-snug text-white/70">
            {product.blurb}
          </p>
          <div className="mt-auto shrink-0 pt-4">
          <p className="text-lg font-extrabold tabular-nums text-white">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/55">
              from{" "}
            </span>
            ${product.priceFrom}
          </p>
          <Link
            href={withBrand(`/build?product=${product.slug}`, b)}
            className="mt-4 flex w-full items-center justify-center px-4 py-3 text-center text-sm font-black tracking-tight text-slate-950 shadow-lg transition-[filter,transform] hover:brightness-110 active:scale-[0.98]"
            style={{
              background: isCrb
                ? "linear-gradient(90deg, var(--brand-primary), #a5f3fc)"
                : "linear-gradient(90deg, var(--brand-accent), var(--brand-secondary))",
              borderRadius: "var(--brand-radius-md)",
              color: isCrb ? "var(--brand-on-primary)" : "#1c1917",
            }}
          >
            Check availability
          </Link>
          </div>
        </div>
      </article>
    );
  }

  if (visual === "showcase") {
    return (
      <article
        className={cn(
          "relative flex flex-col overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
          className,
        )}
      >
        <ProductShowcaseImagePanel
          imageSrc={product.imageSrc}
          imageAlt={product.imageAlt}
          imagePosition={objectPosition}
          title={product.title}
          layout="standard"
          isCrb={isCrb}
        />

        <div className="relative flex flex-1 flex-col bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8">
          <span
            className="w-fit px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg"
            style={{
              background: isCrb
                ? "linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))"
                : "linear-gradient(90deg, var(--brand-secondary), var(--brand-accent))",
              borderRadius: "var(--brand-radius-md)",
            }}
          >
            {product.category}
          </span>
          <h3 className="mt-4 font-black leading-[1.05] text-white drop-shadow-md sm:text-3xl sm:leading-tight">
            <Link
              href={withBrand(`/products/${product.slug}`, b)}
              className={cn(
                "hover:underline hover:decoration-2",
                isCrb
                  ? "hover:decoration-cyan-300"
                  : "hover:decoration-amber-300",
              )}
            >
              {product.title}
            </Link>
          </h3>
          <p className="mt-2 max-w-prose text-sm font-semibold leading-relaxed text-white/85">
            {product.blurb}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-white/90">
            <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/25 backdrop-blur">
              {product.sizeLabel}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/25 backdrop-blur">
              {product.setupSpace}
            </span>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-3xl font-black tabular-nums text-white drop-shadow">
              <span className="text-sm font-bold text-white/80">from </span>$
              {product.priceFrom}
            </p>
            <Link
              href={withBrand(`/build?product=${product.slug}`, b)}
              className="relative inline-flex items-center justify-center px-6 py-3 text-center text-sm font-black text-slate-950 shadow-xl transition hover:brightness-110 active:scale-[0.98]"
              style={{
                background: isCrb
                  ? "linear-gradient(90deg, var(--brand-primary), #a5f3fc)"
                  : "linear-gradient(90deg, var(--brand-accent), var(--brand-secondary))",
                borderRadius: "var(--brand-radius-md)",
                color: isCrb ? "var(--brand-on-primary)" : "#1c1917",
              }}
            >
              I want this for my party →
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        isCrb
          ? "shadow-[0_20px_50px_rgba(2,6,23,0.65)]"
          : "shadow-[0_18px_40px_rgba(120,53,15,0.12)]",
        className,
      )}
      style={{
        borderRadius: "var(--brand-radius-lg)",
        background: isCrb
          ? "linear-gradient(145deg, var(--brand-panel) 0%, var(--brand-surface) 100%)"
          : "linear-gradient(180deg, var(--brand-surface-elevated) 0%, var(--brand-surface) 100%)",
        border: `1px solid var(--brand-border)`,
        boxShadow: isCrb
          ? "0 0 0 1px rgba(8, 47, 73, 0.5), 0 24px 60px rgba(2, 6, 23, 0.65)"
          : undefined,
      }}
    >
      <ProductShelfImagePanel
        imageSrc={product.imageSrc}
        imageAlt={product.imageAlt}
        imagePosition={objectPosition}
        title={product.title}
        isCrb={isCrb}
        category={product.category}
        priceFrom={product.priceFrom}
      />

      <div className="relative flex flex-1 flex-col p-4 sm:p-5">
        <h3
          className={cn(
            "text-lg font-bold leading-snug",
            isCrb ? "text-white" : "text-stone-900",
          )}
        >
          <Link
            href={withBrand(`/products/${product.slug}`, b)}
            className={cn(
              "hover:underline hover:decoration-2",
              isCrb
                ? "hover:decoration-cyan-300"
                : "hover:decoration-pink-500",
            )}
          >
            {product.title}
          </Link>
        </h3>

        <dl
          className={cn(
            "mt-4 space-y-2 rounded-xl px-3 py-3 text-sm",
            isCrb
              ? "bg-cyan-400/10 text-cyan-100/90 ring-1 ring-cyan-400/28"
              : "bg-white/80 text-stone-700 ring-1 ring-orange-400/20",
          )}
          style={{ borderRadius: "var(--brand-radius-md)" }}
        >
          <div className="flex gap-3">
            <dt
              className={cn(
                "shrink-0 font-bold",
                isCrb ? "text-cyan-200" : "text-pink-600",
              )}
            >
              Size
            </dt>
            <dd
              className={cn(
                "font-semibold",
                isCrb ? "text-white" : "text-stone-900",
              )}
            >
              {product.sizeLabel}
            </dd>
          </div>
          <div className="flex gap-3">
            <dt
              className={cn(
                "shrink-0 font-bold",
                isCrb ? "text-cyan-200" : "text-pink-600",
              )}
            >
              Yard space
            </dt>
            <dd
              className={cn(
                "font-medium leading-snug",
                isCrb ? "text-slate-200" : "text-stone-800",
              )}
            >
              {product.setupSpace}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-1 flex-col justify-end gap-3 pt-2 sm:flex-row sm:items-end sm:justify-between">
          <Link
            href={withBrand(`/build?product=${product.slug}`, b)}
            className="inline-flex items-center justify-center px-4 py-2.5 text-center text-sm font-bold transition-[transform,filter] active:scale-[0.98]"
            style={{
              background: isCrb
                ? "linear-gradient(90deg, var(--brand-secondary), #f472b6)"
                : "linear-gradient(90deg, var(--brand-secondary), var(--brand-accent))",
              color: "#fff",
              borderRadius: "var(--brand-radius-md)",
              boxShadow: isCrb
                ? "0 10px 24px rgba(251, 146, 60, 0.35)"
                : "0 10px 24px rgba(225, 29, 72, 0.28)",
            }}
          >
            I want this →
          </Link>
        </div>
      </div>
    </article>
  );
}
