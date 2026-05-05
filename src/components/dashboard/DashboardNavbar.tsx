"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { getRoleLabel, type UserRole } from "./nav-items";
import { getNavForRole } from "./nav-items";
import styles from "./dashboard.module.css";
import { ThemeToggle } from "../shared/ThemeToggle/ThemeToggle";

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function getPageTitle(pathname: string, role?: UserRole): string {
  const navGroups = getNavForRole(role);
  const allItems = navGroups.flatMap((g) => g.items);
  const match = allItems.find(
    (item) =>
      item.href === pathname ||
      (pathname.startsWith(item.href + "/") && item.href.split("/").length > 2)
  );
  return match?.label ?? "Dashboard";
}

interface DashboardNavbarProps {
  user?: { name?: string | null; email?: string | null; image?: string | null; role?: string };
  onMenuClick: () => void;
}

export function DashboardNavbar({ user, onMenuClick }: DashboardNavbarProps) {
  const pathname = usePathname();
  const role = user?.role as UserRole | undefined;
  const pageTitle = getPageTitle(pathname, role);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleSignOut() {
    await signOut();
    window.location.href = "/";
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.navbarLeft}>
        {/* Mobile hamburger */}
        <button
          className={styles.hamburger}
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <span className={styles.pageTitle}>{pageTitle}</span>
      </div>

      <div className={styles.navbarRight}>
        {/* Profile dropdown */}
        <ThemeToggle></ThemeToggle>
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            className={styles.profileTrigger}
            onClick={() => setDropdownOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <div className={`${styles.avatar}`}>
              {user?.image ? (
                <img src={user.image} alt={user.name ?? "User"} />
              ) : (
                getInitials(user?.name)
              )}
            </div>
            <span className={styles.profileName}>{user?.name ?? "…"}</span>
            <ChevronDown
              size={14}
              style={{
                color: "var(--color-text-faint)",
                transition: "transform var(--transition)",
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: "220px",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-lg)",
                overflow: "hidden",
                zIndex: 60,
                animation: "fadeIn 150ms ease",
              }}
            >
              {/* User info header */}
              <div
                style={{
                  padding: "0.875rem 1rem",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text)" }}>
                  {user?.name ?? "Loading…"}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--color-text-faint)", marginTop: "2px" }}>
                  {user?.email ?? ""}
                </div>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "6px",
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    background: "var(--color-primary-50)",
                    color: "var(--color-primary)",
                  }}
                >
                  {getRoleLabel(role)}
                </span>
              </div>

              {/* Menu items */}
              {[
                { icon: User,     label: "Profile",  href: `/${role?.toLowerCase() ?? "user"}/profile` },
                { icon: Settings, label: "Settings", href: `/${role?.toLowerCase() ?? "user"}/settings` },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "0.625rem 1rem",
                    fontSize: "0.875rem",
                    color: "var(--color-text-muted)",
                    textDecoration: "none",
                    transition: "background var(--transition), color var(--transition)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--color-bg-secondary)";
                    (e.currentTarget as HTMLElement).style.color = "var(--color-text)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "";
                    (e.currentTarget as HTMLElement).style.color = "";
                  }}
                >
                  <Icon size={16} />
                  {label}
                </a>
              ))}

              <div style={{ borderTop: "1px solid var(--color-border)" }}>
                <button
                  onClick={handleSignOut}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "0.625rem 1rem",
                    width: "100%",
                    fontSize: "0.875rem",
                    color: "var(--color-danger)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    transition: "background var(--transition)",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--color-danger-bg)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "";
                  }}
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
