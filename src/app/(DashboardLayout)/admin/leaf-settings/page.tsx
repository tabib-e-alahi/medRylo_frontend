"use client";

import { useState } from "react";
import { useLeafSettings, useCreateLeafSetting, useUpdateLeafSetting, useDeleteLeafSetting } from "@/features/leaf-settings/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Edit2, Trash2, Filter } from "lucide-react";
import styles from "../categories/categories.module.css";
import { LeafSettingFormModal } from "./components/LeafSettingFormModal";

export default function LeafSettingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeaf, setSelectedLeaf] = useState<any>(null);

  const { data, isLoading } = useLeafSettings({ searchTerm });
  const deleteMutation = useDeleteLeafSetting();

  const handleEdit = (leaf: any) => {
    setSelectedLeaf(leaf);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedLeaf(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this leaf setting?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Leaf Settings</h1>
          <p className={styles.subtitle}>Configure packaging details like leaves per strip and strips per box</p>
        </div>
        <Button onClick={handleAddNew} className={styles.addButton}>
          <Plus className="w-4 h-4 mr-2" />
          Add Leaf Setting
        </Button>
      </header>

      <Card className={styles.tableCard}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="Search settings..."
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
                <th>Leaves / Strip</th>
                <th>Strips / Box</th>
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
                data.data.map((leaf: any) => (
                  <tr key={leaf.id}>
                    <td className={styles.nameCell}>{leaf.name}</td>
                    <td>{leaf.leavesPerStrip}</td>
                    <td>{leaf.stripsPerBox}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${leaf.isActive ? styles.active : styles.inactive}`}>
                        {leaf.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button onClick={() => handleEdit(leaf)} className={styles.actionBtn} title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(leaf.id)} className={`${styles.actionBtn} ${styles.delete}`} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                    No leaf settings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <LeafSettingFormModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          leaf={selectedLeaf}
        />
      )}
    </div>
  );
}
