"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertCircle, CreditCard, FileText, Package, ReceiptText, ShoppingCart, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRequireAuth } from "@/features/auth/hooks/use-auth";
import {
  usePharmacyInventoryAnalytics,
  usePharmacyOverviewAnalytics,
  usePharmacyPurchaseAnalytics,
  usePharmacySalesAnalytics,
} from "@/features/analytics/hooks";

const money = (value: unknown) => `$${Number(value || 0).toFixed(2)}`;
const dateLabel = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : "-");

type InventoryItem = {
  id: string;
  stockQuantity: number;
  lowStockAlertQuantity: number;
  expiryDate?: string | null;
  medicine?: { name?: string | null; strength?: string | null } | null;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  saleDate?: string | null;
  totalAmount: number | string;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID" | "CANCELLED";
  customer?: { name?: string | null } | null;
};

type Payment = {
  id: string;
  amount: number | string;
  paymentMode: string;
  paymentDate?: string | null;
  invoice?: { invoiceNumber?: string | null } | null;
};

type Purchase = {
  id: string;
  invoiceNumber: string;
  totalAmount: number | string;
  purchaseDate?: string | null;
  supplier?: { name?: string | null } | null;
};

type TopSellingMedicine = {
  medicine?: { id?: string; name?: string | null } | null;
  quantity: number;
  total: number | string;
};

const statusVariant = (status: Invoice["paymentStatus"]) => {
  if (status === "PAID") return "success";
  if (status === "PARTIAL") return "warning";
  if (status === "CANCELLED") return "danger";
  return "muted";
};

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof Package }) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="size-4 text-teal-600" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-bold">{value}</CardContent>
    </Card>
  );
}

