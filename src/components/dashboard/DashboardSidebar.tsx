"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pill } from "lucide-react";
import { getNavForRole, getRoleLabel, type UserRole } from "./nav-items";
import styles from "./dashboard.module.css";

interface DashboardSidebarProps {
  user?: { name?: string | null; email?: string; image?: string | null; role?: string };
  onNavClick?: () => void;
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DashboardSidebar({ user, onNavClick }: DashboardSidebarProps) {
  const pathname = usePathname();
  const role = user?.role as UserRole | undefined;
  const navGroups = getNavForRole(role);

  return (
    <>
      {/* Logo */}
      <Link href="/" className={styles.sidebarLogo}>
        <span className={styles.logoIcon}>
          <Pill size={18} />
        </span>
        <span className={styles.logoText}>
          Medi<strong>Rylo</strong>
        </span>
      </Link>

      {/* Navigation */}
      <nav className={styles.sidebarNav}>
        {navGroups.map((group, gi) => (
          <div key={gi} className={styles.navGroup}>
            {group.label && (
              <div className={styles.navGroupLabel}>{group.label}</div>
            )}
            {group.items.map((item) => {
              const isActive =
                item.href === pathname ||
                (item.href !== "/" &&
                  item.href.split("?")[0] !== undefined &&
                  pathname.startsWith(item.href.split("?")[0]!) &&
                  // Avoid /admin matching /admin/medicines etc for Overview
                  (item.href === pathname || (pathname !== item.href && !navGroups.flatMap(g => g.items).some(i => i.href === pathname && i.href.startsWith(item.href) && i.href !== item.href))));

              // Simpler active check: exact or sub-path
              const active = pathname === item.href || (pathname.startsWith(item.href + "/") && item.href.split("/").length > 2);

              return (
                <Link
                  key={item.href}
                  href={item.disabled ? "#" : item.href}
                  className={`${styles.navItem} ${active ? styles.active : ""} ${item.disabled ? styles.disabled : ""}`}
                  onClick={onNavClick}
                >
                  <item.icon className={styles.navIcon} size={18} />
                  <span className={styles.navLabel}>{item.label}</span>
                  {item.badge && (
                    <span className={styles.navBadge}>{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className={styles.sidebarFooter}>
        <div className={styles.sidebarUser}>
          <div className={styles.avatar}>
            {user?.image ? (
              <img src={user.image} alt={user.name ?? "User"} />
            ) : (
              getInitials(user?.name)
            )}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>
              {user?.name ?? "Loading…"}
            </div>
            <div className={styles.userRole}>
              {getRoleLabel(role)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
