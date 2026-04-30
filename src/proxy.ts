import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const UNAUTHORIZED = new Response("Unauthorized", {
  status: 401,
  headers: { "WWW-Authenticate": 'Basic realm="Dashboard"' },
});

export function proxy(request: NextRequest) {
  const expectedUser = process.env.DASHBOARD_USER;
  const expectedPassword = process.env.DASHBOARD_PASSWORD;

  // If credentials are not configured, deny access rather than open it up.
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
