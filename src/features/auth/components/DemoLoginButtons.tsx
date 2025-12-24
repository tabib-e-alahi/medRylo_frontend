"use client";

import { useState } from "react";
import { Shield, Store, Users, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { getRoleRedirectPath } from "../hooks/use-auth";
import styles from "../auth.module.css";
import { signIn } from "@/lib/auth-client";

const DEMO_ROLES = [
  {
    key: "admin",
    label: "Demo Admin",
    icon: Shield,
    email: process.env.NEXT_PUBLIC_ADMIN_Email as string,
    password: process.env.NEXT_PUBLIC_ADMIN_Password as string,
    role: "ADMIN"
  },
  {
    key: "pharmacy",
    label: "Demo Pharmacy",
    icon: Store,
    email: process.env.NEXT_PUBLIC_PHARMACY_Email as string,
    password: process.env.NEXT_PUBLIC_PHARMACY_Password as string,
    role: "PHARMACY",
  },
  {
    key: "staff",
    label: "Demo Staff",
    icon: Users,
    email: process.env.NEXT_PUBLIC_STAFF_Email as string,
    password: process.env.NEXT_PUBLIC_STAFF_Password as string,
    role: "STAFF",
  },
  {
    key: "user",
    label: "Demo User",
    icon: User,
    email: process.env.NEXT_PUBLIC_USER_Email as string,
    password: process.env.NEXT_PUBLIC_USER_Password as string,
    role: "USER",
  },
] as const;

export function DemoLoginButtons() {
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [loggedInRole, setLoggedInRole] = useState<string | null>(null);

  async function handleDemoLogin(key: string, email:string, password: string, role: string) {
    setLoadingRole(key);
    try {
      const res = await signIn.email({
        email,
        password,
      });
      if (res.error) {
        toast.error("Demo login failed", {
          description: res.error.message || "Please try again.",
        });
        return;
      }
      toast.success(`Signed in as ${role}`, {
        description: "Click 'Go to Dashboard' to continue.",
      });
      setLoggedInRole(role);
    } catch (err: any) {
      toast.error("Demo login failed", {
        description: err?.response?.data?.message || "Please try again.",
      });
    } finally {
      setLoadingRole(null);
    }
  }

  if (loggedInRole) {
    return (
      <div className={styles.demoSection}>
        <p className={styles.demoLabel}>
          Signed in as <strong>{loggedInRole}</strong>
        </p>
        <Link
          href={getRoleRedirectPath(loggedInRole)}
          className={styles.submitBtn}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", textDecoration: "none", marginTop: "0.5rem" }}
        >
          Go to Dashboard
          <ArrowRight size={16} />
        </Link>
        <button
          type="button"
          className={styles.demoBtn}
          style={{ width: "100%", marginTop: "0.5rem", justifyContent: "center" }}
          onClick={() => setLoggedInRole(null)}
        >
          Switch role
        </button>
      </div>
    );
  }

  return (
    <div className={styles.demoSection}>
      <p className={styles.demoLabel}>Quick demo access</p>
      <div className={styles.demoGrid}>
        {DEMO_ROLES.map(({ key, label, icon: Icon, role, email, password }) => (
          <button
            key={key}
            id={`demo-login-${key}`}
            type="button"
            className={styles.demoBtn}
            onClick={() => handleDemoLogin(key, email!, password!, role)}
            disabled={loadingRole !== null}
          >
            {loadingRole === key ? (
              <span className={`${styles.spinner} ${styles.spinnerDark}`} />
            ) : (
              <>
                <Icon size={14} />
                {label}
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
