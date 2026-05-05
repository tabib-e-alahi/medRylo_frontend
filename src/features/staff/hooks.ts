import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as staffApi from "./api";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export const useStaffList = (params: staffApi.StaffParams) => {
  return useQuery({
    queryKey: ["pharmacy-staff", params],
    queryFn: () => staffApi.getStaff(params),
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffApi.createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-staff"] });
      toast.success("Staff account created");
    },
    onError: (error: ApiError) => toast.error(error.response?.data?.message || "Failed to create staff"),
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffApi.updateStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-staff"] });
      toast.success("Staff updated");
    },
    onError: (error: ApiError) => toast.error(error.response?.data?.message || "Failed to update staff"),
  });
};

export const useArchiveStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffApi.archiveStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-staff"] });
      toast.success("Staff deactivated");
    },
    onError: (error: ApiError) => toast.error(error.response?.data?.message || "Failed to deactivate staff"),
  });
};

export const useMyStaffProfile = () => {
  return useQuery({
    queryKey: ["my-staff-profile"],
    queryFn: staffApi.getMyStaffProfile,
  });
};
