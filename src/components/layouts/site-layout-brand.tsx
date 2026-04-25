"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useMemo, type ReactNode } from "react";
import { BRANDS, type Brand } from "@/lib/brand/config";
import { resolveHomeBrandSlug } from "@/lib/brand/resolve-brand";
import { SiteShell } from "./site-shell";

function SiteShellWithUrlSearchParams({
  serverBrand,
  children,
}: {
  serverBrand: Brand;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const brand = useMemo((): Brand => {
    const q = searchParams.get("brand");
    if (pathname === "/") {
      return BRANDS[resolveHomeBrandSlug(q)];
    }
    if (pathname.startsWith("/categories/")) {
      return BRANDS[resolveHomeBrandSlug(q)];
    }
    return serverBrand;
  }, [pathname, searchParams, serverBrand]);

  return <SiteShell brand={brand}>{children}</SiteShell>;
}

export function SiteLayoutBrand({
  serverBrand,
  children,
}: {
  serverBrand: Brand;
  children: ReactNode;
}) {
  return (
    <Suspense
      fallback={<SiteShell brand={serverBrand}>{children}</SiteShell>}
    >
      <SiteShellWithUrlSearchParams serverBrand={serverBrand}>
        {children}
      </SiteShellWithUrlSearchParams>
    </Suspense>
  );
}
