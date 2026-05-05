import {
  Pill,
  BarChart3,
  Users,
  ShoppingCart,
  FileText,
  Store,
  Package,
  Shield,
  Bell,
} from "lucide-react";
import "./features.css";

const features = [
  {
    icon: Pill,
    title: "Medicine database",
    desc: "Admin-managed global medicine database with categories, types, units, and supplier info.",
  },
  {
    icon: Package,
    title: "Inventory management",
    desc: "Track stock levels per pharmacy, set minimum stock alerts, manage expiry dates.",
  },
  {
    icon: ShoppingCart,
    title: "Purchase management",
    desc: "Record purchases from suppliers, track payments, and update stock automatically.",
  },
  {
    icon: FileText,
    title: "Invoice & sales",
    desc: "Create invoices, apply discounts and VAT, track payments and outstanding dues.",
  },
  {
    icon: BarChart3,
    title: "Reports & analytics",
    desc: "Visual sales reports, purchase summaries, stock movement, and revenue analytics.",
  },
  {
    icon: Users,
    title: "Staff management",
    desc: "Add and manage pharmacy staff with role-based access to dashboard features.",
  },
  {
    icon: Store,
    title: "Pharmacy registration",
    desc: "Pharmacy owners register with full profile. Admin reviews and approves before access.",
  },
  {
    icon: Shield,
    title: "Role-based access",
    desc: "Admin, Pharmacy, Staff, and User roles with scoped permissions throughout.",
  },
  {
    icon: Bell,
    title: "Low stock alerts",
    desc: "Get notified when pharmacy stock falls below the configured minimum level.",
  },
];

export function Features() {
  return (
    <section className="features">
      <div className="features-inner">
        <div className="section-header">
          <span className="section-label">What we offer</span>
          <h2 className="section-heading">
            Everything your pharmacy needs
          </h2>
          <p className="section-subtext">
            From medicine inventory to sales invoices — MediTrack covers every
            part of pharmacy operations.
          </p>
        </div>

        <div className="features-grid">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="feature-card">
                <div className="feature-card-icon">
                  <Icon size={20} />
                </div>
                <h3 className="feature-card-title">{f.title}</h3>
                <p className="feature-card-desc">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}