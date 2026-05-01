import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BRANDS } from "@/lib/brand/config";
import {
  resolveBrandSlugFromPageSearchParam,
} from "@/lib/brand/resolve-brand";
import { withBrand } from "@/lib/brand/with-brand-href";
import { getDemoProductBySlug } from "@/lib/catalog/demo-products";
import { getProducts } from "@/lib/catalog/get-products";
import {
  catalogProductToProductCard,
} from "@/lib/catalog/map-catalog-product";
import { formatDeliverySummary } from "@/lib/catalog/product-display-helpers";
import { CatalogImage } from "@/components/media/catalog-image";
import { Container } from "@/components/marketing/container";
import { cn } from "@/lib/utils/cn";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ brand?: string | string[] }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const brandSlug = resolveBrandSlugFromPageSearchParam(sp.brand);
  const brand = BRANDS[brandSlug];
  const catalog = await getProducts(brandSlug);
  const row = catalog.find((p) => p.slug === slug);
  const demo = getDemoProductBySlug(slug);
  const title = row?.name ?? demo?.title ?? "Product";
  const blurb =
    ((row?.short_description ?? "").trim() ||
      (row?.full_description ?? "").trim().slice(0, 200) ||
      demo?.blurb) ??
    "";
  return {
    title,
    description: `${blurb} ${brand.displayName} — Serving Moreno Valley, Perris, and Riverside.`,
  };
}

