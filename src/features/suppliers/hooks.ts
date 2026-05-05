import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as supplierApi from "./api";
import { toast } from "sonner";

export const useSuppliers = (params: any) => {
  return useQuery({
    queryKey: ["suppliers", params],
    queryFn: () => supplierApi.getSuppliers(params),
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: supplierApi.createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create supplier");
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      supplierApi.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update supplier");
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: supplierApi.deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete supplier");
    },
  });
};
