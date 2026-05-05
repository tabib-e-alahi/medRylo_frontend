"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import styles from "./dashboard.module.css";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  user?: { name?: string | null; email?: string; image?: string | null; role?: string };
}

export function MobileSidebar({ open, onClose, user }: MobileSidebarProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`${styles.overlay} ${open ? styles.visible : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar drawer */}
      <aside
        className={`${styles.mobileSidebar} ${open ? styles.open : ""}`}
        aria-label="Navigation"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close menu"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 1,
            width: "30px",
            height: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "var(--color-bg-secondary)",
            color: "var(--color-text-muted)",
            cursor: "pointer",
          }}
        >
          <X size={16} />
        </button>

        <DashboardSidebar user={user} onNavClick={onClose} />
      </aside>
    </>
  );
}
