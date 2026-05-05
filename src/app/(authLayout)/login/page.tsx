"use client";

import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButtons";
import { DemoLoginButtons } from "@/features/auth/components/DemoLoginButtons";
import { useRequireGuest } from "@/features/auth/hooks/use-auth";
import styles from "@/features/auth/auth.module.css";

export default function LoginPage() {
  const { isLoading, isAuthenticated } = useRequireGuest();

  if (isLoading || isAuthenticated) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  return (
    <>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Welcome back</h2>
        <p className={styles.formSubtitle}>
          Sign in to your MedRylo account to continue
        </p>
      </div>

      <div className={styles.formCard}>
        <LoginForm />

        <div className={styles.divider}>or continue with</div>

        <SocialLoginButtons />

        <DemoLoginButtons />
      </div>

      <p className={styles.formFooter}>
        Don&apos;t have an account?{" "}
        <Link href="/register">Create one</Link>
      </p>
    </>
  );
}
