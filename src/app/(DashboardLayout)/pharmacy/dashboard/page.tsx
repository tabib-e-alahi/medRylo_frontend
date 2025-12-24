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
    <Card className="rounded-lg bg-(--color-surface)">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-(--color-text-muted)">
          <Icon className="size-4 text-(--color-primary)" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-bold text-(--color-text)">{value}</CardContent>
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
        <div className="h-10 w-72 rounded-md bg-(--color-bg-secondary)" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-28 rounded-lg bg-(--color-bg-secondary)" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-(--color-text)">Pharmacy Analytics</h1>
          <p className="text-(--color-text-muted)">Inventory, invoices, manual payment collections, and purchase activity.</p>
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
        <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
          <CardHeader>
            <CardTitle className="text-base text-(--color-text)">Monthly Sales</CardTitle>
          </CardHeader>

          <CardContent className="h-72">
            {!salesLoading && sales?.monthlySales?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sales.monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-text-muted)" />
                  <YAxis stroke="var(--color-text-muted)" />
                  <Tooltip
                    formatter={(value) => money(value)}
                    contentStyle={{
                      backgroundColor: "var(--color-surface-raised)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text)",
                    }}
                    labelStyle={{
                      color: "var(--color-text)",
                    }}
                    itemStyle={{
                      color: "var(--color-primary)",
                    }}
                  />
                  <Area
                    dataKey="amount"
                    fill="var(--color-primary-100)"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-(--color-text-muted)">
                No sales data for this range.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
          <CardHeader>
            <CardTitle className="text-base text-(--color-text)">Payment Collection</CardTitle>
          </CardHeader>

          <CardContent className="h-72">
            {!salesLoading && sales?.monthlyPayments?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sales.monthlyPayments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-text-muted)" />
                  <YAxis stroke="var(--color-text-muted)" />
                  <Tooltip
                    formatter={(value) => money(value)}
                    contentStyle={{
                      backgroundColor: "var(--color-surface-raised)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text)",
                    }}
                    labelStyle={{
                      color: "var(--color-text)",
                    }}
                    itemStyle={{
                      color: "var(--color-info)",
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="var(--color-info)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-(--color-text-muted)">
                No payment records for this range.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
          <CardHeader>
            <CardTitle className="text-base text-(--color-text)">Top Selling Medicines</CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-(--color-border)">
                  <TableHead className="text-(--color-text-muted)">Medicine</TableHead>
                  <TableHead className="text-(--color-text-muted)">Qty</TableHead>
                  <TableHead className="text-right text-(--color-text-muted)">Total</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {topSellingMedicines.length ? (
                  topSellingMedicines.map((item, index) => (
                    <TableRow key={item.medicine?.id || index} className="border-(--color-border)">
                      <TableCell className="font-medium text-(--color-text)">
                        {item.medicine?.name || "Unknown medicine"}
                      </TableCell>
                      <TableCell className="text-(--color-text)">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right text-(--color-text)">
                        {money(item.total)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-(--color-border)">
                    <TableCell colSpan={3} className="py-8 text-center text-(--color-text-muted)">
                      No sold medicines yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
          <CardHeader>
            <CardTitle className="text-base text-(--color-text)">Purchase Trend</CardTitle>
          </CardHeader>

          <CardContent className="h-72">
            {purchases?.monthlyPurchases?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={purchases.monthlyPurchases}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-text-muted)" />
                  <YAxis stroke="var(--color-text-muted)" />
                  <Tooltip
                    formatter={(value) => money(value)}
                    contentStyle={{
                      backgroundColor: "var(--color-surface-raised)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text)",
                    }}
                    labelStyle={{
                      color: "var(--color-text)",
                    }}
                    itemStyle={{
                      color: "var(--color-warning)",
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="var(--color-warning)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-(--color-text-muted)">
                No purchase data for this range.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <InventoryTable title="Low Stock Items" items={lowStockItems} mode="stock" />
        <InventoryTable title="Expiring Soon" items={expiringSoonItems} mode="expiry" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
          <CardHeader>
            <CardTitle className="text-base text-(--color-text)">Recent Invoices</CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableBody>
                {recentInvoices.length ? (
                  recentInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="border-(--color-border)">
                      <TableCell>
                        <div className="font-medium text-(--color-text)">
                          {invoice.invoiceNumber}
                        </div>
                        <div className="text-xs text-(--color-text-muted)">
                          {invoice.customer?.name || "Walk-in"} - {dateLabel(invoice.saleDate)}
                        </div>
                      </TableCell>
                      <TableCell className="text-(--color-text)">
                        {money(invoice.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(invoice.paymentStatus)}>
                          {invoice.paymentStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-(--color-border)">
                    <TableCell className="py-8 text-center text-(--color-text-muted)">
                      No invoices.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
          <CardHeader>
            <CardTitle className="text-base text-(--color-text)">Recent Payments</CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableBody>
                {recentPayments.length ? (
                  recentPayments.map((payment) => (
                    <TableRow key={payment.id} className="border-(--color-border)">
                      <TableCell>
                        <div className="font-medium text-(--color-text)">
                          {payment.invoice?.invoiceNumber || "Invoice"}
                        </div>
                        <div className="text-xs text-(--color-text-muted)">
                          {payment.paymentMode} - {dateLabel(payment.paymentDate)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-(--color-text)">
                        {money(payment.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-(--color-border)">
                    <TableCell className="py-8 text-center text-(--color-text-muted)">
                      No payments.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
          <CardHeader>
            <CardTitle className="text-base text-(--color-text)">Recent Purchases</CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableBody>
                {recentPurchases.length ? (
                  recentPurchases.map((purchase) => (
                    <TableRow key={purchase.id} className="border-(--color-border)">
                      <TableCell>
                        <div className="font-medium text-(--color-text)">
                          {purchase.invoiceNumber}
                        </div>
                        <div className="text-xs text-(--color-text-muted)">
                          {purchase.supplier?.name || "Supplier"} - {dateLabel(purchase.purchaseDate)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-(--color-text)">
                        {money(purchase.totalAmount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-(--color-border)">
                    <TableCell className="py-8 text-center text-(--color-text-muted)">
                      No purchases.
                    </TableCell>
                  </TableRow>
                )}
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
    <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
      <CardHeader>
        <CardTitle className="text-base text-(--color-text)">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-(--color-border)">
              <TableHead className="text-(--color-text-muted)">Medicine</TableHead>
              <TableHead className="text-(--color-text-muted)">
                {mode === "stock" ? "Stock" : "Expiry"}
              </TableHead>
              <TableHead className="text-(--color-text-muted)">Alert</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.length ? (
              items.map((item) => (
                <TableRow key={item.id} className="border-(--color-border)">
                  <TableCell className="font-medium text-(--color-text)">
                    {item.medicine?.name || "-"}
                  </TableCell>
                  <TableCell className="text-(--color-text)">
                    {mode === "stock" ? item.stockQuantity : dateLabel(item.expiryDate)}
                  </TableCell>
                  <TableCell className="text-(--color-text)">
                    {item.lowStockAlertQuantity}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-(--color-border)">
                <TableCell
                  colSpan={3}
                  className="py-8 text-center text-(--color-text-muted)"
                >
                  No items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}