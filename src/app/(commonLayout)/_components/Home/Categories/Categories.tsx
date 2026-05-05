import Link from "next/link";
import { ArrowRight } from "lucide-react";
import "./categories.css";

const categories = [
  { name: "Antibiotics", count: "240+ medicines", emoji: "💊", bg: "#FFF7ED", href: "/medicines?category=antibiotics" },
  { name: "Vitamins", count: "180+ medicines", emoji: "🌿", bg: "#F0FDF4", href: "/medicines?category=vitamins" },
  { name: "Pain Relief", count: "150+ medicines", emoji: "🩹", bg: "#FFF1F2", href: "/medicines?category=analgesics" },
  { name: "Antidiabetic", count: "90+ medicines", emoji: "🩸", bg: "#EFF6FF", href: "/medicines?category=antidiabetic" },
  { name: "Antifungal", count: "70+ medicines", emoji: "🔬", bg: "#FAF5FF", href: "/medicines?category=antifungal" },
  { name: "Cardiovascular", count: "110+ medicines", emoji: "❤️", bg: "#FFF1F2", href: "/medicines?category=cardiovascular" },
  { name: "Dermatology", count: "60+ medicines", emoji: "🧴", bg: "#FFFBEB", href: "/medicines?category=dermatology" },
  { name: "Respiratory", count: "80+ medicines", emoji: "🫁", bg: "#F0F9FF", href: "/medicines?category=respiratory" },
];

export function Categories() {
  return (
    <section className="categories">
      <div className="categories-inner">
        <div className="section-header">
          <span className="section-label">Medicine categories</span>
          <h2 className="section-heading">Browse by category</h2>
          <p className="section-subtext">
            Find the medicines you need across a wide range of therapeutic categories.
          </p>
        </div>

        <div className="categories-grid">
          {categories.map((cat) => (
            <Link key={cat.name} href={cat.href} className="category-card">
              <div
                className="category-card-icon"
                style={{ background: cat.bg }}
              >
                {cat.emoji}
              </div>
              <span className="category-card-name">{cat.name}</span>
              <span className="category-card-count">{cat.count}</span>
            </Link>
          ))}
        </div>

        <div className="categories-cta">
          <Link href="/medicines" className="categories-cta-link">
            View all medicines <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}