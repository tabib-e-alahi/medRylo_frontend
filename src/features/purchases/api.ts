import api from "@/lib/axios";

export type PurchaseParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  supplierId?: string;
  paymentStatus?: string;
  purchaseStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type PurchasePayload = Record<string, unknown>;

export const getPurchases = async (params: PurchaseParams) => {
  const { data } = await api.get("/pharmacy/purchases", { params });
  return data;
};

export const getPurchaseById = async (id: string) => {
  const { data } = await api.get(`/pharmacy/purchases/${id}`);
  return data;
};

export const createPurchase = async (payload: PurchasePayload) => {
  const { data } = await api.post("/pharmacy/purchases", payload);
  return data;
};

export const updatePurchasePayment = async ({ id, payload }: { id: string; payload: PurchasePayload }) => {
  const { data } = await api.patch(`/pharmacy/purchases/${id}/payment`, payload);
  return data;
};

export const updatePurchaseStatus = async ({ id, payload }: { id: string; payload: PurchasePayload }) => {
  const { data } = await api.patch(`/pharmacy/purchases/${id}/status`, payload);
  return data;
};

export const getPurchaseSuppliers = async (params: { searchTerm?: string; limit?: number }) => {
  const { data } = await api.get("/pharmacy/purchases/suppliers", { params });
  return data;
};
