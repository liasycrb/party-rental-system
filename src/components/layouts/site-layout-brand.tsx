"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useMemo, type ReactNode } from "react";
import { BRANDS, type Brand } from "@/lib/brand/config";
import { resolveHomeBrandSlug } from "@/lib/brand/resolve-brand";
import { SiteShell } from "./site-shell";
import type { FooterOverride } from "./site-footer";

function SiteShellWithUrlSearchParams({
  serverBrand,
  phoneOverrides,
  footerOverrides,
  children,
}: {
  serverBrand: Brand;
  phoneOverrides?: Record<string, string | null>;
  footerOverrides?: Record<string, FooterOverride | null>;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const brand = useMemo((): Brand => {
    const q = searchParams.get("brand");
    if (q === "lias" || q === "crb") {
      return BRANDS[q];
    }
    if (pathname === "/") {
      return BRANDS[resolveHomeBrandSlug(q)];
    }
    if (pathname.startsWith("/categories/") || pathname === "/build") {
      return BRANDS[resolveHomeBrandSlug(q)];
    }
    return serverBrand;
  }, [pathname, searchParams, serverBrand]);

  // Pick the override that matches whichever brand is active after
  // client-side ?brand= resolution, so header/footer always stay in sync.
  const phoneOverride = phoneOverrides?.[brand.slug] ?? null;
  const footerOverride = footerOverrides?.[brand.slug] ?? null;

  return (
    <SiteShell brand={brand} phoneOverride={phoneOverride} footerOverride={footerOverride}>
      {children}
    </SiteShell>
  );
}

export function SiteLayoutBrand({
  serverBrand,
  phoneOverrides,
  footerOverrides,
  children,
}: {
  serverBrand: Brand;
  phoneOverrides?: Record<string, string | null>;
  footerOverrides?: Record<string, FooterOverride | null>;
  children: ReactNode;
}) {
  const serverPhoneOverride = phoneOverrides?.[serverBrand.slug] ?? null;
  const serverFooterOverride = footerOverrides?.[serverBrand.slug] ?? null;
  return (
    <Suspense
      fallback={
        <SiteShell brand={serverBrand} phoneOverride={serverPhoneOverride} footerOverride={serverFooterOverride}>
          {children}
        </SiteShell>
      }
    >
      <SiteShellWithUrlSearchParams
        serverBrand={serverBrand}
        phoneOverrides={phoneOverrides}
        footerOverrides={footerOverrides}
      >
        {children}
      </SiteShellWithUrlSearchParams>
    </Suspense>
  );
}
