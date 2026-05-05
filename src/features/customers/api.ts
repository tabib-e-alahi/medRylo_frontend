import api from "@/lib/axios";

export type CustomerParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type CustomerPayload = Record<string, unknown>;

export const getCustomers = async (params: CustomerParams) => {
  const { data } = await api.get("/pharmacy/customers", { params });
  return data;
};

export const createCustomer = async (payload: CustomerPayload) => {
  const { data } = await api.post("/pharmacy/customers", payload);
  return data;
};

export const updateCustomer = async ({ id, payload }: { id: string; payload: CustomerPayload }) => {
  const { data } = await api.patch(`/pharmacy/customers/${id}`, payload);
  return data;
};

export const archiveCustomer = async (id: string) => {
  const { data } = await api.delete(`/pharmacy/customers/${id}`);
  return data;
};
