"use client";

import { useState } from "react";
import { Check, Search, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/features/categories/hooks";
import { useMedicineTypes } from "@/features/medicine-types/hooks";
import { useUnits } from "@/features/units/hooks";
import { useSuppliers } from "@/features/suppliers/hooks";
import {
  useAdminMedicineRequests,
  useApproveMedicineRequest,
  useRejectMedicineRequest,
} from "@/features/medicine-requests/hooks";

const approveSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  genericName: z.string().optional(),
  strength: z.string().optional(),
  price: z.coerce.number().min(0),
  supplierPrice: z.coerce.number().min(0).optional(),
  categoryId: z.string().optional(),
  typeId: z.string().optional(),
  unitId: z.string().optional(),
  supplierId: z.string().optional(),
  description: z.string().optional(),
  adminNote: z.string().optional(),
});

type ApproveValues = z.infer<typeof approveSchema>;

type BadgeVariant = "success" | "danger" | "warning";

type Lookup = {
  id: string;
  name: string;
  symbol?: string | null;
};

type MedicineRequest = {
  id: string;
  requestedName: string;
  genericName?: string | null;
  categorySuggestion?: string | null;
  typeSuggestion?: string | null;
  unitSuggestion?: string | null;
  strength?: string | null;
  companyName?: string | null;
  note?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt?: string | null;
  pharmacy?: {
    name?: string | null;
    owner?: {
      email?: string | null;
    } | null;
  } | null;
};

type MutationLike = {
  isPending?: boolean;
  mutateAsync: (input: { id: string; payload: Record<string, unknown> }) => Promise<unknown>;
};

const statusVariant = (status: string): BadgeVariant => {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "danger";
  return "warning";
};

const dateLabel = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : "-");

