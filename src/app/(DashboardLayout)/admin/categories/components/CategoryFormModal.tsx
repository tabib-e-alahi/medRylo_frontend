"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useCreateCategory, useUpdateCategory } from "@/features/categories/hooks";
import styles from "./modal.module.css";
import { useEffect } from "react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  category?: any;
}

export function CategoryFormModal({ open, onClose, category }: CategoryFormModalProps) {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: category || {
      name: "",
      slug: "",
      description: "",
      isActive: true,
    },
  });

  const name = watch("name");

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing && name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", slug);
    }
  }, [name, setValue, isEditing]);

  const onSubmit = async (data: any) => {
    if (isEditing) {
      await updateMutation.mutateAsync({ id: category.id, data });
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
          <h2 className={styles.title}>{isEditing ? "Edit Category" : "Add New Category"}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              placeholder="e.g. Antibiotics"
              {...register("name")}
              className={errors.name ? styles.inputError : ""}
            />
            {errors.name && <span className={styles.errorText}>{errors.name.message as string}</span>}
          </div>

          <div className={styles.field}>
            <Label htmlFor="slug">Slug (Auto-generated)</Label>
            <Input
              id="slug"
              placeholder="antibiotics"
              {...register("slug")}
              className={errors.slug ? styles.inputError : ""}
            />
            {errors.slug && <span className={styles.errorText}>{errors.slug.message as string}</span>}
          </div>

          <div className={styles.field}>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={3}
              className={`${styles.textarea} ${errors.description ? styles.inputError : ""}`}
              placeholder="Enter category description..."
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
              {isSubmitting ? "Saving..." : isEditing ? "Update Category" : "Create Category"}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
