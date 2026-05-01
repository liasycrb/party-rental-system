import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { getRentalCategories } from "@/lib/catalog/get-rental-categories";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Products — Dashboard" };

/** Columns loaded/edited by the dashboard (explicit list for service-role selects). */
const RENTAL_PRODUCT_DASHBOARD_COLUMNS =
  [
    "id",
    "name",
    "slug",
    "category_slug",
    "brand_slugs",
    "price",
    "price_from",
    "is_active",
    "image_src",
    "quantity_available",
    "dimensions",
    "setup_space",
    "required_space",
    "use_type",
    "allowed_surfaces",
    "short_description",
    "item_rules",
    "delivery_included",
    "delivery_fee_note",
  ].join(",");

const SURFACE_TOGGLE_KEYS = ["Grass", "Concrete", "Indoor", "Outdoor"] as const;
const USE_TYPE_OPTIONS = ["dry", "wet", "both"] as const;

function rowHasSurface(row: unknown, label: string): boolean {
  if (!Array.isArray(row)) return false;
  const l = label.toLowerCase();
  return row.some((s) => String(s).trim().toLowerCase() === l);
}

/** Map DB `use_type` to select value; empty string clears to null when saved. */
function normalizeUseTypeForSelect(raw: string | null | undefined): string {
  const t = (raw ?? "").trim().toLowerCase().replace(/_/g, " ");
  if (t === "dry") return "dry";
  if (t === "wet") return "wet";
  if (t === "both" || t === "dry wet" || t === "dry or wet" || t === "dry and wet") {
    return "both";
  }
  return "";
}

function surfacesFromForm(formData: FormData): string[] | null {
  const out: string[] = [];
  for (const s of SURFACE_TOGGLE_KEYS) {
    const field = `surface_${s.toLowerCase()}`;
    if (formData.get(field) === "on") out.push(s);
  }
  return out.length ? out : null;
}

function trimOrNull(formData: FormData, key: string): string | null {
  const v = ((formData.get(key) as string) ?? "").trim();
  return v === "" ? null : v;
}

/** Row loaded from `rental_products`; extra keys depend on deployed schema — only known fields are used in the form. */
type ProductRow = {
  id: string;
  name: string;
  slug: string;
  category_slug: string | null;
  price: number | null;
  price_from?: number | null;
  is_active: boolean;
  image_src: string | null;
  quantity_available?: number | null;
  dimensions?: string | null;
  setup_space?: string | null;
  required_space?: string | null;
  use_type?: string | null;
  allowed_surfaces?: string[] | null;
  short_description?: string | null;
  /** Public catalog surfaces this column as listing rules/setup notes. */
  item_rules?: string | null;
  delivery_included?: boolean | null;
  delivery_fee_note?: string | null;
};

function listingPriceFallback(p: ProductRow): number {
  const pf =
    typeof p.price_from === "number" && Number.isFinite(p.price_from) ? p.price_from : null;
  const pr =
    typeof p.price === "number" && Number.isFinite(p.price) ? p.price : null;
  return Math.round(pf ?? pr ?? 0);
}

