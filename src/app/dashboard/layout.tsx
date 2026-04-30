import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#0c0c0f] text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0c0c0f]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="hidden h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 sm:block"
              aria-hidden
            />
            <div className="min-w-0">
              <Link
                href="/dashboard"
                className="block truncate text-sm font-semibold tracking-tight text-white sm:text-base"
              >
                Operations
              </Link>
              <p className="truncate text-[11px] text-zinc-500 sm:text-xs">
                Party rental OS · visual shell
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300 sm:inline">
              Live preview
            </span>
            <Link
              href="/dashboard/bookings"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-white/25 hover:bg-white/10 sm:text-sm"
            >
              Bookings
            </Link>
            <Link
              href="/dashboard/leads"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-white/25 hover:bg-white/10 sm:text-sm"
            >
              Leads
            </Link>
            <Link
              href="/dashboard/products"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-white/25 hover:bg-white/10 sm:text-sm"
            >
              Products
            </Link>
            <Link
              href="/dashboard/packages"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-white/25 hover:bg-white/10 sm:text-sm"
            >
              Packages
            </Link>
            <Link
              href="/dashboard/site"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-white/25 hover:bg-white/10 sm:text-sm"
            >
              Website
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-white/25 hover:bg-white/10 sm:text-sm"
            >
              View site
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 sm:hidden">
          {["Today", "Bookings", "Payments", "SMS"].map((t) => (
            <button
              key={t}
              type="button"
              className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300"
            >
              {t}
            </button>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}
