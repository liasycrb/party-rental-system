import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { slugFromHost } from "@/lib/brand/resolve-brand";

const UNAUTHORIZED = new Response("Unauthorized", {
  status: 401,
  headers: { "WWW-Authenticate": 'Basic realm="Dashboard"' },
});

function resolveDashboardBasicAuthCredentials(): {
  expectedUser: string | undefined;
  expectedPassword: string | undefined;
} {
  const isDev = process.env.NODE_ENV === "development";
  const expectedUser =
    process.env.DASHBOARD_AUTH_USER ??
    process.env.DASHBOARD_USER ??
    (isDev ? "admin" : undefined);
  const expectedPassword =
    process.env.DASHBOARD_AUTH_PASSWORD ??
    process.env.DASHBOARD_PASSWORD ??
    (isDev ? "1234" : undefined);
  return { expectedUser, expectedPassword };
}

function isLocalLoopbackHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  );
}

function nextWithBrandHeader(request: NextRequest): NextResponse {
  const slug = slugFromHost(request.headers.get("host"));
  if (!slug) {
    return NextResponse.next();
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-brand-slug", slug);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

function handleDashboard(request: NextRequest): NextResponse | Response {
  // Local `next dev` only — preview/production stay behind Basic Auth.
  if (
    process.env.NODE_ENV === "development" &&
    isLocalLoopbackHostname(request.nextUrl.hostname)
  ) {
    return NextResponse.next();
  }

  const { expectedUser, expectedPassword } = resolveDashboardBasicAuthCredentials();

  // Production: credentials must come from env. Dev: fallback admin / 1234.
  if (!expectedUser || !expectedPassword) {
    return UNAUTHORIZED;
  }

  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return UNAUTHORIZED;
  }

  const base64 = authHeader.slice("Basic ".length);
  const decoded = Buffer.from(base64, "base64").toString("utf-8");
  const colonIdx = decoded.indexOf(":");
  if (colonIdx === -1) return UNAUTHORIZED;

  const user = decoded.slice(0, colonIdx);
  const password = decoded.slice(colonIdx + 1);

  if (user !== expectedUser || password !== expectedPassword) {
    return UNAUTHORIZED;
  }

  return NextResponse.next();
}

export function proxy(request: NextRequest) {
  // Dashboard keeps Basic Auth + the existing `?brand=` switcher (no host override).
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    return handleDashboard(request);
  }
  // Public site: inject `x-brand-slug` from the request hostname so that
  // crbjumpers.com → "crb" and liaspartyrentals.com → "lias" without `?brand=`.
  return nextWithBrandHeader(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