function setupSpaceDisplay(p: ProductRow): string {
  const a = typeof p.setup_space === "string" ? p.setup_space.trim() : "";
  if (a) return a;
  const b = typeof p.required_space === "string" ? p.required_space.trim() : "";
  return b;
}

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
  if (!name) throw new Error("Name is required");

  const priceFromRaw = Number(formData.get("price_from") ?? NaN);
  const priceFrom = Number.isFinite(priceFromRaw) && priceFromRaw >= 0 ? priceFromRaw : 0;

  const isActive = formData.get("is_active") === "on";
  const imageSrc = ((formData.get("image_src") as string) ?? "").trim() || null;

  const qtyRaw = Number(formData.get("quantity_available") ?? NaN);
  const quantityAvailable = Number.isFinite(qtyRaw) && qtyRaw >= 0 ? Math.floor(qtyRaw) : 0;

  const setupSpaceStr = trimOrNull(formData, "setup_space");

  const useTypeRaw = ((formData.get("use_type") as string) ?? "").trim().toLowerCase();
  const useType =
    useTypeRaw === "dry" || useTypeRaw === "wet" || useTypeRaw === "both" ? useTypeRaw : null;

  const admin = createSupabaseServiceRoleClient();
  const { error } = await admin
    .from("rental_products")
    .update({
      name,
      price: priceFrom,
      price_from: priceFrom,
      is_active: isActive,
      image_src: imageSrc,
      quantity_available: quantityAvailable,
      dimensions: trimOrNull(formData, "dimensions"),
      setup_space: setupSpaceStr,
      required_space: setupSpaceStr,
      use_type: useType,
      allowed_surfaces: surfacesFromForm(formData),
      short_description: trimOrNull(formData, "short_description"),
      item_rules: trimOrNull(formData, "item_rules"),
      delivery_included: formData.get("delivery_included") === "on",
      delivery_fee_note: trimOrNull(formData, "delivery_fee_note"),
    })
    .eq("id", id);

  if (error) throw new Error(`[updateProduct] ${error.message}`);
  revalidatePath("/dashboard/products");
}

