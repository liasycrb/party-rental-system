import type { Metadata } from "next";
import Link from "next/link";
import { BRANDS } from "@/lib/brand/config";
import { resolveBrandSlugFromPageSearchParam } from "@/lib/brand/resolve-brand";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Leads" };

type Lead = {
  id: string;
  created_at: string;
  request_type: string | null;
  package_id: string | null;
  package_title: string | null;
  product_slug: string | null;
  customer_name: string;
  phone: string;
  event_date: string | null;
  event_city: string | null;
  status: string | null;
};

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function packageLabel(title: string | null, id: string | null): string {
  if (title) return title;
  if (id && !UUID_RE.test(id)) return slugToTitle(id);
  return "—";
}

type PageProps = {
  searchParams: Promise<{ brand?: string | string[] }>;
};

async function getLeads(brandSlug: string): Promise<Lead[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_booking_leads_for_dashboard", {
    p_brand_slug: brandSlug,
  });
  if (error) {
    console.error("[leads]", error.message);
    return [];
  }
  return (data ?? []) as Lead[];
}

function fmt(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function LeadsDashboardPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const brandSlug = resolveBrandSlugFromPageSearchParam(sp.brand);
  const brand = BRANDS[brandSlug];
  const leads = await getLeads(brandSlug);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Leads — {brand.displayName}</h1>
          <p className="text-sm text-zinc-400">{leads.length} lead{leads.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href="/dashboard/leads?brand=lias"
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              brandSlug === "lias"
                ? "border-violet-500/60 bg-violet-500/15 text-violet-300"
                : "border-white/15 bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            Lias
          </Link>
          <Link
            href="/dashboard/leads?brand=crb"
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              brandSlug === "crb"
                ? "border-violet-500/60 bg-violet-500/15 text-violet-300"
                : "border-white/15 bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            CRB
          </Link>
        </div>
      </div>

      {leads.length === 0 ? (
        <p className="text-sm text-zinc-400">
          No leads yet. Run the SQL from the audit to create the RPC, then check back.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-zinc-200">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="pb-2 pr-4">Received</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Package</th>
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Phone</th>
                <th className="pb-2 pr-4">Event date</th>
                <th className="pb-2 pr-4">City</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="py-2 pr-4 text-zinc-400">{fmt(lead.created_at)}</td>
                  <td className="py-2 pr-4">
                    <span className={
                      lead.request_type === "package_inquiry"
                        ? "rounded-full bg-violet-500/20 px-2 py-0.5 text-[11px] font-semibold text-violet-300"
                        : "rounded-full bg-zinc-700/60 px-2 py-0.5 text-[11px] font-semibold text-zinc-400"
                    }>
                      {lead.request_type === "package_inquiry" ? "Package inquiry" : lead.request_type ?? "Lead"}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-zinc-300">
                    {packageLabel(lead.package_title, lead.package_id)}
                  </td>
                  <td className="py-2 pr-4">{lead.customer_name}</td>
                  <td className="py-2 pr-4 text-zinc-400">{lead.phone}</td>
                  <td className="py-2 pr-4 text-zinc-400">{fmt(lead.event_date)}</td>
                  <td className="py-2 text-zinc-400">{lead.event_city ?? "—"}</td>
                  <td className="py-2 pl-4">
                    <Link href={`/dashboard/leads/${lead.id}`} className="text-xs text-violet-400 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
