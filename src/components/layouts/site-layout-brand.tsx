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
    if (pathname !== "/") {
      return serverBrand;
    }
    const slug = resolveHomeBrandSlug(searchParams.get("brand"));
    return BRANDS[slug];
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
