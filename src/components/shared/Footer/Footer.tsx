import Link from "next/link";
import { Pill, Mail, Phone, MapPin } from "lucide-react";
import "./footer.css";

const medicineLinks = [
  { href: "/medicines", label: "Browse medicines" },
  { href: "/medicines?category=antibiotics", label: "Antibiotics" },
  { href: "/medicines?category=vitamins", label: "Vitamins & supplements" },
  { href: "/medicines?category=analgesics", label: "Pain relief" },
];

const companyLinks = [
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
  { href: "/pharmacy/register", label: "Register your pharmacy" },
  { href: "/blog", label: "Blog" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Brand column */}
        <div className="footer-brand">
          <Link href="/" className="footer-logo">
            <span className="footer-logo-icon">
              <Pill size={18} />
            </span>
            <span className="footer-logo-text">
              Medi<strong>Track</strong>
            </span>
          </Link>
          <p className="footer-tagline">
            Modern pharmacy management platform for medicine inventory,
            suppliers, and sales — all in one place.
          </p>
          <div className="footer-contact">
            <span className="footer-contact-item">
              <Mail size={14} /> support@meditrack.com
            </span>
            <span className="footer-contact-item">
              <Phone size={14} /> +880 1234 567890
            </span>
            <span className="footer-contact-item">
              <MapPin size={14} /> Dhaka, Bangladesh
            </span>
          </div>
        </div>

        {/* Medicines column */}
        <div className="footer-col">
          <h4 className="footer-col-heading">Medicines</h4>
          <ul className="footer-col-list">
            {medicineLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="footer-col-link">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company column */}
        <div className="footer-col">
          <h4 className="footer-col-heading">Company</h4>
          <ul className="footer-col-list">
            {companyLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="footer-col-link">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA column */}
        <div className="footer-cta">
          <h4 className="footer-cta-heading">For pharmacies</h4>
          <p className="footer-cta-text">
            Join MediTrack to manage your inventory, staff, and sales
            efficiently.
          </p>
          <Link href="/register?type=pharmacy" className="footer-cta-btn">
            Register your pharmacy
          </Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          © {new Date().getFullYear()} MediTrack. All rights reserved.
        </p>
        <div className="footer-legal">
          {legalLinks.map((l) => (
            <Link key={l.href} href={l.href} className="footer-legal-link">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}