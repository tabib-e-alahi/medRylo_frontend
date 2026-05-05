"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, Pill } from "lucide-react";
import { useCreateMedicine, useUpdateMedicine } from "@/features/medicines/hooks";
import { useCategories } from "@/features/categories/hooks";
import { useMedicineTypes } from "@/features/medicine-types/hooks";
import { useSuppliers } from "@/features/suppliers/hooks";
import { useUnits } from "@/features/units/hooks";
import { useLeafSettings } from "@/features/leaf-settings/hooks";
import styles from "./form.module.css";
import modalStyles from "../../categories/components/modal.module.css";
import { useState, useEffect } from "react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  genericName: z.string().optional(),
  strength: z.string().optional(),
  boxSize: z.string().optional(),
  shelf: z.string().optional(),
  price: z.coerce.number().min(0),
  supplierPrice: z.coerce.number().min(0).optional(),
  vat: z.coerce.number().min(0).optional(),
  expiryDate: z.string().optional(),
  stockQuantity: z.coerce.number().int().min(0).optional(),
  description: z.string().optional(),
  status: z.string().default("ACTIVE"),
  categoryId: z.string().optional(),
  typeId: z.string().optional(),
  supplierId: z.string().optional(),
  unitId: z.string().optional(),
  leafSettingId: z.string().optional(),
});

interface MedicineFormModalProps {
  open: boolean;
  onClose: () => void;
  medicine?: any;
}

export function MedicineFormModal({ open, onClose, medicine }: MedicineFormModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(medicine?.image || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const createMutation = useCreateMedicine();
  const updateMutation = useUpdateMedicine();

  const { data: categories } = useCategories({ limit: 100 });
  const { data: types } = useMedicineTypes({ limit: 100 });
  const { data: suppliers } = useSuppliers({ limit: 100 });
  const { data: units } = useUnits({ limit: 100 });
  const { data: leaves } = useLeafSettings({ limit: 100 });

  const isEditing = !!medicine;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: medicine ? {
      ...medicine,
      expiryDate: medicine.expiryDate ? new Date(medicine.expiryDate).toISOString().split('T')[0] : "",
    } : {
      name: "",
      genericName: "",
      strength: "",
      boxSize: "",
      shelf: "",
      price: 0,
      supplierPrice: 0,
      vat: 0,
      expiryDate: "",
      stockQuantity: 0,
      description: "",
      status: "ACTIVE",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
        alert("Please select a JPG, PNG, or WEBP image.");
        e.target.value = "";
        return;
      }
      if (file.size > 1024 * 1024) {
        alert("Image size must be 1 MB or less.");
        e.target.value = "";
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    if (selectedFile) {
      formData.append("image", selectedFile);
    } else if (isEditing && medicine.image && !imagePreview) {
      formData.append("removeImage", "true");
    }

    if (isEditing) {
      await updateMutation.mutateAsync({ id: medicine.id, formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className={modalStyles.overlay} onClick={onClose}>
      <div className={`${modalStyles.modal} ${styles.wideModal}`} onClick={(e) => e.stopPropagation()}>
        <header className={modalStyles.header}>
          <h2 className={modalStyles.title}>{isEditing ? "Edit Medicine" : "Add New Medicine"}</h2>
          <button className={modalStyles.closeBtn} onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.scrollArea}>
            <div className={styles.grid}>
              {/* Image Upload Section */}
              <div className={styles.imageSection}>
                <Label>Medicine Image</Label>
                <div className={styles.dropzone}>
                  {imagePreview ? (
                    <div className={styles.previewContainer}>
                      <img src={imagePreview} alt="Preview" className={styles.preview} />
                      <button type="button" className={styles.removeImg} onClick={() => { setImagePreview(null); setSelectedFile(null); }}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className={styles.uploadLabel}>
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <span>Click to upload image</span>
                      <small>JPG, PNG, WEBP. Max 1 MB.</small>
                      <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
                    </label>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className={styles.mainInfo}>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <Label htmlFor="name">Medicine Name</Label>
                    <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
                  </div>
                  <div className={styles.field}>
                    <Label htmlFor="genericName">Generic Name</Label>
                    <Input id="genericName" {...register("genericName")} />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <Label htmlFor="strength">Strength</Label>
                    <Input id="strength" placeholder="e.g. 500mg" {...register("strength")} />
                  </div>
                  <div className={styles.field}>
                    <Label htmlFor="status">Status</Label>
                    <select {...register("status")} className={styles.select}>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="DISCONTINUED">Discontinued</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Classification */}
              <div className={styles.fullRow}>
                <div className={styles.rowFour}>
                  <div className={styles.field}>
                    <Label>Category</Label>
                    <select {...register("categoryId")} className={styles.select}>
                      <option value="">Select Category</option>
                      {categories?.data?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <Label>Type</Label>
                    <select {...register("typeId")} className={styles.select}>
                      <option value="">Select Type</option>
                      {types?.data?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <Label>Supplier</Label>
                    <select {...register("supplierId")} className={styles.select}>
                      <option value="">Select Supplier</option>
                      {suppliers?.data?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <Label>Unit</Label>
                    <select {...register("unitId")} className={styles.select}>
                      <option value="">Select Unit</option>
                      {units?.data?.map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className={styles.fullRow}>
                <div className={styles.rowFour}>
                  <div className={styles.field}>
                    <Label htmlFor="price">Selling Price</Label>
                    <Input id="price" type="number" step="0.01" {...register("price")} />
                  </div>
                  <div className={styles.field}>
                    <Label htmlFor="supplierPrice">Purchase Price</Label>
                    <Input id="supplierPrice" type="number" step="0.01" {...register("supplierPrice")} />
                  </div>
                  <div className={styles.field}>
                    <Label htmlFor="vat">VAT (%)</Label>
                    <Input id="vat" type="number" {...register("vat")} />
                  </div>
                  <div className={styles.field}>
                    <Label htmlFor="stockQuantity">Stock Quantity</Label>
                    <Input id="stockQuantity" type="number" {...register("stockQuantity")} />
                  </div>
                </div>
              </div>

              {/* Packaging & Logistics */}
              <div className={styles.fullRow}>
                <div className={styles.rowFour}>
                  <div className={styles.field}>
                    <Label>Leaf Setting</Label>
                    <select {...register("leafSettingId")} className={styles.select}>
                      <option value="">Select Setting</option>
                      {leaves?.data?.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <Label htmlFor="boxSize">Box Size</Label>
                    <Input id="boxSize" placeholder="e.g. 10x10" {...register("boxSize")} />
                  </div>
                  <div className={styles.field}>
                    <Label htmlFor="shelf">Shelf / Location</Label>
                    <Input id="shelf" placeholder="e.g. A-12" {...register("shelf")} />
                  </div>
                  <div className={styles.field}>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input id="expiryDate" type="date" {...register("expiryDate")} />
                  </div>
                </div>
              </div>

              <div className={styles.fullRow}>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  rows={2}
                  className={styles.textarea}
                  placeholder="Enter medicine description..."
                  {...register("description")}
                />
              </div>
            </div>
          </div>

          <footer className={modalStyles.footer}>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className={modalStyles.submitBtn}>
              {isSubmitting ? "Saving..." : isEditing ? "Update Medicine" : "Create Medicine"}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
