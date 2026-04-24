import type { Brand } from "@/lib/brand/config";
import { cn } from "@/lib/utils/cn";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function SiteShell({
  brand,
  children,
}: {
  brand: Brand;
  children: React.ReactNode;
}) {
  const t = brand.theme;
  const isCrb = brand.slug === "crb";

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col antialiased",
        isCrb ? "text-slate-100" : "text-stone-900",
      )}
      data-brand={brand.slug}
      style={
        {
          background: t.pageBackdrop,
          "--brand-primary": t.primary,
          "--brand-on-primary": t.onPrimary,
          "--brand-secondary": t.secondary,
          "--brand-on-secondary": t.onSecondary,
          "--brand-accent": t.accent,
          "--brand-on-accent": t.onAccent,
          "--brand-surface": t.surface,
          "--brand-surface-elevated": t.surfaceElevated,
          "--brand-muted": t.muted,
          "--brand-border": t.border,
          "--brand-hero-backdrop": t.heroBackdrop,
          "--brand-hero-blob-a": t.heroBlobA,
          "--brand-hero-blob-b": t.heroBlobB,
          "--brand-radius-lg": t.radiusLg,
          "--brand-radius-md": t.radiusMd,
          "--brand-header-bg": t.headerBg,
          "--brand-header-border": t.headerBorder,
          "--brand-footer-backdrop": t.footerBackdrop,
          "--brand-stripe-ticker": t.stripeTicker,
          "--brand-stripe-packages": t.stripePackages,
          "--brand-packages-glow": t.packagesGlow,
          "--brand-stripe-trust": t.stripeTrust,
          "--brand-stripe-experience": t.stripeExperience,
          "--brand-experience-glow": t.experienceGlow,
          "--brand-stripe-fleet": t.stripeFleet,
          "--brand-fleet-ambient": t.fleetAmbient,
          "--brand-stripe-feature": t.stripeFeature,
          "--brand-stripe-upgrades": t.stripeUpgrades,
          "--brand-stripe-local-panel": t.stripeLocalPanel,
          "--brand-cta-banner-bg": t.ctaBannerBg,
          "--brand-panel": t.panel,
        } as React.CSSProperties
      }
    >
      <div
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        aria-hidden
        style={{
          opacity: Number(t.shellNoiseOpacity),
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <SiteHeader brand={brand} />
        <div className="flex-1">{children}</div>
        <SiteFooter brand={brand} />
      </div>
    </div>
  );
}
