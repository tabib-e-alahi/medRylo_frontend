import api from "@/lib/axios";

export type AnalyticsParams = {
  dateFrom?: string;
  dateTo?: string;
};

export const getAdminOverview = async (params: AnalyticsParams) => {
  const { data } = await api.get("/admin/analytics/overview", { params });
  return data;
};

export const getPharmacyOverview = async (params: AnalyticsParams) => {
  const { data } = await api.get("/pharmacy/analytics/overview", { params });
  return data;
};

export const getPharmacySales = async (params: AnalyticsParams) => {
  const { data } = await api.get("/pharmacy/analytics/sales", { params });
  return data;
};

export const getPharmacyPurchases = async (params: AnalyticsParams) => {
  const { data } = await api.get("/pharmacy/analytics/purchases", { params });
  return data;
};

export const getPharmacyInventory = async () => {
  const { data } = await api.get("/pharmacy/analytics/inventory");
  return data;
};
