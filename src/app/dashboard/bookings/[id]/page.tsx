import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BookingStaffActions } from "../booking-staff-actions";
import { PaymentProofButton } from "../payment-proof-button";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const short = id.length > 8 ? `${id.slice(0, 8)}…` : id;
  return {
    title: `Reservation ${short}`,
    description: "Reservation detail",
  };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-sm">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 font-medium leading-relaxed text-zinc-100">{value}</p>
    </div>
  );
}

function slugToReadableName(slug: string | null | undefined): string {
  const s = slug?.trim();
  if (!s) return "—";
  return s
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatEventDate(isoDate: string | null | undefined): string {
  const d = isoDate?.trim();
  if (!d) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const parsed = new Date(`${d}T12:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }
  return d;
}

const LOGISTICS_VALUE_LABELS: Record<string, string> = {
  morning: "Morning",
  midday: "Midday",
  afternoon: "Afternoon",
  evening: "Evening",
  next_day: "Next Day",
};

function formatLogisticsWindow(value: string | null | undefined): string {
  const v = value?.trim().toLowerCase();
  if (!v) return "—";
  return LOGISTICS_VALUE_LABELS[v] ?? slugToReadableName(v);
}

function humanizeEnumValue(value: string | null | undefined): string {
  const v = value?.trim();
  if (!v) return "—";
  return v
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

const ADDON_DISPLAY: Array<{ key: string; label: string }> = [
  { key: "tables", label: "Tables" },
  { key: "chairs", label: "Chairs" },
  { key: "canopy", label: "Canopy" },
  { key: "generator", label: "Generator" },
  { key: "extraJumper", label: "Extra Jumper" },
];

function getPositiveAddonLines(addons: Record<string, unknown> | null): string[] {
  if (!addons) return [];
  const out: string[] = [];
  for (const { key, label } of ADDON_DISPLAY) {
    const raw = addons[key];
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) {
      out.push(`${label} (${n})`);
    }
  }
  return out;
}

type RentalAgreement = {
  accepted: boolean | null;
  petsAtLocation: boolean | null;
  itemRulesShown: boolean | null;
};

function extractRentalAgreement(fullNotes: string | null | undefined): RentalAgreement | null {
  if (!fullNotes?.trim()) return null;
  const marker = "Rental agreement:";
  const idx = fullNotes.indexOf(marker);
  if (idx === -1) return null;
  const block = fullNotes.slice(idx + marker.length);
  const section = (block.split("\n\n")[0] ?? "").trim();
  if (!section) return null;

  function parseBoolLine(key: string): boolean | null {
    const re = new RegExp(`^${key}:\\s*(Yes|No)`, "im");
    const m = section.match(re);
    if (!m) return null;
    return m[1].toLowerCase() === "yes";
  }

  return {
    accepted: parseBoolLine("Accepted"),
    petsAtLocation: parseBoolLine("Pets at location"),
    itemRulesShown: parseBoolLine("Item rules shown"),
  };
}

function extractCustomerNotesOnly(fullNotes: string | null | undefined): string | null {
  if (!fullNotes?.trim()) return null;
  const marker = "Customer notes:";
  const idx = fullNotes.indexOf(marker);
  if (idx === -1) return null;
  let rest = fullNotes.slice(idx + marker.length).trimStart();
  const endIdx = rest.indexOf("\n\n");
  if (endIdx !== -1) {
    rest = rest.slice(0, endIdx).trimEnd();
  }
  return rest || null;
}

function formatUsd(amount: number | null | undefined) {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export default async function DashboardBookingDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const bookingId = id?.trim();
  if (!bookingId) {
    notFound();
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <p className="text-sm text-zinc-400">
        Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
      </p>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();

  if (error) {
    return (
      <p className="text-sm text-red-300">Could not load booking: {error.message}</p>
    );
  }
  if (!row) {
    notFound();
  }

  const isOnline = row.source === "online_reservation";
  const canStaffAct = isOnline && row.status === "pending_confirmation";

  const addons =
    row.addons != null && typeof row.addons === "object" && !Array.isArray(row.addons)
      ? (row.addons as Record<string, unknown>)
      : null;

  const addonLines = getPositiveAddonLines(addons);
  const customerNotesOnly = extractCustomerNotesOnly(row.notes);
  const rentalAgreement = extractRentalAgreement(row.notes);
  const hasReceipt = Boolean(row.payment_proof_path?.trim());

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/dashboard/bookings"
        className="text-sm font-medium text-violet-300 underline-offset-2 hover:underline"
      >
        ← Back to Bookings
      </Link>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Reservation
          </h1>
          <p className="mt-2 text-xs text-zinc-500">
            Internal reference · {bookingId}
          </p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm sm:min-w-[200px]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-500">Status</span>
            <span className="font-semibold text-zinc-100">
              {humanizeEnumValue(row.status)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-2">
            <span className="text-zinc-500">Payment Status</span>
            <span className="font-semibold text-zinc-100">
              {humanizeEnumValue(row.payment_status)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        <Section title="Reservation Summary">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Customer Name" value={row.customer_name?.trim() || "—"} />
            <Field label="Phone" value={row.phone?.trim() || "—"} />
            <Field label="Event City" value={row.event_city?.trim() || "—"} />
            <Field label="Event Date" value={formatEventDate(row.event_date)} />
          </div>
        </Section>

        <Section title="Rental">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Product"
              value={slugToReadableName(row.product_slug)}
            />
            <Field label="Quantity" value={row.quantity ?? "—"} />
          </div>
        </Section>

        {addonLines.length > 0 ? (
          <Section title="Add-Ons">
            <ul className="list-inside list-disc space-y-1.5 leading-relaxed text-zinc-200">
              {addonLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Section>
        ) : null}

        <Section title="Logistics">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Event Time"
              value={formatLogisticsWindow(row.event_time_window)}
            />
            <Field
              label="Delivery Time"
              value={formatLogisticsWindow(row.delivery_window)}
            />
            <Field
              label="Pickup Time"
              value={formatLogisticsWindow(row.pickup_window)}
            />
          </div>
        </Section>

        <Section title="Payment">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Subtotal" value={formatUsd(row.subtotal)} />
            <Field label="Deposit" value={formatUsd(row.deposit_amount)} />
            <Field label="Balance Due" value={formatUsd(row.balance_due)} />
          </div>
        </Section>

        <Section title="Payment Proof">
          {hasReceipt ? (
            <PaymentProofButton bookingId={bookingId} />
          ) : (
            <p className="text-zinc-500">No receipt on file.</p>
          )}
        </Section>

        {rentalAgreement ? (
          <Section title="Agreement">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Rules accepted"
                value={rentalAgreement.accepted === null ? "—" : rentalAgreement.accepted ? "Yes" : "No"}
              />
              <Field
                label="Pets at location"
                value={rentalAgreement.petsAtLocation === null ? "—" : rentalAgreement.petsAtLocation ? "Yes" : "No"}
              />
              <Field
                label="Item rules shown"
                value={rentalAgreement.itemRulesShown === null ? "—" : rentalAgreement.itemRulesShown ? "Yes" : "No"}
              />
            </div>
          </Section>
        ) : null}

        {customerNotesOnly ? (
          <Section title="Notes">
            <p className="whitespace-pre-wrap leading-relaxed text-zinc-200">
              {customerNotesOnly}
            </p>
          </Section>
        ) : null}
      </div>

      {canStaffAct ? (
        <div className="mt-10 border-t border-white/10 pt-8">
          <p className="mb-4 text-sm font-medium text-zinc-300">Actions</p>
          <BookingStaffActions bookingId={bookingId} />
        </div>
      ) : null}
    </div>
  );
}
