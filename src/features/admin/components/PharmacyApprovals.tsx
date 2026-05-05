"use client";

import { useAdminPendingPharmacies, useAdminApprovePharmacy, useAdminRejectPharmacy } from "@/features/pharmacies/hooks";
import { Check, X, Eye, MapPin, Phone, Globe, Calendar, Users, Clock } from "lucide-react";
import { useState } from "react";

export default function PharmacyApprovals() {
  const { data: pharmacies, isLoading } = useAdminPendingPharmacies();
  const approve = useAdminApprovePharmacy();
  const reject = useAdminRejectPharmacy();
  
  const [selectedPharmacy, setSelectedPharmacy] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  if (isLoading) return <div className="p-12 text-center text-slate-500">Loading pending requests...</div>;

  if (!pharmacies || pharmacies.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
        <p className="text-slate-500 font-medium">No pending registration requests at the moment.</p>
      </div>
    );
  }

  const handleReject = async () => {
    if (!rejectionReason) return;
    await reject.mutateAsync({ id: selectedPharmacy.id, reason: rejectionReason });
    setSelectedPharmacy(null);
    setRejectionReason("");
    setIsRejecting(false);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">Pharmacy</th>
              <th className="px-6 py-4">Owner</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Submitted</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pharmacies.map((pharmacy: any) => (
              <tr key={pharmacy.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{pharmacy.name}</div>
                  <div className="text-xs text-slate-500">{pharmacy.licenseNumber}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-700">{pharmacy.owner.name}</div>
                  <div className="text-xs text-slate-400">{pharmacy.owner.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {pharmacy.pharmacyType}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(pharmacy.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setSelectedPharmacy(pharmacy)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
                  >
                    <Eye size={14} />
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedPharmacy && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Pharmacy Registration Detail</h2>
              <button onClick={() => { setSelectedPharmacy(null); setIsRejecting(false); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 space-y-8">
              {/* Header Info */}
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-slate-400 border border-slate-200">
                  {selectedPharmacy.logo ? <img src={selectedPharmacy.logo} className="w-full h-full object-contain rounded-2xl" /> : <Eye size={32} />}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{selectedPharmacy.name}</h3>
                  <p className="text-slate-500 flex items-center gap-1.5 text-sm">
                    <MapPin size={14} /> {selectedPharmacy.address}
                  </p>
                </div>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">License Number</div>
                  <div className="text-sm font-semibold text-slate-800">{selectedPharmacy.licenseNumber}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BIN/VAT</div>
                  <div className="text-sm font-semibold text-slate-800">{selectedPharmacy.binVat || "N/A"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-sm flex items-center gap-1.5"><Phone size={12}/> Phone</div>
                  <div className="text-sm font-semibold text-slate-800">{selectedPharmacy.phone}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-sm flex items-center gap-1.5"><Globe size={12}/> Website</div>
                  <div className="text-sm font-semibold text-blue-600">{selectedPharmacy.website || "N/A"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-sm flex items-center gap-1.5"><Calendar size={12}/> Established</div>
                  <div className="text-sm font-semibold text-slate-800">{selectedPharmacy.establishedYear || "N/A"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-sm flex items-center gap-1.5"><Users size={12}/> Staff Count</div>
                  <div className="text-sm font-semibold text-slate-800">{selectedPharmacy.staffCount || "N/A"}</div>
                </div>
                <div className="col-span-2 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-sm flex items-center gap-1.5"><Clock size={12}/> Opening Hours</div>
                  <div className="text-sm font-semibold text-slate-800">{selectedPharmacy.openingHours || "N/A"}</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              {isRejecting ? (
                <div className="space-y-4">
                  <textarea 
                    placeholder="Enter rejection reason..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setIsRejecting(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900">Cancel</button>
                    <button 
                      onClick={handleReject} 
                      disabled={!rejectionReason || reject.isPending}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setIsRejecting(true)} 
                    className="px-6 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"
                  >
                    Reject Application
                  </button>
                  <button 
                    onClick={() => { approve.mutateAsync(selectedPharmacy.id); setSelectedPharmacy(null); }} 
                    disabled={approve.isPending}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {approve.isPending ? "Approving..." : "Approve Pharmacy"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
