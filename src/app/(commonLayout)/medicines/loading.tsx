export default function MedicinesLoading() {
  return (
    <div className="discovery-page">
      <section className="discovery-hero">
        <div className="discovery-hero-inner">
          <div className="skeleton" style={{ width: 180, height: 18, marginBottom: 14 }} />
          <div className="skeleton" style={{ width: "60%", height: 48, marginBottom: 14 }} />
          <div className="skeleton" style={{ width: "44%", height: 20 }} />
        </div>
      </section>
      <section className="discovery-content">
        <div className="discovery-skeleton-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="skeleton discovery-skeleton-card" />
          ))}
        </div>
      </section>
    </div>
  );
}