export default function PharmacyDashboardPage() {
  const { isLoading: authLoading } = useRequireAuth(["PHARMACY"]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const params = useMemo(() => ({ dateFrom, dateTo }), [dateFrom, dateTo]);
  const { data: overviewData, isLoading: overviewLoading } = usePharmacyOverviewAnalytics(params);
  const { data: salesData, isLoading: salesLoading } = usePharmacySalesAnalytics(params);
  const { data: purchaseData } = usePharmacyPurchaseAnalytics(params);
  const { data: inventoryData } = usePharmacyInventoryAnalytics();

  const overview = overviewData?.data;
  const sales = salesData?.data;
  const purchases = purchaseData?.data;
  const inventory = inventoryData?.data;
  const totals = overview?.totals ?? {};
  const recentInvoices = (overview?.recentInvoices ?? []) as Invoice[];
  const recentPayments = (overview?.recentPayments ?? []) as Payment[];
  const recentPurchases = (overview?.recentPurchases ?? []) as Purchase[];
  const lowStockItems = (inventory?.lowStockItems ?? []) as InventoryItem[];
  const expiringSoonItems = (inventory?.expiringSoonItems ?? []) as InventoryItem[];
  const topSellingMedicines = (sales?.topSellingMedicines ?? []) as TopSellingMedicine[];

  if (authLoading || overviewLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-10 w-72 rounded-md bg-slate-100" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-28 rounded-lg bg-slate-100" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pharmacy Analytics</h1>
          <p className="text-slate-500">Inventory, invoices, manual payment collections, and purchase activity.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Package} label="Inventory Items" value={totals.inventoryItems ?? 0} />
        <StatCard icon={AlertCircle} label="Low Stock" value={totals.lowStockItems ?? 0} />
        <StatCard icon={Users} label="Customers" value={totals.customers ?? 0} />
        <StatCard icon={ShoppingCart} label="Purchases" value={totals.purchases ?? 0} />
        <StatCard icon={ReceiptText} label="Sales Amount" value={money(totals.salesAmount)} />
        <StatCard icon={CreditCard} label="Collected Payments" value={money(totals.collectedAmount)} />
        <StatCard icon={FileText} label="Due Amount" value={money(totals.dueAmount)} />
        <StatCard icon={ShoppingCart} label="Purchase Amount" value={money(totals.purchaseAmount)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader><CardTitle className="text-base">Monthly Sales</CardTitle></CardHeader>
          <CardContent className="h-72">
            {!salesLoading && sales?.monthlySales?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sales.monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => money(value)} />
                  <Area dataKey="amount" fill="#99f6e4" stroke="#0f766e" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center text-sm text-slate-500">No sales data for this range.</div>}
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader><CardTitle className="text-base">Payment Collection</CardTitle></CardHeader>
          <CardContent className="h-72">
            {!salesLoading && sales?.monthlyPayments?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sales.monthlyPayments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => money(value)} />
                  <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center text-sm text-slate-500">No payment records for this range.</div>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader><CardTitle className="text-base">Top Selling Medicines</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Medicine</TableHead><TableHead>Qty</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
              <TableBody>
                {topSellingMedicines.length ? topSellingMedicines.map((item, index) => (
                  <TableRow key={item.medicine?.id || index}>
                    <TableCell className="font-medium">{item.medicine?.name || "Unknown medicine"}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="text-right">{money(item.total)}</TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={3} className="py-8 text-center text-slate-500">No sold medicines yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader><CardTitle className="text-base">Purchase Trend</CardTitle></CardHeader>
          <CardContent className="h-72">
            {purchases?.monthlyPurchases?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={purchases.monthlyPurchases}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => money(value)} />
                  <Bar dataKey="amount" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center text-sm text-slate-500">No purchase data for this range.</div>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <InventoryTable title="Low Stock Items" items={lowStockItems} mode="stock" />
        <InventoryTable title="Expiring Soon" items={expiringSoonItems} mode="expiry" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-lg">
          <CardHeader><CardTitle className="text-base">Recent Invoices</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {recentInvoices.length ? recentInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="font-medium">{invoice.invoiceNumber}</div>
                      <div className="text-xs text-slate-500">{invoice.customer?.name || "Walk-in"} - {dateLabel(invoice.saleDate)}</div>
                    </TableCell>
                    <TableCell>{money(invoice.totalAmount)}</TableCell>
                    <TableCell><Badge variant={statusVariant(invoice.paymentStatus)}>{invoice.paymentStatus}</Badge></TableCell>
                  </TableRow>
                )) : <TableRow><TableCell className="py-8 text-center text-slate-500">No invoices.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader><CardTitle className="text-base">Recent Payments</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {recentPayments.length ? recentPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="font-medium">{payment.invoice?.invoiceNumber || "Invoice"}</div>
                      <div className="text-xs text-slate-500">{payment.paymentMode} - {dateLabel(payment.paymentDate)}</div>
                    </TableCell>
                    <TableCell className="text-right">{money(payment.amount)}</TableCell>
                  </TableRow>
                )) : <TableRow><TableCell className="py-8 text-center text-slate-500">No payments.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader><CardTitle className="text-base">Recent Purchases</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {recentPurchases.length ? recentPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      <div className="font-medium">{purchase.invoiceNumber}</div>
                      <div className="text-xs text-slate-500">{purchase.supplier?.name || "Supplier"} - {dateLabel(purchase.purchaseDate)}</div>
                    </TableCell>
                    <TableCell className="text-right">{money(purchase.totalAmount)}</TableCell>
                  </TableRow>
                )) : <TableRow><TableCell className="py-8 text-center text-slate-500">No purchases.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InventoryTable({ title, items, mode }: { title: string; items: InventoryItem[]; mode: "stock" | "expiry" }) {
  return (
    <Card className="rounded-lg">
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead>{mode === "stock" ? "Stock" : "Expiry"}</TableHead>
              <TableHead>Alert</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length ? items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.medicine?.name || "-"}</TableCell>
                <TableCell>{mode === "stock" ? item.stockQuantity : dateLabel(item.expiryDate)}</TableCell>
                <TableCell>{item.lowStockAlertQuantity}</TableCell>
              </TableRow>
            )) : <TableRow><TableCell colSpan={3} className="py-8 text-center text-slate-500">No items found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
