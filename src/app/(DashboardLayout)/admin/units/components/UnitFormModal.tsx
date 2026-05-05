"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useCreateUnit, useUpdateUnit } from "@/features/units/hooks";
import styles from "../../categories/components/modal.module.css";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  symbol: z.string().min(1, "Symbol is required"),
  isActive: z.boolean().default(true),
});

interface UnitFormModalProps {
  open: boolean;
  onClose: () => void;
  unit?: any;
}

export function UnitFormModal({ open, onClose, unit }: UnitFormModalProps) {
  const createMutation = useCreateUnit();
  const updateMutation = useUpdateUnit();

  const isEditing = !!unit;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: unit || {
      name: "",
      symbol: "",
      isActive: true,
    },
  });

  const onSubmit = async (data: any) => {
    if (isEditing) {
      await updateMutation.mutateAsync({ id: unit.id, data });
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
          <h2 className={styles.title}>{isEditing ? "Edit Unit" : "Add New Unit"}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <Label htmlFor="name">Unit Name</Label>
            <Input
              id="name"
              placeholder="e.g. Milligram, Milliliter, Box"
              {...register("name")}
              className={errors.name ? styles.inputError : ""}
            />
            {errors.name && <span className={styles.errorText}>{errors.name.message as string}</span>}
          </div>

          <div className={styles.field}>
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              placeholder="e.g. mg, ml, Box"
              {...register("symbol")}
              className={errors.symbol ? styles.inputError : ""}
            />
            {errors.symbol && <span className={styles.errorText}>{errors.symbol.message as string}</span>}
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
              {isSubmitting ? "Saving..." : isEditing ? "Update Unit" : "Create Unit"}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
