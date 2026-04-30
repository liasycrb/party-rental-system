import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/site/get-site-settings";
import { BRANDS } from "@/lib/brand/config";
import { resolveBrandSlugFromPageSearchParam } from "@/lib/brand/resolve-brand";

export const metadata: Metadata = { title: "Website — Dashboard" };

type Field = { name: string; label: string; placeholder: string; multiline?: boolean };

const FIELDS: Field[] = [
  {
    name: "business_name",
    label: "Business name",
    placeholder: "e.g. Lias Party Rentals",
  },
  {
    name: "support_phone",
    label: "Phone / WhatsApp number",
    placeholder: "E.164 format, e.g. +19515550000",
  },
  {
    name: "hero_headline",
    label: "Hero headline",
    placeholder: "e.g. Your backyard. Their best day ever.",
  },
  {
    name: "hero_subheadline",
    label: "Hero subheadline",
    placeholder: "e.g. Bounce houses & waterslides delivered to your door.",
  },
  {
    name: "hero_cta_primary",
    label: "Primary CTA button text",
    placeholder: "e.g. Check availability",
  },
  {
    name: "announcement_text",
    label: "Announcement / ticker text",
    placeholder: "e.g. Book now for summer weekends — spots filling fast!",
    multiline: true,
  },
  {
    name: "service_areas_text",
    label: "Service areas text",
    placeholder: "e.g. Serving Moreno Valley, Riverside & the Inland Empire",
    multiline: true,
  },
];

const FOOTER_FIELDS: Field[] = [
  {
    name: "footer_headline",
    label: "Brand description",
    placeholder: "e.g. Premium party rentals delivered to your door.",
    multiline: true,
  },
  {
    name: "footer_phone",
    label: "Footer phone",
    placeholder: "E.164 format, e.g. +19515550000",
  },
  {
    name: "footer_email",
    label: "Email address",
    placeholder: "e.g. info@liaspartyrentals.com",
  },
  {
    name: "footer_service_area",
    label: "Service area / bottom note",
    placeholder: "e.g. Serving Moreno Valley, Riverside & surrounding areas.",
    multiline: true,
  },
  {
    name: "footer_copyright",
    label: "Copyright line",
    placeholder: "e.g. © 2025 Lias Party Rentals. All rights reserved.",
  },
  {
    name: "footer_facebook_url",
    label: "Facebook URL (optional)",
    placeholder: "https://facebook.com/yourpage",
  },
  {
    name: "footer_instagram_url",
    label: "Instagram URL (optional)",
    placeholder: "https://instagram.com/yourhandle",
  },
];

async function updateSiteSettings(formData: FormData) {
  "use server";
  const brandSlug = (formData.get("brand_slug") as string | null)?.trim();
  if (!brandSlug) throw new Error("Missing brand_slug");

  const get = (key: string) =>
    ((formData.get(key) as string) ?? "").trim() || null;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("update_site_settings", {
    p_brand_slug: brandSlug,
    p_business_name: get("business_name"),
    p_support_phone: get("support_phone"),
    p_hero_headline: get("hero_headline"),
    p_hero_subheadline: get("hero_subheadline"),
    p_hero_cta_primary: get("hero_cta_primary"),
    p_announcement_text: get("announcement_text"),
    p_service_areas_text: get("service_areas_text"),
    p_footer_headline: get("footer_headline"),
    p_footer_phone: get("footer_phone"),
    p_footer_email: get("footer_email"),
    p_footer_service_area: get("footer_service_area"),
    p_footer_copyright: get("footer_copyright"),
    p_footer_facebook_url: get("footer_facebook_url"),
    p_footer_instagram_url: get("footer_instagram_url"),
  });

  if (error) throw new Error(`[updateSiteSettings] ${error.message}`);
  revalidatePath("/dashboard/site");
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500/60 focus:outline-none focus:ring-1 focus:ring-violet-500/40";

const labelClass = "mb-1.5 block text-sm font-semibold text-zinc-300";

export default async function SiteDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const sp = await searchParams;
  const brandSlug = resolveBrandSlugFromPageSearchParam(sp.brand);
  const settings = await getSiteSettings(brandSlug);

  const val = (key: string): string =>
    (settings?.[key as keyof typeof settings] as string | null) ?? "";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white">Website Manager</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Edit public-facing content for{" "}
          <span className="font-semibold text-zinc-200">
            {BRANDS[brandSlug].displayName}
          </span>
          . Changes are saved to the database.
        </p>
      </div>

      {/* Brand switcher */}
      <div className="flex gap-2">
        {(["lias", "crb"] as const).map((slug) => (
          <Link
            key={slug}
            href={`/dashboard/site?brand=${slug}`}
            className={
              brandSlug === slug
                ? "rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white"
                : "rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-white/10"
            }
          >
            {BRANDS[slug].displayName}
          </Link>
        ))}
      </div>

      <form action={updateSiteSettings} className="space-y-6">
        <input type="hidden" name="brand_slug" value={brandSlug} />

        {FIELDS.map((field) =>
          field.multiline ? (
            <div key={field.name}>
              <label htmlFor={field.name} className={labelClass}>
                {field.label}
              </label>
              <textarea
                id={field.name}
                name={field.name}
                rows={3}
                defaultValue={val(field.name)}
                placeholder={field.placeholder}
                className={inputClass}
              />
            </div>
          ) : (
            <div key={field.name}>
              <label htmlFor={field.name} className={labelClass}>
                {field.label}
              </label>
              <input
                id={field.name}
                name={field.name}
                type="text"
                defaultValue={val(field.name)}
                placeholder={field.placeholder}
                className={inputClass}
              />
            </div>
          ),
        )}

        {/* Footer section */}
        <div className="space-y-6 border-t border-white/10 pt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Footer
          </h2>
          {FOOTER_FIELDS.map((field) =>
            field.multiline ? (
              <div key={field.name}>
                <label htmlFor={field.name} className={labelClass}>
                  {field.label}
                </label>
                <textarea
                  id={field.name}
                  name={field.name}
                  rows={3}
                  defaultValue={val(field.name)}
                  placeholder={field.placeholder}
                  className={inputClass}
                />
              </div>
            ) : (
              <div key={field.name}>
                <label htmlFor={field.name} className={labelClass}>
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  defaultValue={val(field.name)}
                  placeholder={field.placeholder}
                  className={inputClass}
                />
              </div>
            ),
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-white/10 pt-4">
          <button
            type="submit"
            className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500 active:scale-[0.98]"
          >
            Save changes
          </button>
          {settings?.updated_at && (
            <p className="text-xs text-zinc-500">
              Last saved:{" "}
              {new Date(settings.updated_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