export default async function ProductDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const brandSlug = resolveBrandSlugFromPageSearchParam(sp.brand);
  const brand = BRANDS[brandSlug];
  const isCrb = brandSlug === "crb";

  const catalog = await getProducts(brandSlug);
  const row = catalog.find((p) => p.slug === slug);
  const product = row ? catalogProductToProductCard(row) : getDemoProductBySlug(slug);
  if (!product) notFound();

  const deliveryNote = row
    ? formatDeliverySummary({
        delivery_included: row.delivery_included,
        delivery_fee: row.delivery_fee,
      })
    : null;
  const qtyNote =
    row && typeof row.quantity_available === "number"
      ? `${row.quantity_available} available.`
      : null;

  const surfacesText = product.surfaceRequirements?.trim() || null;
  const specBoxes = [
    product.sizeLabel?.trim()
      ? { label: "Dimensions", value: product.sizeLabel.trim() }
      : null,
    product.setupSpace?.trim()
      ? { label: "Setup space", value: product.setupSpace.trim() }
      : null,
    product.useType ? { label: "Use", value: product.useType } : null,
    surfacesText ? { label: "Surfaces", value: surfacesText } : null,
    deliveryNote ? { label: "Delivery", value: deliveryNote } : null,
  ].filter((b): b is { label: string; value: string } => b != null);

  const detailBlocks = [
    product.accessRequirements?.trim()
      ? { title: "Access & gate width", body: product.accessRequirements }
      : null,
  ].filter((b): b is { title: string; body: string } => b != null);

  return (
    <div className={cn("pb-16 sm:pb-24", isCrb && "text-slate-100")}>
      <div
        className={cn(
          "relative border-b",
          isCrb ? "border-cyan-400/28 bg-slate-950/82" : "border-orange-400/18 bg-white/65",
        )}
      >
        <Container className="relative py-4">
          <nav
            className={cn(
              "text-sm font-semibold",
              isCrb ? "text-cyan-200/85" : "text-orange-900/80",
            )}
          >
            <Link
              href={withBrand("/products", brandSlug)}
              className={cn(
                "hover:underline",
                isCrb ? "hover:text-white" : "hover:text-pink-700",
              )}
            >
              Catalog
            </Link>
            <span className="mx-2 opacity-50">/</span>
            <span
              className={cn(
                "font-bold",
                isCrb ? "text-white" : "text-stone-900",
              )}
            >
              {product.title}
            </span>
          </nav>
        </Container>
      </div>

      <section
        className={cn(
          "relative overflow-hidden",
          isCrb
            ? "bg-gradient-to-b from-slate-950 via-slate-900/98 to-slate-950"
            : "bg-gradient-to-b from-amber-50 via-white to-pink-50/85",
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage: isCrb
              ? "radial-gradient(circle at 20% 20%, rgba(34,211,238,0.22), transparent 45%), radial-gradient(circle at 85% 10%, rgba(251,146,60,0.2), transparent 40%)"
              : "radial-gradient(circle at 15% 15%, rgba(251,113,133,0.28), transparent 45%), radial-gradient(circle at 90% 20%, rgba(253,224,71,0.2), transparent 45%)",
          }}
          aria-hidden
        />
        <Container className="relative grid gap-12 py-12 lg:grid-cols-2 lg:items-start lg:gap-16 lg:py-16">
          <div className="relative">
            <div
              className={cn(
                "pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] blur-3xl",
                isCrb
                  ? "bg-gradient-to-tr from-cyan-500/38 to-orange-500/35"
                  : "bg-gradient-to-tr from-pink-400/50 to-amber-300/50",
              )}
              aria-hidden
            />
            <div
              className={cn(
                "relative overflow-hidden shadow-2xl ring-4",
                isCrb
                  ? "rotate-1 ring-cyan-400/45"
                  : "-rotate-1 ring-white/85",
              )}
              style={{ borderRadius: "var(--brand-radius-lg)" }}
            >
              <div className="relative aspect-[4/3]">
                <CatalogImage
                  src={product.imageSrc}
                  alt={product.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t to-transparent",
                  isCrb ? "from-slate-950/85" : "from-stone-900/65",
                )}
              />
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white ring-1 ring-white/30 backdrop-blur"
                  style={{
                    background: isCrb
                      ? "linear-gradient(90deg, rgba(34,211,238,0.5), rgba(251,146,60,0.5))"
                      : "linear-gradient(90deg, rgba(236,72,153,0.55), rgba(251,191,36,0.55))",
                  }}
                >
                  {product.category}
                </span>
                <p className="text-2xl font-black text-white drop-shadow-lg">
                  {product.priceFrom != null && product.priceFrom > 0 ? (
                    <>
                      <span className="text-sm font-bold opacity-90">from </span>$
                      {Math.round(product.priceFrom)}{" "}
                      <span className="text-sm font-bold opacity-90">/ event</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold">Pricing on request</span>
                  )}
                </p>
              </div>
            </div>
            <p
              className={cn(
                "mt-4 text-center text-xs font-semibold",
                isCrb ? "text-slate-400" : "text-stone-600",
              )}
            >
              Footprint &amp; specs reflect what you&apos;ll get at delivery.
            </p>
          </div>

          <div>
            <p
              className={cn(
                "text-[11px] font-black uppercase tracking-[0.2em]",
                isCrb ? "text-cyan-200/90" : "text-pink-600",
              )}
            >
              {product.category} · {brand.displayName}
            </p>
            <h1
              className={cn(
                "mt-3 text-4xl font-black tracking-tight sm:text-5xl",
                isCrb ? "text-white" : "text-stone-900",
              )}
            >
              {product.title}
            </h1>
            <p
              className={cn(
                "mt-5 text-base font-medium leading-relaxed sm:text-lg",
                isCrb ? "text-slate-300" : "text-stone-700",
              )}
            >
              {product.blurb}
            </p>

            {specBoxes.length > 0 ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {specBoxes.map((box) => (
                  <div
                    key={box.label}
                    className={cn(
                      "border p-5 shadow-lg",
                      isCrb
                        ? "border-cyan-400/28 bg-slate-950/65 backdrop-blur"
                        : "border-orange-400/20 bg-white/88 backdrop-blur",
                    )}
                    style={{ borderRadius: "var(--brand-radius-lg)" }}
                  >
                    <p
                      className={cn(
                        "text-[11px] font-black uppercase tracking-widest",
                        isCrb ? "text-cyan-200/85" : "text-pink-600",
                      )}
                    >
                      {box.label}
                    </p>
                    <p
                      className={cn(
                        "mt-2 text-lg font-bold leading-snug",
                        isCrb ? "text-white" : "text-stone-900",
                      )}
                    >
                      {box.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-10 space-y-8">
              {detailBlocks.map((block) => (
                <div key={block.title}>
                  <h2
                    className={cn(
                      "text-sm font-black uppercase tracking-wide",
                      isCrb ? "text-orange-200" : "text-orange-900",
                    )}
                  >
                    {block.title}
                  </h2>
                  <p
                    className={cn(
                      "mt-2 text-sm font-medium leading-relaxed",
                      isCrb ? "text-slate-300" : "text-stone-700",
                    )}
                  >
                    {block.body}
                  </p>
                </div>
              ))}
              {product.setupNotes.length > 0 ? (
                <div>
                  <h2
                    className={cn(
                      "text-sm font-black uppercase tracking-wide",
                      isCrb ? "text-orange-200" : "text-orange-900",
                    )}
                  >
                    Rules
                  </h2>
                  <ul
                    className={cn(
                      "mt-3 space-y-2 text-sm font-medium leading-relaxed",
                      isCrb ? "text-slate-300" : "text-stone-700",
                    )}
                  >
                    {product.setupNotes.map((note, idx) => (
                      <li key={`${idx}-${note.slice(0, 24)}`} className="flex gap-2">
                        <span className="text-orange-400" aria-hidden>
                          ✦
                        </span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div
              className={cn(
                "mt-12 flex flex-col gap-5 border-t pt-10 sm:flex-row sm:items-center sm:justify-between",
                isCrb ? "border-cyan-400/22" : "border-orange-200/80",
              )}
            >
              <div>
                <p
                  className={cn(
                    "text-sm font-bold",
                    isCrb ? "text-slate-400" : "text-stone-600",
                  )}
                >
                  Starting at
                </p>
                <p
                  className={cn(
                    "text-4xl font-black",
                    isCrb ? "text-white" : "text-stone-900",
                  )}
                >
                  {product.priceFrom != null && product.priceFrom > 0 ? (
                    <>
                      <span className="text-lg font-bold text-white/90">from </span>$
                      {Math.round(product.priceFrom)}
                      <span
                        className={cn(
                          "text-lg font-bold",
                          isCrb ? "text-slate-400" : "text-stone-500",
                        )}
                      >
                        {" "}
                        / event
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold">Pricing on request</span>
                  )}
                </p>
                <p
                  className={cn(
                    "text-xs font-semibold",
                    isCrb ? "text-slate-500" : "text-stone-500",
                  )}
                >
                  Moreno Valley, Perris &amp; Riverside · taxes may apply
                </p>
                {qtyNote ? (
                  <p
                    className={cn(
                      "mt-1 text-xs font-medium",
                      isCrb ? "text-slate-400" : "text-stone-600",
                    )}
                  >
                    {qtyNote}
                  </p>
                ) : null}
              </div>
              <Link
                href={withBrand(`/build?product=${product.slug}`, brandSlug)}
                className="inline-flex items-center justify-center px-8 py-4 text-center text-base font-black text-white shadow-2xl transition-[transform,box-shadow] hover:shadow-[0_0_40px_rgba(34,211,238,0.35)] active:scale-[0.98]"
                style={{
                  background: isCrb
                    ? "linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))"
                    : "linear-gradient(90deg, var(--brand-secondary), var(--brand-accent))",
                  borderRadius: "var(--brand-radius-md)",
                }}
              >
                Check availability for this rental
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
