"use client";

import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButtons";
import { useRequireGuest } from "@/features/auth/hooks/use-auth";
import styles from "@/features/auth/auth.module.css";

export default function RegisterPage() {
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
        <h2 className={styles.formTitle}>Create your account</h2>
        <p className={styles.formSubtitle}>
          Join MedRylo and start managing your pharmacy today
        </p>
      </div>

      <div className={styles.formCard}>
        <RegisterForm />

        <div className={styles.divider}>or sign up with</div>

        <SocialLoginButtons />
      </div>

      <p className={styles.formFooter}>
        Already have an account?{" "}
        <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}
