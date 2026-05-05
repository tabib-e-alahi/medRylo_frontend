"use client";

import { Clock, RefreshCw } from "lucide-react";
import { usePharmacyStatus } from "@/features/pharmacies/hooks";

export default function PharmacyPendingPage() {
  const { refetch, isRefetching } = usePharmacyStatus();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
        <Clock size={40} />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Approval Pending</h1>
      <p className="text-slate-600 max-w-md mb-8">
        Your pharmacy registration is currently being reviewed by our administrators. 
        This usually takes 24-48 hours. We'll notify you once your account is activated.
      </p>
      
      <button 
        onClick={() => refetch()}
        disabled={isRefetching}
        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
      >
        <RefreshCw size={18} className={isRefetching ? "animate-spin" : ""} />
        {isRefetching ? "Checking status..." : "Check Status"}
      </button>
    </div>
  );
}
