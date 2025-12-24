"use client";

import { useState } from "react";
import { useUnits, useDeleteUnit } from "@/features/units/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Edit2, Trash2, Filter } from "lucide-react";
import styles from "../categories/categories.module.css";
import { UnitFormModal } from "./components/UnitFormModal";

export default function UnitsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);

  const { data, isLoading } = useUnits({ searchTerm });
  const deleteMutation = useDeleteUnit();

  const handleEdit = (unit: any) => {
    setSelectedUnit(unit);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedUnit(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this unit?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Units</h1>
          <p className={styles.subtitle}>Manage measurement units like mg, ml, Box, etc.</p>
        </div>
        <Button onClick={handleAddNew} className={styles.addButton}>
          <Plus className="w-4 h-4 mr-2" />
          Add Unit
        </Button>
      </header>

      <Card className={styles.tableCard}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="Search units..."
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
                <th>Symbol</th>
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
                data.data.map((unit: any) => (
                  <tr key={unit.id}>
                    <td className={styles.nameCell}>{unit.name}</td>
                    <td className={styles.slugCell}>{unit.symbol}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${unit.isActive ? styles.active : styles.inactive}`}>
                        {unit.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button onClick={() => handleEdit(unit)} className={styles.actionBtn} title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(unit.id)} className={`${styles.actionBtn} ${styles.delete}`} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>
                    No units found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <UnitFormModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          unit={selectedUnit}
        />
      )}
    </div>
  );
}
