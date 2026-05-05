"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, CreditCard, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePurchase, useUpdatePurchasePayment, useUpdatePurchaseStatus } from "@/features/purchases/hooks";

const money = (value: unknown) => `$${Number(value || 0).toFixed(2)}`;
const dateLabel = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : "-");

type PurchaseItem = {
  id: string;
  quantity: number;
  purchasePrice: number | string;
  sellingPrice: number | string;
  total: number | string;
  batchNumber?: string | null;
  expiryDate?: string | null;
  medicine?: {
    name?: string | null;
    genericName?: string | null;
    strength?: string | null;
  } | null;
  inventory?: {
    batchNumber?: string | null;
  } | null;
};

type Purchase = {
  id: string;
  invoiceNumber: string;
  purchaseDate?: string | null;
  subtotal: number | string;
  vatAmount: number | string;
  discount: number | string;
  totalAmount: number | string;
  paidAmount: number | string;
  dueAmount: number | string;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID" | "CANCELLED";
  purchaseStatus: "PENDING" | "RECEIVED" | "PARTIAL" | "CANCELLED";
  note?: string | null;
  supplier?: {
    name?: string | null;
    contactPerson?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  } | null;
  items?: PurchaseItem[];
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

export default function PurchaseDetailsPage() {
  const params = useParams<{ id: string }>();
  const purchaseId = params.id;
  const { data, isLoading } = usePurchase(purchaseId);
  const updatePayment = useUpdatePurchasePayment();
  const updateStatus = useUpdatePurchaseStatus();
  const purchase = data?.data as Purchase | undefined;
  const [paidAmountOverride, setPaidAmountOverride] = useState<string | null>(null);
  const paidAmount = paidAmountOverride ?? String(Number(purchase?.paidAmount || 0));

  const handlePaymentUpdate = async () => {
    await updatePayment.mutateAsync({
      id: purchaseId,
      payload: { paidAmount: Number(paidAmount || 0) },
    });
  };

  const handleMarkReceived = async () => {
    await updateStatus.mutateAsync({
      id: purchaseId,
      payload: { purchaseStatus: "RECEIVED" },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-8 w-64 rounded-md bg-slate-100" />
        <div className="h-64 rounded-lg bg-slate-100" />
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="p-6">
        <Card className="rounded-lg">
          <CardContent className="py-10 text-center text-slate-500">Purchase not found.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Button asChild variant="ghost" className="mb-2 px-0">
            <Link href="/pharmacy/purchases">
              <ArrowLeft className="size-4" />
              Back to purchases
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Purchase {purchase.invoiceNumber}</h1>
          <p className="text-slate-500">Supplier purchase details, stock receiving state, and payment summary.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {purchase.purchaseStatus === "PENDING" && (
            <Button onClick={handleMarkReceived} disabled={updateStatus.isPending}>
              <CheckCircle2 className="size-4" />
              Mark Received
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="text-base">Purchase Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs uppercase text-slate-500">Supplier</div>
              <div className="font-semibold text-slate-900">{purchase.supplier?.name || "-"}</div>
              <div className="text-sm text-slate-500">{purchase.supplier?.contactPerson || "No contact person"}</div>
              <div className="text-sm text-slate-500">{[purchase.supplier?.phone, purchase.supplier?.email].filter(Boolean).join(" | ")}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-slate-500">Invoice</div>
              <div className="font-semibold text-slate-900">{purchase.invoiceNumber}</div>
              <div className="text-sm text-slate-500">{dateLabel(purchase.purchaseDate)}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={purchaseVariant(purchase.purchaseStatus)}>{purchase.purchaseStatus}</Badge>
              <Badge variant={paymentVariant(purchase.paymentStatus)}>{purchase.paymentStatus}</Badge>
            </div>
            <div className="text-sm text-slate-500">{purchase.note || "No note added."}</div>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="paidAmount">Paid Amount</Label>
              <div className="mt-2 flex gap-2">
                <Input id="paidAmount" type="number" step="0.01" min={0} value={paidAmount} onChange={(event) => setPaidAmountOverride(event.target.value)} />
                <Button type="button" onClick={handlePaymentUpdate} disabled={updatePayment.isPending}>
                  <CreditCard className="size-4" />
                  Save
                </Button>
              </div>
            </div>
            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><strong>{money(purchase.subtotal)}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">VAT</span><strong>{money(purchase.vatAmount)}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Discount</span><strong>{money(purchase.discount)}</strong></div>
              <div className="flex justify-between text-base"><span>Total</span><strong>{money(purchase.totalAmount)}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Paid</span><strong>{money(purchase.paidAmount)}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Due</span><strong>{money(purchase.dueAmount)}</strong></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Selling</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(purchase.items ?? []).map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{item.medicine?.name || "-"}</div>
                    <div className="text-xs text-slate-500">{[item.medicine?.genericName, item.medicine?.strength].filter(Boolean).join(" - ")}</div>
                  </TableCell>
                  <TableCell>{item.batchNumber || item.inventory?.batchNumber || "-"}</TableCell>
                  <TableCell>{dateLabel(item.expiryDate)}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{money(item.purchasePrice)}</TableCell>
                  <TableCell>{money(item.sellingPrice)}</TableCell>
                  <TableCell className="text-right font-semibold">{money(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
