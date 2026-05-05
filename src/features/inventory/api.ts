import api from "@/lib/axios";

export type InventoryParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  categoryId?: string;
  status?: string;
  lowStock?: boolean;
  expiringSoon?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type GlobalMedicineParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  categoryId?: string;
  typeId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type InventoryPayload = Record<string, unknown>;

export const getInventory = async (params: InventoryParams) => {
  const { data } = await api.get("/pharmacy/inventory", { params });
  return data;
};

export const getGlobalMedicinesForInventory = async (params: GlobalMedicineParams) => {
  const { data } = await api.get("/pharmacy/inventory/medicines", { params });
  return data;
};

export const createInventoryItem = async (payload: InventoryPayload) => {
  const { data } = await api.post("/pharmacy/inventory", payload);
  return data;
};

export const updateInventoryItem = async ({ id, payload }: { id: string; payload: InventoryPayload }) => {
  const { data } = await api.put(`/pharmacy/inventory/${id}`, payload);
  return data;
};

export const archiveInventoryItem = async (id: string) => {
  const { data } = await api.delete(`/pharmacy/inventory/${id}`);
  return data;
};
