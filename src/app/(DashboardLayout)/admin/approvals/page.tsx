"use client";

import PharmacyApprovals from "@/features/admin/components/PharmacyApprovals";

export default function AdminApprovalsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Pharmacy Approvals</h1>
        <p className="text-slate-500">Review and manage pending pharmacy registration requests.</p>
      </div>
      
      <PharmacyApprovals />
    </div>
  );
}
