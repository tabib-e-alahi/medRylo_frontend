import "./testimonials.css";

const testimonials = [
  {
    quote:
      "MediTrack transformed how we run our pharmacy. The inventory tracking alone saves us hours every week. Highly recommend to any pharmacy owner.",
    name: "Rahim Ahmed",
    role: "Owner, Dhaka Pharmacy",
    initials: "RA",
  },
  {
    quote:
      "The approval process was smooth and the dashboard is very easy to use. Our staff picked it up within a day. Sales reporting is excellent.",
    name: "Sultana Khanam",
    role: "Manager, City Medica",
    initials: "SK",
  },
  {
    quote:
      "Being able to manage purchases, invoices, and customer records all in one place has been a game changer for us.",
    name: "Mizanur Hossain",
    role: "Owner, HealthPoint Pharmacy",
    initials: "MH",
  },
];

export function Testimonials() {
  return (
    <section className="testimonials">
      <div className="testimonials-inner">
        <div className="section-header">
          <span className="section-label">Testimonials</span>
          <h2 className="section-heading">What pharmacies say</h2>
          <p className="section-subtext">
            Hear from pharmacy owners who use MediTrack every day.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <div key={t.name} className="testimonial-card">
              <div className="testimonial-stars">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.initials}</div>
                <div>
                  <p className="testimonial-author-name">{t.name}</p>
                  <p className="testimonial-author-role">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}