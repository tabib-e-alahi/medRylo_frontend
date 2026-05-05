import api from "@/lib/axios";

export const getSuppliers = async (params: any) => {
  const { data } = await api.get("/admin/suppliers", { params });
  return data;
};

export const createSupplier = async (supplierData: any) => {
  const { data } = await api.post("/admin/suppliers", supplierData);
  return data;
};

export const updateSupplier = async (id: string, supplierData: any) => {
  const { data } = await api.put(`/admin/suppliers/${id}`, supplierData);
  return data;
};

export const deleteSupplier = async (id: string) => {
  const { data } = await api.delete(`/admin/suppliers/${id}`);
  return data;
};
