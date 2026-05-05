import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as inventoryApi from "./api";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export const useInventory = (params: inventoryApi.InventoryParams) => {
  return useQuery({
    queryKey: ["pharmacy-inventory", params],
    queryFn: () => inventoryApi.getInventory(params),
  });
};

export const useGlobalMedicinesForInventory = (params: inventoryApi.GlobalMedicineParams) => {
  return useQuery({
    queryKey: ["inventory-global-medicines", params],
    queryFn: () => inventoryApi.getGlobalMedicinesForInventory(params),
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryApi.createInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-inventory"] });
      toast.success("Medicine added to inventory");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to add inventory item");
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryApi.updateInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-inventory"] });
      toast.success("Inventory item updated");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to update inventory item");
    },
  });
};

export const useArchiveInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryApi.archiveInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-inventory"] });
      toast.success("Inventory item archived");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to archive inventory item");
    },
  });
};
