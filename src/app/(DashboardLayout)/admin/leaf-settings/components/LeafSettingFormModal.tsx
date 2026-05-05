"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useCreateLeafSetting, useUpdateLeafSetting } from "@/features/leaf-settings/hooks";
import styles from "../../categories/components/modal.module.css";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  leavesPerStrip: z.coerce.number().int().min(1, "Must be at least 1"),
  stripsPerBox: z.coerce.number().int().min(1, "Must be at least 1"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

interface LeafSettingFormModalProps {
  open: boolean;
  onClose: () => void;
  leaf?: any;
}

export function LeafSettingFormModal({ open, onClose, leaf }: LeafSettingFormModalProps) {
  const createMutation = useCreateLeafSetting();
  const updateMutation = useUpdateLeafSetting();

  const isEditing = !!leaf;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: leaf || {
      name: "",
      leavesPerStrip: 10,
      stripsPerBox: 10,
      description: "",
      isActive: true,
    },
  });

  const onSubmit = async (data: any) => {
    if (isEditing) {
      await updateMutation.mutateAsync({ id: leaf.id, data });
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
          <h2 className={styles.title}>{isEditing ? "Edit Leaf Setting" : "Add New Setting"}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <Label htmlFor="name">Setting Name</Label>
            <Input
              id="name"
              placeholder="e.g. 10 Leaves / 10 Strips"
              {...register("name")}
              className={errors.name ? styles.inputError : ""}
            />
            {errors.name && <span className={styles.errorText}>{errors.name.message as string}</span>}
          </div>

          <div className={styles.fieldGroup} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className={styles.field}>
              <Label htmlFor="leavesPerStrip">Leaves per Strip</Label>
              <Input
                id="leavesPerStrip"
                type="number"
                {...register("leavesPerStrip")}
                className={errors.leavesPerStrip ? styles.inputError : ""}
              />
              {errors.leavesPerStrip && <span className={styles.errorText}>{errors.leavesPerStrip.message as string}</span>}
            </div>
            <div className={styles.field}>
              <Label htmlFor="stripsPerBox">Strips per Box</Label>
              <Input
                id="stripsPerBox"
                type="number"
                {...register("stripsPerBox")}
                className={errors.stripsPerBox ? styles.inputError : ""}
              />
              {errors.stripsPerBox && <span className={styles.errorText}>{errors.stripsPerBox.message as string}</span>}
            </div>
          </div>

          <div className={styles.field}>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={3}
              className={`${styles.textarea} ${errors.description ? styles.inputError : ""}`}
              placeholder="Enter setting description..."
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
              {isSubmitting ? "Saving..." : isEditing ? "Update Setting" : "Create Setting"}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
