import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as customerApi from "./api";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export const useCustomers = (params: customerApi.CustomerParams) => {
  return useQuery({
    queryKey: ["pharmacy-customers", params],
    queryFn: () => customerApi.getCustomers(params),
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-customers"] });
      toast.success("Customer saved");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to save customer");
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.updateCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-customers"] });
      toast.success("Customer updated");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to update customer");
    },
  });
};

export const useArchiveCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.archiveCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-customers"] });
      toast.success("Customer archived");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to archive customer");
    },
  });
};
