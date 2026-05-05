"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getRoleRedirectPath } from "@/features/auth/hooks/use-auth";
import styles from "@/features/auth/auth.module.css";

/**
 * OAuth callback page — Better Auth redirects here after social login.
 * We wait for the session to load, then redirect by role.
 */
export default function AuthCallbackPage() {
  const { isLoading, isAuthenticated, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace(getRoleRedirectPath(role));
      } else {
        router.replace("/login");
      }
    }
  }, [isLoading, isAuthenticated, role, router]);

  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingSpinner} />
    </div>
  );
}
