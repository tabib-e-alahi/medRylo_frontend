"use client";

import Link from "next/link";
import { CreditCard, FileText, Package, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/features/auth/hooks/use-auth";
import { useMyStaffProfile } from "@/features/staff/hooks";
import { usePharmacyOverviewAnalytics } from "@/features/analytics/hooks";

export default function StaffDashboardPage() {
  const { isLoading: authLoading } = useRequireAuth(["STAFF"]);
  const { data: profileData, isLoading: profileLoading } = useMyStaffProfile();
  const { data: overviewData, isLoading: overviewLoading } = usePharmacyOverviewAnalytics({});
  const staff = profileData?.data;
  const totals = overviewData?.data?.totals ?? {};

  if (authLoading || profileLoading || overviewLoading) {
    return <div className="space-y-4 p-6"><div className="h-10 w-72 rounded-md bg-slate-100" /><div className="h-48 rounded-lg bg-slate-100" /></div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Staff Dashboard</h1>
        <p className="text-slate-500">Assigned pharmacy: {staff?.pharmacy?.name || "Pharmacy"}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-lg"><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Package className="size-4 text-teal-600" />Inventory</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{totals.inventoryItems ?? 0}</CardContent></Card>
        <Card className="rounded-lg"><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Users className="size-4 text-teal-600" />Customers</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{totals.customers ?? 0}</CardContent></Card>
        <Card className="rounded-lg"><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><FileText className="size-4 text-teal-600" />Invoices</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{totals.invoices ?? 0}</CardContent></Card>
        <Card className="rounded-lg"><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><CreditCard className="size-4 text-teal-600" />Collected</CardTitle></CardHeader><CardContent className="text-2xl font-bold">${Number(totals.collectedAmount || 0).toFixed(2)}</CardContent></Card>
      </div>
      <Card className="rounded-lg">
        <CardHeader><CardTitle className="text-base">Your Permissions</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {staff?.canManageInventory && <Button asChild variant="outline"><Link href="/staff/inventory">Inventory</Link></Button>}
          {staff?.canManageCustomers && <Button asChild variant="outline"><Link href="/staff/customers">Customers</Link></Button>}
          {staff?.canManageSales && <Button asChild><Link href="/staff/invoices/create">Create Invoice</Link></Button>}
        </CardContent>
      </Card>
    </div>
  );
}
