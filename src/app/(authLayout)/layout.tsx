import { Pill, ShieldCheck, Package, BarChart3 } from "lucide-react";
import styles from "@/features/auth/auth.module.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.authLayout}>
      {/* Left branding panel — hidden on mobile */}
      <div className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <div className={styles.brandLogo}>
            <span className={styles.brandLogoIcon}>
              <Pill size={24} />
            </span>
            <span className={styles.brandLogoText}>
              Medi<strong>Track</strong>
            </span>
          </div>

          <h1 className={styles.brandTagline}>
            Smart Pharmacy Management Platform
          </h1>
          <p className={styles.brandDescription}>
            Organize medicines, track inventory, manage sales, handle purchases,
            and control daily operations — all from one powerful system.
          </p>

          <div className={styles.brandFeatures}>
            <div className={styles.brandFeature}>
              <span className={styles.brandFeatureIcon}>
                <Package size={14} />
              </span>
              Real-time inventory tracking
            </div>
            <div className={styles.brandFeature}>
              <span className={styles.brandFeatureIcon}>
                <ShieldCheck size={14} />
              </span>
              Role-based access control
            </div>
            <div className={styles.brandFeature}>
              <span className={styles.brandFeatureIcon}>
                <BarChart3 size={14} />
              </span>
              Analytics &amp; reporting dashboard
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>{children}</div>
      </div>
    </div>
  );
}
