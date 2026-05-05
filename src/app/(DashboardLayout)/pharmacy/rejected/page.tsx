"use client";

import { AlertCircle, FileEdit } from "lucide-react";
import { usePharmacyStatus, useResubmitPharmacy } from "@/features/pharmacies/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function PharmacyRejectedPage() {
  const { data: pharmacy } = usePharmacyStatus();
  const resubmit = useResubmitPharmacy();
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: pharmacy || {}
  });

  const onSubmit = async (data: any) => {
    // Convert strings to numbers if needed
    if (data.establishedYear) data.establishedYear = parseInt(data.establishedYear);
    if (data.staffCount) data.staffCount = parseInt(data.staffCount);
    
    await resubmit.mutateAsync(data);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center mb-8">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-red-900 mb-2">Registration Rejected</h1>
        <p className="text-red-700 mb-4">
          Unfortunately, your pharmacy registration has been rejected for the following reason:
        </p>
        <div className="bg-white border border-red-200 rounded-lg p-4 text-left mb-6 font-medium text-red-900 italic">
          "{pharmacy?.rejectionReason || "No specific reason provided."}"
        </div>
        
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mx-auto"
          >
            <FileEdit size={18} />
            Edit and Resubmit
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Update Pharmacy Information</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pharmacy Name</label>
                <input {...register("name")} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">License Number</label>
                <input {...register("licenseNumber")} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">BIN/VAT</label>
                <input {...register("binVat")} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <input {...register("phone")} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Address</label>
              <textarea {...register("address")} rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>

            <div className="flex justify-end gap-4">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={resubmit.isPending}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                {resubmit.isPending ? "Resubmitting..." : "Resubmit for Approval"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
