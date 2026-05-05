"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const API_BASE = "/api/v1/pharmacies";

export function usePharmacyStatus() {
  return useQuery({
    queryKey: ["pharmacy-status"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/status`);
      if (!res.ok) throw new Error("Failed to fetch pharmacy status");
      return res.json().then((d) => d.data);
    },
  });
}

export function useResubmitPharmacy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/resubmit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to resubmit");
      }
      return res.json().then((d) => d.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-status"] });
      toast.success("Pharmacy information resubmitted for approval");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAdminPendingPharmacies() {
  return useQuery({
    queryKey: ["admin-pending-pharmacies"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/pending`);
      if (!res.ok) throw new Error("Failed to fetch pending pharmacies");
      return res.json().then((d) => d.data);
    },
  });
}

export function useAdminApprovePharmacy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/admin/${id}/approve`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to approve pharmacy");
      return res.json().then((d) => d.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-pharmacies"] });
      toast.success("Pharmacy approved successfully");
    },
  });
}

export function useAdminRejectPharmacy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch(`${API_BASE}/admin/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to reject pharmacy");
      return res.json().then((d) => d.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-pharmacies"] });
      toast.success("Pharmacy rejected");
    },
  });
}

export function useCreatePharmacy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(API_BASE, {
        method: "POST",
        body: formData,
        // Don't set Content-Type header when sending FormData, 
        // the browser will set it with the correct boundary
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create pharmacy profile");
      }
      return res.json().then((d) => d.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-status"] });
    },
  });
}
