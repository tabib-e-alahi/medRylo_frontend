import "./how-it-works.css";

const steps = [
  {
    num: "01",
    title: "Register pharmacy",
    desc: "Pharmacy owners sign up and submit their license and profile details.",
    active: true,
  },
  {
    num: "02",
    title: "Admin approval",
    desc: "The admin reviews the application and approves or rejects with feedback.",
    active: true,
  },
  {
    num: "03",
    title: "Set up inventory",
    desc: "Add medicines from the global database and configure pharmacy stock.",
    active: false,
  },
  {
    num: "04",
    title: "Manage & grow",
    desc: "Track sales, purchases, customers, and reports all from one dashboard.",
    active: false,
  },
];

export function HowItWorks() {
  return (
    <section className="how-it-works">
      <div className="how-it-works-inner">
        <div className="section-header">
          <span className="section-label">How it works</span>
          <h2 className="section-heading">Up and running in 4 steps</h2>
          <p className="section-subtext">
            From registration to full pharmacy management in minutes.
          </p>
        </div>

        <div className="how-steps">
          {steps.map((step) => (
            <div
              key={step.num}
              className={`how-step${step.active ? " active" : ""}`}
            >
              <div className="how-step-num">{step.num}</div>
              <h3 className="how-step-title">{step.title}</h3>
              <p className="how-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}