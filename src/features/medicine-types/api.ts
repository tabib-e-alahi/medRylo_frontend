import api from "@/lib/axios";

export const getMedicineTypes = async (params: any) => {
  const { data } = await api.get("/admin/medicine-types", { params });
  return data;
};

export const createMedicineType = async (typeData: any) => {
  const { data } = await api.post("/admin/medicine-types", typeData);
  return data;
};

export const updateMedicineType = async (id: string, typeData: any) => {
  const { data } = await api.put(`/admin/medicine-types/${id}`, typeData);
  return data;
};

export const deleteMedicineType = async (id: string) => {
  const { data } = await api.delete(`/admin/medicine-types/${id}`);
  return data;
};
