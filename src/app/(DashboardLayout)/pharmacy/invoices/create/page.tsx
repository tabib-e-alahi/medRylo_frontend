"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useCustomers } from "@/features/customers/hooks";
import { useInventory } from "@/features/inventory/hooks";
import { useCreateInvoice } from "@/features/invoices/hooks";

const schema = z.object({
  customerId: z.string().optional(),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  saleDate: z.string().min(1, "Sale date is required"),
  note: z.string().optional(),
  paidAmount: z.coerce.number().min(0).default(0),
  paymentMode: z.enum(["CASH", "CARD", "MOBILE_BANKING", "BANK_TRANSFER"]).optional(),
  paymentNote: z.string().optional(),
  items: z.array(z.object({
    inventoryId: z.string().min(1, "Select inventory"),
    medicineId: z.string().min(1, "Medicine is required"),
    quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
    unitPrice: z.coerce.number().min(0, "Unit price must be zero or more"),
    vat: z.coerce.number().min(0).default(0),
    discount: z.coerce.number().min(0).default(0),
  })).min(1, "Add at least one item"),
});

type InvoiceFormValues = z.infer<typeof schema>;

type Customer = { id: string; name: string; phone?: string | null };
type InventoryItem = {
  id: string;
  medicineId: string;
  stockQuantity: number;
  sellingPrice?: number | string | null;
  medicine?: { name?: string | null; genericName?: string | null; strength?: string | null } | null;
};

const money = (value: number) => `$${value.toFixed(2)}`;
const today = () => new Date().toISOString().slice(0, 10);
const emptyItem = { inventoryId: "", medicineId: "", quantity: 1, unitPrice: 0, vat: 0, discount: 0 };
const invoiceSeed = () => `INV-${Date.now().toString().slice(-8)}`;

