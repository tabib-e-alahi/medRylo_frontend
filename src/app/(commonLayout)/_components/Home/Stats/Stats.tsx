import "./stats.css";

const stats = [
  { value: "500+", label: "Pharmacies registered" },
  { value: "12k+", label: "Medicines in database" },
  { value: "98%", label: "Uptime guarantee" },
  { value: "৳2M+", label: "Sales processed daily" },
];

export function Stats() {
  return (
    <section className="stats">
      <div className="stats-inner">
        {stats.map((s, i) => (
          <div key={i} className="lg:flex lg:justify-around">
            <div key={s.value} className="stats-item">
              <span className="stats-item-value">{s.value}</span>
              <span className="stats-item-label">{s.label}</span>
            </div>
            {i < stats.length - 1 && (
              <div key={`div-${i}`} className="stats-divider" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}