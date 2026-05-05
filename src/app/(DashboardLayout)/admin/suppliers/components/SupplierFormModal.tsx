"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useCreateSupplier, useUpdateSupplier } from "@/features/suppliers/hooks";
import styles from "../../categories/components/modal.module.css";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().default(true),
});

interface SupplierFormModalProps {
  open: boolean;
  onClose: () => void;
  supplier?: any;
}

export function SupplierFormModal({ open, onClose, supplier }: SupplierFormModalProps) {
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();

  const isEditing = !!supplier;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: supplier || {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      isActive: true,
    },
  });

  const onSubmit = async (data: any) => {
    if (isEditing) {
      await updateMutation.mutateAsync({ id: supplier.id, data });
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
          <h2 className={styles.title}>{isEditing ? "Edit Supplier" : "Add New Supplier"}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <Label htmlFor="name">Supplier Name</Label>
            <Input
              id="name"
              placeholder="e.g. Square Pharmaceuticals Ltd."
              {...register("name")}
              className={errors.name ? styles.inputError : ""}
            />
            {errors.name && <span className={styles.errorText}>{errors.name.message as string}</span>}
          </div>

          <div className={styles.field}>
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              placeholder="e.g. John Doe"
              {...register("contactPerson")}
            />
          </div>

          <div className={styles.fieldGroup} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className={styles.field}>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="supplier@example.com"
                {...register("email")}
                className={errors.email ? styles.inputError : ""}
              />
              {errors.email && <span className={styles.errorText}>{errors.email.message as string}</span>}
            </div>
            <div className={styles.field}>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+880123456789"
                {...register("phone")}
              />
            </div>
          </div>

          <div className={styles.field}>
            <Label htmlFor="address">Address</Label>
            <textarea
              id="address"
              rows={2}
              className={`${styles.textarea} ${errors.address ? styles.inputError : ""}`}
              placeholder="Enter supplier address..."
              {...register("address")}
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
              {isSubmitting ? "Saving..." : isEditing ? "Update Supplier" : "Create Supplier"}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
