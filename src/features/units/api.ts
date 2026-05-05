import api from "@/lib/axios";

export const getUnits = async (params: any) => {
  const { data } = await api.get("/admin/units", { params });
  return data;
};

export const createUnit = async (unitData: any) => {
  const { data } = await api.post("/admin/units", unitData);
  return data;
};

export const updateUnit = async (id: string, unitData: any) => {
  const { data } = await api.put(`/admin/units/${id}`, unitData);
  return data;
};

export const deleteUnit = async (id: string) => {
  const { data } = await api.delete(`/admin/units/${id}`);
  return data;
};
