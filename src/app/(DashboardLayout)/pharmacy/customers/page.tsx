"use client";

import { useMemo, useState } from "react";
import { Archive, Edit2, Plus, Search, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useArchiveCustomer, useCreateCustomer, useCustomers, useUpdateCustomer } from "@/features/customers/hooks";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof schema>;

type Customer = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  createdAt?: string | null;
};

const dateLabel = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : "-");

function CustomerModal({ customer, onClose }: { customer?: Customer | null; onClose: () => void }) {
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const isEditing = Boolean(customer);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: customer?.name || "",
      phone: customer?.phone || "",
      email: customer?.email || "",
      address: customer?.address || "",
    },
  });

  const onSubmit = async (values: CustomerFormValues) => {
    if (isEditing) {
      await updateCustomer.mutateAsync({ id: customer!.id, payload: values });
    } else {
      await createCustomer.mutateAsync(values);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-xl rounded-xl border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{isEditing ? "Edit Customer" : "Add Customer"}</h2>
            <p className="text-sm text-slate-500">Customer records are scoped to this pharmacy.</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </div>
        <div className="grid gap-5 p-6">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} className="mt-2" />
            {errors.name && <p className="mt-1 text-xs text-red-600">{String(errors.name.message)}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} className="mt-2" />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{String(errors.phone.message)}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} className="mt-2" />
            {errors.email && <p className="mt-1 text-xs text-red-600">{String(errors.email.message)}</p>}
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" {...register("address")} className="mt-2" />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting || createCustomer.isPending || updateCustomer.isPending}>
            {isSubmitting ? "Saving..." : "Save Customer"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function PharmacyCustomersPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const archiveCustomer = useArchiveCustomer();

  const params = useMemo(() => ({ page, limit: 10, searchTerm, sortBy: "createdAt", sortOrder: "desc" as const }), [page, searchTerm]);
  const { data, isLoading } = useCustomers(params);
  const customers = (data?.data ?? []) as Customer[];
  const meta = data?.meta;

  const handleAdd = () => {
    setSelectedCustomer(null);
    setModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const handleArchive = async (id: string) => {
    if (confirm("Archive this customer?")) {
      await archiveCustomer.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500">Manage pharmacy customers for invoice and sales records.</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="size-4" />
          Add Customer
        </Button>
      </div>

      <Card className="rounded-lg">
        <CardContent className="space-y-4 pt-4">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-slate-400" />
            <Input value={searchTerm} onChange={(event) => { setPage(1); setSearchTerm(event.target.value); }} placeholder="Search by name, phone, or email" className="pl-8" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={6}><div className="h-10 rounded-md bg-slate-100" /></TableCell>
                  </TableRow>
                ))
              ) : customers.length ? (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-semibold text-slate-900">{customer.name}</TableCell>
                    <TableCell>{customer.phone || "-"}</TableCell>
                    <TableCell>{customer.email || "-"}</TableCell>
                    <TableCell>{customer.address || "-"}</TableCell>
                    <TableCell>{dateLabel(customer.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(customer)} aria-label="Edit customer">
                          <Edit2 className="size-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleArchive(customer.id)} aria-label="Archive customer">
                          <Archive className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-slate-500">No customers found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t pt-4 text-sm text-slate-500">
            <span>Page {meta?.page ?? page} of {meta?.totalPages ?? 1}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
              <Button variant="outline" size="sm" disabled={!meta || page >= meta.totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {modalOpen && <CustomerModal customer={selectedCustomer} onClose={() => setModalOpen(false)} />}
    </div>
  );
}
