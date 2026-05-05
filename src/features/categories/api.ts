import api from "@/lib/axios";

export const getCategories = async (params: any) => {
  const { data } = await api.get("/admin/categories", { params });
  return data;
};

export const createCategory = async (categoryData: any) => {
  const { data } = await api.post("/admin/categories", categoryData);
  return data;
};

export const updateCategory = async (id: string, categoryData: any) => {
  const { data } = await api.put(`/admin/categories/${id}`, categoryData);
  return data;
};

export const deleteCategory = async (id: string) => {
  const { data } = await api.delete(`/admin/categories/${id}`);
  return data;
};
