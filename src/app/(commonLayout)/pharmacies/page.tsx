import type { Metadata } from "next";
import Link from "next/link";
import { getPublicPharmacies } from "@/features/public-discovery/api";
import {
  EmptyState,
  Pagination,
  PharmacyCard,
} from "@/features/public-discovery/DiscoveryCards";

export const metadata: Metadata = {
  title: "Approved Pharmacies | MediTrack",
  description:
    "Browse approved pharmacies with public medicine availability in MediTrack.",
};

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function value(params: SearchParams, key: string) {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

export default async function PharmaciesPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const params = (await Promise.resolve(searchParams)) || {};
  const query = {
    page: value(params, "page") || "1",
    limit: "12",
    searchTerm: value(params, "searchTerm"),
    sortBy: value(params, "sortBy") || "name",
    sortOrder: value(params, "sortOrder") || "asc",
  };

  const response = await getPublicPharmacies(query);
  const pharmacies = response.data;
  const meta = response.meta || { total: 0, page: 1, limit: 12, totalPages: 1 };

  return (
    <div className="discovery-page">
      <section className="discovery-hero">
        <div className="discovery-hero-inner">
          <p className="discovery-eyebrow">Approved pharmacies</p>
          <h1>Browse pharmacies with available medicine inventory</h1>
          <p>
            Public pharmacy profiles are limited to approved pharmacies with active,
            in-stock inventory. No internal purchase or admin data is shown.
          </p>
        </div>
      </section>

      <section className="discovery-content">
        <div className="discovery-layout">
          <aside className="discovery-filters">
            <h2>Find pharmacies</h2>
            <form action="/pharmacies">
              <div className="discovery-field">
                <label htmlFor="searchTerm">Search</label>
                <input
                  id="searchTerm"
                  name="searchTerm"
                  defaultValue={query.searchTerm}
                  placeholder="Name or location"
                />
              </div>

              <div className="discovery-filter-row">
                <div className="discovery-field">
                  <label htmlFor="sortBy">Sort by</label>
                  <select id="sortBy" name="sortBy" defaultValue={query.sortBy}>
                    <option value="name">Name</option>
                    <option value="recent">Recently added</option>
                  </select>
                </div>
                <div className="discovery-field">
                  <label htmlFor="sortOrder">Order</label>
                  <select id="sortOrder" name="sortOrder" defaultValue={query.sortOrder}>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>

              <div className="discovery-filter-actions">
                <button className="discovery-submit" type="submit">
                  Apply
                </button>
                <Link className="discovery-reset" href="/pharmacies">
                  Reset
                </Link>
              </div>
            </form>
          </aside>

          <div>
            <div className="discovery-grid-head">
              <div>
                <h2>Approved pharmacies</h2>
                <p>{meta.total} pharmacies found</p>
              </div>
            </div>

            {pharmacies.length ? (
              <>
                <div className="discovery-grid">
                  {pharmacies.map((pharmacy) => (
                    <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
                  ))}
                </div>
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  basePath="/pharmacies"
                  params={query}
                />
              </>
            ) : (
              <EmptyState
                title="No pharmacies found"
                message="Try searching a different pharmacy name or location."
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
