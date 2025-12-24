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
import { useInventory } from "@/features/inventory/hooks";
import { useCreatePurchase, usePurchaseSuppliers } from "@/features/purchases/hooks";

const schema = z.object({
  supplierId: z.string().min(1, "Select a supplier"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  vatAmount: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
  paidAmount: z.coerce.number().min(0).default(0),
  purchaseStatus: z.enum(["PENDING", "RECEIVED"]).default("PENDING"),
  note: z.string().optional(),
  items: z.array(z.object({
    inventoryId: z.string().min(1, "Select inventory"),
    medicineId: z.string().min(1, "Medicine is required"),
    quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
    purchasePrice: z.coerce.number().min(0, "Purchase price must be zero or more"),
    sellingPrice: z.coerce.number().min(0, "Selling price must be zero or more"),
    expiryDate: z.string().optional(),
    batchNumber: z.string().optional(),
  })).min(1, "Add at least one item"),
});

type PurchaseFormValues = z.infer<typeof schema>;

type Supplier = {
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
  medicine?: {
    name?: string | null;
    genericName?: string | null;
    strength?: string | null;
  } | null;
};

const money = (value: number) => `$${value.toFixed(2)}`;
const today = () => new Date().toISOString().slice(0, 10);
const emptyItem = {
  inventoryId: "",
  medicineId: "",
  quantity: 1,
  purchasePrice: 0,
  sellingPrice: 0,
  expiryDate: "",
  batchNumber: "",
};

export default function CreatePurchasePage() {
  const router = useRouter();
  const [inventorySearch, setInventorySearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const createPurchase = useCreatePurchase();
  const { data: suppliers, isLoading: suppliersLoading } = usePurchaseSuppliers({ searchTerm: supplierSearch, limit: 50 });
  const { data: inventory, isLoading: inventoryLoading } = useInventory({
    searchTerm: inventorySearch,
    status: "ACTIVE",
    limit: 100,
    sortBy: "medicineName",
    sortOrder: "asc",
  });

  const inventoryItems = useMemo(() => (inventory?.data ?? []) as InventoryItem[], [inventory?.data]);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof schema>, unknown, PurchaseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      supplierId: "",
      invoiceNumber: "",
      purchaseDate: today(),
      vatAmount: 0,
      discount: 0,
      paidAmount: 0,
      purchaseStatus: "PENDING",
      note: "",
      items: [emptyItem],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const vatAmount = Number(watch("vatAmount") || 0);
  const discount = Number(watch("discount") || 0);
  const paidAmount = Number(watch("paidAmount") || 0);
  const subtotal = watchedItems.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.purchasePrice || 0), 0);
  const totalAmount = Math.max(0, subtotal + vatAmount - discount);
  const dueAmount = Math.max(0, totalAmount - paidAmount);

  const handleInventoryChange = (rowIndex: number, inventoryId: string) => {
    const selected = inventoryItems.find((item) => item.id === inventoryId);
    setValue(`items.${rowIndex}.inventoryId`, inventoryId);
    setValue(`items.${rowIndex}.medicineId`, selected?.medicineId || "");
    setValue(`items.${rowIndex}.purchasePrice`, Number(selected?.purchasePrice || 0));
    setValue(`items.${rowIndex}.sellingPrice`, Number(selected?.sellingPrice || 0));
    setValue(`items.${rowIndex}.batchNumber`, selected?.batchNumber || "");
    setValue(`items.${rowIndex}.expiryDate`, selected?.expiryDate ? new Date(selected.expiryDate).toISOString().slice(0, 10) : "");
  };

  const onSubmit = async (values: PurchaseFormValues) => {
    const result = await createPurchase.mutateAsync({
      ...values,
      vatAmount,
      discount,
      paidAmount,
      items: values.items.map((item) => ({
        ...item,
        expiryDate: item.expiryDate || "",
        batchNumber: item.batchNumber || "",
      })),
    });

    router.push(`/pharmacy/purchases/${result?.data?.id}`);
  };

  return (
   <div className="space-y-6 p-6">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <Button asChild variant="ghost" className="mb-2 px-0">
        <Link href="/pharmacy/purchases">
          <ArrowLeft className="size-4" />
          Back to purchases
        </Link>
      </Button>
      <h1 className="text-3xl font-bold text-(--color-text)">Create Purchase</h1>
      <p className="text-(--color-text-muted)">
        Record supplier invoices and receive stock into existing inventory items.
      </p>
    </div>
  </div>

  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
    <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
      <CardHeader>
        <CardTitle className="text-base text-(--color-text)">Purchase Information</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="xl:col-span-2">
          <Label>Supplier</Label>
          <div className="mt-2 grid gap-2 md:grid-cols-[1fr_1.4fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-(--color-text-faint)" />
              <Input
                value={supplierSearch}
                onChange={(event) => setSupplierSearch(event.target.value)}
                placeholder="Search supplier"
                className="pl-8"
              />
            </div>
            <select
              {...register("supplierId")}
              className="h-8 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-text)"
            >
              <option value="">{suppliersLoading ? "Loading suppliers..." : "Select supplier"}</option>
              {((suppliers?.data ?? []) as Supplier[]).map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          {errors.supplierId && (
            <p className="mt-1 text-xs text-(--color-danger)">
              {String(errors.supplierId.message)}
            </p>
          )}
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
          <Label htmlFor="purchaseDate">Purchase Date</Label>
          <Input id="purchaseDate" type="date" {...register("purchaseDate")} className="mt-2" />
        </div>

        <div>
          <Label htmlFor="purchaseStatus">Purchase Status</Label>
          <select
            id="purchaseStatus"
            {...register("purchaseStatus")}
            className="mt-2 h-8 w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-text)"
          >
            <option value="PENDING">Pending</option>
            <option value="RECEIVED">Received</option>
          </select>
        </div>

        <div className="md:col-span-2 xl:col-span-3">
          <Label htmlFor="note">Note</Label>
          <Textarea id="note" {...register("note")} className="mt-2 min-h-20" />
        </div>
      </CardContent>
    </Card>

    <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
      <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="text-base text-(--color-text)">Purchase Items</CardTitle>
          <p className="text-sm text-(--color-text-muted)">
            Select active inventory rows. Received purchases increase these stock quantities.
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

      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-(--color-border)">
                <TableHead className="min-w-64 text-(--color-text-muted)">Inventory</TableHead>
                <TableHead className="text-(--color-text-muted)">Qty</TableHead>
                <TableHead className="text-(--color-text-muted)">Cost</TableHead>
                <TableHead className="text-(--color-text-muted)">Selling</TableHead>
                <TableHead className="text-(--color-text-muted)">Batch</TableHead>
                <TableHead className="text-(--color-text-muted)">Expiry</TableHead>
                <TableHead className="text-(--color-text-muted)">Total</TableHead>
                <TableHead className="text-right text-(--color-text-muted)">Remove</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {fields.map((field, index) => (
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

                  <TableCell>
                    <Input type="number" min={1} {...register(`items.${index}.quantity`)} className="w-24" />
                  </TableCell>

                  <TableCell>
                    <Input type="number" step="0.01" min={0} {...register(`items.${index}.purchasePrice`)} className="w-28" />
                  </TableCell>

                  <TableCell>
                    <Input type="number" step="0.01" min={0} {...register(`items.${index}.sellingPrice`)} className="w-28" />
                  </TableCell>

                  <TableCell>
                    <Input {...register(`items.${index}.batchNumber`)} className="w-32" />
                  </TableCell>

                  <TableCell>
                    <Input type="date" {...register(`items.${index}.expiryDate`)} className="w-36" />
                  </TableCell>

                  <TableCell className="font-semibold text-(--color-text)">
                    {money(Number(watchedItems[index]?.quantity || 0) * Number(watchedItems[index]?.purchasePrice || 0))}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      aria-label="Remove purchase row"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
        <CardContent className="grid gap-5 pt-6 md:grid-cols-3">
          <div>
            <Label htmlFor="vatAmount">VAT Amount</Label>
            <Input id="vatAmount" type="number" step="0.01" min={0} {...register("vatAmount")} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="discount">Discount</Label>
            <Input id="discount" type="number" step="0.01" min={0} {...register("discount")} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="paidAmount">Paid Amount</Label>
            <Input id="paidAmount" type="number" step="0.01" min={0} {...register("paidAmount")} className="mt-2" />
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
        <Link href="/pharmacy/purchases">Cancel</Link>
      </Button>
      <Button type="submit" disabled={isSubmitting || createPurchase.isPending}>
        {isSubmitting || createPurchase.isPending ? "Saving..." : "Save Purchase"}
      </Button>
    </div>
  </form>
</div>
  );
}
