"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { usePharmacyStatus } from "../hooks";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function PharmacyGuard({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading: authLoading } = useAuth();
  const { data: pharmacy, isLoading: statusLoading } = usePharmacyStatus();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authLoading || statusLoading) return;
    if (role !== "PHARMACY") return;

    const isSetupPage = pathname === "/pharmacy/setup";
    const isPendingPage = pathname === "/pharmacy/pending";
    const isRejectedPage = pathname === "/pharmacy/rejected";

    // If no pharmacy profile exists, must go to setup
    if (!pharmacy) {
      if (!isSetupPage) {
        router.replace("/pharmacy/setup");
      }
      return;
    }

    // If profile exists, prevent going back to setup
    if (isSetupPage && pharmacy) {
      router.replace("/pharmacy/dashboard");
      return;
    }

    const status = pharmacy.status;

    if (status === "PENDING" && !isPendingPage) {
      router.replace("/pharmacy/pending");
    } else if (status === "REJECTED" && !isRejectedPage) {
      router.replace("/pharmacy/rejected");
    } else if (status === "APPROVED" && (isPendingPage || isRejectedPage)) {
      router.replace("/pharmacy/dashboard");
    }
  }, [pharmacy, role, authLoading, statusLoading, pathname, router]);

  if (authLoading || statusLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">Verifying pharmacy status...</p>
      </div>
    );
  }

  return <>{children}</>;
}