export default function CreateInvoicePage() {
  const router = useRouter();
  const [customerSearch, setCustomerSearch] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");
  const createInvoice = useCreateInvoice();

  const { data: customers } = useCustomers({ searchTerm: customerSearch, limit: 50 });
  const { data: inventory, isLoading: inventoryLoading } = useInventory({
    searchTerm: inventorySearch,
    status: "ACTIVE",
    limit: 100,
    sortBy: "medicineName",
    sortOrder: "asc",
  });
  const inventoryItems = useMemo(() => (inventory?.data ?? []) as InventoryItem[], [inventory?.data]);

  const { control, register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<z.input<typeof schema>, unknown, InvoiceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerId: "",
      invoiceNumber: invoiceSeed(),
      saleDate: today(),
      note: "",
      paidAmount: 0,
      paymentMode: "CASH",
      paymentNote: "",
      items: [emptyItem],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchedItems = watch("items");
  const paidAmount = Number(watch("paidAmount") || 0);
  const subtotal = watchedItems.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);
  const vatAmount = watchedItems.reduce((sum, item) => sum + Number(item.vat || 0), 0);
  const discount = watchedItems.reduce((sum, item) => sum + Number(item.discount || 0), 0);
  const totalAmount = Math.max(0, subtotal + vatAmount - discount);
  const dueAmount = Math.max(0, totalAmount - paidAmount);

  const handleInventoryChange = (index: number, inventoryId: string) => {
    const selected = inventoryItems.find((item) => item.id === inventoryId);
    setValue(`items.${index}.inventoryId`, inventoryId);
    setValue(`items.${index}.medicineId`, selected?.medicineId || "");
    setValue(`items.${index}.unitPrice`, Number(selected?.sellingPrice || 0));
  };

  const onSubmit = async (values: InvoiceFormValues) => {
    const result = await createInvoice.mutateAsync({
      ...values,
      customerId: values.customerId || "",
      paidAmount,
      paymentMode: paidAmount > 0 ? values.paymentMode : undefined,
      items: values.items.map((item) => ({
        ...item,
        vat: item.vat ?? 0,
        discount: item.discount ?? 0,
      })),
    });
    router.push(`/pharmacy/invoices/${result?.data?.id}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <Button asChild variant="ghost" className="mb-2 px-0">
          <Link href="/pharmacy/invoices">
            <ArrowLeft className="size-4" />
            Back to invoices
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-(--color-text)">Create Invoice</h1>
        <p className="text-(--color-text-muted)">
          Sell from inventory and optionally record an internal payment.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
          <CardHeader>
            <CardTitle className="text-base text-(--color-text)">Invoice Information</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="xl:col-span-2">
              <Label>Customer</Label>
              <div className="mt-2 grid gap-2 md:grid-cols-[1fr_1.4fr]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-(--color-text-faint)" />
                  <Input
                    value={customerSearch}
                    onChange={(event) => setCustomerSearch(event.target.value)}
                    placeholder="Search customer"
                    className="pl-8"
                  />
                </div>
                <select
                  {...register("customerId")}
                  className="h-8 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-text)"
                >
                  <option value="">Walk-in Customer</option>
                  {((customers?.data ?? []) as Customer[]).map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.phone ? `- ${customer.phone}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input id="invoiceNumber" {...register("invoiceNumber")} className="mt-2" />
              {errors.invoiceNumber && (
                <p className="mt-1 text-xs text-(--color-danger)">
                  {String(errors.invoiceNumber.message)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="saleDate">Sale Date</Label>
              <Input id="saleDate" type="date" {...register("saleDate")} className="mt-2" />
            </div>

            <div className="md:col-span-2 xl:col-span-4">
              <Label htmlFor="note">Note</Label>
              <Textarea id="note" {...register("note")} className="mt-2 min-h-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
          <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base text-(--color-text)">Invoice Items</CardTitle>
              <p className="text-sm text-(--color-text-muted)">
                Stock is deducted after the invoice is saved.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-(--color-text-faint)" />
                <Input
                  value={inventorySearch}
                  onChange={(event) => setInventorySearch(event.target.value)}
                  placeholder="Search inventory"
                  className="pl-8"
                />
              </div>
              <Button type="button" variant="outline" onClick={() => append(emptyItem)}>
                <Plus className="size-4" />
                Add Row
              </Button>
            </div>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-(--color-border)">
                  <TableHead className="min-w-72 text-(--color-text-muted)">Inventory</TableHead>
                  <TableHead className="text-(--color-text-muted)">Stock</TableHead>
                  <TableHead className="text-(--color-text-muted)">Qty</TableHead>
                  <TableHead className="text-(--color-text-muted)">Price</TableHead>
                  <TableHead className="text-(--color-text-muted)">VAT</TableHead>
                  <TableHead className="text-(--color-text-muted)">Discount</TableHead>
                  <TableHead className="text-(--color-text-muted)">Total</TableHead>
                  <TableHead className="text-right text-(--color-text-muted)">Remove</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {fields.map((field, index) => {
                  const selected = inventoryItems.find((item) => item.id === watchedItems[index]?.inventoryId);
                  const rowTotal = Math.max(
                    0,
                    Number(watchedItems[index]?.quantity || 0) * Number(watchedItems[index]?.unitPrice || 0) +
                    Number(watchedItems[index]?.vat || 0) -
                    Number(watchedItems[index]?.discount || 0)
                  );

                  return (
                    <TableRow key={field.id} className="border-(--color-border)">
                      <TableCell>
                        <select
                          value={watchedItems[index]?.inventoryId || ""}
                          onChange={(event) => handleInventoryChange(index, event.target.value)}
                          className="h-8 w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-text)"
                        >
                          <option value="">
                            {inventoryLoading ? "Loading inventory..." : "Select inventory item"}
                          </option>
                          {inventoryItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.medicine?.name} {item.medicine?.strength ? `- ${item.medicine.strength}` : ""} | Stock {item.stockQuantity}
                            </option>
                          ))}
                        </select>
                        <input type="hidden" {...register(`items.${index}.medicineId`)} />
                        {errors.items?.[index]?.inventoryId && (
                          <p className="mt-1 text-xs text-(--color-danger)">
                            {String(errors.items[index]?.inventoryId?.message)}
                          </p>
                        )}
                      </TableCell>

                      <TableCell className="text-(--color-text)">
                        {selected?.stockQuantity ?? "-"}
                      </TableCell>

                      <TableCell>
                        <Input type="number" min={1} {...register(`items.${index}.quantity`)} className="w-24" />
                      </TableCell>

                      <TableCell>
                        <Input type="number" step="0.01" min={0} {...register(`items.${index}.unitPrice`)} className="w-28" />
                      </TableCell>

                      <TableCell>
                        <Input type="number" step="0.01" min={0} {...register(`items.${index}.vat`)} className="w-28" />
                      </TableCell>

                      <TableCell>
                        <Input type="number" step="0.01" min={0} {...register(`items.${index}.discount`)} className="w-28" />
                      </TableCell>

                      <TableCell className="font-semibold text-(--color-text)">
                        {money(rowTotal)}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          aria-label="Remove row"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
            <CardContent className="grid gap-5 pt-6 md:grid-cols-2">
              <div>
                <Label htmlFor="paidAmount">Initial Paid Amount</Label>
                <Input
                  id="paidAmount"
                  type="number"
                  step="0.01"
                  min={0}
                  {...register("paidAmount")}
                  className="mt-2"
                />
              </div>

              {paidAmount > 0 && (
                <div>
                  <Label htmlFor="paymentMode">Payment Mode</Label>
                  <select
                    id="paymentMode"
                    {...register("paymentMode")}
                    className="mt-2 h-8 w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-text)"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="MOBILE_BANKING">Mobile banking</option>
                    <option value="BANK_TRANSFER">Bank transfer</option>
                  </select>
                </div>
              )}

              <div className="md:col-span-2">
                <Label htmlFor="paymentNote">Payment Note</Label>
                <Textarea id="paymentNote" {...register("paymentNote")} className="mt-2 min-h-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
            <CardContent className="space-y-3 pt-6 text-sm">
              <div className="flex justify-between">
                <span className="text-(--color-text-muted)">Subtotal</span>
                <strong className="text-(--color-text)">{money(subtotal)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-(--color-text-muted)">VAT</span>
                <strong className="text-(--color-text)">{money(vatAmount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-(--color-text-muted)">Discount</span>
                <strong className="text-(--color-text)">{money(discount)}</strong>
              </div>
              <div className="flex justify-between border-t border-(--color-border) pt-3 text-base">
                <span className="text-(--color-text)">Total</span>
                <strong className="text-(--color-text)">{money(totalAmount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-(--color-text-muted)">Paid</span>
                <strong className="text-(--color-text)">{money(paidAmount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-(--color-text-muted)">Due</span>
                <strong className="text-(--color-text)">{money(dueAmount)}</strong>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/pharmacy/invoices">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting || createInvoice.isPending}>
            {isSubmitting || createInvoice.isPending ? "Saving..." : "Save Invoice"}
          </Button>
        </div>
      </form>
    </div>
  );
}
