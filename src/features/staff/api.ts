import api from "@/lib/axios";

export type StaffParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  isActive?: boolean;
};

export type StaffPayload = Record<string, unknown>;

export const getStaff = async (params: StaffParams) => {
  const { data } = await api.get("/pharmacy/staff", { params });
  return data;
};

export const createStaff = async (payload: StaffPayload) => {
  const { data } = await api.post("/pharmacy/staff", payload);
  return data;
};

export const updateStaff = async ({ id, payload }: { id: string; payload: StaffPayload }) => {
  const { data } = await api.patch(`/pharmacy/staff/${id}`, payload);
  return data;
};

export const archiveStaff = async (id: string) => {
  const { data } = await api.delete(`/pharmacy/staff/${id}`);
  return data;
};

export const getMyStaffProfile = async () => {
  const { data } = await api.get("/pharmacy/staff/me");
  return data;
};
