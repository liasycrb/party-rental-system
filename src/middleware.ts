import { type NextRequest } from "next/server";
import { resolveBrandFromHost } from "@/lib/brand/resolve-brand";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const brand = resolveBrandFromHost(host);

  const forwardHeaders = new Headers(request.headers);
  forwardHeaders.set("x-brand-slug", brand.slug);
  forwardHeaders.set("x-url-host", host ?? "");

  return updateSupabaseSession(request, forwardHeaders);
}

export const config = {
  matcher: [
    /*
     * Run on all paths except static assets and Next internals.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
