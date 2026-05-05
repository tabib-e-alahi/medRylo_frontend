"use client";

import { useState } from "react";
import { useMedicines, useDeleteMedicine } from "@/features/medicines/hooks";
import { useCategories } from "@/features/categories/hooks";
import { useMedicineTypes } from "@/features/medicine-types/hooks";
import { useSuppliers } from "@/features/suppliers/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Edit2, Trash2, Filter, Image as ImageIcon, Pill } from "lucide-react";
import styles from "./medicines.module.css";
import { MedicineFormModal } from "./components/MedicineFormModal";

export default function MedicinesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [status, setStatus] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);

  const { data, isLoading } = useMedicines({ searchTerm, categoryId, typeId, supplierId, status });
  const { data: categories } = useCategories({ limit: 100 });
  const { data: types } = useMedicineTypes({ limit: 100 });
  const { data: suppliers } = useSuppliers({ limit: 100 });
  
  const deleteMutation = useDeleteMedicine();

  const handleEdit = (medicine: any) => {
    setSelectedMedicine(medicine);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedMedicine(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Master Medicine Database</h1>
          <p className={styles.subtitle}>Global catalogue of medicines for pharmacy inventory</p>
        </div>
        <Button onClick={handleAddNew} className={styles.addButton}>
          <Plus className="w-4 h-4 mr-2" />
          Add Medicine
        </Button>
      </header>

      <Card className={styles.tableCard}>
        <div className={styles.toolbar}>
          <div className={styles.filtersRow}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} />
              <Input
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.selectsWrapper}>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={styles.select}>
                <option value="">All Categories</option>
                {categories?.data?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <select value={typeId} onChange={(e) => setTypeId(e.target.value)} className={styles.select}>
                <option value="">All Types</option>
                {types?.data?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>

              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={styles.select}>
                <option value="">All Suppliers</option>
                {suppliers?.data?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>

              <select value={status} onChange={(e) => setStatus(e.target.value)} className={styles.select}>
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DISCONTINUED">Discontinued</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Category / Type</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th className={styles.actionsHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className={styles.skeletonRow}>
                    <td colSpan={6}><div className="skeleton h-12 w-full" /></td>
                  </tr>
                ))
              ) : data?.data?.length > 0 ? (
                data.data.map((medicine: any) => (
                  <tr key={medicine.id}>
                    <td>
                      <div className={styles.medicineInfo}>
                        <div className={styles.imageThumb}>
                          {medicine.image ? (
                            <img src={medicine.image} alt={medicine.name} />
                          ) : (
                            <div className={styles.placeholderImg}><Pill className="w-5 h-5 text-gray-400" /></div>
                          )}
                        </div>
                        <div>
                          <div className={styles.medicineName}>{medicine.name}</div>
                          <div className={styles.genericName}>{medicine.genericName} - {medicine.strength}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.metaInfo}>
                        <div className={styles.categoryLabel}>{medicine.category?.name || "-"}</div>
                        <div className={styles.typeLabel}>{medicine.type?.name || "-"}</div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.priceInfo}>
                        <div className={styles.sellPrice}>${Number(medicine.price).toFixed(2)}</div>
                        <div className={styles.supplierPrice}>Cost: ${Number(medicine.supplierPrice || 0).toFixed(2)}</div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.stockLabel}>{medicine.stockQuantity} {medicine.unit?.symbol}</div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[medicine.status?.toLowerCase()]}`}>
                        {medicine.status}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button onClick={() => handleEdit(medicine)} className={styles.actionBtn} title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(medicine.id)} className={`${styles.actionBtn} ${styles.delete}`} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    No medicines found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <MedicineFormModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          medicine={selectedMedicine}
        />
      )}
    </div>
  );
}
