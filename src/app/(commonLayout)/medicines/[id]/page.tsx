import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  formatPrice,
  getPublicMedicineDetails,
} from "@/features/public-discovery/api";
import { MedicineCard } from "@/features/public-discovery/DiscoveryCards";

type RouteParams = { id: string };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams> | RouteParams;
}): Promise<Metadata> {
  const { id } = await Promise.resolve(params);
  const medicine = await getPublicMedicineDetails(id);

  return {
    title: `${medicine.name} | MediTrack`,
    description:
      medicine.description ||
      `View public availability and pharmacy price information for ${medicine.name}.`,
  };
}

export default async function MedicineDetailsPage({
  params,
}: {
  params: Promise<RouteParams> | RouteParams;
}) {
  const { id } = await Promise.resolve(params);
  const medicine = await getPublicMedicineDetails(id);

  return (
    <div className="discovery-page">
      <section className="discovery-hero">
        <div className="discovery-hero-inner">
          <p className="discovery-eyebrow">
            {medicine.category?.name || "Medicine"} / {medicine.type?.name || "Details"}
          </p>
          <h1>{medicine.name}</h1>
          <p>
            {medicine.genericName || "Generic name not listed"}
            {medicine.strength ? `, ${medicine.strength}` : ""}
          </p>
        </div>
      </section>

      <section className="discovery-content">
        <div className="discovery-detail-grid">
          <div className="discovery-detail-panel">
            <Image
              src={medicine.image || "/globe.svg"}
              alt={medicine.name}
              width={900}
              height={506}
              className="discovery-detail-image"
            />
            <h2 className="discovery-section-title">Medicine overview</h2>
            <p>{medicine.description || "No detailed description has been added yet."}</p>

            <div className="discovery-note">
              Medicine information is for discovery only. Confirm dosage, suitability,
              and safety with a licensed healthcare professional before use.
            </div>
          </div>

          <aside className="discovery-detail-panel">
            <h2 className="discovery-section-title">Specifications</h2>
            <dl className="discovery-spec-list">
              <div>
                <dt>Generic name</dt>
                <dd>{medicine.genericName || "N/A"}</dd>
              </div>
              <div>
                <dt>Strength</dt>
                <dd>{medicine.strength || "N/A"}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{medicine.category?.name || "N/A"}</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{medicine.type?.name || "N/A"}</dd>
              </div>
              <div>
                <dt>Box size</dt>
                <dd>{medicine.boxSize || "N/A"}</dd>
              </div>
              <div>
                <dt>Price range</dt>
                <dd>{formatPrice(medicine.minPrice, medicine.maxPrice)}</dd>
              </div>
            </dl>
          </aside>
        </div>

        <div className="discovery-detail-panel" style={{ marginTop: "1.25rem" }}>
          <h2 className="discovery-section-title">Available pharmacies</h2>
          <div className="discovery-availability-list">
            {medicine.availablePharmacies.map((item) => (
              <article key={item.pharmacy.id} className="discovery-availability-item">
                <h3>
                  <Link href={`/pharmacies/${item.pharmacy.id}`}>
                    {item.pharmacy.name}
                  </Link>
                </h3>
                <p>{item.pharmacy.address || "Location not listed"}</p>
                <p>
                  {formatPrice(item.minPrice, item.maxPrice)} / Stock:{" "}
                  {item.stockQuantity}
                </p>
                <p>Contact: {item.pharmacy.phone || "Contact unavailable"}</p>
              </article>
            ))}
          </div>
        </div>

        {medicine.relatedMedicines.length > 0 && (
          <div className="discovery-detail-panel" style={{ marginTop: "1.25rem" }}>
            <h2 className="discovery-section-title">Related medicines</h2>
            <div className="discovery-grid">
              {medicine.relatedMedicines.map((related) => (
                <MedicineCard key={related.id} medicine={related} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
