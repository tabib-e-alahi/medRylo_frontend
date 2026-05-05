"use client";

import { useState } from "react";
import { toast } from "sonner";
import "./newsletter.css";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      toast.success("You're subscribed! We'll keep you updated.");
      setEmail("");
      setLoading(false);
    }, 800);
  }

  return (
    <section className="newsletter">
      <div className="newsletter-inner">
        <h2 className="newsletter-heading">Stay in the loop</h2>
        <p className="newsletter-subtext">
          Get updates on new features, pharmacy tips, and MediTrack news
          straight to your inbox.
        </p>

        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="newsletter-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="newsletter-btn" disabled={loading}>
            {loading ? "..." : "Subscribe"}
          </button>
        </form>

        <p className="newsletter-note">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}