"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { UserRole } from "../services/auth.service";

/** Typed user object returned by useAuth */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  role?: UserRole;
  status?: string;
  phone?: string | null;
}

/** Map a user role to its dashboard path */
export function getRoleRedirectPath(role: string | undefined): string {
  switch (role) {
    case "ADMIN":    return "/admin/dashboard";
    case "PHARMACY": return "/pharmacy/dashboard";
    case "STAFF":    return "/staff/dashboard";
    case "USER":     return "/user/dashboard";
    default:         return "/user/dashboard";
  }
}

/**
 * Core auth hook — wraps Better Auth's useSession and exposes typed fields.
 */
export function useAuth() {
  const { data: session, isPending, error } = useSession();

  // Cast to our typed interface that includes Better Auth additional fields
  const rawUser = session?.user
    ? (session.user as unknown as AuthUser)
    : undefined;

  return {
    user: rawUser,
    session: session?.session,
    isLoading: isPending,
    isAuthenticated: !!rawUser,
    role: (rawUser as any)?.role as UserRole | undefined,
    error,
  };
}

/**
 * Redirect authenticated users away from guest-only pages (login, register).
 * Shows loading while session resolves — prevents flash redirects.
 */
export function useRequireGuest() {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(getRoleRedirectPath(role));
    }
  }, [isAuthenticated, isLoading, role, router]);

  return { isLoading, isAuthenticated };
}

export function useRequireAuth(allowedRoles?: UserRole[]) {
  const { isAuthenticated, isLoading, role, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Never act while session is still loading
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Only enforce role restriction once we actually have a role
    if (allowedRoles && allowedRoles.length > 0) {
      if (!role) return;
      if (!allowedRoles.includes(role)) {
        router.replace("/unauthorized");
      }
    }
  }, [isAuthenticated, isLoading, role, router]);
  // NOTE: intentionally omit `allowedRoles` from deps (static per page)

  return { isLoading, isAuthenticated, user, role };
}
