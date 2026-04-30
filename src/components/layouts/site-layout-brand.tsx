"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useMemo, type ReactNode } from "react";
import { BRANDS, type Brand } from "@/lib/brand/config";
import { resolveHomeBrandSlug } from "@/lib/brand/resolve-brand";
import { SiteShell } from "./site-shell";

function SiteShellWithUrlSearchParams({
  serverBrand,
  phoneOverrides,
  children,
}: {
  serverBrand: Brand;
  phoneOverrides?: Record<string, string | null>;
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

  // Pick the phone override that matches whichever brand is active after
  // client-side ?brand= resolution, so header/footer always stay in sync.
  const phoneOverride = phoneOverrides?.[brand.slug] ?? null;

  return (
    <SiteShell brand={brand} phoneOverride={phoneOverride}>
      {children}
    </SiteShell>
  );
}

export function SiteLayoutBrand({
  serverBrand,
  phoneOverrides,
  children,
}: {
  serverBrand: Brand;
  phoneOverrides?: Record<string, string | null>;
  children: ReactNode;
}) {
  const serverPhoneOverride = phoneOverrides?.[serverBrand.slug] ?? null;
  return (
    <Suspense
      fallback={
        <SiteShell brand={serverBrand} phoneOverride={serverPhoneOverride}>
          {children}
        </SiteShell>
      }
    >
      <SiteShellWithUrlSearchParams
        serverBrand={serverBrand}
        phoneOverrides={phoneOverrides}
      >
        {children}
      </SiteShellWithUrlSearchParams>
    </Suspense>
  );
}
