import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import "./pharmacy-cta.css";

const perks = [
  "Free to register",
  "Admin approval within 24 hrs",
  "Full dashboard access",
  "No setup fees",
];

export function PharmacyCTA() {
  return (
    <section className="pharmacy-cta">
      <div className="pharmacy-cta-decor-1" />
      <div className="pharmacy-cta-decor-2" />

      <div className="pharmacy-cta-inner">
        <span className="pharmacy-cta-badge">For pharmacy owners</span>

        <h2 className="pharmacy-cta-heading">
          Ready to modernize your pharmacy?
        </h2>

        <p className="pharmacy-cta-subtext">
          Register your pharmacy on MediTrack and get access to inventory
          management, staff tools, sales invoicing, and more — all from one
          dashboard.
        </p>

        <div className="pharmacy-cta-actions">
          <Link
            href="/register?type=pharmacy"
            className="pharmacy-cta-btn-primary"
          >
            Register your pharmacy <ArrowRight size={16} />
          </Link>
          <Link href="/contact" className="pharmacy-cta-btn-ghost">
            <Phone size={15} />
            Talk to us
          </Link>
        </div>

        <div className="pharmacy-cta-perks">
          {perks.map((perk) => (
            <span key={perk} className="pharmacy-cta-perk">
              <span className="pharmacy-cta-perk-dot" />
              {perk}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}