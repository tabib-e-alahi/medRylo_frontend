import Image from "next/image";
import Link from "next/link";
import { MapPin, Pill, Store } from "lucide-react";
import {
  formatPrice,
  PublicMedicine,
  PublicPharmacy,
} from "./api";

function imageSrc(src?: string | null) {
  return src || "/globe.svg";
}

export function MedicineCard({ medicine }: { medicine: PublicMedicine }) {
  return (
    <article className="discovery-card">
      <div className="discovery-card-media">
        <Image
          src={imageSrc(medicine.image)}
          alt={medicine.name}
          width={360}
          height={240}
          className="discovery-card-img"
        />
        <span className="discovery-status">{medicine.availabilityStatus}</span>
      </div>

      <div className="discovery-card-body">
        <div>
          <p className="discovery-kicker">
            {medicine.category?.name || "Medicine"}
            {medicine.type?.name ? ` / ${medicine.type.name}` : ""}
          </p>
          <h2 className="discovery-card-title">{medicine.name}</h2>
          <p className="discovery-card-muted">
            {medicine.genericName || "Generic name not listed"}
          </p>
        </div>

        <dl className="discovery-card-specs">
          <div>
            <dt>Strength</dt>
            <dd>{medicine.strength || "N/A"}</dd>
          </div>
          <div>
            <dt>Pharmacies</dt>
            <dd>{medicine.availablePharmacyCount}</dd>
          </div>
        </dl>

        <div className="discovery-card-footer">
          <strong>{formatPrice(medicine.minPrice, medicine.maxPrice)}</strong>
          <Link className="discovery-primary-link" href={`/medicines/${medicine.id}`}>
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export function PharmacyCard({ pharmacy }: { pharmacy: PublicPharmacy }) {
  return (
    <article className="discovery-card">
      <div className="discovery-card-media pharmacy-media">
        <Image
          src={imageSrc(pharmacy.logo)}
          alt={pharmacy.name}
          width={360}
          height={240}
          className="discovery-card-img"
        />
        <span className="discovery-status">Approved</span>
      </div>

      <div className="discovery-card-body">
        <div>
          <p className="discovery-kicker">{pharmacy.pharmacyType}</p>
          <h2 className="discovery-card-title">{pharmacy.name}</h2>
          <p className="discovery-card-muted">
            <MapPin size={14} />
            {pharmacy.address || "Location not listed"}
          </p>
        </div>

        <dl className="discovery-card-specs">
          <div>
            <dt>Medicines</dt>
            <dd>{pharmacy.availableMedicineCount}</dd>
          </div>
          <div>
            <dt>Hours</dt>
            <dd>{pharmacy.openingHours || "Contact pharmacy"}</dd>
          </div>
        </dl>

        <div className="discovery-card-footer">
          <span className="discovery-contact">
            <Store size={15} />
            {pharmacy.phone || "Contact unavailable"}
          </span>
          <Link className="discovery-primary-link" href={`/pharmacies/${pharmacy.id}`}>
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="discovery-empty">
      <Pill size={28} />
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) search.set(key, value);
    });
    search.set("page", String(target));
    return `${basePath}?${search.toString()}`;
  };

  return (
    <nav className="discovery-pagination" aria-label="Pagination">
      <Link
        className={page <= 1 ? "disabled" : ""}
        href={page <= 1 ? basePath : hrefFor(page - 1)}
      >
        Previous
      </Link>
      <span>
        Page {page} of {totalPages}
      </span>
      <Link
        className={page >= totalPages ? "disabled" : ""}
        href={page >= totalPages ? basePath : hrefFor(page + 1)}
      >
        Next
      </Link>
    </nav>
  );
}
