"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Archive, CalendarClock, Edit2, PackagePlus, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCategories } from "@/features/categories/hooks";
import { useArchiveInventoryItem, useInventory } from "@/features/inventory/hooks";
import { useMyMedicineRequests } from "@/features/medicine-requests/hooks";
import { InventoryFormModal } from "./components/InventoryFormModal";
import { MedicineRequestFormModal } from "./components/MedicineRequestFormModal";

const money = (value: unknown) => `$${Number(value || 0).toFixed(2)}`;
const dateLabel = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : "-");

type Category = {
  id: string;
  name: string;
};

type InventoryItem = {
  id: string;
  medicineId: string;
  batchNumber?: string | null;
  stockQuantity: number;
  sellingPrice?: number | string | null;
  purchasePrice?: number | string | null;
  expiryDate?: string | null;
  shelf?: string | null;
  lowStockAlertQuantity: number;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  isLowStock?: boolean;
  isExpiringSoon?: boolean;
  medicine?: {
    id: string;
    name?: string | null;
    genericName?: string | null;
    strength?: string | null;
    category?: { name?: string | null } | null;
  } | null;
};

type MedicineRequest = {
  id: string;
  requestedName: string;
  genericName?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt?: string | null;
};

export default function PharmacyInventoryPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [alertFilter, setAlertFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const inventoryParams = useMemo(
    () => ({
      page,
      limit: 10,
      searchTerm,
      categoryId,
      status,
      lowStock: alertFilter === "lowStock" ? true : undefined,
      expiringSoon: alertFilter === "expiringSoon" ? true : undefined,
      sortBy,
      sortOrder,
    }),
    [alertFilter, categoryId, page, searchTerm, sortBy, sortOrder, status]
  );

  const { data, isLoading } = useInventory(inventoryParams);
  const { data: categories } = useCategories({ limit: 100 });
  const { data: myRequests } = useMyMedicineRequests({ limit: 5, sortBy: "createdAt", sortOrder: "desc" });
  const archiveItem = useArchiveInventoryItem();

  const items = (data?.data ?? []) as InventoryItem[];
  const meta = data?.meta;

  const handleAdd = () => {
    setSelectedItem(null);
    setIsInventoryModalOpen(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsInventoryModalOpen(true);
  };

  const handleArchive = async (id: string) => {
    if (confirm("Archive this inventory item?")) {
      await archiveItem.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pharmacy Inventory</h1>
          <p className="text-slate-500">Manage stock, batch, shelf, pricing, and expiry data for your approved pharmacy.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setIsRequestModalOpen(true)}>
            <Send className="size-4" />
            Request Missing Medicine
          </Button>
          <Button onClick={handleAdd}>
            <PackagePlus className="size-4" />
            Add from Global Database
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <PackagePlus className="size-4 text-teal-600" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{meta?.total ?? 0}</CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="size-4 text-amber-600" />
              Low Stock Visible
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{items.filter((item) => item.isLowStock).length}</CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CalendarClock className="size-4 text-red-600" />
              Expiring Soon Visible
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{items.filter((item) => item.isExpiringSoon).length}</CardContent>
        </Card>
      </div>

      <Card className="rounded-lg">
        <CardContent className="space-y-4 pt-4">
          <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(event) => {
                  setPage(1);
                  setSearchTerm(event.target.value);
                }}
                placeholder="Search by medicine name, generic, or strength"
                className="pl-8"
              />
            </div>
            <select value={categoryId} onChange={(event) => { setPage(1); setCategoryId(event.target.value); }} className="h-8 rounded-lg border bg-white px-3 text-sm">
              <option value="">All categories</option>
              {((categories?.data ?? []) as Category[]).map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }} className="h-8 rounded-lg border bg-white px-3 text-sm">
              <option value="">Active and inactive</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <select value={alertFilter} onChange={(event) => { setPage(1); setAlertFilter(event.target.value); }} className="h-8 rounded-lg border bg-white px-3 text-sm">
              <option value="">All alerts</option>
              <option value="lowStock">Low stock</option>
              <option value="expiringSoon">Expiring soon</option>
            </select>
            <select value={`${sortBy}:${sortOrder}`} onChange={(event) => {
              const [nextSortBy, nextSortOrder] = event.target.value.split(":");
              setSortBy(nextSortBy);
              setSortOrder(nextSortOrder as "asc" | "desc");
            }} className="h-8 rounded-lg border bg-white px-3 text-sm">
              <option value="createdAt:desc">Newest</option>
              <option value="medicineName:asc">Medicine A-Z</option>
              <option value="stockQuantity:asc">Stock low to high</option>
              <option value="expiryDate:asc">Expiry soonest</option>
              <option value="sellingPrice:desc">Price high to low</option>
            </select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Batch / Shelf</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={7}>
                      <div className="h-10 w-full rounded-md bg-slate-100" />
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length ? (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{item.medicine?.name}</div>
                      <div className="text-xs text-slate-500">
                        {[item.medicine?.genericName, item.medicine?.strength, item.medicine?.category?.name].filter(Boolean).join(" - ")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-800">{item.batchNumber || "-"}</div>
                      <div className="text-xs text-slate-500">{item.shelf || "No shelf"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{item.stockQuantity}</div>
                      <div className="text-xs text-slate-500">Alert at {item.lowStockAlertQuantity}</div>
                      {item.isLowStock && <Badge variant="warning" className="mt-1">Low stock</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{money(item.sellingPrice)}</div>
                      <div className="text-xs text-slate-500">Cost {money(item.purchasePrice)}</div>
                    </TableCell>
                    <TableCell>
                      <div>{dateLabel(item.expiryDate)}</div>
                      {item.isExpiringSoon && <Badge variant="danger" className="mt-1">Expiring soon</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === "ACTIVE" ? "success" : item.status === "ARCHIVED" ? "muted" : "warning"}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(item)} aria-label="Edit inventory item">
                          <Edit2 className="size-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleArchive(item.id)} aria-label="Archive inventory item">
                          <Archive className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-slate-500">
                    No inventory items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t pt-4 text-sm text-slate-500">
            <span>Page {meta?.page ?? page} of {meta?.totalPages ?? 1}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={!meta || page >= meta.totalPages} onClick={() => setPage((current) => current + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-base">Recent Missing Medicine Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {myRequests?.data?.length ? (
            ((myRequests.data ?? []) as MedicineRequest[]).map((request) => (
              <div key={request.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium text-slate-900">{request.requestedName}</div>
                  <div className="text-xs text-slate-500">{request.genericName || "No generic name"} - {dateLabel(request.createdAt)}</div>
                </div>
                <Badge variant={request.status === "APPROVED" ? "success" : request.status === "REJECTED" ? "danger" : "warning"}>
                  {request.status}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No medicine requests submitted yet.</p>
          )}
        </CardContent>
      </Card>

      <InventoryFormModal
        open={isInventoryModalOpen}
        item={selectedItem}
        onClose={() => setIsInventoryModalOpen(false)}
      />
      <MedicineRequestFormModal
        open={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
    </div>
  );
}
