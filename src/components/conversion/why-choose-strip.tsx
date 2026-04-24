import type { Brand } from "@/lib/brand/config";
import { Container } from "@/components/marketing/container";
import { cn } from "@/lib/utils/cn";

const ITEMS = [
  {
    icon: "📍",
    title: "Moreno Valley + I.E.",
    body: "Local routes, local crew — not a call center.",
  },
  {
    icon: "🛠️",
    title: "Setup included",
    body: "We place, anchor, and safety-check so you host.",
  },
  {
    icon: "🧒",
    title: "Kid-safe process",
    body: "Clear rules, gate width checks, no guesswork.",
  },
  {
    icon: "⚡",
    title: "Fast online booking",
    body: "Pick date → jumper → upgrades. Minutes, not voicemails.",
  },
] as const;

export function WhyChooseStrip({
  brand,
  id = "why-heading",
}: {
  brand: Brand;
  id?: string;
}) {
  const isCrb = brand.slug === "crb";

  return (
    <section
      className="relative py-12 sm:py-16"
      aria-labelledby={id}
      style={{ background: "var(--brand-stripe-trust)" }}
    >
      <Container>
        <p
          id={id}
          className={cn(
            "text-center text-[11px] font-black uppercase tracking-[0.28em]",
            isCrb ? "text-cyan-200/85" : "text-orange-800",
          )}
        >
          Why families book with us
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item) => (
            <div
              key={item.title}
              className={cn(
                "flex gap-4 border p-4 shadow-lg",
                isCrb
                  ? "border-cyan-400/25 bg-slate-950/65 backdrop-blur"
                  : "border-orange-400/20 bg-white/90 backdrop-blur",
              )}
              style={{ borderRadius: "var(--brand-radius-md)" }}
            >
              <span
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ring-1",
                  isCrb
                    ? "bg-cyan-400/10 ring-cyan-400/25"
                    : "bg-gradient-to-br from-amber-100 to-pink-100 ring-orange-400/20",
                )}
                aria-hidden
              >
                {item.icon}
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-sm font-black",
                    isCrb ? "text-white" : "text-stone-900",
                  )}
                >
                  {item.title}
                </p>
                <p
                  className={cn(
                    "mt-1 text-xs font-semibold leading-relaxed",
                    isCrb ? "text-slate-400" : "text-stone-600",
                  )}
                >
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
