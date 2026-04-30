import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export function proxy(request: NextRequest) {
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

export const config = {
  matcher: ["/dashboard/:path*"],
};
