import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as leafSettingApi from "./api";
import { toast } from "sonner";

export const useLeafSettings = (params: any) => {
  return useQuery({
    queryKey: ["leaf-settings", params],
    queryFn: () => leafSettingApi.getLeafSettings(params),
  });
};

export const useCreateLeafSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leafSettingApi.createLeafSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaf-settings"] });
      toast.success("Leaf setting created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create leaf setting");
    },
  });
};

export const useUpdateLeafSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      leafSettingApi.updateLeafSetting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaf-settings"] });
      toast.success("Leaf setting updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update leaf setting");
    },
  });
};

export const useDeleteLeafSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leafSettingApi.deleteLeafSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaf-settings"] });
      toast.success("Leaf setting deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete leaf setting");
    },
  });
};
