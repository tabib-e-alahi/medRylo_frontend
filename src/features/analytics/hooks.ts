import { useQuery } from "@tanstack/react-query";
import * as analyticsApi from "./api";

export const useAdminOverviewAnalytics = (params: analyticsApi.AnalyticsParams) => {
  return useQuery({
    queryKey: ["admin-analytics-overview", params],
    queryFn: () => analyticsApi.getAdminOverview(params),
  });
};

export const usePharmacyOverviewAnalytics = (params: analyticsApi.AnalyticsParams) => {
  return useQuery({
    queryKey: ["pharmacy-analytics-overview", params],
    queryFn: () => analyticsApi.getPharmacyOverview(params),
  });
};

export const usePharmacySalesAnalytics = (params: analyticsApi.AnalyticsParams) => {
  return useQuery({
    queryKey: ["pharmacy-analytics-sales", params],
    queryFn: () => analyticsApi.getPharmacySales(params),
  });
};

export const usePharmacyPurchaseAnalytics = (params: analyticsApi.AnalyticsParams) => {
  return useQuery({
    queryKey: ["pharmacy-analytics-purchases", params],
    queryFn: () => analyticsApi.getPharmacyPurchases(params),
  });
};

export const usePharmacyInventoryAnalytics = () => {
  return useQuery({
    queryKey: ["pharmacy-analytics-inventory"],
    queryFn: analyticsApi.getPharmacyInventory,
  });
};
