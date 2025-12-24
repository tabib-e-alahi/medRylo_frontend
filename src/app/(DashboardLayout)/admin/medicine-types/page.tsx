"use client";

import { useState } from "react";
import { useMedicineTypes, useDeleteMedicineType } from "@/features/medicine-types/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Edit2, Trash2, Filter } from "lucide-react";
import styles from "../categories/categories.module.css";
import { MedicineTypeFormModal } from "./components/MedicineTypeFormModal";

export default function MedicineTypesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<any>(null);

  const { data, isLoading } = useMedicineTypes({ searchTerm });
  const deleteMutation = useDeleteMedicineType();

  const handleEdit = (type: any) => {
    setSelectedType(type);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedType(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this medicine type?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Medicine Types</h1>
          <p className={styles.subtitle}>Manage types like Tablet, Capsule, Syrup, etc.</p>
        </div>
        <Button onClick={handleAddNew} className={styles.addButton}>
          <Plus className="w-4 h-4 mr-2" />
          Add Type
        </Button>
      </header>

      <Card className={styles.tableCard}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="Search types..."
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
                <th>Description</th>
                <th>Status</th>
                <th className={styles.actionsHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className={styles.skeletonRow}>
                    <td colSpan={4}><div className="skeleton h-8 w-full" /></td>
                  </tr>
                ))
              ) : data?.data?.length > 0 ? (
                data.data.map((type: any) => (
                  <tr key={type.id}>
                    <td className={styles.nameCell}>{type.name}</td>
                    <td className={styles.descCell}>{type.description || "-"}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${type.isActive ? styles.active : styles.inactive}`}>
                        {type.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button onClick={() => handleEdit(type)} className={styles.actionBtn} title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(type.id)} className={`${styles.actionBtn} ${styles.delete}`} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>
                    No medicine types found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <MedicineTypeFormModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          typeData={selectedType}
        />
      )}
    </div>
  );
}
