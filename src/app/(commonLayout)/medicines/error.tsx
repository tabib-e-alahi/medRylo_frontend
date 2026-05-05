"use client";

export default function MedicinesError({ reset }: { reset: () => void }) {
  return (
    <div className="discovery-page">
      <section className="discovery-content">
        <div className="discovery-error">
          <h2>Unable to load medicines</h2>
          <p>Please try again. The public discovery service did not respond correctly.</p>
          <button className="discovery-submit" type="button" onClick={reset}>
            Try again
          </button>
        </div>
      </section>
    </div>
  );
}
