"use client";

import { useMemo, useState } from "react";
import { Archive, Edit2, Plus, Search, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useArchiveStaff, useCreateStaff, useStaffList, useUpdateStaff } from "@/features/staff/hooks";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  phone: z.string().optional(),
  canManageInventory: z.boolean().default(false),
  canManageSales: z.boolean().default(true),
  canManageCustomers: z.boolean().default(true),
  canViewReports: z.boolean().default(false),
  canManagePurchases: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type StaffFormValues = z.infer<typeof schema>;
type StaffFormInput = z.input<typeof schema>;
type StaffMember = {
  id: string;
  canManageInventory: boolean;
  canManageSales: boolean;
  canManageCustomers: boolean;
  canViewReports: boolean;
  canManagePurchases: boolean;
  isActive: boolean;
  user?: { name?: string | null; email?: string | null; phone?: string | null; status?: string | null } | null;
};

const permissionLabels: Array<[keyof StaffFormValues, string]> = [
  ["canManageInventory", "Inventory"],
  ["canManageSales", "Sales and payments"],
  ["canManageCustomers", "Customers"],
  ["canViewReports", "Reports"],
  ["canManagePurchases", "Purchases"],
];

function StaffModal({ staff, onClose }: { staff?: StaffMember | null; onClose: () => void }) {
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const isEditing = Boolean(staff);
  const staffFormSchema = schema.refine((data) => isEditing || Boolean(data.password), { message: "Password is required", path: ["password"] });
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<StaffFormInput, unknown, StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: staff?.user?.name || "",
      email: staff?.user?.email || "",
      password: "",
      phone: staff?.user?.phone || "",
      canManageInventory: staff?.canManageInventory ?? false,
      canManageSales: staff?.canManageSales ?? true,
      canManageCustomers: staff?.canManageCustomers ?? true,
      canViewReports: staff?.canViewReports ?? false,
      canManagePurchases: staff?.canManagePurchases ?? false,
      isActive: staff?.isActive ?? true,
    },
  });

  const onSubmit = async (values: StaffFormValues) => {
    if (isEditing) {
      await updateStaff.mutateAsync({
        id: staff!.id,
        payload: {
          name: values.name,
          phone: values.phone,
          canManageInventory: values.canManageInventory,
          canManageSales: values.canManageSales,
          canManageCustomers: values.canManageCustomers,
          canViewReports: values.canViewReports,
          canManagePurchases: values.canManagePurchases,
          isActive: values.isActive,
        },
      });
    } else {
      await createStaff.mutateAsync(values);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{isEditing ? "Edit Staff" : "Add Staff"}</h2>
            <p className="text-sm text-slate-500">Staff use the normal MediTrack login.</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close"><X className="size-4" /></Button>
        </div>
        <div className="grid gap-5 p-6 md:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input {...register("name")} className="mt-2" />
            {errors.name && <p className="mt-1 text-xs text-red-600">{String(errors.name.message)}</p>}
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" disabled={isEditing} {...register("email")} className="mt-2" />
            {errors.email && <p className="mt-1 text-xs text-red-600">{String(errors.email.message)}</p>}
          </div>
          <div>
            <Label>Phone</Label>
            <Input {...register("phone")} className="mt-2" />
          </div>
          {!isEditing && (
            <div>
              <Label>Password</Label>
              <Input type="password" {...register("password")} className="mt-2" />
              {errors.password && <p className="mt-1 text-xs text-red-600">{String(errors.password.message)}</p>}
            </div>
          )}
          <div className="md:col-span-2">
            <Label>Permissions</Label>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {permissionLabels.map(([key, label]) => (
                <label key={String(key)} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                  <input type="checkbox" {...register(key)} />
                  {label}
                </label>
              ))}
              {isEditing && (
                <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                  <input type="checkbox" {...register("isActive")} />
                  Active staff account
                </label>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting || createStaff.isPending || updateStaff.isPending}>Save Staff</Button>
        </div>
      </form>
    </div>
  );
}

export default function PharmacyStaffPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const archiveStaff = useArchiveStaff();
  const params = useMemo(() => ({ page, limit: 10, searchTerm }), [page, searchTerm]);
  const { data, isLoading } = useStaffList(params);
  const staff = (data?.data ?? []) as StaffMember[];
  const meta = data?.meta;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Staff</h1>
          <p className="text-slate-500">Create staff accounts and control pharmacy permissions.</p>
        </div>
        <Button onClick={() => { setSelectedStaff(null); setModalOpen(true); }}><Plus className="size-4" />Add Staff</Button>
      </div>
      <Card className="rounded-lg">
        <CardContent className="space-y-4 pt-4">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-slate-400" />
            <Input value={searchTerm} onChange={(event) => { setPage(1); setSearchTerm(event.target.value); }} placeholder="Search staff by name, email, or phone" className="pl-8" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}><TableCell colSpan={4}><div className="h-10 rounded-md bg-slate-100" /></TableCell></TableRow>
              )) : staff.length ? staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{member.user?.name}</div>
                    <div className="text-xs text-slate-500">{member.user?.email} {member.user?.phone ? `- ${member.user.phone}` : ""}</div>
                  </TableCell>
                  <TableCell><Badge variant={member.isActive ? "success" : "danger"}>{member.isActive ? "ACTIVE" : "INACTIVE"}</Badge></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {permissionLabels.filter(([key]) => Boolean(member[key as keyof StaffMember])).map(([, label]) => <Badge key={label} variant="muted">{label}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => { setSelectedStaff(member); setModalOpen(true); }} aria-label="Edit staff"><Edit2 className="size-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => { if (confirm("Deactivate this staff account?")) archiveStaff.mutate(member.id); }} aria-label="Deactivate staff"><Archive className="size-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={4} className="py-10 text-center text-slate-500">No staff accounts found.</TableCell></TableRow>}
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
      {modalOpen && <StaffModal staff={selectedStaff} onClose={() => setModalOpen(false)} />}
    </div>
  );
}
