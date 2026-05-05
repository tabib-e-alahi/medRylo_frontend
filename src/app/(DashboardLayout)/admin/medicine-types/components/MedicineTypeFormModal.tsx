"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useCreateMedicineType, useUpdateMedicineType } from "@/features/medicine-types/hooks";
import styles from "../../categories/components/modal.module.css";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

interface MedicineTypeFormModalProps {
  open: boolean;
  onClose: () => void;
  typeData?: any;
}

export function MedicineTypeFormModal({ open, onClose, typeData }: MedicineTypeFormModalProps) {
  const createMutation = useCreateMedicineType();
  const updateMutation = useUpdateMedicineType();

  const isEditing = !!typeData;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: typeData || {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const onSubmit = async (data: any) => {
    if (isEditing) {
      await updateMutation.mutateAsync({ id: typeData.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>{isEditing ? "Edit Medicine Type" : "Add New Type"}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <Label htmlFor="name">Type Name</Label>
            <Input
              id="name"
              placeholder="e.g. Tablet, Syrup, Injection"
              {...register("name")}
              className={errors.name ? styles.inputError : ""}
            />
            {errors.name && <span className={styles.errorText}>{errors.name.message as string}</span>}
          </div>

          <div className={styles.field}>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={3}
              className={`${styles.textarea} ${errors.description ? styles.inputError : ""}`}
              placeholder="Enter type description..."
              {...register("description")}
            />
          </div>

          <div className={styles.checkboxField}>
            <input type="checkbox" id="isActive" {...register("isActive")} className={styles.checkbox} />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <footer className={styles.footer}>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
              {isSubmitting ? "Saving..." : isEditing ? "Update Type" : "Create Type"}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
