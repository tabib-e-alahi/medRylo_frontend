"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, PackagePlus, Search, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePurchases, usePurchaseSuppliers } from "@/features/purchases/hooks";

const money = (value: unknown) => `$${Number(value || 0).toFixed(2)}`;
const dateLabel = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : "-");

type Supplier = {
  id: string;
  name: string;
};

type Purchase = {
  id: string;
  invoiceNumber: string;
  purchaseDate?: string | null;
  totalAmount: number | string;
  paidAmount: number | string;
  dueAmount: number | string;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID" | "CANCELLED";
  purchaseStatus: "PENDING" | "RECEIVED" | "PARTIAL" | "CANCELLED";
  supplier?: Supplier | null;
  items?: unknown[];
};

const paymentVariant = (status: Purchase["paymentStatus"]) => {
  if (status === "PAID") return "success";
  if (status === "PARTIAL") return "warning";
  if (status === "CANCELLED") return "danger";
  return "muted";
};

const purchaseVariant = (status: Purchase["purchaseStatus"]) => {
  if (status === "RECEIVED") return "success";
  if (status === "PENDING" || status === "PARTIAL") return "warning";
  return "danger";
};

export default function PharmacyPurchasesPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [purchaseStatus, setPurchaseStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      searchTerm,
      supplierId,
      paymentStatus,
      purchaseStatus,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
    }),
    [dateFrom, dateTo, page, paymentStatus, purchaseStatus, searchTerm, sortBy, sortOrder, supplierId]
  );

  const { data, isLoading } = usePurchases(params);
  const { data: suppliers } = usePurchaseSuppliers({ limit: 100 });

  const purchases = (data?.data ?? []) as Purchase[];
  const meta = data?.meta;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Purchases</h1>
          <p className="text-slate-500">Record supplier purchases and keep received stock aligned with inventory.</p>
        </div>
        <Button asChild>
          <Link href="/pharmacy/purchases/create">
            <PackagePlus className="size-4" />
            Create Purchase
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ShoppingCart className="size-4 text-teal-600" />
              Total Purchases
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{meta?.total ?? 0}</CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="text-sm">Visible Total</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {money(purchases.reduce((sum, purchase) => sum + Number(purchase.totalAmount || 0), 0))}
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="text-sm">Visible Due</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {money(purchases.reduce((sum, purchase) => sum + Number(purchase.dueAmount || 0), 0))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg">
        <CardContent className="space-y-4 pt-4">
          <div className="grid gap-3 xl:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(event) => {
                  setPage(1);
                  setSearchTerm(event.target.value);
                }}
                placeholder="Search invoice or supplier"
                className="pl-8"
              />
            </div>
            <select value={supplierId} onChange={(event) => { setPage(1); setSupplierId(event.target.value); }} className="h-8 rounded-lg border bg-white px-3 text-sm">
              <option value="">All suppliers</option>
              {((suppliers?.data ?? []) as Supplier[]).map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
            <select value={purchaseStatus} onChange={(event) => { setPage(1); setPurchaseStatus(event.target.value); }} className="h-8 rounded-lg border bg-white px-3 text-sm">
              <option value="">All purchase statuses</option>
              <option value="PENDING">Pending</option>
              <option value="RECEIVED">Received</option>
              <option value="PARTIAL">Partial</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select value={paymentStatus} onChange={(event) => { setPage(1); setPaymentStatus(event.target.value); }} className="h-8 rounded-lg border bg-white px-3 text-sm">
              <option value="">All payment statuses</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <Input type="date" value={dateFrom} onChange={(event) => { setPage(1); setDateFrom(event.target.value); }} />
            <Input type="date" value={dateTo} onChange={(event) => { setPage(1); setDateTo(event.target.value); }} />
            <select value={`${sortBy}:${sortOrder}`} onChange={(event) => {
              const [nextSortBy, nextSortOrder] = event.target.value.split(":");
              setSortBy(nextSortBy);
              setSortOrder(nextSortOrder as "asc" | "desc");
            }} className="h-8 rounded-lg border bg-white px-3 text-sm">
              <option value="createdAt:desc">Newest</option>
              <option value="purchaseDate:desc">Purchase date</option>
              <option value="invoiceNumber:asc">Invoice A-Z</option>
              <option value="totalAmount:desc">Total high to low</option>
              <option value="dueAmount:desc">Due high to low</option>
            </select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={8}>
                      <div className="h-10 w-full rounded-md bg-slate-100" />
                    </TableCell>
                  </TableRow>
                ))
              ) : purchases.length ? (
                purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-semibold text-slate-900">{purchase.invoiceNumber}</TableCell>
                    <TableCell>{purchase.supplier?.name || "-"}</TableCell>
                    <TableCell>{dateLabel(purchase.purchaseDate)}</TableCell>
                    <TableCell>{purchase.items?.length ?? 0}</TableCell>
                    <TableCell>{money(purchase.totalAmount)}</TableCell>
                    <TableCell>{money(purchase.dueAmount)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={purchaseVariant(purchase.purchaseStatus)}>{purchase.purchaseStatus}</Badge>
                        <Badge variant={paymentVariant(purchase.paymentStatus)}>{purchase.paymentStatus}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="icon" aria-label="View purchase">
                        <Link href={`/pharmacy/purchases/${purchase.id}`}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-slate-500">
                    No purchases found.
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
    </div>
  );
}
