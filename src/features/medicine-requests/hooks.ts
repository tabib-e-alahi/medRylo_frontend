import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as requestApi from "./api";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export const useMyMedicineRequests = (params: requestApi.MedicineRequestParams) => {
  return useQuery({
    queryKey: ["my-medicine-requests", params],
    queryFn: () => requestApi.getMyMedicineRequests(params),
  });
};

export const useSubmitMedicineRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestApi.submitMedicineRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-medicine-requests"] });
      toast.success("Medicine request submitted");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to submit medicine request");
    },
  });
};

export const useAdminMedicineRequests = (params: requestApi.MedicineRequestParams) => {
  return useQuery({
    queryKey: ["admin-medicine-requests", params],
    queryFn: () => requestApi.getAdminMedicineRequests(params),
  });
};

export const useApproveMedicineRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestApi.approveMedicineRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-medicine-requests"] });
      toast.success("Request approved and medicine created");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to approve request");
    },
  });
};

export const useRejectMedicineRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestApi.rejectMedicineRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-medicine-requests"] });
      toast.success("Request rejected");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to reject request");
    },
  });
};
