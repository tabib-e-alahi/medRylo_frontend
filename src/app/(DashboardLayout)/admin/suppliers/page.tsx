"use client";

import { useState } from "react";
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from "@/features/suppliers/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Edit2, Trash2, Filter, Mail, Phone, User as UserIcon } from "lucide-react";
import styles from "../categories/categories.module.css";
import { SupplierFormModal } from "./components/SupplierFormModal";

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  const { data, isLoading } = useSuppliers({ searchTerm });
  const deleteMutation = useDeleteSupplier();

  const handleEdit = (supplier: any) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Suppliers</h1>
          <p className={styles.subtitle}>Manage medicine suppliers and manufacturers</p>
        </div>
        <Button onClick={handleAddNew} className={styles.addButton}>
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </header>

      <Card className={styles.tableCard}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="Search suppliers..."
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
                <th>Supplier Info</th>
                <th>Contact Person</th>
                <th>Contact Details</th>
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
                data.data.map((supplier: any) => (
                  <tr key={supplier.id}>
                    <td>
                      <div className={styles.supplierInfo}>
                        <div className={styles.supplierName}>{supplier.name}</div>
                        <div className={styles.supplierAddress}>{supplier.address || "-"}</div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.contactPerson}>
                        <UserIcon className="w-3 h-3 mr-1 inline" />
                        {supplier.contactPerson || "-"}
                      </div>
                    </td>
                    <td>
                      <div className={styles.contactDetails}>
                        {supplier.email && (
                          <div className={styles.detailItem}>
                            <Mail className="w-3 h-3 mr-1 inline" />
                            {supplier.email}
                          </div>
                        )}
                        {supplier.phone && (
                          <div className={styles.detailItem}>
                            <Phone className="w-3 h-3 mr-1 inline" />
                            {supplier.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${supplier.isActive ? styles.active : styles.inactive}`}>
                        {supplier.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button onClick={() => handleEdit(supplier)} className={styles.actionBtn} title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(supplier.id)} className={`${styles.actionBtn} ${styles.delete}`} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                    No suppliers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <SupplierFormModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          supplier={selectedSupplier}
        />
      )}
    </div>
  );
}
