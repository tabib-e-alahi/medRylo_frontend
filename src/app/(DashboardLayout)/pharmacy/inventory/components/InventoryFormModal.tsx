"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateInventoryItem, useGlobalMedicinesForInventory, useUpdateInventoryItem } from "@/features/inventory/hooks";

const schema = z.object({
  medicineId: z.string().min(1, "Select a medicine"),
  batchNumber: z.string().optional(),
  stockQuantity: z.coerce.number().int().min(0, "Stock must be zero or more"),
  sellingPrice: z.coerce.number().min(0, "Selling price must be zero or more"),
  purchasePrice: z.coerce.number().min(0, "Purchase price must be zero or more").optional(),
  expiryDate: z.string().optional(),
  shelf: z.string().optional(),
  lowStockAlertQuantity: z.coerce.number().int().min(0).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).default("ACTIVE"),
});

type InventoryFormValues = z.infer<typeof schema>;

type MedicineOption = {
  id: string;
  name?: string | null;
  genericName?: string | null;
  strength?: string | null;
  price?: number | string | null;
  supplierPrice?: number | string | null;
  shelf?: string | null;
  category?: { name?: string | null } | null;
  type?: { name?: string | null } | null;
};

type InventoryItem = {
  id: string;
  medicineId: string;
  batchNumber?: string | null;
  stockQuantity: number;
  sellingPrice?: number | string | null;
  purchasePrice?: number | string | null;
  expiryDate?: string | null;
  shelf?: string | null;
  lowStockAlertQuantity: number;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  medicine?: MedicineOption | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
};

export function InventoryFormModal({ open, onClose, item }: Props) {
  const [medicineSearch, setMedicineSearch] = useState("");
  const createInventory = useCreateInventoryItem();
  const updateInventory = useUpdateInventoryItem();
  const { data: medicines, isLoading: medicinesLoading } = useGlobalMedicinesForInventory({
    searchTerm: medicineSearch,
    limit: 25,
  });

  const isEditing = Boolean(item);
  const defaultValues = useMemo<InventoryFormValues>(
    () => ({
      medicineId: item?.medicineId || "",
      batchNumber: item?.batchNumber || "",
      stockQuantity: item?.stockQuantity ?? 0,
      sellingPrice: Number(item?.sellingPrice ?? item?.medicine?.price ?? 0),
      purchasePrice: Number(item?.purchasePrice ?? 0),
      expiryDate: item?.expiryDate ? new Date(item.expiryDate).toISOString().slice(0, 10) : "",
      shelf: item?.shelf || "",
      lowStockAlertQuantity: item?.lowStockAlertQuantity ?? 10,
      status: item?.status || "ACTIVE",
    }),
    [item]
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof schema>, unknown, InventoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const selectedMedicineId = watch("medicineId");

  useEffect(() => {
    const selected = ((medicines?.data ?? []) as MedicineOption[]).find((medicine) => medicine.id === selectedMedicineId);
    if (selected && !isEditing) {
      setValue("sellingPrice", Number(selected.price || 0));
      setValue("purchasePrice", Number(selected.supplierPrice || 0));
      setValue("shelf", selected.shelf || "");
    }
  }, [isEditing, medicines?.data, selectedMedicineId, setValue]);

  const onSubmit = async (values: InventoryFormValues) => {
    const payload = {
      ...values,
      expiryDate: values.expiryDate || "",
      purchasePrice: values.purchasePrice ?? 0,
      lowStockAlertQuantity: values.lowStockAlertQuantity ?? 10,
    };

    if (isEditing) {
      await updateInventory.mutateAsync({ id: item!.id, payload });
    } else {
      await createInventory.mutateAsync(payload);
    }

    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{isEditing ? "Edit Inventory Item" : "Add Medicine to Inventory"}</h2>
            <p className="text-sm text-slate-500">Use medicines from the admin-managed global database.</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Global Medicine</Label>
              <div className="mt-2 grid gap-3 md:grid-cols-[1fr_2fr]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-slate-400" />
                  <Input
                    value={medicineSearch}
                    onChange={(event) => setMedicineSearch(event.target.value)}
                    placeholder="Search global database"
                    className="pl-8"
                    disabled={isEditing}
                  />
                </div>
                <select
                  {...register("medicineId")}
                  disabled={isEditing}
                  className="h-8 rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-60"
                >
                  <option value="">{medicinesLoading ? "Loading medicines..." : "Select medicine"}</option>
                  {item?.medicine && (
                    <option value={item.medicine.id}>
                      {item.medicine.name} {item.medicine.strength ? `- ${item.medicine.strength}` : ""}
                    </option>
                  )}
                  {((medicines?.data ?? []) as MedicineOption[]).map((medicine) => (
                    <option key={medicine.id} value={medicine.id}>
                      {medicine.name} {medicine.strength ? `- ${medicine.strength}` : ""} {medicine.genericName ? `(${medicine.genericName})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {errors.medicineId && <p className="mt-1 text-xs text-red-600">{String(errors.medicineId.message)}</p>}
            </div>

            <div>
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input id="batchNumber" {...register("batchNumber")} className="mt-2" placeholder="e.g. BTH-2026-01" />
            </div>

            <div>
              <Label htmlFor="shelf">Shelf</Label>
              <Input id="shelf" {...register("shelf")} className="mt-2" placeholder="e.g. A-12" />
            </div>

            <div>
              <Label htmlFor="stockQuantity">Stock Quantity</Label>
              <Input id="stockQuantity" type="number" {...register("stockQuantity")} className="mt-2" />
              {errors.stockQuantity && <p className="mt-1 text-xs text-red-600">{String(errors.stockQuantity.message)}</p>}
            </div>

            <div>
              <Label htmlFor="lowStockAlertQuantity">Low Stock Alert</Label>
              <Input id="lowStockAlertQuantity" type="number" {...register("lowStockAlertQuantity")} className="mt-2" />
            </div>

            <div>
              <Label htmlFor="sellingPrice">Selling Price</Label>
              <Input id="sellingPrice" type="number" step="0.01" {...register("sellingPrice")} className="mt-2" />
              {errors.sellingPrice && <p className="mt-1 text-xs text-red-600">{String(errors.sellingPrice.message)}</p>}
            </div>

            <div>
              <Label htmlFor="purchasePrice">Purchase Price</Label>
              <Input id="purchasePrice" type="number" step="0.01" {...register("purchasePrice")} className="mt-2" />
            </div>

            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input id="expiryDate" type="date" {...register("expiryDate")} className="mt-2" />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                {...register("status")}
                className="mt-2 h-8 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <Label>Selected Medicine Details</Label>
            <Textarea
              readOnly
              value={
                item?.medicine
                  ? `${item.medicine.name}\n${item.medicine.genericName || ""}\n${item.medicine.category?.name || ""} ${item.medicine.type?.name || ""}`
                  : "Search and select a medicine above. Pharmacy users cannot create global medicines from here."
              }
              className="mt-2 min-h-20 bg-white"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || createInventory.isPending || updateInventory.isPending}>
              {isSubmitting ? "Saving..." : isEditing ? "Update Item" : "Add to Inventory"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
