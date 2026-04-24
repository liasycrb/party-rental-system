import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Operations dashboard (placeholder).",
};

const CARDS = [
  {
    title: "Today’s route",
    meta: "0 stops · placeholder",
    tone: "from-amber-500/20 to-orange-500/10",
  },
  {
    title: "Pending Zelle",
    meta: "Queue UI only",
    tone: "from-emerald-500/15 to-teal-500/10",
  },
  {
    title: "Reservations",
    meta: "Shared inventory",
    tone: "from-violet-500/15 to-indigo-500/10",
  },
  {
    title: "CRM inbox",
    meta: "SMS later",
    tone: "from-sky-500/15 to-cyan-500/10",
  },
] as const;

export default function DashboardHomePage() {
  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Good afternoon, team
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Mobile-first operations hub — cards below mirror how we&apos;ll surface
            deliveries, Zelle confirmations, and inventory exceptions without
            clutter.
          </p>
        </div>
        <button
          type="button"
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm transition-opacity hover:opacity-90 sm:mt-0"
        >
          New hold (soon)
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <div
            key={c.title}
            className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-5 ${c.tone}`}
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <p className="text-sm font-semibold text-white">{c.title}</p>
            <p className="mt-2 text-xs text-zinc-300">{c.meta}</p>
            <span className="mt-4 inline-flex text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Placeholder
            </span>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Schedule preview
          </p>
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    Delivery slot {i}
                  </p>
                  <p className="text-xs text-zinc-500">Moreno Valley · TBD</p>
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  Empty
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Quick stats
          </p>
          <ul className="mt-4 space-y-4 text-sm">
            <li className="flex justify-between gap-2">
              <span className="text-zinc-400">Utilization</span>
              <span className="font-semibold text-zinc-100">—</span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-zinc-400">Open leads</span>
              <span className="font-semibold text-zinc-100">—</span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-zinc-400">SMS sent (7d)</span>
              <span className="font-semibold text-zinc-100">—</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
