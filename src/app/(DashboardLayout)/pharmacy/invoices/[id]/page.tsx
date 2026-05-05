"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CreditCard, Printer, X } from "lucide-react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useCreateInvoicePayment, useInvoice, useInvoicePayments } from "@/features/invoices/hooks";

const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than zero"),
  paymentMode: z.enum(["CASH", "CARD", "MOBILE_BANKING", "BANK_TRANSFER"]),
  paymentDate: z.string().min(1, "Payment date is required"),
  note: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;
type PaymentFormInput = z.input<typeof paymentSchema>;

type InvoiceItem = {
  id: string;
  quantity: number;
  unitPrice: number | string;
  vat: number | string;
  discount: number | string;
  total: number | string;
  medicine?: { name?: string | null; genericName?: string | null; strength?: string | null } | null;
  inventory?: { stockQuantity?: number | null; batchNumber?: string | null } | null;
};

type Payment = {
  id: string;
  amount: number | string;
  paymentMode: string;
  paymentDate?: string | null;
  note?: string | null;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  saleDate?: string | null;
  subtotal: number | string;
  vatAmount: number | string;
  discount: number | string;
  totalAmount: number | string;
  paidAmount: number | string;
  dueAmount: number | string;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID" | "CANCELLED";
  note?: string | null;
  customer?: { name?: string | null; phone?: string | null; email?: string | null; address?: string | null } | null;
  items?: InvoiceItem[];
  payments?: Payment[];
};

const money = (value: unknown) => `$${Number(value || 0).toFixed(2)}`;
const dateLabel = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : "-");
const today = () => new Date().toISOString().slice(0, 10);

const statusVariant = (status: Invoice["paymentStatus"]) => {
  if (status === "PAID") return "success";
  if (status === "PARTIAL") return "warning";
  if (status === "CANCELLED") return "danger";
  return "muted";
};

function PaymentModal({ invoiceId, dueAmount, onClose }: { invoiceId: string; dueAmount: number; onClose: () => void }) {
  const createPayment = useCreateInvoicePayment();
  const paymentFormSchema = paymentSchema.refine((data) => data.amount <= dueAmount, { message: "Amount cannot exceed due amount", path: ["amount"] });
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PaymentFormInput, unknown, PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: dueAmount,
      paymentMode: "CASH",
      paymentDate: today(),
      note: "",
    },
  });

  const onSubmit = async (values: PaymentFormValues) => {
    await createPayment.mutateAsync({ id: invoiceId, payload: values });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg rounded-xl border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Record Payment</h2>
            <p className="text-sm text-slate-500">This records an internal payment only. No gateway is used.</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </div>
        <div className="grid gap-5 p-6">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" step="0.01" min={0.01} max={dueAmount} {...register("amount")} className="mt-2" />
            {errors.amount && <p className="mt-1 text-xs text-red-600">{String(errors.amount.message)}</p>}
          </div>
          <div>
            <Label htmlFor="paymentMode">Payment Mode</Label>
            <select id="paymentMode" {...register("paymentMode")} className="mt-2 h-8 w-full rounded-lg border border-input bg-white px-3 text-sm">
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="MOBILE_BANKING">Mobile banking</option>
              <option value="BANK_TRANSFER">Bank transfer</option>
            </select>
          </div>
          <div>
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Input id="paymentDate" type="date" {...register("paymentDate")} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="note">Note</Label>
            <Textarea id="note" {...register("note")} className="mt-2" />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting || createPayment.isPending}>{isSubmitting ? "Saving..." : "Save Payment"}</Button>
        </div>
      </form>
    </div>
  );
}

