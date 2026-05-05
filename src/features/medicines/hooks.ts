import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as medicineApi from "./api";
import { toast } from "sonner";

export const useMedicines = (params: any) => {
  return useQuery({
    queryKey: ["medicines", params],
    queryFn: () => medicineApi.getMedicines(params),
  });
};

export const useCreateMedicine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: medicineApi.createMedicine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create medicine");
    },
  });
};

export const useUpdateMedicine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      medicineApi.updateMedicine(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update medicine");
    },
  });
};

export const useDeleteMedicine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: medicineApi.deleteMedicine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete medicine");
    },
  });
};
