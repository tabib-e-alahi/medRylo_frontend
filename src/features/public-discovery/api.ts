const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PublicCategory {
  id: string;
  name: string;
  slug?: string | null;
}

export interface PublicType {
  id: string;
  name: string;
}

export interface PublicPharmacyOption {
  id: string;
  name: string;
  address?: string | null;
}

export interface PublicMedicine {
  id: string;
  name: string;
  genericName?: string | null;
  strength?: string | null;
  image?: string | null;
  description?: string | null;
  category?: PublicCategory | null;
  type?: PublicType | null;
  unit?: { id: string; name: string; symbol: string } | null;
  availablePharmacyCount: number;
  minPrice: number | null;
  maxPrice: number | null;
  totalStock: number;
  availabilityStatus: string;
}

export interface MedicineAvailability {
  pharmacy: PublicPharmacyDetails;
  stockQuantity: number;
  minPrice: number;
  maxPrice: number;
  expiryDate?: string | null;
  shelf?: string | null;
}

export interface PublicMedicineDetails extends PublicMedicine {
  boxSize?: string | null;
  vat?: number | null;
  leafSetting?: {
    id: string;
    name: string;
    leavesPerStrip: number;
    stripsPerBox: number;
  } | null;
  availablePharmacies: MedicineAvailability[];
  relatedMedicines: PublicMedicine[];
}

export interface PublicPharmacy {
  id: string;
  name: string;
  pharmacyType: string;
  establishedYear?: number | null;
  openingHours?: string | null;
  website?: string | null;
  phone?: string | null;
  address?: string | null;
  logo?: string | null;
  availableMedicineCount: number;
}

export interface PublicPharmacyDetails extends PublicPharmacy {
  medicines?: Array<{
    id: string;
    name: string;
    genericName?: string | null;
    strength?: string | null;
    image?: string | null;
    category?: PublicCategory | null;
    type?: PublicType | null;
    stockQuantity: number;
    minPrice: number;
    maxPrice: number;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

function toQueryString(params?: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function publicFetch<T>(
  path: string,
  params?: Record<string, string | number | undefined>
) {
  const response = await fetch(`${API_BASE_URL}/public${path}${toQueryString(params)}`, {
    next: { revalidate: 60 },
  });
  

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as ApiResponse<T>;
}

export async function getMedicineFilters() {
  const response = await publicFetch<{
    categories: PublicCategory[];
    types: PublicType[];
    pharmacies: PublicPharmacyOption[];
  }>("/medicine-filters");
  return response.data;
}

export async function getPublicMedicines(params: Record<string, string | number | undefined>) {
  return await publicFetch<PublicMedicine[]>("/medicines", params);
}

export async function getPublicMedicineDetails(id: string) {
  const response = await publicFetch<PublicMedicineDetails>(`/medicines/${id}`);
  return response.data;
}

export async function getPublicPharmacies(params: Record<string, string | number | undefined>) {
  const res = await publicFetch<PublicPharmacy[]>("/pharmacies", params);
  // console.log("\n====================\n",res,"\n========================\n");
  return res;
}

export async function getPublicPharmacyDetails(id: string) {
  const response = await publicFetch<PublicPharmacyDetails>(`/pharmacies/${id}`);
  return response.data;
}

export function formatPrice(minPrice: number | null, maxPrice: number | null) {
  if (minPrice === null || maxPrice === null) return "Price unavailable";
  const formatter = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  });
  if (minPrice === maxPrice) return formatter.format(minPrice);
  return `${formatter.format(minPrice)} - ${formatter.format(maxPrice)}`;
}
