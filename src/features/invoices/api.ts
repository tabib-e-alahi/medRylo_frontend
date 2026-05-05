import api from "@/lib/axios";

export type InvoiceParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type InvoicePayload = Record<string, unknown>;

export const getInvoices = async (params: InvoiceParams) => {
  const { data } = await api.get("/pharmacy/invoices", { params });
  return data;
};

export const getInvoiceById = async (id: string) => {
  const { data } = await api.get(`/pharmacy/invoices/${id}`);
  return data;
};

export const createInvoice = async (payload: InvoicePayload) => {
  const { data } = await api.post("/pharmacy/invoices", payload);
  return data;
};

export const cancelInvoice = async (id: string) => {
  const { data } = await api.patch(`/pharmacy/invoices/${id}/cancel`);
  return data;
};

export const getInvoicePayments = async (id: string) => {
  const { data } = await api.get(`/pharmacy/invoices/${id}/payments`);
  return data;
};

export const createInvoicePayment = async ({ id, payload }: { id: string; payload: InvoicePayload }) => {
  const { data } = await api.post(`/pharmacy/invoices/${id}/payments`, payload);
  return data;
};
