import Link from "next/link";
import type { Brand } from "@/lib/brand/config";
import type { DemoProduct } from "@/lib/catalog/demo-products";
import { CatalogImage } from "@/components/media/catalog-image";
import { cn } from "@/lib/utils/cn";

export function ProductCard({
  brand,
  product,
  visual = "shelf",
  className,
}: {
  brand: Brand;
  product: DemoProduct;
  /** `showcase` = editorial, image-first, minimal “card chrome” */
  visual?: "shelf" | "showcase";
  className?: string;
}) {
  const isCrb = brand.slug === "crb";
  const objectPosition = product.imagePosition ?? "center center";

  if (visual === "showcase") {
    return (
      <article
        className={cn(
          "group relative flex min-h-[340px] flex-col overflow-hidden shadow-2xl transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(0,0,0,0.35)] lg:min-h-[400px]",
          className,
        )}
        style={{ borderRadius: "var(--brand-radius-lg)" }}
      >
        <div className="absolute inset-0 z-0">
          <CatalogImage
            src={product.imageSrc}
            alt={product.imageAlt}
            fill
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
            style={{ objectPosition }}
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
          <Link
            href={`/products/${product.slug}`}
            className="absolute inset-0 z-[1]"
            aria-label={`View ${product.title}`}
          >
            <span className="sr-only">{product.title}</span>
          </Link>
        </div>
        <div
          className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/75 via-black/35 to-black/5"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[2] opacity-25 mix-blend-screen"
          style={{
            backgroundImage: isCrb
              ? "radial-gradient(circle at 25% 20%, rgba(34,211,238,0.32), transparent 50%)"
              : "radial-gradient(circle at 22% 24%, rgba(251,113,133,0.35), transparent 50%)",
          }}
          aria-hidden
        />

        <div className="relative z-[3] mt-auto flex flex-1 flex-col justify-end p-6 sm:p-8">
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
              href={`/products/${product.slug}`}
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
              href={`/build?product=${product.slug}`}
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
        "group relative flex h-full flex-col overflow-hidden transition-[transform,box-shadow] duration-300 hover:-translate-y-1",
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
      <Link href={`/products/${product.slug}`} className="relative block">
        <div
          className="relative aspect-[3/4] overflow-hidden sm:aspect-[5/6]"
          style={{
            borderTopLeftRadius: "var(--brand-radius-lg)",
            borderTopRightRadius: "var(--brand-radius-lg)",
          }}
        >
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-0 scale-105",
              isCrb
                ? "bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.3),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(251,146,60,0.22),transparent_45%)]"
                : "bg-[radial-gradient(circle_at_25%_30%,rgba(253,186,116,0.5),transparent_50%),radial-gradient(circle_at_85%_60%,rgba(251,113,133,0.28),transparent_45%)]",
            )}
            aria-hidden
          />
          <CatalogImage
            src={product.imageSrc}
            alt={product.imageAlt}
            fill
            className={cn(
              "relative z-[1] object-cover transition duration-500 ease-out motion-reduce:transition-none",
              "group-hover:scale-[1.03]",
              isCrb && "brightness-[1.05] contrast-[1.05]",
            )}
            style={{ objectPosition }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div
            className="absolute inset-0 z-[2] bg-gradient-to-t from-black/65 via-black/25 to-transparent"
            aria-hidden
          />
          <span
            className="absolute left-3 top-3 z-[3] inline-flex px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-md"
            style={{
              background: isCrb
                ? "linear-gradient(90deg, var(--brand-accent), var(--brand-primary))"
                : "linear-gradient(90deg, var(--brand-accent), #fb7185)",
              color: isCrb ? "var(--brand-on-primary)" : "var(--brand-on-accent)",
              borderRadius: "var(--brand-radius-md)",
            }}
          >
            {product.category}
          </span>
          <div className="absolute bottom-3 left-3 right-3 z-[3] flex items-end justify-between gap-2">
            <p
              className={cn(
                "text-2xl font-black tabular-nums drop-shadow-md",
                isCrb ? "text-white" : "text-amber-100",
              )}
            >
              <span className="text-sm font-bold opacity-90">from </span>$
              {product.priceFrom}
            </p>
          </div>
        </div>
      </Link>

      <div className="relative flex flex-1 flex-col p-4 sm:p-5">
        <h3
          className={cn(
            "text-lg font-bold leading-snug",
            isCrb ? "text-white" : "text-stone-900",
          )}
        >
          <Link
            href={`/products/${product.slug}`}
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
            href={`/build?product=${product.slug}`}
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
