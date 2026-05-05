"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { MobileSidebar } from "@/components/dashboard/MobileSidebar";
import styles from "@/components/dashboard/dashboard.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user
    ? {
        name:  session.user.name,
        email: session.user.email,
        image: session.user.image,
        role:  (session.user as any)?.role as string | undefined,
      }
    : undefined;

  return (
    <div className={styles.shell}>
      {/* Desktop sidebar — fixed, hidden on mobile via CSS */}
      <aside className={styles.sidebar}>
        <DashboardSidebar user={user} />
      </aside>

      {/* Mobile sidebar drawer */}
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
      />

      {/* Main area: navbar + content */}
      <div className={styles.main}>
        <DashboardNavbar
          user={user}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
