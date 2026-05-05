import api from "@/lib/axios";

export const getLeafSettings = async (params: any) => {
  const { data } = await api.get("/admin/leaf-settings", { params });
  return data;
};

export const createLeafSetting = async (leafData: any) => {
  const { data } = await api.post("/admin/leaf-settings", leafData);
  return data;
};

export const updateLeafSetting = async (id: string, leafData: any) => {
  const { data } = await api.put(`/admin/leaf-settings/${id}`, leafData);
  return data;
};

export const deleteLeafSetting = async (id: string) => {
  const { data } = await api.delete(`/admin/leaf-settings/${id}`);
  return data;
};
