"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Building2, ClipboardList, DollarSign, Pill, ReceiptText, Truck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRequireAuth } from "@/features/auth/hooks/use-auth";
import { useAdminOverviewAnalytics } from "@/features/analytics/hooks";

const money = (value: unknown) => `$${Number(value || 0).toFixed(2)}`;
const dateLabel = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : "-");
const chartColors = ["#0f766e", "#f59e0b", "#ef4444", "#2563eb"];

type StatusDatum = { status: string; count: number };
type Pharmacy = {
  id: string;
  name: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt?: string | null;
  owner?: { name?: string | null; email?: string | null } | null;
};

const statusVariant = (status: Pharmacy["status"]) => {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "danger";
  return "warning";
};

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof Users }) {
  return (
    <Card className="rounded-lg bg-(--color-surface) border-(--color-border)">
      <CardHeader>
        <CardTitle className="flex items-center gap-2  text-teal-600">
          <Icon className="size-4 text-teal-600" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-bold text-(--color-text)">{value}</CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { isLoading: authLoading } = useRequireAuth(["ADMIN"]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const params = useMemo(() => ({ dateFrom, dateTo }), [dateFrom, dateTo]);
  const { data, isLoading } = useAdminOverviewAnalytics(params);
  const analytics = data?.data;
  const totals = analytics?.totals ?? {};
  const pharmacyStatus = (analytics?.pharmacyStatus ?? []) as StatusDatum[];
  const requestStatus = (analytics?.medicineRequestStatus ?? []) as StatusDatum[];
  const recentPharmacies = (analytics?.recentPharmacies ?? []) as Pharmacy[];

  if (authLoading || isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-10 w-72 rounded-md bg-(--color-surface) border-(--color-border)" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-28 rounded-lg bg-(--color-surface) border-(--color-border)" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <h1 className="text-3xl font-bold text-(--color-text)">Admin Analytics</h1>
      <p className="text-(--color-text-muted)">
        Platform activity, catalogue health, pharmacy approvals, and manual-payment sales totals.
      </p>
    </div>
    <div className="grid gap-2 sm:grid-cols-2">
      <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
      <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
    </div>
  </div>

  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <StatCard icon={Building2} label="Total Pharmacies" value={totals.pharmacies ?? 0} />
    <StatCard icon={Users} label="Total Users" value={totals.users ?? 0} />
    <StatCard icon={Pill} label="Global Medicines" value={totals.medicines ?? 0} />
    <StatCard icon={ClipboardList} label="Medicine Requests" value={totals.medicineRequests ?? 0} />
    <StatCard icon={Truck} label="Suppliers" value={totals.suppliers ?? 0} />
    <StatCard icon={ReceiptText} label="Platform Sales" value={money(totals.platformSales)} />
    <StatCard icon={DollarSign} label="Paid Amount" value={money(totals.platformPaid)} />
    <StatCard icon={DollarSign} label="Due Amount" value={money(totals.platformDue)} />
  </div>

  <div className="grid gap-6 xl:grid-cols-2">
    <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
      <CardHeader>
        <CardTitle className="text-base text-(--color-text)">Pharmacy Status</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {pharmacyStatus.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pharmacyStatus} dataKey="count" nameKey="status" outerRadius={90} label>
                {pharmacyStatus.map((_, index) => (
                  <Cell key={index} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface-raised)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
                labelStyle={{
                  color: "var(--color-text)",
                }}
                itemStyle={{
                  color: "var(--color-text)",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-(--color-text-muted)">
            No pharmacy data yet.
          </div>
        )}
      </CardContent>
    </Card>

    <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
      <CardHeader>
        <CardTitle className="text-base text-(--color-text)">Medicine Request Status</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {requestStatus.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={requestStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="status" stroke="var(--color-text-muted)" />
              <YAxis allowDecimals={false} stroke="var(--color-text-muted)" />
              <Tooltip
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
              <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-(--color-text-muted)">
            No medicine requests yet.
          </div>
        )}
      </CardContent>
    </Card>
  </div>

  <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
    <CardHeader>
      <CardTitle className="text-base text-(--color-text)">Recent Pharmacy Registrations</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow className="border-(--color-border)">
            <TableHead className="text-(--color-text-muted)">Pharmacy</TableHead>
            <TableHead className="text-(--color-text-muted)">Owner</TableHead>
            <TableHead className="text-(--color-text-muted)">Status</TableHead>
            <TableHead className="text-(--color-text-muted)">Registered</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentPharmacies.length ? (
            recentPharmacies.map((pharmacy) => (
              <TableRow key={pharmacy.id} className="border-(--color-border)">
                <TableCell className="font-semibold text-(--color-text)">
                  {pharmacy.name}
                </TableCell>
                <TableCell className="text-(--color-text)">
                  <div>{pharmacy.owner?.name || "-"}</div>
                  <div className="text-xs text-(--color-text-muted)">
                    {pharmacy.owner?.email || ""}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(pharmacy.status)}>
                    {pharmacy.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-(--color-text)">
                  {dateLabel(pharmacy.createdAt)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="border-(--color-border)">
              <TableCell colSpan={4} className="py-8 text-center text-(--color-text-muted)">
                No registrations found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</div>
  );
}
