import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

export default async function ProductsDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc(
    "get_active_rental_products_for_brand",
    { p_brand_slug: "lias" },
  );

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <p className="font-semibold text-red-400">Failed to load products</p>
        <p className="mt-1 text-sm text-red-300/80">{error.message}</p>
      </div>
    );
  }

  const products = (data ?? []) as ProductRow[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Products</h1>
          <p className="mt-0.5 text-sm text-zinc-400">
            {products.length} active product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Column headers */}
      <div className="mb-1 grid grid-cols-[2fr_1fr_80px_70px_2fr_72px] gap-3 px-4 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
        <span>Name</span>
        <span>Category</span>
        <span>Price ($)</span>
        <span>Active</span>
        <span>Image path</span>
        <span />
      </div>

      <div className="space-y-1.5">
        {products.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-zinc-400">
            No products found.
          </div>
        ) : (
          products.map((p) => (
            <form
              key={p.id}
              action={updateProduct}
              className="grid grid-cols-[2fr_1fr_80px_70px_2fr_72px] items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 transition-colors hover:bg-white/[0.07]"
            >
              <input type="hidden" name="id" value={p.id} />

              <input
                name="name"
                defaultValue={p.name}
                className="w-full rounded border border-white/15 bg-white/5 px-2 py-1 text-sm text-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
              />

              <span className="truncate text-xs text-zinc-400">
                {formatCategory(p.category_slug)}
              </span>

              <input
                name="price"
                type="number"
                min={0}
                step={1}
                defaultValue={p.price ?? 0}
                className="w-full rounded border border-white/15 bg-white/5 px-2 py-1 text-sm text-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
              />

              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-zinc-300">
                <input
                  name="is_active"
                  type="checkbox"
                  defaultChecked={p.is_active}
                  className="accent-violet-400"
                />
                Active
              </label>

              <input
                name="image_src"
                defaultValue={p.image_src ?? ""}
                placeholder="/products/…/main.jpg"
                className="w-full rounded border border-white/15 bg-white/5 px-2 py-1 text-xs text-zinc-300 outline-none placeholder:text-zinc-600 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
              />

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

      <p className="mt-4 text-[11px] text-zinc-600">
        Note: updates require write access to rental_products. If you see a permission
        error after saving, an RPC will be needed to bypass RLS.
      </p>
    </div>
  );
}
