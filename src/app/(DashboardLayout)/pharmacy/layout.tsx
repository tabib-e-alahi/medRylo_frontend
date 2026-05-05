import { PharmacyGuard } from "@/features/pharmacies/components/PharmacyGuard";

export default function PharmacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PharmacyGuard>{children}</PharmacyGuard>;
}
