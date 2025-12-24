"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, FileText, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInvoices } from "@/features/invoices/hooks";

const money = (value: unknown) => `$${Number(value || 0).toFixed(2)}`;
const dateLabel = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : "-");

type Invoice = {
  id: string;
  invoiceNumber: string;
  saleDate?: string | null;
  totalAmount: number | string;
  paidAmount: number | string;
  dueAmount: number | string;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID" | "CANCELLED";
  customer?: { name?: string | null; phone?: string | null } | null;
  items?: unknown[];
};

const statusVariant = (status: Invoice["paymentStatus"]) => {
  if (status === "PAID") return "success";
  if (status === "PARTIAL") return "warning";
  if (status === "CANCELLED") return "danger";
  return "muted";
};

export default function PharmacyInvoicesPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const params = useMemo(
    () => ({ page, limit: 10, searchTerm, paymentStatus, dateFrom, dateTo, sortBy, sortOrder }),
    [dateFrom, dateTo, page, paymentStatus, searchTerm, sortBy, sortOrder]
  );
  const { data, isLoading } = useInvoices(params);
  const invoices = (data?.data ?? []) as Invoice[];
  const meta = data?.meta;

  return (
  <div className="space-y-6 p-6">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <h1 className="text-3xl font-bold text-(--color-text)">Invoices</h1>
      <p className="text-(--color-text-muted)">
        Create sales invoices, track due amounts, and record manual payments.
      </p>
    </div>
    <Button asChild>
      <Link href="/pharmacy/invoices/create">
        <Plus className="size-4" />
        Create Invoice
      </Link>
    </Button>
  </div>

  <div className="grid gap-4 md:grid-cols-3">
    <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-(--color-text)">
          <FileText className="size-4 text-(--color-primary)" />
          Total Invoices
        </CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-bold text-(--color-text)">
        {meta?.total ?? 0}
      </CardContent>
    </Card>

    <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
      <CardHeader>
        <CardTitle className="text-sm text-(--color-text)">Visible Sales</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-bold text-(--color-text)">
        {money(invoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount || 0), 0))}
      </CardContent>
    </Card>

    <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
      <CardHeader>
        <CardTitle className="text-sm text-(--color-text)">Visible Due</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-bold text-(--color-text)">
        {money(invoices.reduce((sum, invoice) => sum + Number(invoice.dueAmount || 0), 0))}
      </CardContent>
    </Card>
  </div>

  <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
    <CardContent className="space-y-4 pt-4">
      <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-(--color-text-faint)" />
          <Input
            value={searchTerm}
            onChange={(event) => {
              setPage(1);
              setSearchTerm(event.target.value);
            }}
            placeholder="Search invoice or customer"
            className="pl-8"
          />
        </div>

        <select
          value={paymentStatus}
          onChange={(event) => {
            setPage(1);
            setPaymentStatus(event.target.value);
          }}
          className="h-8 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-text)"
        >
          <option value="">All statuses</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PARTIAL">Partial</option>
          <option value="PAID">Paid</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <Input
          type="date"
          value={dateFrom}
          onChange={(event) => {
            setPage(1);
            setDateFrom(event.target.value);
          }}
        />

        <Input
          type="date"
          value={dateTo}
          onChange={(event) => {
            setPage(1);
            setDateTo(event.target.value);
          }}
        />

        <select
          value={`${sortBy}:${sortOrder}`}
          onChange={(event) => {
            const [nextSortBy, nextSortOrder] = event.target.value.split(":");
            setSortBy(nextSortBy);
            setSortOrder(nextSortOrder as "asc" | "desc");
          }}
          className="h-8 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-text)"
        >
          <option value="createdAt:desc">Newest</option>
          <option value="saleDate:desc">Sale date</option>
          <option value="invoiceNumber:asc">Invoice A-Z</option>
          <option value="totalAmount:desc">Total high to low</option>
          <option value="dueAmount:desc">Due high to low</option>
        </select>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-(--color-border)">
            <TableHead className="text-(--color-text-muted)">Invoice</TableHead>
            <TableHead className="text-(--color-text-muted)">Customer</TableHead>
            <TableHead className="text-(--color-text-muted)">Date</TableHead>
            <TableHead className="text-(--color-text-muted)">Items</TableHead>
            <TableHead className="text-(--color-text-muted)">Total</TableHead>
            <TableHead className="text-(--color-text-muted)">Paid / Due</TableHead>
            <TableHead className="text-(--color-text-muted)">Status</TableHead>
            <TableHead className="text-right text-(--color-text-muted)">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} className="border-(--color-border)">
                <TableCell colSpan={8}>
                  <div className="h-10 rounded-md bg-(--color-bg-secondary)" />
                </TableCell>
              </TableRow>
            ))
          ) : invoices.length ? (
            invoices.map((invoice) => (
              <TableRow key={invoice.id} className="border-(--color-border)">
                <TableCell className="font-semibold text-(--color-text)">
                  {invoice.invoiceNumber}
                </TableCell>

                <TableCell className="text-(--color-text)">
                  <div>{invoice.customer?.name || "Walk-in Customer"}</div>
                  <div className="text-xs text-(--color-text-muted)">
                    {invoice.customer?.phone || ""}
                  </div>
                </TableCell>

                <TableCell className="text-(--color-text)">
                  {dateLabel(invoice.saleDate)}
                </TableCell>

                <TableCell className="text-(--color-text)">
                  {invoice.items?.length ?? 0}
                </TableCell>

                <TableCell className="text-(--color-text)">
                  {money(invoice.totalAmount)}
                </TableCell>

                <TableCell className="text-(--color-text)">
                  <div>{money(invoice.paidAmount)}</div>
                  <div className="text-xs text-(--color-text-muted)">
                    Due {money(invoice.dueAmount)}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant={statusVariant(invoice.paymentStatus)}>
                    {invoice.paymentStatus}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <Button asChild variant="outline" size="icon" aria-label="View invoice">
                    <Link href={`/pharmacy/invoices/${invoice.id}`}>
                      <Eye className="size-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="border-(--color-border)">
              <TableCell colSpan={8} className="py-10 text-center text-(--color-text-muted)">
                No invoices found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between border-t border-(--color-border) pt-4 text-sm text-(--color-text-muted)">
        <span>
          Page {meta?.page ?? page} of {meta?.totalPages ?? 1}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!meta || page >= meta.totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</div>
  );
}