export default function InvoiceDetailsPage() {
  const params = useParams<{ id: string }>();
  const invoiceId = params.id;
  const [paymentOpen, setPaymentOpen] = useState(false);
  const { data, isLoading } = useInvoice(invoiceId);
  const { data: paymentData } = useInvoicePayments(invoiceId);
  const invoice = data?.data as Invoice | undefined;
  const payments = ((paymentData?.data?.payments ?? invoice?.payments ?? []) as Payment[]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-8 w-64 rounded-md bg-slate-100" />
        <div className="h-64 rounded-lg bg-slate-100" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <Card className="rounded-lg"><CardContent className="py-10 text-center text-slate-500">Invoice not found.</CardContent></Card>
      </div>
    );
  }

  const dueAmount = Number(invoice.dueAmount || 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Button asChild variant="ghost" className="mb-2 px-0">
            <Link href="/pharmacy/invoices"><ArrowLeft className="size-4" />Back to invoices</Link>
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Invoice {invoice.invoiceNumber}</h1>
          <p className="text-slate-500">Payment history and invoice item details.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {dueAmount > 0 && invoice.paymentStatus !== "CANCELLED" && (
            <Button onClick={() => setPaymentOpen(true)}><CreditCard className="size-4" />Record Payment</Button>
          )}
          <Button type="button" variant="outline" onClick={() => window.print()}><Printer className="size-4" />Print</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="rounded-lg">
          <CardHeader><CardTitle className="text-base">Invoice Information</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs uppercase text-slate-500">Customer</div>
              <div className="font-semibold text-slate-900">{invoice.customer?.name || "Walk-in Customer"}</div>
              <div className="text-sm text-slate-500">{[invoice.customer?.phone, invoice.customer?.email].filter(Boolean).join(" | ")}</div>
              <div className="text-sm text-slate-500">{invoice.customer?.address || ""}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-slate-500">Invoice</div>
              <div className="font-semibold text-slate-900">{invoice.invoiceNumber}</div>
              <div className="text-sm text-slate-500">{dateLabel(invoice.saleDate)}</div>
            </div>
            <div><Badge variant={statusVariant(invoice.paymentStatus)}>{invoice.paymentStatus}</Badge></div>
            <div className="text-sm text-slate-500">{invoice.note || "No note added."}</div>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader><CardTitle className="text-base">Payment Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><strong>{money(invoice.subtotal)}</strong></div>
            <div className="flex justify-between"><span className="text-slate-500">VAT</span><strong>{money(invoice.vatAmount)}</strong></div>
            <div className="flex justify-between"><span className="text-slate-500">Discount</span><strong>{money(invoice.discount)}</strong></div>
            <div className="flex justify-between border-t pt-3 text-base"><span>Total</span><strong>{money(invoice.totalAmount)}</strong></div>
            <div className="flex justify-between"><span className="text-slate-500">Paid</span><strong>{money(invoice.paidAmount)}</strong></div>
            <div className="flex justify-between"><span className="text-slate-500">Due</span><strong>{money(invoice.dueAmount)}</strong></div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg">
        <CardHeader><CardTitle className="text-base">Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>VAT</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(invoice.items ?? []).map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{item.medicine?.name || "-"}</div>
                    <div className="text-xs text-slate-500">{[item.medicine?.genericName, item.medicine?.strength].filter(Boolean).join(" - ")}</div>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{money(item.unitPrice)}</TableCell>
                  <TableCell>{money(item.vat)}</TableCell>
                  <TableCell>{money(item.discount)}</TableCell>
                  <TableCell className="text-right font-semibold">{money(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader><CardTitle className="text-base">Payment History</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length ? payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{dateLabel(payment.paymentDate)}</TableCell>
                  <TableCell>{payment.paymentMode}</TableCell>
                  <TableCell>{payment.note || "-"}</TableCell>
                  <TableCell className="text-right font-semibold">{money(payment.amount)}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={4} className="py-8 text-center text-slate-500">No payments recorded.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {paymentOpen && <PaymentModal invoiceId={invoice.id} dueAmount={dueAmount} onClose={() => setPaymentOpen(false)} />}
    </div>
  );
}