async function toggleProductActive(formData: FormData) {
  "use server";
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) throw new Error("Missing product id");

  const raw = ((formData.get("next_active") as string | null) ?? "").trim().toLowerCase();
  const nextActive = raw === "true";

  const admin = createSupabaseServiceRoleClient();
  const { error } = await admin.from("rental_products").update({ is_active: nextActive }).eq("id", id);

  if (error) throw new Error(`[toggleProductActive] ${error.message}`);
  revalidatePath("/dashboard/products");
  revalidatePath("/", "layout");
  revalidatePath("/build");
  revalidatePath("/products");
  revalidatePath("/categories", "layout");
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

  console.log(
    "Dashboard products using service role:",
    !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const admin = createSupabaseServiceRoleClient();
  const [{ data, error }, canonicalCategories] = await Promise.all([
    admin
      .from("rental_products")
      .select(RENTAL_PRODUCT_DASHBOARD_COLUMNS)
      .order("category_slug", { ascending: true })
      .order("name", { ascending: true }),
    getRentalCategories({ allBrands: true }),
  ]);

  if (error) {
    console.error(
      "[dashboard/products] rental_products select error (full):",
      JSON.stringify(error, ["message", "details", "hint", "code"], 2),
      error,
    );
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <p className="font-semibold text-red-400">Failed to load products</p>
        <p className="mt-1 text-sm text-red-300/80">{error.message}</p>
      </div>
    );
  }

  const allProducts = (data ?? []) as unknown as ProductRow[];

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

      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
        Edit listings — saves name, visibility, imagery, specs, surfaces, pricing, quantity, delivery notes
      </p>

      {/* Product rows */}
      <div className="space-y-3">
        {products.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-zinc-400">
            No products match your filters.
          </div>
        ) : (
          products.map((p) => {
            const useSel = normalizeUseTypeForSelect(p.use_type ?? null);
            return (
              <form
                key={p.id}
                action={updateProduct}
                className={cn(
                  "space-y-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 transition-colors hover:bg-white/[0.07]",
                  !p.is_active && "opacity-65 ring-1 ring-zinc-600/35",
                )}
              >
                <input type="hidden" name="id" value={p.id} />

                <div className="flex flex-wrap items-start gap-3">
                  <div className="shrink-0">
                    {p.image_src ? (
                      <img
                        src={p.image_src}
                        alt={p.name}
                        className="h-14 w-14 rounded-md object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-md bg-white/10" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2 gap-y-2">
                      <label className="sr-only">Name</label>
                      <input
                        name="name"
                        defaultValue={p.name}
                        className="min-w-[160px] flex-1 rounded border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
                      />
                      <span className="shrink-0 rounded-full border border-white/10 bg-black/25 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                        {formatCategory(p.category_slug)}
                      </span>
                    </div>
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      Image path
                    </label>
                    <input
                      name="image_src"
                      defaultValue={p.image_src ?? ""}
                      placeholder="/products/…/main.jpg"
                      className="w-full rounded border border-white/15 bg-white/5 px-2 py-1 text-xs text-zinc-300 outline-none placeholder:text-zinc-600 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
                    />
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        p.is_active
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-zinc-700/60 text-zinc-400"
                      }`}
                    >
                      {p.is_active ? "Active" : "Inactive · hidden"}
                    </span>
                    <label className="flex cursor-pointer items-center gap-2 text-[11px] text-zinc-400">
                      <input
                        name="is_active"
                        type="checkbox"
                        defaultChecked={p.is_active}
                        className="accent-violet-400"
                      />
                      Active
                    </label>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {p.is_active ? (
                        <button
                          type="submit"
                          formAction={toggleProductActive}
                          className="rounded-lg border border-red-500/45 bg-transparent px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:border-red-400/70 hover:bg-red-500/10 hover:text-red-200 active:scale-[0.97]"
                        >
                          Hide
                        </button>
                      ) : (
                        <button
                          type="submit"
                          formAction={toggleProductActive}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 active:scale-[0.97]"
                        >
                          Activate
                        </button>
                      )}
                      <input type="hidden" name="next_active" value={String(!p.is_active)} />
                      <button
                        type="submit"
                        className="rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-500 active:scale-[0.97]"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 border-t border-white/10 pt-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      Listing price ($)
                    </label>
                    <input
                      name="price_from"
                      type="number"
                      min={0}
                      step={1}
                      defaultValue={listingPriceFallback(p)}
                      className="rounded border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      Qty available
                    </label>
                    <input
                      name="quantity_available"
                      type="number"
                      min={0}
                      step={1}
                      defaultValue={p.quantity_available ?? 0}
                      className="rounded border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      Use type
                    </label>
                    <select
                      name="use_type"
                      defaultValue={useSel}
                      className="rounded border border-white/15 bg-[#0c0c0f] px-2 py-1.5 text-sm text-zinc-200 outline-none focus:border-violet-400"
                    >
                      <option value="">— Not set —</option>
                      {USE_TYPE_OPTIONS.map((v) => (
                        <option key={v} value={v}>
                          {v.charAt(0).toUpperCase() + v.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      Delivery fee note
                    </label>
                    <input
                      name="delivery_fee_note"
                      defaultValue={p.delivery_fee_note ?? ""}
                      placeholder="Optional"
                      className="rounded border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
                    />
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                  <input
                    name="delivery_included"
                    type="checkbox"
                    defaultChecked={p.delivery_included === true}
                    className="accent-violet-400"
                  />
                  Delivery &amp; setup included
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      Dimensions
                    </label>
                    <input
                      name="dimensions"
                      defaultValue={p.dimensions ?? ""}
                      placeholder="e.g. 13×13 ft"
                      className="rounded border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      Setup space
                    </label>
                    <input
                      name="setup_space"
                      defaultValue={setupSpaceDisplay(p)}
                      placeholder="Level area, pathway, etc."
                      className="rounded border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
                    />
                  </div>
                </div>

                <fieldset className="rounded-lg border border-white/10 px-3 py-2">
                  <legend className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                    Allowed surfaces
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                    {SURFACE_TOGGLE_KEYS.map((s) => {
                      const fid = `${p.id}-${s}`;
                      const field = `surface_${s.toLowerCase()}`;
                      return (
                        <label key={s} htmlFor={fid} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                          <input
                            id={fid}
                            type="checkbox"
                            name={field}
                            defaultChecked={rowHasSurface(p.allowed_surfaces, s)}
                            className="accent-violet-400"
                          />
                          {s}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                    Short description
                  </label>
                  <textarea
                    name="short_description"
                    rows={2}
                    defaultValue={p.short_description ?? ""}
                    className="rounded border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                    Rules
                  </label>
                  <textarea
                    name="item_rules"
                    rows={3}
                    defaultValue={p.item_rules ?? ""}
                    placeholder="Setup / safety notes (one guideline per line works well)."
                    className="rounded border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
                  />
                </div>
              </form>
            );
          })
        )}
      </div>
    </div>
  );
}
