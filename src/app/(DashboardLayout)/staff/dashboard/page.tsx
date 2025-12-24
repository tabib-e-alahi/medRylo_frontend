"use client";

import Link from "next/link";
import { CreditCard, FileText, Package, Users } from "lucide-react";
import { useRequireAuth } from "@/features/auth/hooks/use-auth";
import { useMyStaffProfile } from "@/features/staff/hooks";
import { usePharmacyOverviewAnalytics } from "@/features/analytics/hooks";
import styles from "@/components/dashboard/dashboard.module.css";

export default function StaffDashboardPage() {
  const { isLoading: authLoading } = useRequireAuth(["STAFF"]);
  const { data: profileData, isLoading: profileLoading } = useMyStaffProfile();
  const { data: overviewData, isLoading: overviewLoading } = usePharmacyOverviewAnalytics({});
  const staff = profileData?.data;
  const totals = overviewData?.data?.totals ?? {};

  if (authLoading || profileLoading || overviewLoading) {
    return (
      <div className={styles.loadingShell}>
        <div className={styles.skeletonBar} style={{ width: "18rem", height: "2rem" }} />
        <div className={styles.skeletonBar} style={{ height: "7rem" }} />
        <div className={styles.skeletonBar} style={{ height: "12rem" }} />
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageHeaderTitle}>Staff Dashboard</h1>
        <p className={styles.pageHeaderSubtitle}>
          Assigned pharmacy: <strong>{staff?.pharmacy?.name || "—"}</strong>
        </p>
      </div>

      <div className={styles.statGrid}>
        {staff?.canManageInventory && (
          <div className={styles.statCard}>
            <div className={styles.statIconWrap} style={{ background: "var(--color-primary-50)" }}>
              <Package size={20} color="var(--color-primary)" />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>Inventory Items</div>
              <div className={styles.statValue}>{totals.inventoryItems ?? 0}</div>
            </div>
          </div>
        )}
        {staff?.canManageCustomers && (
          <div className={styles.statCard}>
            <div className={styles.statIconWrap} style={{ background: "var(--color-warning-bg)" }}>
              <Users size={20} color="var(--color-warning)" />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>Customers</div>
              <div className={styles.statValue}>{totals.customers ?? 0}</div>
            </div>
          </div>
        )}
        {staff?.canManageSales && (
          <div className={styles.statCard}>
            <div className={styles.statIconWrap} style={{ background: "var(--color-info-bg)" }}>
              <FileText size={20} color="var(--color-info)" />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>Invoices</div>
              <div className={styles.statValue}>{totals.invoices ?? 0}</div>
            </div>
          </div>
        )}
        {staff?.canManageSales && (
          <div className={styles.statCard}>
            <div className={styles.statIconWrap} style={{ background: "var(--color-success-bg)" }}>
              <CreditCard size={20} color="var(--color-success)" />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>Collected</div>
              <div className={styles.statValue}>${Number(totals.collectedAmount || 0).toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Quick Actions</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.75rem" }}>
          {staff?.canManageInventory && (
            <Link href="/staff/inventory" className="btn-theme-outline flex items-center gap-1 font-medium">
              <Package size={16} /> Manage Inventory
            </Link>
          )}
          {staff?.canManageCustomers && (
            <Link href="/staff/customers" className="btn-theme-outline flex items-center gap-1 font-medium">
              <Users size={16} /> Manage Customers
            </Link>
          )}
          {staff?.canManageSales && (
            <Link href="/staff/invoices/create" className="btn-theme-primary flex items-center gap-1 font-medium">
              <FileText size={16} /> Create Invoice
            </Link>
          )}
          {staff?.canManageSales && (
            <Link href="/staff/invoices" className="btn-theme-outline flex items-center gap-1 font-medium">
              <FileText size={16} /> View Invoices
            </Link>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Your Permissions</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {[
            { key: "canManageInventory", label: "Inventory", bg: "var(--color-primary-50)", color: "var(--color-primary)" },
            { key: "canManageSales", label: "Sales & Payments", bg: "var(--color-info-bg)", color: "var(--color-info)" },
            { key: "canManageCustomers", label: "Customers", bg: "var(--color-warning-bg)", color: "var(--color-warning)" },
            { key: "canViewReports", label: "Reports", bg: "var(--color-success-bg)", color: "var(--color-success)" },
            { key: "canManagePurchases", label: "Purchases", bg: "var(--color-bg-secondary)", color: "var(--color-text-muted)" },
          ].map(({ key, label, bg, color }) =>
            staff?.[key as keyof typeof staff] ? (
              <span key={key} className="badge" style={{ background: bg, color }}>
                {label}
              </span>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}