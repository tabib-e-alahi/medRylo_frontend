import api from "@/lib/axios";

export const getMedicines = async (params: any) => {
  const { data } = await api.get("/admin/medicines", { params });
  return data;
};

export const createMedicine = async (formData: FormData) => {
  const { data } = await api.post("/admin/medicines", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const updateMedicine = async (id: string, formData: FormData) => {
  const { data } = await api.put(`/admin/medicines/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const deleteMedicine = async (id: string) => {
  const { data } = await api.delete(`/admin/medicines/${id}`);
  return data;
};
