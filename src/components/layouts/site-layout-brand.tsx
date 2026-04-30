"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useMemo, type ReactNode } from "react";
import { BRANDS, type Brand, type BrandSlug } from "@/lib/brand/config";
import { resolveHomeBrandSlug } from "@/lib/brand/resolve-brand";
import type { FooterCategoryLink } from "./site-footer";
import { SiteShell } from "./site-shell";
import type { FooterOverride } from "./site-footer";

function SiteShellWithUrlSearchParams({
  serverBrand,
  phoneOverrides,
  footerOverrides,
  footerCategoryLinksByBrand,
  children,
}: {
  serverBrand: Brand;
  phoneOverrides?: Record<string, string | null>;
  footerOverrides?: Record<string, FooterOverride | null>;
  footerCategoryLinksByBrand?: Partial<
    Record<BrandSlug, readonly FooterCategoryLink[]>
  >;
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

  const phoneOverride = phoneOverrides?.[brand.slug] ?? null;
  const footerOverride = footerOverrides?.[brand.slug] ?? null;

  return (
    <SiteShell
      brand={brand}
      phoneOverride={phoneOverride}
      footerOverride={footerOverride}
      footerCategoryLinksByBrand={footerCategoryLinksByBrand}
    >
      {children}
    </SiteShell>
  );
}

export function SiteLayoutBrand({
  serverBrand,
  phoneOverrides,
  footerOverrides,
  footerCategoryLinksByBrand,
  children,
}: {
  serverBrand: Brand;
  phoneOverrides?: Record<string, string | null>;
  footerOverrides?: Record<string, FooterOverride | null>;
  footerCategoryLinksByBrand?: Partial<
    Record<BrandSlug, readonly FooterCategoryLink[]>
  >;
  children: ReactNode;
}) {
  const serverPhoneOverride = phoneOverrides?.[serverBrand.slug] ?? null;
  const serverFooterOverride = footerOverrides?.[serverBrand.slug] ?? null;
  return (
    <Suspense
      fallback={
        <SiteShell
          brand={serverBrand}
          phoneOverride={serverPhoneOverride}
          footerOverride={serverFooterOverride}
          footerCategoryLinksByBrand={footerCategoryLinksByBrand}
        >
          {children}
        </SiteShell>
      }
    >
      <SiteShellWithUrlSearchParams
        serverBrand={serverBrand}
        phoneOverrides={phoneOverrides}
        footerOverrides={footerOverrides}
        footerCategoryLinksByBrand={footerCategoryLinksByBrand}
      >
        {children}
      </SiteShellWithUrlSearchParams>
    </Suspense>
  );
}
