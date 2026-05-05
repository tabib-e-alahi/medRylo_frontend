import { NextRequest, NextResponse } from "next/server";

const AUTH_PAGES = ["/login", "/register"];

const ROLE_ROUTE_MAP: Record<string, string> = {
  "/admin": "ADMIN",
  "/pharmacy": "PHARMACY",
  "/staff": "STAFF",
  "/user": "USER",
};

const ROLE_DASHBOARD_MAP: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  PHARMACY: "/pharmacy/dashboard",
  STAFF: "/staff/dashboard",
  USER: "/user/dashboard",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("session_token")?.value;
  // ── Guest-only pages (login, register) ──────────────────
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (isAuthPage) {
    if (sessionToken) {
      // User has a session cookie — try to get their role for redirect
      const userData = await fetchUserRole(request);
      console.log(userData);
      if (userData) {
        const redirectPath = ROLE_DASHBOARD_MAP[userData.role] || "/user/dashboard";
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }
    // No session or invalid — allow access to auth pages
    return NextResponse.next();
  }

  // ── Protected dashboard routes ──────────────────────────
  const matchedPrefix = Object.keys(ROLE_ROUTE_MAP).find((prefix) =>
    pathname.startsWith(prefix)
  );

  if (matchedPrefix) {
    if (!sessionToken) {
      // No session cookie — redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Validate session and check role
    const userData = await fetchUserRole(request);
    if (!userData) {
      // Invalid session — redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      const response = NextResponse.redirect(loginUrl);
      // Clear stale cookie
      response.cookies.delete("session_token");
      return response;
    }

    const requiredRole = ROLE_ROUTE_MAP[matchedPrefix];
    if (requiredRole && userData.role !== requiredRole) {
      // Wrong role — redirect to unauthorized
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
  }

  // ── All other routes — pass through ────────────────────
  return NextResponse.next();
}

/**
 * Fetch user role from the backend /api/v1/auth/me endpoint.
 * Returns { role } or null if unauthenticated.
 */
async function fetchUserRole(
  request: NextRequest
): Promise<{ role: string } | null> {
  try {
    // Use the backend URL through the rewrite proxy
    const baseUrl = request.nextUrl.origin;
    const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
      cache: "no-store",
    });
    console.log("From fetch user role", res);
    if (!res.ok) return null;

    const json = await res.json();
    console.log("From fetch user role", json);
    return json?.data?.user ? { role: json.data.user.role } : null;
  } catch {
    return null;
  }
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/admin/:path*",
    "/pharmacy/:path*",
    "/staff/:path*",
    "/user/:path*",
  ],
};
