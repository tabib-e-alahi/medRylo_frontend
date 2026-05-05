import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as purchaseApi from "./api";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export const usePurchases = (params: purchaseApi.PurchaseParams) => {
  return useQuery({
    queryKey: ["pharmacy-purchases", params],
    queryFn: () => purchaseApi.getPurchases(params),
  });
};

export const usePurchase = (id: string) => {
  return useQuery({
    queryKey: ["pharmacy-purchase", id],
    queryFn: () => purchaseApi.getPurchaseById(id),
    enabled: Boolean(id),
  });
};

export const usePurchaseSuppliers = (params: { searchTerm?: string; limit?: number }) => {
  return useQuery({
    queryKey: ["purchase-suppliers", params],
    queryFn: () => purchaseApi.getPurchaseSuppliers(params),
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseApi.createPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacy-inventory"] });
      toast.success("Purchase created successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to create purchase");
    },
  });
};

export const useUpdatePurchasePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseApi.updatePurchasePayment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacy-purchase", variables.id] });
      toast.success("Payment updated");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to update payment");
    },
  });
};

export const useUpdatePurchaseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseApi.updatePurchaseStatus,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacy-purchase", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["pharmacy-inventory"] });
      toast.success("Purchase status updated");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to update purchase status");
    },
  });
};
