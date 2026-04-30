import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ConvertForm } from "./_convert-form";
import type { BrandSlug } from "@/lib/brand/config";

export const metadata: Metadata = { title: "Lead detail" };

type Lead = {
  id: string;
  brand_slug: string;
  created_at: string;
  request_type: string | null;
  package_id: string | null;
  package_title: string | null;
  product_slug: string | null;
  category_slug: string | null;
  customer_name: string;
  phone: string;
  event_date: string | null;
  event_city: string | null;
  notes: string | null;
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

async function getLead(id: string): Promise<Lead | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_booking_lead_by_id", {
    p_id: id,
  });
  if (error) {
    console.error("[getLead]", error.message);
    return null;
  }
  const rows = (data ?? []) as Lead[];
  return rows[0] ?? null;
}

function fmt(dateStr: string | null | undefined): string {
  if (!dateStr?.trim()) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm text-zinc-200">{value}</p>
    </div>
  );
}

export default async function LeadDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  if (!id) notFound();

  const lead = await getLead(id);
  if (!lead) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/leads" className="text-xs text-zinc-500 hover:text-zinc-300">
          ← Back to leads
        </Link>
        <p className="text-sm text-red-300">
          Lead not found. Run the SQL for <code>get_booking_lead_by_id</code> RPC first.
        </p>
      </div>
    );
  }

  const isConverted = lead.status === "converted";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/leads" className="text-xs text-zinc-500 hover:text-zinc-300">
          ← Leads
        </Link>
        {isConverted && (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
            Converted
          </span>
        )}
      </div>

      {/* Lead info */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <h1 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Lead</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Package" value={packageLabel(lead.package_title, lead.package_id)} />
          <Field label="Customer" value={lead.customer_name} />
          <Field label="Phone" value={lead.phone} />
          <Field label="Event date" value={fmt(lead.event_date)} />
          <Field label="City" value={lead.event_city ?? "—"} />
          <Field label="Brand" value={lead.brand_slug} />
        </div>
        {lead.notes && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Notes</p>
            <pre className="mt-1 whitespace-pre-wrap text-sm text-zinc-300">{lead.notes}</pre>
          </div>
        )}
      </div>

      {/* Convert form */}
      {isConverted ? (
        <p className="text-sm text-zinc-400">
          This lead has already been converted to a booking.
        </p>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Convert to booking
          </h2>
          <ConvertForm
            leadId={lead.id}
            brandSlug={lead.brand_slug as BrandSlug}
            categorySlug={lead.category_slug}
            productSlug={lead.product_slug}
            packageTitle={lead.package_title}
            eventDate={lead.event_date}
            eventCity={lead.event_city}
            customerName={lead.customer_name}
            phone={lead.phone}
            notes={lead.notes}
          />
        </div>
      )}
    </div>
  );
}
