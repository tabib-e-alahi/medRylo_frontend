import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  formatPrice,
  getPublicPharmacyDetails,
} from "@/features/public-discovery/api";

type RouteParams = { id: string };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams> | RouteParams;
}): Promise<Metadata> {
  const { id } = await Promise.resolve(params);
  const pharmacy = await getPublicPharmacyDetails(id);

  return {
    title: `${pharmacy.name} | MediTrack`,
    description: `View public medicine availability and contact information for ${pharmacy.name}.`,
  };
}

export default async function PharmacyDetailsPage({
  params,
}: {
  params: Promise<RouteParams> | RouteParams;
}) {
  const { id } = await Promise.resolve(params);
  const pharmacy = await getPublicPharmacyDetails(id);

  return (
    <div className="discovery-page">
      <section className="discovery-hero">
        <div className="discovery-hero-inner">
          <p className="discovery-eyebrow">{pharmacy.pharmacyType} pharmacy</p>
          <h1>{pharmacy.name}</h1>
          <p>{pharmacy.address || "Location not listed"}</p>
        </div>
      </section>

      <section className="discovery-content">
        <div className="discovery-detail-grid">
          <div className="discovery-detail-panel">
            <Image
              src={pharmacy.logo || "/globe.svg"}
              alt={pharmacy.name}
              width={900}
              height={506}
              className="discovery-detail-image"
            />
            <h2 className="discovery-section-title">Pharmacy overview</h2>
            <p>
              This approved pharmacy currently lists{" "}
              <strong>{pharmacy.availableMedicineCount}</strong> available
              medicines for public discovery.
            </p>
          </div>

          <aside className="discovery-detail-panel">
            <h2 className="discovery-section-title">Contact and hours</h2>
            <dl className="discovery-spec-list">
              <div>
                <dt>Phone</dt>
                <dd>{pharmacy.phone || "Contact unavailable"}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{pharmacy.address || "N/A"}</dd>
              </div>
              <div>
                <dt>Opening hours</dt>
                <dd>{pharmacy.openingHours || "Contact pharmacy"}</dd>
              </div>
              <div>
                <dt>Website</dt>
                <dd>
                  {pharmacy.website ? (
                    <a href={pharmacy.website} target="_blank" rel="noreferrer">
                      Visit website
                    </a>
                  ) : (
                    "N/A"
                  )}
                </dd>
              </div>
            </dl>
          </aside>
        </div>

        <div className="discovery-detail-panel" style={{ marginTop: "1.25rem" }}>
          <h2 className="discovery-section-title">Medicine availability</h2>
          <div className="discovery-availability-list">
            {(pharmacy.medicines || []).map((medicine) => (
              <article key={medicine.id} className="discovery-availability-item">
                <h3>
                  <Link href={`/medicines/${medicine.id}`}>{medicine.name}</Link>
                </h3>
                <p>
                  {medicine.genericName || "Generic name not listed"}
                  {medicine.strength ? ` / ${medicine.strength}` : ""}
                </p>
                <p>
                  {medicine.category?.name || "Medicine"}
                  {medicine.type?.name ? ` / ${medicine.type.name}` : ""}
                </p>
                <p>
                  {formatPrice(medicine.minPrice, medicine.maxPrice)} / Stock:{" "}
                  {medicine.stockQuantity}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
