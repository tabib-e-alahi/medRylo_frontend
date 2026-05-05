import type { Metadata } from "next";
import Link from "next/link";
import {
  getMedicineFilters,
  getPublicMedicines,
} from "@/features/public-discovery/api";
import {
  EmptyState,
  MedicineCard,
  Pagination,
} from "@/features/public-discovery/DiscoveryCards";

export const metadata: Metadata = {
  title: "Browse Medicines | MediTrack",
  description:
    "Discover medicines available from approved pharmacies. Search by name, category, type, pharmacy, price, and availability.",
};

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function value(params: SearchParams, key: string) {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

export default async function MedicinesPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const params = (await Promise.resolve(searchParams)) || {};
  const query = {
    page: value(params, "page") || "1",
    limit: "12",
    searchTerm: value(params, "searchTerm"),
    categoryId: value(params, "categoryId"),
    typeId: value(params, "typeId"),
    pharmacyId: value(params, "pharmacyId"),
    minPrice: value(params, "minPrice"),
    maxPrice: value(params, "maxPrice"),
    availability: value(params, "availability"),
    sortBy: value(params, "sortBy") || "recent",
    sortOrder: value(params, "sortOrder") || "desc",
  };

  const [filters, response] = await Promise.all([
    getMedicineFilters(),
    getPublicMedicines(query),
  ]);

  const medicines = response.data;
  const meta = response.meta || { total: 0, page: 1, limit: 12, totalPages: 1 };

  return (
    <div className="discovery-page">
      <section className="discovery-hero">
        <div className="discovery-hero-inner">
          <p className="discovery-eyebrow">Public medicine discovery</p>
          <h1>Find medicines available at approved pharmacies</h1>
          <p>
            Search verified inventory across approved pharmacies. This section is
            for discovery only, with no ordering, checkout, or online payment.
          </p>
        </div>
      </section>

      <section className="discovery-content">
        <div className="discovery-layout">
          <aside className="discovery-filters">
            <h2>Filters</h2>
            <form action="/medicines">
              <div className="discovery-field">
                <label htmlFor="searchTerm">Search</label>
                <input
                  id="searchTerm"
                  name="searchTerm"
                  defaultValue={query.searchTerm}
                  placeholder="Medicine or generic name"
                />
              </div>

              <div className="discovery-field">
                <label htmlFor="categoryId">Category</label>
                <select id="categoryId" name="categoryId" defaultValue={query.categoryId}>
                  <option value="">All categories</option>
                  {filters.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="discovery-field">
                <label htmlFor="typeId">Type</label>
                <select id="typeId" name="typeId" defaultValue={query.typeId}>
                  <option value="">All types</option>
                  {filters.types.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="discovery-field">
                <label htmlFor="pharmacyId">Pharmacy</label>
                <select id="pharmacyId" name="pharmacyId" defaultValue={query.pharmacyId}>
                  <option value="">All approved pharmacies</option>
                  {filters.pharmacies.map((pharmacy) => (
                    <option key={pharmacy.id} value={pharmacy.id}>
                      {pharmacy.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="discovery-filter-row">
                <div className="discovery-field">
                  <label htmlFor="minPrice">Min price</label>
                  <input
                    id="minPrice"
                    name="minPrice"
                    type="number"
                    min="0"
                    defaultValue={query.minPrice}
                  />
                </div>
                <div className="discovery-field">
                  <label htmlFor="maxPrice">Max price</label>
                  <input
                    id="maxPrice"
                    name="maxPrice"
                    type="number"
                    min="0"
                    defaultValue={query.maxPrice}
                  />
                </div>
              </div>

              <div className="discovery-field">
                <label htmlFor="availability">Availability</label>
                <select
                  id="availability"
                  name="availability"
                  defaultValue={query.availability}
                >
                  <option value="">Available stock</option>
                  <option value="inStock">In stock</option>
                  <option value="lowStock">Low stock</option>
                </select>
              </div>

              <div className="discovery-filter-row">
                <div className="discovery-field">
                  <label htmlFor="sortBy">Sort by</label>
                  <select id="sortBy" name="sortBy" defaultValue={query.sortBy}>
                    <option value="recent">Recently added</option>
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                  </select>
                </div>
                <div className="discovery-field">
                  <label htmlFor="sortOrder">Order</label>
                  <select id="sortOrder" name="sortOrder" defaultValue={query.sortOrder}>
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>

              <div className="discovery-filter-actions">
                <button className="discovery-submit" type="submit">
                  Apply
                </button>
                <Link className="discovery-reset" href="/medicines">
                  Reset
                </Link>
              </div>
            </form>
          </aside>

          <div>
            <div className="discovery-grid-head">
              <div>
                <h2>Available medicines</h2>
                <p>{meta.total} medicines found from approved pharmacy inventory</p>
              </div>
            </div>

            {medicines.length ? (
              <>
                <div className="discovery-grid">
                  {medicines.map((medicine) => (
                    <MedicineCard key={medicine.id} medicine={medicine} />
                  ))}
                </div>
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  basePath="/medicines"
                  params={query}
                />
              </>
            ) : (
              <EmptyState
                title="No medicines found"
                message="Try changing your search, price range, category, type, or pharmacy filter."
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
