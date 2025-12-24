"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileImageUpload } from "@/features/auth/components/ProfileImageUpload";
import { useRequireAuth } from "@/features/auth/hooks/use-auth";
import { useMyStaffProfile } from "@/features/staff/hooks";

export default function StaffProfilePage() {
  const { isLoading: authLoading } = useRequireAuth(["STAFF"]);
  const { data, isLoading } = useMyStaffProfile();
  const staff = data?.data;

  if (authLoading || isLoading) {
    return <div className="p-6"><div className="h-48 rounded-lg bg-(--color-surface) border-(--color-border)" /></div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-(--color-text)">Staff Profile</h1>
        <p className="text-(--color-text-muted)">
          Your pharmacy assignment and permissions.
        </p>
      </div>

      <ProfileImageUpload currentImage={staff?.user?.image} userName={staff?.user?.name} />

      <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
        <CardHeader>
          <CardTitle className="text-base text-(--color-text)">Account</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-xs uppercase text-(--color-text-muted)">Name</div>
            <div className="font-semibold text-(--color-text)">{staff?.user?.name}</div>
          </div>

          <div>
            <div className="text-xs uppercase text-(--color-text-muted)">Email</div>
            <div className="font-semibold text-(--color-text)">{staff?.user?.email}</div>
          </div>

          <div>
            <div className="text-xs uppercase text-(--color-text-muted)">Pharmacy</div>
            <div className="font-semibold text-(--color-text)">{staff?.pharmacy?.name}</div>
          </div>

          <div>
            <div className="text-xs uppercase text-(--color-text-muted)">Status</div>
            <Badge variant={staff?.isActive ? "success" : "danger"}>
              {staff?.isActive ? "ACTIVE" : "INACTIVE"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-(--color-surface) border-(--color-border) text-(--color-text)">
        <CardHeader>
          <CardTitle className="text-base text-(--color-text)">Permissions</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-2">
          {staff?.canManageInventory && <Badge variant="muted">Inventory</Badge>}
          {staff?.canManageSales && <Badge variant="muted">Sales and payments</Badge>}
          {staff?.canManageCustomers && <Badge variant="muted">Customers</Badge>}
          {staff?.canViewReports && <Badge variant="muted">Reports</Badge>}
          {staff?.canManagePurchases && <Badge variant="muted">Purchases</Badge>}
        </CardContent>
      </Card>
    </div>
  );
}
