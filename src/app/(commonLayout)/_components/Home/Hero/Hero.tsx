import Link from "next/link";
import { ArrowRight, Search, TrendingUp, ShieldCheck } from "lucide-react";
import "./hero.css";

const medicines = [
  { name: "Paracetamol 500mg", stock: "248 units", icon: "Pa" },
  { name: "Amoxicillin 250mg", stock: "134 units", icon: "Am" },
  { name: "Omeprazole 20mg", stock: "89 units", icon: "Om" },
];

const avatarInitials = ["RA", "SK", "MH", "TI"];

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg-dots" />
      <div className="hero-bg-gradient" />

      <div className="hero-inner">
        {/* Text side */}
        <div  className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Trusted by 500+ pharmacies
          </div>

          <h1 className="hero-heading">
            Smarter pharmacy
            <br />
            management,{" "}
            <span className="hero-heading-accent">all in one place</span>
          </h1>

          <p className="hero-subtext">
            MediTrack helps pharmacies manage medicines, inventory, suppliers,
            staff, and sales — from a single streamlined dashboard.
          </p>

          <div className="hero-actions">
            <Link href="/register?type=pharmacy" className="hero-btn-primary">
              Register your pharmacy
              <ArrowRight size={16} />
            </Link>
            <Link href="/medicines" className="hero-btn-secondary">
              <Search size={16} />
              Browse medicines
            </Link>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-avatars">
              {avatarInitials.map((init) => (
                <div key={init} className="hero-trust-avatar">
                  {init}
                </div>
              ))}
            </div>
            <p className="hero-trust-text">
              <strong>500+ pharmacies</strong> already managing
              <br />
              their operations with MediTrack
            </p>
          </div>
        </div>

        {/* Visual side */}
        <div className="hero-visual">
          <div className="hero-card-stack">
            {/* Main inventory card */}
            <div className="hero-card-main">
              <p className="hero-card-label">Live inventory</p>
              {medicines.map((med) => (
                <div key={med.name} className="hero-card-med-row">
                  <div className="hero-card-med-icon">{med.icon}</div>
                  <span className="hero-card-med-name">{med.name}</span>
                  <span className="hero-card-med-stock">{med.stock}</span>
                </div>
              ))}
              <div className="hero-card-footer">
                <span className="hero-card-footer-label">Total items</span>
                <span className="hero-card-footer-value">1,247</span>
              </div>
            </div>

            {/* Floating card 1 */}
            <div className="hero-float-card hero-float-card-1">
              <div className="hero-float-icon green">
                <TrendingUp size={14} />
              </div>
              <div>
                <p className="hero-float-card-title">Sales today</p>
                <p className="hero-float-card-sub">৳ 18,430</p>
              </div>
            </div>

            {/* Floating card 2 */}
            <div className="hero-float-card hero-float-card-2">
              <div className="hero-float-icon blue">
                <ShieldCheck size={14} />
              </div>
              <div>
                <p className="hero-float-card-title">Approved</p>
                <p className="hero-float-card-sub">Pharmacy verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}