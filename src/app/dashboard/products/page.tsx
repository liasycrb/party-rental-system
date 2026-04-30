import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRentalCategories } from "@/lib/catalog/get-rental-categories";

export const metadata: Metadata = { title: "Products — Dashboard" };

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  category_slug: string | null;
  price: number | null;
  is_active: boolean;
  image_src: string | null;
};

async function addProduct(formData: FormData) {
  "use server";
  const name = ((formData.get("name") as string) ?? "").trim();
  if (!name) throw new Error("Name is required");

  let slug = ((formData.get("slug") as string) ?? "").trim();
  if (!slug) {
    slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  const brandField = ((formData.get("brand_visibility") as string) ?? "").trim();
  const brandSlugs =
    brandField === "lias" ? ["lias"] :
    brandField === "crb"  ? ["crb"]  :
                            ["lias", "crb"];

  const isActive = formData.get("is_active") === "true";

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("insert_rental_product_dashboard", {
    p_name: name,
    p_slug: slug,
    p_category_slug: ((formData.get("category_slug") as string) ?? "").trim() || "regular-jumper-13x13",
    p_brand_slugs: brandSlugs,
    p_price: Number(formData.get("price") ?? 0),
    p_is_active: isActive,
    p_image_src: ((formData.get("image_src") as string) ?? "").trim() || null,
    p_quantity_available: Number(formData.get("quantity_available") ?? 1),
  });

  if (error) throw new Error(`[addProduct] ${error.message}`);
  revalidatePath("/dashboard/products");
}

async function updateProduct(formData: FormData) {
  "use server";
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) throw new Error("Missing product id");

  const name = ((formData.get("name") as string) ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const isActive = formData.get("is_active") === "on";
  const imageSrc = ((formData.get("image_src") as string) ?? "").trim() || null;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("update_rental_product_dashboard", {
    p_id: id,
    p_name: name,
    p_price: price,
    p_is_active: isActive,
    p_image_src: imageSrc,
  });

  if (error) throw new Error(`[updateProduct] ${error.message}`);
  revalidatePath("/dashboard/products");
}

function formatCategory(slug: string | null): string {
  if (!slug) return "—";
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function ProductsDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const searchQuery = sp.search?.toLowerCase().trim() ?? "";
  const categoryFilter = sp.category?.trim() ?? "";

  const supabase = await createSupabaseServerClient();
  const [{ data, error }, canonicalCategories] = await Promise.all([
    supabase.rpc("get_all_rental_products_for_dashboard", { p_brand_slug: "lias" }),
    getRentalCategories(),
  ]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <p className="font-semibold text-red-400">Failed to load products</p>
        <p className="mt-1 text-sm text-red-300/80">{error.message}</p>
      </div>
    );
  }

  const allProducts = (data ?? []) as ProductRow[];

  // Unique categories for the filter dropdown
  const categories = Array.from(
    new Set(allProducts.map((p) => p.category_slug).filter(Boolean)),
  ).sort() as string[];

  // Apply filters
  const products = allProducts.filter((p) => {
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery);
    const matchesCategory = !categoryFilter || p.category_slug === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Products</h1>
          <p className="mt-0.5 text-sm text-zinc-400">
            {products.length} of {allProducts.length} product{allProducts.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filter bar — GET form, no JS needed */}
      <form method="GET" className="mb-5 flex flex-wrap gap-2">
        <input
          name="search"
          type="search"
          defaultValue={sp.search ?? ""}
          placeholder="Search by name…"
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
        />
        <select
          name="category"
          defaultValue={sp.category ?? ""}
          className="rounded-lg border border-white/15 bg-[#0c0c0f] px-3 py-2 text-sm text-zinc-200 outline-none focus:border-violet-400"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {formatCategory(c)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
        >
          Filter
        </button>
        {(searchQuery || categoryFilter) && (
          <a
            href="/dashboard/products"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
          >
            Clear
          </a>
        )}
      </form>

      {/* Add product form */}
      <details className="mb-5 rounded-xl border border-white/10 bg-white/5">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-zinc-200 hover:text-white">
          + Add product
        </summary>
        <form
          action={addProduct}
          className="grid grid-cols-1 gap-3 border-t border-white/10 p-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Name *</label>
            <input
              name="name"
              required
              placeholder="e.g. Princess Combo 13x13"
              className="rounded border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Slug (auto if blank)</label>
            <input
              name="slug"
              placeholder="e.g. princess-combo-13x13"
              className="rounded border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Category</label>
            <select
              name="category_slug"
              className="rounded border border-white/15 bg-[#0c0c0f] px-2 py-1.5 text-sm text-zinc-200 outline-none focus:border-violet-400"
            >
              {canonicalCategories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Price ($)</label>
            <input
              name="price"
              type="number"
              min={0}
              step={1}
              defaultValue={0}
              className="rounded border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Qty available</label>
            <input
              name="quantity_available"
              type="number"
              min={0}
              step={1}
              defaultValue={1}
              className="rounded border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Image path</label>
            <input
              name="image_src"
              placeholder="/products/category/slug/main.jpg"
              className="rounded border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Brand visibility</label>
            <select
              name="brand_visibility"
              defaultValue="both"
              className="rounded border border-white/15 bg-[#0c0c0f] px-2 py-1.5 text-sm text-zinc-200 outline-none focus:border-violet-400"
            >
              <option value="both">Both — Lias &amp; CRB</option>
              <option value="lias">Lias only</option>
              <option value="crb">CRB only</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Status</label>
            <select
              name="is_active"
              defaultValue="false"
              className="rounded border border-white/15 bg-[#0c0c0f] px-2 py-1.5 text-sm text-zinc-200 outline-none focus:border-violet-400"
            >
              <option value="false">Draft — hidden</option>
              <option value="true">Active — visible</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-emerald-500 active:scale-[0.98]"
            >
              Add product
            </button>
          </div>
        </form>
      </details>

      {/* Column headers */}
      <div className="mb-1 grid grid-cols-[48px_2fr_1fr_80px_80px_2fr_72px] gap-3 px-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
        <span />
        <span>Name</span>
        <span>Category</span>
        <span>Price ($)</span>
        <span>Status</span>
        <span>Image path</span>
        <span />
      </div>

      {/* Product rows */}
      <div className="space-y-1.5">
        {products.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-zinc-400">
            No products match your filters.
          </div>
        ) : (
          products.map((p) => (
            <form
              key={p.id}
              action={updateProduct}
              className="grid grid-cols-[48px_2fr_1fr_80px_80px_2fr_72px] items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 transition-colors hover:bg-white/[0.07]"
            >
              <input type="hidden" name="id" value={p.id} />

              {/* Thumbnail */}
              {p.image_src ? (
                <img
                  src={p.image_src}
                  alt={p.name}
                  className="h-10 w-10 rounded-md object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-10 w-10 rounded-md bg-white/10" />
              )}

              {/* Name */}
              <input
                name="name"
                defaultValue={p.name}
                className="w-full rounded border border-white/15 bg-white/5 px-2 py-1 text-sm text-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
              />

              {/* Category (read-only) */}
              <span className="truncate text-xs text-zinc-400">
                {formatCategory(p.category_slug)}
              </span>

              {/* Price */}
              <input
                name="price"
                type="number"
                min={0}
                step={1}
                defaultValue={p.price ?? 0}
                className="w-full rounded border border-white/15 bg-white/5 px-2 py-1 text-sm text-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
              />

              {/* Active badge + checkbox */}
              <label className="flex cursor-pointer flex-col items-start gap-1">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    p.is_active
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-zinc-700/60 text-zinc-400"
                  }`}
                >
                  {p.is_active ? "Active" : "Inactive"}
                </span>
                <input
                  name="is_active"
                  type="checkbox"
                  defaultChecked={p.is_active}
                  className="accent-violet-400"
                />
              </label>

              {/* Image path */}
              <input
                name="image_src"
                defaultValue={p.image_src ?? ""}
                placeholder="/products/…/main.jpg"
                className="w-full rounded border border-white/15 bg-white/5 px-2 py-1 text-xs text-zinc-300 outline-none placeholder:text-zinc-600 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
              />

              {/* Save */}
              <button
                type="submit"
                className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-500 active:scale-[0.97]"
              >
                Save
              </button>
            </form>
          ))
        )}
      </div>
    </div>
  );
}
