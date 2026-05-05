"use client";

import { useRequireAuth, type AuthUser } from "@/features/auth/hooks/use-auth";
import {
  Pill, Bookmark, ShoppingBag, Bell, Info,
} from "lucide-react";
import styles from "@/components/dashboard/dashboard.module.css";

export default function UserDashboardPage() {
  const { isLoading, user } = useRequireAuth(["USER"]);

  if (isLoading) {
    return (
      <div className={styles.loadingShell}>
        {[70, 50, 80].map((w, i) => (
          <div key={i} className={styles.skeletonBar} style={{ width: `${w}%` }} />
        ))}
        <div className={styles.statGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.skeletonBar} style={{ width: "44px", height: "44px", borderRadius: "var(--radius-md)" }} />
              <div style={{ flex: 1 }}>
                <div className={styles.skeletonBar} style={{ width: "60%", marginBottom: "8px" }} />
                <div className={styles.skeletonBar} style={{ width: "40%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] ?? "there";

  const stats = [
    {
      icon: ShoppingBag,
      label: "My Orders",
      value: "—",
      delta: "Total orders placed",
      color: "var(--color-primary)",
      bg: "var(--color-primary-50)",
    },
    {
      icon: Bookmark,
      label: "Saved Medicines",
      value: "—",
      delta: "In your saved list",
      color: "var(--color-warning)",
      bg: "var(--color-warning-bg)",
    },
    {
      icon: Bell,
      label: "Notifications",
      value: "—",
      delta: "Unread alerts",
      color: "var(--color-info)",
      bg: "var(--color-info-bg)",
    },
  ];

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageHeaderTitle}>
          Hi, {firstName} 👋
        </h1>
        <p className={styles.pageHeaderSubtitle}>
          Browse medicines and manage your personal health records.
        </p>
      </div>

      <div className={styles.statGrid}>
        {stats.map(({ icon: Icon, label, value, delta, color, bg }) => (
          <div key={label} className={styles.statCard}>
            <div className={styles.statIconWrap} style={{ background: bg }}>
              <Icon size={22} color={color} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>{label}</div>
              <div className={styles.statValue}>{value}</div>
              <div className={styles.statDelta} style={{ color: "var(--color-text-faint)" }}>
                {delta}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* What you can do */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Explore MediTrack</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[
            {
              icon: Pill,
              title: "Browse Medicines",
              desc: "Search and filter our full medicine catalogue with real-time availability.",
            },
            {
              icon: Bookmark,
              title: "Save Medicines",
              desc: "Bookmark medicines you need regularly for quick access later.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "0.875rem",
                background: "var(--color-bg-secondary)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-primary-50)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                <Icon size={16} color="var(--color-primary)" />
              </div>
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "2px" }}>
                  {title}
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                  {desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account info */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Your Account</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {[
            { label: "Name",   value: user?.name ?? "—" },
            { label: "Email",  value: (user as AuthUser)?.email ?? "—" },
            { label: "Role",   value: "User" },
            { label: "Member since", value: user?.createdAt ? new Date(user.createdAt as string).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: "0.72rem", color: "var(--color-text-faint)", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label}
              </div>
              <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text)" }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "0.875rem 1rem",
          background: "var(--color-primary-50)",
          border: "1px solid var(--color-primary-100)",
          borderRadius: "var(--radius-lg)",
          fontSize: "0.875rem",
          color: "var(--color-primary)",
        }}
      >
        <Info size={16} />
        Medicine browsing, orders, and saved items are coming in upcoming phases.
      </div>
    </div>
  );
}
