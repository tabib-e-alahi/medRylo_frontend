"use client";

import { useState } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/features/categories/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Edit2, Trash2, MoreHorizontal, Filter } from "lucide-react";
import styles from "./categories.module.css";
import { CategoryFormModal } from "./components/CategoryFormModal";

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const { data, isLoading } = useCategories({ searchTerm });
  const deleteMutation = useDeleteCategory();

  const handleEdit = (category: any) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Categories</h1>
          <p className={styles.subtitle}>Manage medicine categories for the global database</p>
        </div>
        <Button onClick={handleAddNew} className={styles.addButton}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </header>

      <Card className={styles.tableCard}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <Button variant="outline" className={styles.filterButton}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Status</th>
                <th className={styles.actionsHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className={styles.skeletonRow}>
                    <td colSpan={5}><div className="skeleton h-8 w-full" /></td>
                  </tr>
                ))
              ) : data?.data?.length > 0 ? (
                data.data.map((category: any) => (
                  <tr key={category.id}>
                    <td className={styles.nameCell}>{category.name}</td>
                    <td className={styles.slugCell}>{category.slug}</td>
                    <td className={styles.descCell}>{category.description || "-"}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${category.isActive ? styles.active : styles.inactive}`}>
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button onClick={() => handleEdit(category)} className={styles.actionBtn} title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(category.id)} className={`${styles.actionBtn} ${styles.delete}`} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <CategoryFormModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          category={selectedCategory}
        />
      )}
    </div>
  );
}