export default function AdminMedicineRequestsPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [selectedRequest, setSelectedRequest] = useState<MedicineRequest | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  const { data, isLoading } = useAdminMedicineRequests({
    page,
    limit: 10,
    searchTerm,
    status,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const { data: categories } = useCategories({ limit: 100 });
  const { data: types } = useMedicineTypes({ limit: 100 });
  const { data: units } = useUnits({ limit: 100 });
  const { data: suppliers } = useSuppliers({ limit: 100 });
  const approveRequest = useApproveMedicineRequest();
  const rejectRequest = useRejectMedicineRequest();

  const requests = (data?.data ?? []) as MedicineRequest[];
  const meta = data?.meta;

  const openReview = (request: MedicineRequest) => {
    setSelectedRequest(request);
    setIsRejecting(false);
    setAdminNote("");
  };

  const handleReject = async () => {
    if (!selectedRequest || !adminNote.trim()) return;
    await rejectRequest.mutateAsync({ id: selectedRequest.id, adminNote });
    setSelectedRequest(null);
    setAdminNote("");
    setIsRejecting(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Medicine Requests</h1>
        <p className="text-slate-500">Review missing medicine submissions from approved pharmacies.</p>
      </div>

      <Card className="rounded-lg">
        <CardContent className="space-y-4 pt-4">
          <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(event) => {
                  setPage(1);
                  setSearchTerm(event.target.value);
                }}
                placeholder="Search requested name, generic, company, or note"
                className="pl-8"
              />
            </div>
            <select
              value={status}
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value);
              }}
              className="h-8 rounded-lg border bg-white px-3 text-sm"
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requested Medicine</TableHead>
                <TableHead>Suggestions</TableHead>
                <TableHead>Pharmacy</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={6}>
                      <div className="h-10 w-full rounded-md bg-slate-100" />
                    </TableCell>
                  </TableRow>
                ))
              ) : requests.length ? (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{request.requestedName}</div>
                      <div className="text-xs text-slate-500">{[request.genericName, request.strength, request.companyName].filter(Boolean).join(" - ") || "No extra details"}</div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <div>{request.categorySuggestion || "No category"}</div>
                      <div>{request.typeSuggestion || "No type"} / {request.unitSuggestion || "No unit"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-800">{request.pharmacy?.name}</div>
                      <div className="text-xs text-slate-500">{request.pharmacy?.owner?.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(request.status)}>{request.status}</Badge>
                    </TableCell>
                    <TableCell>{dateLabel(request.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openReview(request)} disabled={request.status !== "PENDING"}>
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                    No medicine requests found.
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

      {selectedRequest && (
        <ReviewModal
          request={selectedRequest}
          categories={(categories?.data ?? []) as Lookup[]}
          types={(types?.data ?? []) as Lookup[]}
          units={(units?.data ?? []) as Lookup[]}
          suppliers={(suppliers?.data ?? []) as Lookup[]}
          isRejecting={isRejecting}
          adminNote={adminNote}
          setAdminNote={setAdminNote}
          setIsRejecting={setIsRejecting}
          onClose={() => setSelectedRequest(null)}
          onReject={handleReject}
          approveRequest={approveRequest}
        />
      )}
    </div>
  );
}

function ReviewModal({
  request,
  categories,
  types,
  units,
  suppliers,
  isRejecting,
  adminNote,
  setAdminNote,
  setIsRejecting,
  onClose,
  onReject,
  approveRequest,
}: {
  request: MedicineRequest;
  categories: Lookup[];
  types: Lookup[];
  units: Lookup[];
  suppliers: Lookup[];
  isRejecting: boolean;
  adminNote: string;
  setAdminNote: (value: string) => void;
  setIsRejecting: (value: boolean) => void;
  onClose: () => void;
  onReject: () => Promise<void>;
  approveRequest: MutationLike;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof approveSchema>, unknown, ApproveValues>({
    resolver: zodResolver(approveSchema),
    defaultValues: {
      name: request.requestedName || "",
      genericName: request.genericName || "",
      strength: request.strength || "",
      price: 0,
      supplierPrice: 0,
      categoryId: "",
      typeId: "",
      unitId: "",
      supplierId: "",
      description: [request.companyName ? `Company: ${request.companyName}` : "", request.note || ""].filter(Boolean).join("\n"),
      adminNote: "",
    },
  });

  const onApprove = async (values: ApproveValues) => {
    await approveRequest.mutateAsync({
      id: request.id,
      payload: {
        adminNote: values.adminNote,
        medicine: {
          name: values.name,
          genericName: values.genericName,
          strength: values.strength,
          price: values.price,
          supplierPrice: values.supplierPrice,
          categoryId: values.categoryId || undefined,
          typeId: values.typeId || undefined,
          unitId: values.unitId || undefined,
          supplierId: values.supplierId || undefined,
          description: values.description,
        },
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Review Medicine Request</h2>
            <p className="text-sm text-slate-500">{request.pharmacy?.name} submitted this request.</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </div>

        <div className="grid gap-6 overflow-y-auto p-6 lg:grid-cols-[1fr_2fr]">
          <div className="space-y-4 rounded-lg border bg-slate-50 p-4">
            <div>
              <div className="text-xs font-semibold uppercase text-slate-500">Requested</div>
              <div className="text-lg font-bold text-slate-900">{request.requestedName}</div>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Generic:</span> {request.genericName || "-"}</div>
              <div><span className="font-medium">Strength:</span> {request.strength || "-"}</div>
              <div><span className="font-medium">Company:</span> {request.companyName || "-"}</div>
              <div><span className="font-medium">Category:</span> {request.categorySuggestion || "-"}</div>
              <div><span className="font-medium">Type:</span> {request.typeSuggestion || "-"}</div>
              <div><span className="font-medium">Unit:</span> {request.unitSuggestion || "-"}</div>
            </div>
            {request.note && (
              <div className="rounded-md bg-white p-3 text-sm text-slate-600">
                {request.note}
              </div>
            )}
          </div>

          {isRejecting ? (
            <div className="space-y-4">
              <Label htmlFor="adminNote">Rejection Reason</Label>
              <Textarea
                id="adminNote"
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                placeholder="Explain why this request cannot be approved."
              />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsRejecting(false)}>Cancel</Button>
                <Button variant="destructive" onClick={onReject} disabled={!adminNote.trim()}>
                  Reject Request
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onApprove)} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Medicine Name</Label>
                  <Input id="name" {...register("name")} className="mt-2" />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{String(errors.name.message)}</p>}
                </div>
                <div>
                  <Label htmlFor="genericName">Generic Name</Label>
                  <Input id="genericName" {...register("genericName")} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="strength">Strength</Label>
                  <Input id="strength" {...register("strength")} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="price">Default Selling Price</Label>
                  <Input id="price" type="number" step="0.01" {...register("price")} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="supplierPrice">Default Purchase Price</Label>
                  <Input id="supplierPrice" type="number" step="0.01" {...register("supplierPrice")} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="categoryId">Category</Label>
                  <select id="categoryId" {...register("categoryId")} className="mt-2 h-8 w-full rounded-lg border bg-white px-3 text-sm">
                    <option value="">No category</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="typeId">Type</Label>
                  <select id="typeId" {...register("typeId")} className="mt-2 h-8 w-full rounded-lg border bg-white px-3 text-sm">
                    <option value="">No type</option>
                    {types.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="unitId">Unit</Label>
                  <select id="unitId" {...register("unitId")} className="mt-2 h-8 w-full rounded-lg border bg-white px-3 text-sm">
                    <option value="">No unit</option>
                    {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name} ({unit.symbol})</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="supplierId">Supplier</Label>
                  <select id="supplierId" {...register("supplierId")} className="mt-2 h-8 w-full rounded-lg border bg-white px-3 text-sm">
                    <option value="">No supplier</option>
                    {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" {...register("description")} className="mt-2" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="approveAdminNote">Admin Note</Label>
                  <Textarea id="approveAdminNote" {...register("adminNote")} className="mt-2" />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setIsRejecting(true)}>
                  Reject
                </Button>
                <Button type="submit" disabled={isSubmitting || approveRequest.isPending}>
                  <Check className="size-4" />
                  Approve and Create Medicine
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
