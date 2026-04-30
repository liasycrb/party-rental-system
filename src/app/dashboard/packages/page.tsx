import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAllRentalPackagesDashboard, type RentalPackage } from "@/lib/marketing/get-rental-packages";

export const metadata: Metadata = { title: "Packages — Dashboard" };

const BRAND_SLUG = "lias";

const inputClass =
  "w-full rounded border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30";
const labelClass = "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500";
const selectClass =
  "w-full rounded border border-white/15 bg-[#0c0c0f] px-2 py-1.5 text-sm text-zinc-200 outline-none focus:border-violet-400";

function parseBrandSlugs(field: string): string[] {
  if (field === "lias") return ["lias"];
  if (field === "crb") return ["crb"];
  return ["lias", "crb"];
}

function brandVisibilityFromSlugs(slugs: string[]): string {
  if (slugs.includes("lias") && slugs.includes("crb")) return "both";
  if (slugs.includes("crb")) return "crb";
  return "lias";
}

function parseIncludes(raw: string): string[] {
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function upsertPackage(formData: FormData) {
  "use server";
  const rawId = (formData.get("id") as string | null)?.trim();
  const id = rawId || null;

  const title = ((formData.get("title") as string) ?? "").trim();
  if (!title) throw new Error("Title is required");

  const brandSlugs = parseBrandSlugs(
    ((formData.get("brand_visibility") as string) ?? "").trim(),
  );
  const isActive = formData.get("is_active") === "true";

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("upsert_rental_package_dashboard", {
    p_id: id,
    p_brand_slugs: brandSlugs,
    p_title: title,
    p_tagline: ((formData.get("tagline") as string) ?? "").trim() || null,
    p_badge: ((formData.get("badge") as string) ?? "").trim() || null,
    p_includes: parseIncludes((formData.get("includes") as string) ?? ""),
    p_from_price: Number(formData.get("from_price") ?? 0),
    p_primary_product_slug:
      ((formData.get("primary_product_slug") as string) ?? "").trim() || null,
    p_image_src: ((formData.get("image_src") as string) ?? "").trim() || null,
    p_is_active: isActive,
    p_sort_order: Number(formData.get("sort_order") ?? 0),
  });

  if (error) throw new Error(`[upsertPackage] ${error.message}`);
  revalidatePath("/dashboard/packages");
}

function PackageForm({
  pkg,
  isNew = false,
}: {
  pkg?: RentalPackage;
  isNew?: boolean;
}) {
  const includesText = (pkg?.includes ?? []).join("\n");
  const brandVis = pkg ? brandVisibilityFromSlugs(pkg.brand_slugs) : "both";

  return (
    <form action={upsertPackage} className="space-y-3">
      {pkg && <input type="hidden" name="id" value={pkg.id} />}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={labelClass}>Title *</label>
          <input name="title" required defaultValue={pkg?.title ?? ""} placeholder="e.g. Kids Party Combo" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>From price ($)</label>
          <input name="from_price" type="number" min={0} step={1} defaultValue={pkg?.from_price ?? 0} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Sort order</label>
          <input name="sort_order" type="number" min={0} step={1} defaultValue={pkg?.sort_order ?? 0} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Badge (optional)</label>
          <input name="badge" defaultValue={pkg?.badge ?? ""} placeholder='e.g. "Most booked"' className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Primary product slug</label>
          <input name="primary_product_slug" defaultValue={pkg?.primary_product_slug ?? ""} placeholder="e.g. regular-jumper-13x13" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Image path (optional)</label>
          <input name="image_src" defaultValue={pkg?.image_src ?? ""} placeholder="/products/…/main.jpg" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Brand visibility</label>
          <select name="brand_visibility" defaultValue={brandVis} className={selectClass}>
            <option value="both">Both — Lias &amp; CRB</option>
            <option value="lias">Lias only</option>
            <option value="crb">CRB only</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select name="is_active" defaultValue={pkg ? String(pkg.is_active) : "false"} className={selectClass}>
            <option value="false">Draft — hidden</option>
            <option value="true">Active — visible</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Tagline</label>
        <input name="tagline" defaultValue={pkg?.tagline ?? ""} placeholder="Short marketing line shown under title" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Includes (one bullet per line)</label>
        <textarea
          name="includes"
          rows={4}
          defaultValue={includesText}
          placeholder={"Hero jumper + room for presents\nTables & chairs in the builder\nDelivery & pro setup included"}
          className={inputClass}
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          className={
            isNew
              ? "rounded-lg bg-emerald-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-emerald-500 active:scale-[0.98]"
              : "rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-violet-500 active:scale-[0.98]"
          }
        >
          {isNew ? "Add package" : "Save"}
        </button>
        {pkg && (
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${pkg.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-700/60 text-zinc-400"}`}>
            {pkg.is_active ? "Active" : "Draft"}
          </span>
        )}
      </div>
    </form>
  );
}

export default async function PackagesDashboardPage() {
  const packages = await getAllRentalPackagesDashboard(BRAND_SLUG);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white">Packages</h1>
        <p className="mt-0.5 text-sm text-zinc-400">
          Marketing bundles shown on the homepage Popular Setups section.
          {packages.length > 0 && ` ${packages.length} package${packages.length !== 1 ? "s" : ""}.`}
        </p>
      </div>

      {/* Add package */}
      <details className="rounded-xl border border-white/10 bg-white/5">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-zinc-200 hover:text-white">
          + Add package
        </summary>
        <div className="border-t border-white/10 p-4">
          <PackageForm isNew />
        </div>
      </details>

      {/* Existing packages */}
      {packages.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-zinc-400">
          No packages yet. Add one above — until you do, the homepage falls back to the built-in demo packages.
        </div>
      ) : (
        <div className="space-y-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-200">{pkg.title}</span>
                {pkg.badge && (
                  <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                    {pkg.badge}
                  </span>
                )}
                <span className="ml-auto text-xs text-zinc-500">
                  sort: {pkg.sort_order}
                </span>
              </div>
              <PackageForm pkg={pkg} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
