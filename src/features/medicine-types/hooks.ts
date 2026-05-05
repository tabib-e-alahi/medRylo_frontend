import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as medicineTypeApi from "./api";
import { toast } from "sonner";

export const useMedicineTypes = (params: any) => {
  return useQuery({
    queryKey: ["medicine-types", params],
    queryFn: () => medicineTypeApi.getMedicineTypes(params),
  });
};

export const useCreateMedicineType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: medicineTypeApi.createMedicineType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicine-types"] });
      toast.success("Medicine type created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create medicine type");
    },
  });
};

export const useUpdateMedicineType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      medicineTypeApi.updateMedicineType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicine-types"] });
      toast.success("Medicine type updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update medicine type");
    },
  });
};

export const useDeleteMedicineType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: medicineTypeApi.deleteMedicineType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicine-types"] });
      toast.success("Medicine type deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete medicine type");
    },
  });
};
