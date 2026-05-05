import api from "@/lib/axios";

export type MedicineRequestParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type MedicineRequestPayload = Record<string, unknown>;

export const submitMedicineRequest = async (payload: MedicineRequestPayload) => {
  const { data } = await api.post("/medicine-requests/pharmacy", payload);
  return data;
};

export const getMyMedicineRequests = async (params: MedicineRequestParams) => {
  const { data } = await api.get("/medicine-requests/pharmacy", { params });
  return data;
};

export const getAdminMedicineRequests = async (params: MedicineRequestParams) => {
  const { data } = await api.get("/medicine-requests/admin", { params });
  return data;
};

export const approveMedicineRequest = async ({ id, payload }: { id: string; payload: MedicineRequestPayload }) => {
  const { data } = await api.patch(`/medicine-requests/admin/${id}/approve`, payload);
  return data;
};

export const rejectMedicineRequest = async ({ id, adminNote }: { id: string; adminNote: string }) => {
  const { data } = await api.patch(`/medicine-requests/admin/${id}/reject`, { adminNote });
  return data;
};
