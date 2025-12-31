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

const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN ||
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
  "http://localhost:5000";


function getSessionToken(request: NextRequest) {
  return (
    request.cookies.get("session_token")?.value ||
    request.cookies.get("__Secure-session_token")?.value ||
    request.cookies.get("better-auth.session_data")?.value ||
    request.cookies.get("__Secure-better-auth.session_data")?.value ||
    null
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionToken = getSessionToken(request);
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  if (isAuthPage) {
    if (sessionToken) {
      const userData = await fetchUserRole(request);

      if (userData?.role) {
        const redirectPath =
          ROLE_DASHBOARD_MAP[userData.role] || "/user/dashboard";
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }

    return NextResponse.next();
  }

  const matchedPrefix = Object.keys(ROLE_ROUTE_MAP).find((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!matchedPrefix) {
    return NextResponse.next();
  }

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  const userData = await fetchUserRole(request);

  if (!userData?.role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);

    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("session_token");
    response.cookies.delete("__Secure-session_token");
    response.cookies.delete("better-auth.session_data");
    response.cookies.delete("__Secure-better-auth.session_data");
    
    return response;
  }

  const requiredRole = ROLE_ROUTE_MAP[matchedPrefix];

  if (requiredRole && userData.role !== requiredRole) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

async function fetchUserRole(
  request: NextRequest
): Promise<{ role: string } | null> {
  try {
    const cookie = request.headers.get("cookie") || "";

    const res = await fetch(`${BACKEND_ORIGIN}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        cookie,
        accept: "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const json = await res.json();

    const role = json?.data?.user?.role;

    return role ? { role } : null;
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