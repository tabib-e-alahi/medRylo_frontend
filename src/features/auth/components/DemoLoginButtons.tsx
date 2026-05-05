"use client";

import { useState } from "react";
import { Shield, Store, Users, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { demoLogin } from "../services/auth.service";
import { getRoleRedirectPath } from "../hooks/use-auth";
import styles from "../auth.module.css";

const DEMO_ROLES = [
  { key: "admin",    label: "Demo Admin",    icon: Shield, role: "ADMIN"    },
  { key: "pharmacy", label: "Demo Pharmacy", icon: Store,  role: "PHARMACY" },
  { key: "staff",    label: "Demo Staff",    icon: Users,  role: "STAFF"    },
  { key: "user",     label: "Demo User",     icon: User,   role: "USER"     },
] as const;

export function DemoLoginButtons() {
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [loggedInRole, setLoggedInRole] = useState<string | null>(null);

  async function handleDemoLogin(key: string, role: string) {
    setLoadingRole(key);
    try {
      const res = await demoLogin(key);
      toast.success(res.message || `Signed in as ${role}`, {
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
        <a
          href={getRoleRedirectPath(loggedInRole)}
          className={styles.submitBtn}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", textDecoration: "none", marginTop: "0.5rem" }}
        >
          Go to Dashboard
          <ArrowRight size={16} />
        </a>
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
        {DEMO_ROLES.map(({ key, label, icon: Icon, role }) => (
          <button
            key={key}
            id={`demo-login-${key}`}
            type="button"
            className={styles.demoBtn}
            onClick={() => handleDemoLogin(key, role)}
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
